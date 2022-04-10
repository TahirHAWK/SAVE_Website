const logController = require('./logController')
const Member = require('../model/memberModel')
const { result } = require('lodash')


exports.home = function(req, res){
    let member = new Member()
    member.loadBlogsAndStuff().then((result)=>{

        res.render('index', {blog: result})
    }).catch((error)=>{
        res.redirect('https://www.google.com')
    })
}


// accessing login page as guest or member
exports.loginRegister = function(req, res){

    if(req.session.member && req.session.member.loginAs == 'member'){
        let member = new Member(req.session.member)
        member.checkMemberAvailability().then((result)=>{
            
            console.log(result, '<== result from check member availability')
            res.render('loginDashboard', { errors: req.flash('errors'), from: 'loginDashboard', session_data: req.session.member, memberInfo: result})
        }).catch((notPresent)=>{
            //  if the user not present ex: first time signup
            res.render('loginDashboard', { errors: req.flash('errors'), from: 'loginDashboard', session_data: req.session.member, memberInfo: notPresent})

        })
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
                console.log(req.session.member, '<-- session object after login(from login controller)')
                res.redirect('/loginRegister')
            })
        
 
    }).catch((error)=>{
        req.flash('errors', error)
        req.session.save(()=>{
            res.redirect('/loginRegister')
        })
    })
}

exports.updateProfile = function(req, res){
    let member = new Member(req.body)
    member.updateProfile().then((result)=>{
        req.flash('errors', result)
        res.redirect('/loginRegister')
    }).catch((error)=>{
        req.flash('errors', error)
        req.session.save(()=>{
            res.redirect('/loginRegister')
        })
    })
}

exports.createBlogPost = function(req, res){
    // make correction on render of next line
    // fetch the posts previously done by user
    let member = new Member(req.session.member)
    member.fetchPreviousPostsByMember().then((result)=>{
        console.log(result, '<-- from fetchprevious')
        res.render('createBlogPost', {from: 'loginDashboard', session_data: req.session.member, errors: req.flash('errors'), previous_posts: result }) 
    }).catch((errors)=>{
        req.flash('errors', error)
        res.render('createBlogPost', {from: 'loginDashboard', session_data: req.session.member, errors: req.flash('errors'), previous_posts: '' }) 
    })

}

exports.actuallyPostBlog = function(req, res){
    let member = new Member(req.body)
    member.actuallyPostBlog().then((result)=>{
        req.flash('errors', result)
        res.redirect('/createBlogPost')
    }).catch((error)=>{
        
        req.flash('errors', error)
        res.redirect('/createBlogPost')
    })
}
