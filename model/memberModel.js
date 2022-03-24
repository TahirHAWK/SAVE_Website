const logController = require('../controller/logController')
const membersAuth = require('../db').db().collection('membersAuth')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { Module } = require('webpack')


let Member = function(data){
    this.data = data
    this.errors = []
}

Member.prototype.cleanUp = function(){
    if(typeof(this.data.registerName) != 'string'){
        this.data.registerName = '';
    }
    if(typeof(this.data.registerEmail) != 'string'){
        this.data.registerEmail = '';
    }
    if(typeof(this.data.registerFaculty) != 'string'){
        this.data.registerFaculty = '';
    }
    if(typeof(this.data.registerDepartment) != 'string'){
        this.data.registerDepartment = '';
    }
    if(typeof(this.data.registerPassword) != 'string'){
        this.data.registerPassword = '';
    }
     // here we checked that, if the data submitted by user is not a string type data, it'll return an empty string.

     // get rid of any bogus properties that is not part of our data model.
    this.data = {
        registerName: this.data.registerName.trim(),
        registerEmail: this.data.registerEmail.trim().toLowerCase(),
        registerFaculty: this.data.registerFaculty.trim().toUpperCase(),
        registerDepartment: this.data.registerDepartment.trim().toUpperCase(),
        registerPassword: this.data.registerPassword
    }
    // trim() method will get rid of any empty spaces in the end or beginning of the text that was submitted by user.
    // toLowerCase() method will convert all the text of the field into lowercase letters which is necessary for username and email.
}

Member.prototype.validate = function(){
    // generate error for empty fields
    if(this.data.registerName == ""){
        this.errors.push(' You must provide a username ')}
    if(this.data.registerEmail == ""){
        this.errors.push(' You must provide an Email ')}
    if(this.data.registerFaculty == ""){
        this.errors.push(' You must provide your faculty name ')}
    if(this.data.registerDepartment == ""){
        this.errors.push(' You must provide your department name ')}
    if(this.data.registerPassword == ""){
        this.errors.push(' You must provide your password ')}

    // generate error for formatting problems
    if(!validator.isEmail(this.data.registerEmail)){
        this.errors.push(' You must provide a valid email address ')
    }

}

Member.prototype.detectDuplicate = function(){

    let detectPromise = new Promise((resolve, reject) => {
        membersAuth.findOne({registerEmail: this.data.registerEmail})
    .then((result) => {
        if(result != null) {

             this.errors.push('The email you entered already assigned to another account. ')
             //   console.log('from detectDup', this.errors)
            reject(this.errors)

         
        } else {

             //   console.log("from detect Duplicate, no duplicates found.")
            resolve('not found')
        }
        
    }
    )
    }) 
    return detectPromise
    
}

Member.prototype.register = function(){
    let registerPromise = new Promise((resolve, reject)=>{
        this.cleanUp()
        this.validate()
        this.detectDuplicate().then((result)=>{
            if(!this.errors.length && result == 'not found'){
                // if no error is found then it will hash and insert inside db
                let salt = bcrypt.genSaltSync(10)
                this.data.registerPassword = bcrypt.hashSync(this.data.registerPassword, salt)
                membersAuth.insertOne(this.data).then(()=>{
                    resolve('inserted')

                })
                    
            }
            else{
                 //   console.log('after rejects on model with no duplicate bt cleanup and validation: ',this.errors, result)
                reject(this.errors)
                
            }


        }).catch((error)=>{
            reject(this.errors)
        })

    })
    return registerPromise
}

Member.prototype.login = function(){
    let loginPromise = new Promise((resolve, reject)=>{
        this.cleanUp()
        this.validate()
        membersAuth.findOne({registerEmail: this.data.registerEmail})
        .then((attemptedUser) => {
        if(attemptedUser && bcrypt.compareSync(this.data.registerPassword, attemptedUser.registerPassword)){
            // bcrypt.compareSync is a method of the bcrypt package that compares two values that are accepted as parameters after hashing the first one.
             //   console.log('user found from User model login prototype: ', attemptedUser)
            resolve(attemptedUser)
        } else { 
             //   console.log('user not found from User model login prototype!!!')
            reject('invalid username/password!!!!')

        }
    }).catch((error)=>{
        reject(error)
    })
    })
    return loginPromise
}




module.exports = Member