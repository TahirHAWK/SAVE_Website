const express = require('express')
const router = express.Router()
const memberController = require('./controller/memberController')
const logController = require('./controller/logController')
const adminController = require('./controller/adminController')

// members routes
router.get('/edit/post/:id', memberController.displayEditPageForPost)
router.get('/loginRegister', memberController.loginRegister);
router.get('/logOut', memberController.logOut);
router.get('/createBlogPost', memberController.createBlogPost)
router.post('/createBlogPost', memberController.actuallyPostBlog)
router.post('/login', memberController.login)
router.post('/blogRegister', memberController.blogRegister);
router.post('/update_member_profile', memberController.updateProfile)

// Home routes
router.get('/', memberController.home);


// admin routes
router.get('/adminLogin', adminController.adminLogin)
router.post('/adminRegister', adminController.adminRegister)
router.get('/adminLogout', adminController.logout)
router.post('/adminLogin', adminController.login)
router.get('/assignMembers', adminController.assignMembers)
router.post('/submitDesignation', adminController.submitDesignation)
router.get('/approvePosts', adminController.approvePosts)
router.post('/approveExistingPost', adminController.approveExistingPost)
router.post('/contactForm', adminController.PostcontactFormData)


// with logging example 
// router.get('/',logController.homeLog , memberController.home)



module.exports = router