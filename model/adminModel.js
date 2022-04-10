const logController = require('../controller/logController')
const Member = require('../model/memberModel')
const adminAuth = require('../db').db().collection('adminAuth')
const membersInfo = require('../db').db().collection('membersInfo')
const blog = require('../db').db().collection('blog')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { Module } = require('webpack')

let Admin = function(data){
    this.data = data
    this.errors = []
}

Admin.prototype.cleanUp = function(){
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

Admin.prototype.validate = function(){
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


Admin.prototype.detectDuplicateAdmin = function(email){
    let duplicateDetectionPromise = new Promise((resolve, reject)=>{
        adminAuth.findOne({registerEmail: email}).then((duplicateEntry)=>{
            if(duplicateEntry != null){
                
                reject('There is already another account with this Email.')
            } else{
                resolve('No Duplicate Detected')
            }
        }).catch((result)=>{
            resolve('No Duplicate Detected')
        })
    })
    return duplicateDetectionPromise
}

Admin.prototype.AdminRegister = function(){
    let adminRegisterPromise = new Promise((resolve, reject) =>{
    
    this.cleanUp()
    this.validate()
    this.detectDuplicateAdmin(this.data.registerEmail).then((result)=>{
        if(!this.errors.length && result == 'No Duplicate Detected'){
            // if no error is found then it will hash and insert inside db
            let salt = bcrypt.genSaltSync(10)
            this.data.registerPassword = bcrypt.hashSync(this.data.registerPassword, salt)
            adminAuth.insertOne(this.data).then(()=>{
                resolve('inserted')

            })
                
        }
        else{

            reject(this.errors)
            
        }

    }).catch((error)=>{
        this.errors.push(error)
        console.log(this.errors)
        reject(this.errors)
    })
    })
    return adminRegisterPromise
}

Admin.prototype.login = function(){
    let loginPromise = new Promise((resolve, reject)=>{
        this.cleanUp()
        this.validate()
        adminAuth.findOne({registerEmail: this.data.registerEmail})
        .then((attemptedUser) => {
        if(attemptedUser && bcrypt.compareSync(this.data.registerPassword, attemptedUser.registerPassword)){
            // bcrypt.compareSync is a method of the bcrypt package that compares two values that are accepted as parameters after hashing the first one.
            resolve(attemptedUser)
        } else { 
            reject('invalid username/password!!!!')

        }
    }).catch((error)=>{
        reject(error)
    })
    })
    return loginPromise
}

Admin.prototype.fetchNewMembers = function(session){
    let fetchMembersPromise = new Promise((resolve, reject)=>{
        membersInfo.find().toArray().then((result)=>{
            if(result.length > 0){
            resolve(result) 
            } else{
            resolve('There are no members here. Please recruit them first.')
            }
           
        }).catch((error)=>{
            this.errors.push('Cannot Fetch members, either you have no members or you have database issue, contact developer for details.')
            reject(this.errors)

        })
    })
    return fetchMembersPromise
}

Admin.prototype.updateMemberDesignation = function(){
    let updateDesignationPromise = new Promise((resolve, reject)=>{
        membersInfo.updateOne({registerID: this.data.registerID, registerEmail: this.data.registerEmail}, {$set: {designation: this.data.Designation}}).then((result)=>{
            resolve(`Successfully Update Designation of ${this.data.registerEmail}.`)
        }).catch((error)=>{
            this.errors.push('Server error, please contact developer.')
            reject(this.errors)
        })
    })
    return updateDesignationPromise
}

Admin.prototype.showPosts = function(){
    let showPostsPromise = new Promise((resolve, reject)=>{
        blog.find().toArray().then((result)=>{
            resolve(result)
        }).catch((error)=>{
            reject('Cannot find Data.')
        })
    })
    return showPostsPromise
}

Admin.prototype.approveExistingPost = function(){
    let approvePostPromise = new Promise((resolve, reject)=>{
        blog.updateOne({registerEmail: this.data.registerEmail, blogHeading: this.data.blogHeading, blogBody: this.data.blogBody}, {$set: {status: this.data.status}}).then((result)=>{
            resolve('Successfully Updated.')
        }).catch((error)=>{
            reject('Cannot connect to server.')
        })
    })
    return approvePostPromise
}


module.exports = Admin

