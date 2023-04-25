const Member = require('../model/member')
const PortalNavDefaultData = require('../model/portalNavEjsDataModel')


exports.isUserOwner = function(req, res, next){
    // to use this function in any middleware, the request link must contain userId as parameter
    if(req.session.member){

        if(req.params.id == req.session.member._id){
            req.session.member.ownershipOfId = true
            next()
        } else{
            req.session.member.ownershipOfId = false
            next()
        }
    } else{
        console.log('not a member, please login first')
        res.redirect('/login')
    }
}

exports.loginPage = function(req, res){
    if(req.session.member && req.session.member.userType == 'normal'){
        // shows the posted blogs by the user
        res.redirect(`/login/${req.session.member._id}`)
    } else{
        res.render('loginRegister')
    }

}

exports.portalPageAfterLogin = function(req, res){
    if(req.session.member.ownershipOfId == true){
        let member = new Member(req.session.member)
    
            // shows the posted blogs by the user
             member.showBlogs()
        .then((result)=>{
            
            res.render('portalDashboard', {result: result, userId: req.session.member._id}) 
        })
        
    } else{
        console.log('redirected on the portalpageafterlogin function:')
        res.redirect('/error404')
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
            res.redirect(`/login/${req.session.member._id}`)
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
            res.redirect(`/login/${req.session.member._id}`)
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

exports.blankPageDisplay = function(req, res){
    let portalNavDefaultData = new PortalNavDefaultData(req.session.member)
    res.render('portalDashboardBlank', portalNavDefaultData)
}