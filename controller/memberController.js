const logController = require('./logController')
const Member = require('../model/memberModel')
const { result } = require('lodash')


exports.home = function(req, res){
    let member = new Member()
    member.loadBlogsAndStuff().then((result)=>{

        res.render('index', {blog: result.blogs, memberData: result.memberData, memberInfo: result.memberInfo})
    }).catch((error)=>{
        res.redirect('https://www.google.com/search?q=why+should+i+be+a+volunteer&sxsrf=APq-WBs3URDVI4BTTgf8KflTzZZd8amsJw%3A1649611000878&source=hp&ei=-BBTYuCUM-ap4t4P_uS3aA&iflsig=AHkkrS4AAAAAYlMfCE2uO8dEO1HUBzVadG2czRLyQzuh&oq=why+i+should+be+a+vo&gs_lcp=Cgdnd3Mtd2l6EAMYADIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeOgsIABCABBCxAxCDAToICAAQgAQQsQM6CAgAELEDEIMBOggILhCABBCxAzoFCAAQgAQ6CwguEIAEEMcBENEDOgsILhCABBCxAxDUAjoLCC4QgAQQsQMQgwE6CAguEIAEENQCOgoIABCABBBGEP8BOgUILhCABFAAWOErYMk4aABwAHgAgAGCAogBnxeSAQYwLjE4LjKYAQCgAQE&sclient=gws-wiz')
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
        res.render('createBlogPost', {from: 'loginDashboard', session_data: req.session.member, errors: req.flash('errors'), previous_posts: result }) 
    }).catch((errors)=>{
        req.flash('errors', errors)
        res.render('createBlogPost', {from: 'loginDashboard', session_data: req.session.member, errors: req.flash('errors'), previous_posts: '' }) 
    })

}

exports.actuallyPostBlog = function(req, res){
    let member = new Member(req.body)
    member.actuallyPostBlog().then((result)=>{
        req.flash('errors', result)
        req.session.save(()=>{
            res.redirect('/createBlogPost')
        })
        
    }).catch((error)=>{
        
        req.flash('errors', error)
        req.session.save(()=>{
        res.redirect('/createBlogPost')    
        })
        
    })
}


exports.displayEditPageForPost = function(req, res){
    
    let member = new Member(req.params.id)
    member.displayPostDataForEditPage().then((result)=>{
        res.render('displayEditPageForPost', {from: 'loginDashboard', errors: req.flash('errors'), DataToBeEdited: result})
    }).catch((error)=>{
        console.log(error)
        req.flash('errors', error)
        req.session.save(()=>{
            res.redirect('/createBlogPost')
        })
    })
}