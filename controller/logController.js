const { promiseImpl } = require('ejs')
const Logs = require('../model/logModel')

exports.homeLog = function(req, res, next){
    let date = new Date()
    let logs = new Logs(req.session)
    logs.homeLog(date).then((result) => {
        console.log(`This type of logs will be included here by model of course.Ex: clicked/loaded on homepage.`, result)
        next()
    })
  
}

exports.errorLog = function(data, category){
    let errorPromise = new Promise((resolve, reject)=> {
        let log = new Logs(data)
        log.errorLog(category).then((result)=>{
            console.log(result,'<--log recorded successfully')
            resolve()
        }).catch((error)=>{
            console.log(error, '<--log error while inserting db')
            reject()
        })
    })

    return errorPromise

}
