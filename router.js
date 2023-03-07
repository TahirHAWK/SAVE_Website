const express = require('express')
const router = express.Router()
// controller files will be linked here
const guestController = require('./controller/guestController')
const memberController = require('./controller/memberController') 

// Guest routes
router.get('/', guestController.home);
router.get('/about', guestController.about)
router.get('/contact', guestController.contact)

// Portal routes
router.get('/login', memberController.loginPage)
router.post('/registerAccount', memberController.registerAccount)
router.post('/login', memberController.loginAccount)
router.get('/logout', memberController.logout)
router.get('/weddingPortal/:id', memberController.isUserOwner, memberController.loginPage)
router.get('/blank', memberController.blankPageDisplay)

// Wildcard route (normally for displaying routes that won't be found)
// IMPORTANT: Make sure it is at the end of all routes.
router.all('*', guestController.notFoundPage);



module.exports = router