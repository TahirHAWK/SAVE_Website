const Logs = require('../model/logModel')

exports.homeLog = function(req, res, next){
    let date = new Date()
    let logs = new Logs(req.session)
    logs.homeLog(date).then((result) => {
        console.log(`This type of logs will be included here by model of course.Ex: clicked/loaded on homepage.`, result)
        next()
    })
  
}
