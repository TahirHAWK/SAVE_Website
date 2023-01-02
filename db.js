const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

// when deploying to new cloud make sure to get the online connection string and use it as environmental variable 
 let connectionString = process.env.CONNECTIONSTRING
// for online


let port = process.env.PORT 


mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client){ 
  if(err){
    console.log('You have some errors: ',err)
  }
  module.exports = client

  // the require ./app file must be after client, otherwise it would generate an error.
  const app = require('./app')
    app.listen(port)
    console.log(`Connection String: ${connectionString}`)
    console.log(`-------------------- Connected to db and port ${port} --------------------`)
})

