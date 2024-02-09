onRecordBeforeUpdateRequest((e) => {
    let requestInfo = $apis.requestInfo(e.httpContext)
    console.log(requestInfo)

    console.log(JSON.stringify(e.record))

    let users = e.record.getStringSlice("users")

    if (users.length == 0) {
        e.record.set("status", "em_espera")
    } else if (users.length > 0) {
        e.record.set("status", "em_andamento")
    }
    console.log(users)
}, "chamados")

