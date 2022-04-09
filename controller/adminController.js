const Admin = require('../model/adminModel')
const { result } = require('lodash')

exports.adminLogin = function(req, res){
    if(req.session.admin && req.session.admin.loginAs == 'admin'){
        res.render('AdminDashboard', {from: 'AdminDashboard', errors: req.flash('errors'), session_data: req.session.admin})
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