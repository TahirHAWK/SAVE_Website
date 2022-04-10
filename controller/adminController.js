const Admin = require('../model/adminModel')
const { result } = require('lodash')

exports.adminLogin = function(req, res){
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
        let admin = new Admin()
        admin.showContactFormData().then((result)=>{

            res.render('AdminDashboard', {from: 'AdminDashboard', errors: req.flash('errors'), session_data: req.session.admin, formData: result})
        }).catch((error)=>{
            req.flash('errors', error)
            req.session.save(()=>{

                res.render('AdminGuest', {from: 'AdminGuest', errors: req.flash('errors')})
            })
        })
    } else{
    res.render('AdminGuest', {from: 'AdminGuest', errors: req.flash('errors')})
    } 

}

exports.adminRegister = function(req, res){
    let admin = new Admin(req.body)
    admin.AdminRegister().then((result)=>{
        req.session.admin = {
            registerName: admin.data.registerName,
            registerEmail: admin.data.registerEmail,
            registerFaculty: admin.data.registerFaculty,
            registerDepartment: admin.data.registerDepartment,
            loginAs: 'admin'
        }
        req.session.save(function(){
            res.redirect('/adminLogin')
        })
        
    }).catch((errors)=>{
        req.flash('errors', errors)
        req.session.save(function(){
            res.redirect('/adminLogin')
        })
    })
    
}

exports.logout = function(req, res){
    req.session.destroy(()=>{
        res.redirect('/adminLogin')
    })
}

exports.login = function(req, res){
    let admin = new Admin(req.body)
    admin.login().then((result)=>{
        req.session.admin = {
            registerName: result.registerName,
            registerEmail: result.registerEmail,
            registerFaculty: result.registerFaculty,
            registerDepartment: result.registerDepartment,
            loginAs: 'admin'
        }
        req.session.save(()=>{
            res.redirect('/adminLogin')
        })
    }).catch((errors)=>{
        req.flash('errors', errors)
        req.session.save(()=>{
            res.redirect('/adminLogin')
        })
    })
}

exports.assignMembers = function(req, res){
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
    let admin = new Admin()
    admin.fetchNewMembers(req.session.admin).then((result)=>{

        if(result.length > 0){

            res.render('assignMemberDesignation', {from: 'AdminDashboard', errors: req.flash('errors'), members: result})
            
        } else{
            res.render('assignMemberDesignation', {from: 'AdminDashboard', errors: req.flash('errors'), members: result})
            
        }

    }).catch((error)=>{
        console.log(error, '<<<<-----from reject tab')
        req.flash('errors', error)
        req.session.save(function(){
            res.redirect('/adminLogin')
        })
    })

    } else{
        res.redirect('/')
    }

}

exports.submitDesignation = function(req, res){

    let admin = new Admin(req.body)
    admin.updateMemberDesignation().then((result)=>{
        req.flash('errors', result)
        req.session.save(function(){
            res.redirect('/assignMembers')
        })
    }).catch((error)=>{
        req.flash('errors', error)
        req.session.save(function(){
            res.redirect('/assignMembers')
        })
    })
}

exports.approvePosts = function(req, res){
    // checking if the user logged in as admin or not.
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
        let admin = new Admin()
        admin.showPosts().then((result)=>{

            res.render('approvePosts', {from: 'AdminDashboard', errors: req.flash('errors'), blog: result})
        }).catch((error)=>{

        })
    } else{
        res.redirect('/')
    }
}

exports.approveExistingPost = function(req, res){
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
        let admin = new Admin(req.body)
        admin.approveExistingPost().then((result)=>{
            req.flash('errors', result)
            req.session.save(()=>{
                res.redirect('/approvePosts')
            })
        }).catch((error)=>{
            req.flash('errors', error)
            req.session.save(()=>{
                res.redirect('/approvePosts')
            })
        })
    } else{
        res.redirect('/')
    }
}

exports.PostcontactFormData = function(req, res){
    let admin = new Admin(req.body)
    admin.PostcontactFormData().then((result)=>{
        res.redirect('/')
    }).catch((error)=>{
        res.redirect('/')
    })
}