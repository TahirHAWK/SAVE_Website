const express = require('express')
const router = express.Router()
// controller files will be linked here


// Home routes
router.get('/', memberController.home);

// other routes will start from here




module.exports = router