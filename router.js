const express = require('express')
const router = express.Router()
const memberController = require('./controller/memberController')
const logController = require('./controller/logController')


// Home routes
router.get('/', memberController.home);

// members routes
router.get('/loginRegister', memberController.loginRegister);

// with logging example 
// router.get('/',logController.homeLog , memberController.home)



module.exports = router