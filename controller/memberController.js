const Member = require('../model/member')

exports.isUserOwner = function(req, res, next){
    if(req.session.member){

        if(req.params.id == req.session.member._id){
            console.log('user is legit, we should grant him access.')
            next()
        } else{
            console.log('he is an impostor, he should be kicked out.')
            res.render('404')
        }
    } else{
        console.log('not a member, please login first')
        res.redirect('/login')
    }
}

exports.loginPage = function(req, res){
    let member = new Member(req.session.user)
    if(req.session.member && req.session.member.userType == 'normal'){
         member.showBlogs()
    .then((result)=>{
        
        res.render('portalDashboard', {result: result, userId: req.session.member._id}) 
    })
    } else{
        res.render('loginRegister')
    }

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

exports.loginAccount = function(req, res){
    let member = new Member(req.body)
    member.login()
    .then((result)=>{
        req.session.member = result
        req.session.save(()=>{
            res.redirect('/login')
        })
    })
    .catch((err)=>{
        if(member.errors.length){
            req.flash('errors', member.errors)
            req.session.save(()=>{
                res.redirect('/login')
            })
        }
    })
}

exports.logout = function(req, res){
    req.session.destroy(()=>{
        res.redirect('/login')
    })
    
}