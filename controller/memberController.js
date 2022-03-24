const logController = require('./logController')
const Member = require('../model/memberModel')


exports.home = function(req, res){
    res.render('index')
}


// accessing login page as guest or member
exports.loginRegister = function(req, res){

    if(req.session.member && req.session.member.loginAs == 'member'){

        res.render('loginDashboard', { errors: req.flash('errors'), from: 'loginDashboard'})
    } else {
        res.render('login', { errors: req.flash('errors'), from: 'loginGuest'})

    }
 

}

// registering a new user for blog
exports.blogRegister = function(req, res){
        let member = new Member(req.body)
        member.register().then((result)=>{
        
            console.log('from register model if resolves', result)
     
            req.session.member = { registerName: member.data.registerName, registerEmail: member.data.registerEmail, registerFaculty: member.data.registerFaculty, registerDepartment: member.data.registerDepartment, loginAs: 'member'}
            console.log(req.session.member)
            req.session.save(function(){
                res.redirect('/loginRegister')
            })
        }).catch((error)=>{
                if(member.errors.length){
                // storing errors on DB for further inspection
                logController.errorLog({error: error,data: member.data}, 'error').then((result)=>{
                    console.log('successfully stored the error')
                    req.flash('errors', member.errors)

                    req.session.save(function(){
                        res.redirect('/loginRegister')
                    })
                })
                
            }
            }
        )


}

exports.logOut = function(req, res){
    req.session.destroy(()=>{
        res.redirect('/loginRegister')
    })
}


exports.login = function(req, res){
    let member = new Member(req.body)
    member.login().then((result)=>{

            req.session.member = {
                registerName: result.registerName, registerEmail: result.registerEmail, registerFaculty: result.registerFaculty, registerDepartment: result.registerDepartment, loginAs: 'member'
            }
            req.session.save(()=>{
                res.redirect('/loginRegister')
            })
        

    }).catch((error)=>{
        req.flash('errors', error)
        req.session.save(()=>{
            res.redirect('/loginRegister')
        })
    })
}
