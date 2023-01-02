const express = require('express')
const router = express.Router()
// controller files will be linked here
const guestController = require('./controller/guestController')

// Home routes
router.get('/', guestController.home);
router.get('/about', guestController.about)
router.get('/contact', guestController.contact)

// other routes will start from here




module.exports = router