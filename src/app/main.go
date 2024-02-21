package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"slices"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/hook"

	"time"

	"github.com/google/uuid"
)

func statusPausaLogic(i interface{}, app *daos.Dao) error {
    var chamadoID string

    switch v := i.(type) {
        case *core.RecordUpdateEvent:
            chamadoID = v.Record.GetString("chamado")
        case *core.RecordCreateEvent:
            chamadoID = v.Record.GetString("chamado")

    }
    // filter := fmt.Sprintf( "chamado.id='%v'", chamadoID)

    query := app.RecordQuery("duracao_chamados").AndWhere(dbx.HashExp{"chamado": chamadoID})         // optional filter params

    records := []*models.Record{}
    if err := query.All(&records); err != nil {
        return nil
    }

    em_andamento := false;

    for _, record := range records {
        if (record.GetString("status") == `"em_andamento"`) {
            em_andamento = true
        }
    }
    record, err := app.FindRecordById("chamados", chamadoID)
    if (err == nil) {

        if (em_andamento) {
            record.Set("status", "em_andamento")
        } else {
            record.Set("status", "em_pausa")
        }
        err := app.SaveRecord(record)
        log.Println("Record save error: ", err)
        if (err != nil) {
            log.Println(err)
        }
    } else {
        log.Println("Erro ao encontrar chamado para atualizar status de em_andamento e em_pausa")
    }

    return nil
}

func finalizarChamado(c echo.Context) error {
    // admin, _ := c.Get(apis.ContextAdminKey).(*models.Admin)
    record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
    chamado_id := c.FormValue("chamado_id")
    chamado, err := app.Dao().FindRecordById("chamados", chamado_id)

    if (err != nil) {
        return c.JSON(http.StatusBadRequest, "Chamado não encontrado")
    }

    if (slices.Contains(chamado.GetStringSlice("users"), record.Id) == false) {
        return c.JSON(http.StatusForbidden, "Você não tem permissão para finalizar esse chamado")
    }

    chamado.Set("end_time", time.Now())

    chamado.Set("status", "finalizado")

    app.Dao().SaveRecord(chamado)

    records, err := app.Dao().FindRecordsByFilter("horas", fmt.Sprintf( "chamado.id='%v'", chamado_id), "created",-1, 0)
    if (err == nil) {
        for _, record := range records {
            record.Set("end_time", time.Now())
            app.Dao().SaveRecord(record)
        }
    }

    return c.JSON(http.StatusOK, "success")
}

var app = pocketbase.New()

func main() {


    // serves static files from the provided public dir (if exists)
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

        e.Router.GET("/images/*", apis.StaticDirectoryHandler(os.DirFS("./pb_relatorio_images"), false), apis.RequireAdminOrRecordAuth())
        e.Router.POST("/uploadFile", uploadFile, apis.RequireAdminOrRecordAuth())
        e.Router.POST("/finalizarChamado", finalizarChamado, apis.RequireAdminOrRecordAuth())

        // e.Router.POST("/fetchUrl", fetchUrl)


        return nil
    })

    app.OnRecordsListRequest("chamados").Add(func(e *core.RecordsListEvent) error {
        admin, ok := e.HttpContext.Get(apis.ContextAdminKey).(*models.Admin)
        if (admin != nil && ok) {
            return nil
        }

        vl := e.Result.Items.(*[]*models.Record)
        authRecord := e.HttpContext.Get(apis.ContextAuthRecordKey).(*models.Record)

        if authRecord != nil {
            for i := 0; i < len(*vl); i++ {
                record := (*vl)[i]

                users := record.GetStringSlice("users")
                created_by := record.GetString("created_by")
                public := record.GetBool("public")
                status := record.GetString("status")

                isOwner := created_by == authRecord.Id
                isInChamado := slices.Contains(users, authRecord.Id)
                isParticipant := isOwner || isInChamado

                if ((!isParticipant && status != "em_espera") ||
                    (!isParticipant && status == "em_espera" && !public)) {
                    // record.Set("title", record.GetString("title") + "*" )
                    record.Set("description", "null")
                    record.Set("cliente", "null")
                    record.Set("created_by", "null")
                }
            }
        }

        return nil
    })

    //"Censura" de dados relevantes
    app.OnRealtimeBeforeMessageSend().Add(func(e *core.RealtimeMessageEvent) error {
        // Retrieve authentication record from the client
        log.Println("RealtimeBeforeMessageSend", e.Message.Name)
        authRecord, _ := e.Client.Get(apis.ContextAuthRecordKey).(*models.Record)

        // Só executar se o usuário estiver autenticado e na tabela chamados
        if authRecord != nil && e.Message.Name == "chamados/*" {

            // Unmarshal message data
            var messageData map[string]interface{}
            if err := json.Unmarshal(e.Message.Data, &messageData); err != nil {
                log.Println("Error unmarshaling message data:", err)
                return hook.StopPropagation
            }

            // Remove informações ou cancela o envio da mensagem
            if record, ok := messageData["record"].(map[string]interface{}); ok {
                // Cancela o envio se o chamado está em espera e não é publico
                if ((record["status"] == "em_espera" && record["public"] == false && record["created_by"] != authRecord.Id) ) {
                    log.Println("Cancelando envio do chamado para ", authRecord.Username())
                    return hook.StopPropagation
                }

                usersI := record["users"].([]interface {})
                users := make([]string, len(usersI))
                for i, v := range usersI {
                    users[i] = fmt.Sprint(v)
                }

                isOwner := record["created_by"] == authRecord.Id
                isInChamado := slices.Contains(users, authRecord.Id)
                isParticipant := isOwner || isInChamado
                public := record["public"].(bool)
                status := record["status"].(string)

                if ((!isParticipant && status != "em_espera") ||
                    (!isParticipant && status == "em_espera" && !public)) {
                    log.Println("Removendo informações do chamado para ", authRecord.Username())
                    // record["title"] = record["title"].(string) + "*"
                    record["description"] = "null"
                    record["cliente"] = "null"
                    record["created_by"] = "null"
                }

            }

            jsonData, err := json.Marshal(messageData)
            if err != nil {
                log.Println("Error marshaling message data:", err)
                return err
            }

            // Substitui a mensagem
            e.Message.Data = jsonData
        }

        return nil
    })


    app.OnRecordBeforeUpdateRequest("chamados").Add(func(e *core.RecordUpdateEvent) error {
        users := e.Record.GetStringSlice("users")

        status := e.Record.GetString("status")

        if (status == "em_pausa" || status == "finalizado") {
            return nil
        }

        if (len(users) == 0) {
            e.Record.Set("status", "em_espera")
        } else if (len(users) > 0) {

            records, err := app.Dao().FindRecordsByFilter("horas", "chamado.id = '"+e.Record.GetString("id")+"'", "created",-1, 0)

            if (err == nil) {
               if (len(records) == 0) {
                    e.Record.Set("status", "aguardando")
                }
            } else {
                e.Record.Set("status", "em_pausa")
            }


        }

        return nil
    })


    app.OnRecordBeforeCreateRequest("chamados").Add(func(e *core.RecordCreateEvent) error {
        users := e.Record.GetStringSlice("users")

        status := e.Record.Get("status")

        if (len(users) == 0) {
            e.Record.Set("status", "em_espera")
        } else if (len(users) > 0) {
            if (status != "em_pausa") {
                e.Record.Set("status", "aguardando")
            }
        }

        return nil
    })

    app.OnRecordAfterUpdateRequest("horas").Add(func(e *core.RecordUpdateEvent) error {
        statusPausaLogic(e, app.Dao())

        return nil
    })

    app.OnRecordAfterCreateRequest("horas").Add(func(e *core.RecordCreateEvent) error {
        statusPausaLogic(e, app.Dao())

        return nil
    })

    app.OnRecordBeforeCreateRequest("horas").Add(func(e *core.RecordCreateEvent) error {
        user := e.Record.Get("user")
        chamado := e.Record.Get("chamado")

        filter := fmt.Sprintf( "user.id = '%v' && end_time = '' && chamado.id = '%v'", user, chamado)

        records, err := app.Dao().FindRecordsByFilter("horas", filter, "created",-1, 0)
        if (err != nil || len(records) > 0) {
            log.Println("Já existe uma hora registrada para este usuário")
            return fmt.Errorf("Já existe uma hora registrada para este usuário")
        }

        return nil
    })

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

