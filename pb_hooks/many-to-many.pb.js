/// <reference path="../pb_data/types.d.ts" />

/*



users -> [
	user1 -> chamados_ref[chamado1, chamado2]
	user2 -> chamados_ref[]
	user3 -> chamados_ref[] // user3 didn´t update should have chamado3
	user4 -> chamados_ref[] // user4 didn´t update should have chamado3
]

chamados -> [
	chamado1 -> users_ref[], //chamado didn´t update should have user1
	chamado2 -> users_ref[], //chamado didn´t update should have user1
	chamado3 -> users_ref[user3, user4]
	chamado4 -> users_ref[]

]

*/


// onModelBeforeUpdate((e) => {
//     console.log(e.model.tableName())

//     if (e.model.tableName() == "chamados") {
// 	    let users = e.model.getStringSlice("users")

// 	    users.forEach((u) => {
// 			console.log(u)

// 	    })
//     }

// }, "chamados", "users")
/*
users -> [
	user1 -> chamados[]
	user2 -> chamados[chamado3]
	user3 -> chamados[chamado3] 
	user4 -> chamados[] 
]

chamados -> [
	chamado1 -> users[], 
	chamado2 -> users[], 
	chamado3 -> users[user3]
	chamado4 -> users[]

]
// */
// onModelBeforeUpdate((e) => {
//     console.log('Model being updated:', e.model.tableName())
//     console.log('Model being updated:', e.model.getId())


//     if (e.model.tableName() == "chamados") {
//         let users = e.model.getStringSlice("users")
//         console.log('Users in chamados:', users)

//         users.forEach((user_id) => {
//             console.log('Processing user:', user_id)
//             let user = $app.dao().findRecordById("users", user_id)
//             if (user) {
//             	console.log("Found user ", user.getString("id"))
//                 const chamados = user.getStringSlice("chamados")
//                 console.log('Chamados for user:', chamados)

//                 //Se não existe adiciona
//                 if (!chamados.includes(e.model.getId())) {
//                     chamados.push(e.model.getId())
//                     console.log('Chamados after push:', chamados)
//                     user.set("chamados", chamados)
//                     $app.dao().saveRecord(user)
//                 }
//             } else {
//                 console.log('User not found:', user_id)
//             }
//         })
//     }

//     if (e.model.tableName() == "users") {
//         let chamados = e.model.getStringSlice("chamados")
//         console.log('Chamados in users:', chamados)

//         chamados.forEach((chamado_id) => {
//             console.log('Processing chamado:', chamado_id)
//             let chamado = $app.dao().findRecordById("chamados", chamado_id)
//             if (chamado) {
//                 let users = chamado.getStringSlice("users")
//                 console.log('Users for chamado:', users)
//                 if (!users.includes(e.model.getId())) {
//                     users.push(e.model.getId())
//                     chamado.set("users", users)
//                     $app.dao().saveRecord(chamado)

//                 }
//             } else {
//                 console.log('Chamado not found:', chamado_id)
//             }
//         })
//     }
// }, "chamados", "users")
