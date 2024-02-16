package main

import (
    "fmt"
    "io"
    "log"
    "os"
    "regexp"
    "strings"

    "github.com/labstack/echo/v5"
    "github.com/pocketbase/pocketbase"
    "github.com/pocketbase/pocketbase/apis"
    "github.com/pocketbase/pocketbase/core"

    "time"

    "github.com/google/uuid"
)

func main() {
    app := pocketbase.New()

    // serves static files from the provided public dir (if exists)
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

        e.Router.GET("/images/*", apis.StaticDirectoryHandler(os.DirFS("./pb_relatorio_images"), false), apis.RequireAdminOrRecordAuth())

        e.Router.POST("/uploadFile", uploadFile, apis.RequireAdminOrRecordAuth())

        // e.Router.POST("/fetchUrl", fetchUrl)


        return nil
    })

    app.OnRecordBeforeUpdateRequest("chamados").Add(func(e *core.RecordUpdateEvent) error {
        users := e.Record.GetStringSlice("users")

        if (len(users) == 0) {
            e.Record.Set("status", "em_espera")
        } else if (len(users) > 0) {
            e.Record.Set("status", "em_andamento")
        }

        return nil
    })


    app.OnRecordBeforeCreateRequest("chamados").Add(func(e *core.RecordCreateEvent) error {
        users := e.Record.GetStringSlice("users")

        if (len(users) == 0) {
            e.Record.Set("status", "em_espera")
        } else if (len(users) > 0) {
            e.Record.Set("status", "em_andamento")
        }

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