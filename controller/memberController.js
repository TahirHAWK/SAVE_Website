const Member = require('../model/member')

exports.login = function(req, res){
    res.render('loginRegister') 
}

exports.registerAccount = function(req, res){
    // just use the promise, the async await is causing more confusion than ease
    let member = new Member(req.body)
    member.register().then((result)=>{
        console.log('from register controller:', result)
    }).catch((error)=>{
        
    })
}