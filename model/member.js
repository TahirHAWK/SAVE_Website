const userData = require('../db').db().collection('userData')
const bcrypt = require('bcryptjs')
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

Member.prototype.detectDuplicate = function(){
    return new Promise((resolve, reject)=>{
        userData.findOne({email: this.data.email}).then((result)=>{
            if(result != null){
                this.errors.push('Duplicate value exists, use another email.')
                reject('Duplication found')
            } else{
                resolve('no duplication')
            }    
        }).catch((err)=>{
            // this is part where you make some logs so that it can be used to debug later.
            console.log(new Date(), ": You have some errors(detect duplicate model): \n",err)
        })   
    })   
}

Member.prototype.register = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUpRegisterData()
        this.validate()
        this.detectDuplicate()
        .then((result)=>{
            if(result == 'no duplication' && !this.errors.length){
                let salt = bcrypt.genSaltSync(10)
                this.data.password = bcrypt.hashSync(this.data.password, salt)
                userData.insertOne(this.data) 
                .then((result)=>{
            resolve('done')
                                })
         } // closing if parenthesis
        })
       
        .catch((err)=>{
            // this is part where you make some logs so that it can be used to debug later.
            console.log(new Date(), ": You have some errors(register model): \n",err)
            reject()
        })
   })
}

Member.prototype.login = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUpRegisterData()
        userData.findOne({email: this.data.email})
        .then((result)=>{
            if(result && bcrypt.compareSync(this.data.password, result.password)){
                resolve(result)
            } else{
                this.errors.push('The password you entered is incorrect.')
                reject()
            }
        })
        .catch((err)=>{
            console.log(new Date(), ': there might be a database problem:\n', err)
        })
    })
}


module.exports = Member