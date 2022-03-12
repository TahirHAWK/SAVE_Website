const logController = require('./logController')


exports.home = function(req, res){
    
    res.render('index')
}

exports.loginRegister = function(req, res){
    res.render('login')
}

