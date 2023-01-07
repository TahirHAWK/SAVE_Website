const userData = require('../db').db().collection('userData')
const bcrypt = require('bcryptjs')
const { promiseImpl, resolveInclude } = require('ejs')
const { reject } = require('lodash')
const validator = require('validator')


let Member = function(data){
    this.data = data
    this.errors = []
}

Member.prototype.cleanUpRegisterData = function(){
    if(typeof(this.data.name) != 'string'){
        this.errors.push('The data you entered is not valid.')
        this.data.name = ""
    } 
     if(typeof(this.data.email) != 'string'){
        this.errors.push('The data you entered is not valid.')
        this.data.email = ""
    }  
    if(typeof(this.data.password) != 'string'){
        this.errors.push('The data you entered is not valid.')
        this.data.password = ""
    } 
     if(typeof(this.data.fbLink) != 'string'){
        this.errors.push('The data you entered is not valid.')
        this.data.fbLink = ""
    }
    
     this.data = {
        name: this.data.name.trim(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password,
        fbLink: this.data.fbLink.trim().toLowerCase(),
        userType: "normal"
    }
}

Member.prototype.validate = function(){
    if(this.data.name == "" || this.data.name.length < 5){
        this.errors.push('Please enter your name correctly.') 
    }
    if(this.data.email == ""){
        this.errors.push('Please enter your email correctly.') 
    }
    if(this.data.password == "" || this.data.password.length < 12){
        this.errors.push('Please enter your password correctly. Your password should at least be 12 characters.')
    } 
    if(this.data.fbLink == ""){
        this.errors.push('Please enter your facebook account link correctly. Your link will look like this: https://www.facebook.com/tahiranam.tamin')
    } 

    // now we check if the email format is correct or not
    if(!validator.isEmail(this.data.email)){
        this.errors.push('The email you entered is not valid in format.')
    }
    if(!validator.isURL(this.data.fbLink)){
        this.errors.push('The link you entered is not valid in format. Make sure you copy the link from your Facebook profile, do not type it.')
    }
}

Member.prototype.detectDuplicate = async function(){
    
        try{
         let result = await userData.findOne({email: this.data.email})
         
         if(result != null){
             this.errors.push('Duplicate value exists, use another email.')
             reject()
        } else{
            resolve('no duplication')
        }
        } catch(err){
        console.log('Problem detecting duplicates on system side.')
        
        }
    
}

Member.prototype.register = async function(){
       try{
        this.cleanUpRegisterData()
        this.validate()
        let test = await this.detectDuplicate()
        await console.log('detect duplicate works', test)
       } catch(err){
        console.log('from register model',err)
        this.errors.push('Having problems registering.')
       }

}


module.exports = Member