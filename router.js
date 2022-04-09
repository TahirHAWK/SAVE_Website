const express = require('express')
const router = express.Router()
const memberController = require('./controller/memberController')
const logController = require('./controller/logController')
const adminController = require('./controller/adminController')


// Home routes
router.get('/', memberController.home);

// members routes
router.get('/loginRegister', memberController.loginRegister);
router.get('/logOut', memberController.logOut);
router.get('/createBlogPost', memberController.createBlogPost)
router.post('/createBlogPost', memberController.actuallyPostBlog)
router.post('/login', memberController.login)
router.post('/blogRegister', memberController.blogRegister);
router.post('/update_member_profile', memberController.updateProfile)

// admin routes
router.get('/adminLogin', adminController.adminLogin)
router.post('/adminRegister', adminController.adminRegister)
router.get('/adminLogout', adminController.logout)
router.post('/adminLogin', adminController.login)


// with logging example 
// router.get('/',logController.homeLog , memberController.home)



module.exports = router