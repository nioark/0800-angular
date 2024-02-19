package main

import (
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

    log.Println("Chamado update: ", chamadoID)
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

    log.Println("Em andamento: ", em_andamento)

    record, err := app.FindRecordById("chamados", chamadoID)
    log.Println("Record before: ", record)
    if (err == nil) {

        if (em_andamento) {
            log.Println("Setado para em_andamento")
            record.Set("status", "em_andamento")
        } else {
            log.Println("Setado para em_pausa")
            record.Set("status", "em_pausa")
        }

        log.Println("Record after: ", record)
        log.Println("Record status: ", record.GetString("status"))


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

    log.Println("User api id: ", record.Id)
    log.Println("Chamado id: ", chamado_id)

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
    log.Println("Records: ", records, err)
    if (err == nil) {
        for _, record := range records {
            log.Println("Setando record: ",record)
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

    app.OnRecordBeforeUpdateRequest("chamados").Add(func(e *core.RecordUpdateEvent) error {
        users := e.Record.GetStringSlice("users")

        status := e.Record.GetString("status")

        if (status == "em_pausa" || status == "finalizado") {
            return nil
        }
        log.Println("Status: ", status)

        if (len(users) == 0) {
            e.Record.Set("status", "em_espera")
        } else if (len(users) > 0) {
            log.Println("Status: ", status)

            records, err := app.Dao().FindRecordsByFilter("horas", "chamado.id = '"+e.Record.GetString("id")+"'", "created",-1, 0)

            if (err == nil) {
                e.Record.Set("status", "em_pausa")
                return nil
            }

            if (len(records) == 0) {
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
            log.Println("Status: ", status)
            if (status != "em_pausa") {
                e.Record.Set("status", "em_andamento")
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

        log.Println(filter)

        records, err := app.Dao().FindRecordsByFilter("horas", filter, "created",-1, 0)
        if (err != nil || len(records) > 0) {
            log.Println("Já existe uma hora registrada para este usuário")
            return fmt.Errorf("Já existe uma hora registrada para este usuário") 
        }

        log.Println(user)

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
    log.Println("Received request")

    file, err := c.FormFile("image")
    if err != nil {
        return c.JSON(400, err) 
    }
    log.Println(file.Filename)

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