// func fetchUrl(c echo.Context) error {
//     // Parse request body
//     req := struct {
//         URL                  string `json:"url"`
//         AdditionalRequestData string `json:"additionalRequestData"`
//     }{}

//     if err := c.Bind(&req); err != nil {
//         return err
//     }

//     // Download image from URL
//     resp, err := http.Get(req.URL)
//     if err != nil {
//         return err
//     }
//     defer resp.Body.Close()

//     // Create a temporary file to save the downloaded image
//     currentDate := time.Now().Format("02-01-2006")

//     // Generate a UUID
//     uid := uuid.New()

//     source_name := uid.String() + "-" + currentDate + "-" + sanitizeFilename(file.Filename)

//     // Destination
//     dst, err := os.Create("pb_relatorio_images/" + source_name)
//     if err != nil {
//         return err
//     }
//     defer dst.Close()

//     // Write the downloaded image to the temporary file
//     _, err = io.Copy(dst, resp.Body)
//     if err != nil {
//         return err
//     }

//     // Prepare response JSON
//     response := struct {
//         FileName string `json:"fileName"`
//         FileURL  string `json:"fileUrl"`
//     }{
//         FileName: filepath.Base(dst.Name()),
//         FileURL:  "http://yourdomain.com/" + filepath.Base(tempFile.Name()),
//     }

//     return c.JSON(http.StatusOK, response)
// }

func sanitizeFilename(filename string) string {
    // Replace spaces with underscores
    filename = strings.ReplaceAll(filename, " ", "_")

    // Define a regular expression to match and replace bad characters
    re := regexp.MustCompile("[^a-zA-Z0-9_.-]")
    filename = re.ReplaceAllString(filename, "")

    return filename
}

func uploadFile(c echo.Context) error {
    file, err := c.FormFile("image")
    if err != nil {
        return c.JSON(400, err)
    }

    src, err := file.Open()
    if err != nil {
        return err
    }
    defer src.Close()

    currentDate := time.Now().Format("02-01-2006")

    // Generate a UUID
    uid := uuid.New()

    source_name := uid.String() + "-" + currentDate + "-" + sanitizeFilename(file.Filename)

    // Destination
    dst, err := os.Create("pb_relatorio_images/" + source_name)
    if err != nil {
        return err
    }
    defer dst.Close()

    // Copy
    if _, err = io.Copy(dst, src); err != nil {
        return err
    }

    response := map[string]interface{}{
        "success": 1,
        "file": map[string]interface{}{
           "url": "http://localhost:8090/images/" + source_name,

            // You can add more fields here such as width, height, color, extension, etc.
        },
    }

    return c.JSON(200, response)
}
