const Member = require('../model/member')

exports.login = function(req, res){
    res.render('loginRegister') 
}

exports.registerAccount = function(req, res){
    // just use the promise, the async await is causing more confusion than ease
    let member = new Member(req.body)
    member.register().then((result)=>{
        // now the session will be build
        member.data.password = result
        req.session.member = member.data
        req.session.save(()=>{
            res.redirect('/login')
        })

    }).catch((error)=>{
        if(member.errors.length){
            req.flash('errors', member.errors)
            req.session.save(()=>{
                res.redirect('/login')
            })
        }
    })
}