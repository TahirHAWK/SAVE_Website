const mongodb = require('mongodb')
const logController = require('../controller/logController')
const membersAuth = require('../db').db().collection('membersAuth')
const membersInfo = require('../db').db().collection('membersInfo')
const blog = require('../db').db().collection('blog')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { Module } = require('webpack')
const { load } = require('dotenv')


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
            reject(this.errors)

         
        } else {

        
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

Member.prototype.updateProfile = function(){
    let updatePromise = new Promise((resolve, reject)=>{
        membersInfo.updateOne({registerEmail: this.data.registerEmail}, {$set: this.data},  { upsert: true }  ).then((result)=>{
            resolve('Data updated successfully')
        }).catch((error)=>{
            logController.errorLog(error, 'error').then((error)=>{

                reject(error)
            }).catch((error)=>{
                this.errors.push('Cannot save log errors, please contact developer.')
                reject(this.errors)
            }) 
        })

    })
    return updatePromise
}


Member.prototype.checkMemberAvailability = function(){
    let checkMemberPromise = new Promise((resolve, reject)=>{
        membersInfo.findOne({registerEmail: this.data.registerEmail}).then((result)=>{
            // check if null
            if(result == null || result == ''){
                result = {
                    registerEmail: '',
                    aboutMe: '',
                    designation: '',
                    facebookID: '',
                    linkedinID: '',
                    registerID: ''
                  }
            }
            resolve(result)
        }).catch((notFound)=>{
            console.log(notFound, '<== from checkMemberAvailability model not found')
            if(notFound == null || notFound == ''){
                notFound = {
                    registerEmail: '',
                    aboutMe: '',
                    designation: '',
                    facebookID: '',
                    linkedinID: '',
                    registerID: ''
                  }
            }
            reject(notFound)
        })
    })
    return checkMemberPromise
}

Member.prototype.actuallyPostBlog = function(){
    let postBlogPromise = new Promise((resolve, reject)=>{
        console.log(this.data) 
        // trimming spaces and checking empty property
        this.correctionBlogData()
        // inserting or updating the db with the new post
        blog.updateOne({registerEmail: this.data.registerEmail, blogHeading: this.data.blogHeading}, {$set: this.data},  { upsert: true }).then((result)=>{
            resolve('Your post has been saved successfully, please wait for the admin to review and approve.', result)
        }).catch((error)=>{
            logController.errorLog(error, 'error').then((result)=>{
                // console.log('saved to error log database successfully')
                reject('Blog cannot be saved, contact your developer.')
            }).catch((error)=>{
                // console.log('cannot be saved to error log database')
                reject('Blog cannot be saved, contact your developer.')

            })

        })

    })
    return postBlogPromise
}

Member.prototype.correctionBlogData = function(){
    // trimming empty spaces
    this.data.blogHeading = this.data.blogHeading.trim()
    this.data.blogBody = this.data.blogBody.trim()
    this.data.imageAddress = this.data.imageAddress.trim()

    // check if imageAddress is empty or not
    //  if empty set a default image to display at every blog
    if(this.data.imageAddress == '' || this.data.imageAddress == "" || this.data.imageAddress == null || this.data.imageAddress == undefined){
        // have to check if the default image link is working or not
        this.data.imageAddress = "./public/static_images/save_banner.jpg"
    }


}

Member.prototype.fetchPreviousPostsByMember = function(){
    let fetchPostPromise = new Promise((resolve, reject)=>{
        blog.find({registerEmail: this.data.registerEmail}).toArray().then((result)=>{
            if(result =='' || result == "" || result == null || result == undefined){
                result=[{
                    blogHeading: 'Start writing to post a new one.',
                    blogBody: 'You have no old Blogs',
                    imageAddress: './public/static_images/save_banner.jpg',
                    registerEmail: this.data.registerEmail,
                    status: 'waiting'
                }]
            }
            resolve(result)
        }).catch((error)=>{
            logController.errorLog(error, 'error').then((error)=>{
                
                reject('cannot find posts or DB internal error.')
            }).catch((error)=>{
                reject('cannot log error data also cannot find previous posts.')
            })
        })
    })
    return fetchPostPromise
}


Member.prototype.loadBlogsAndStuff = function(){
    let loadPromise = new Promise((resolve, reject)=>{
        blog.find({status: 'Approved'}).toArray().then((result)=>{
            let approvedBlogs = result
            membersAuth.find().toArray().then((memberAuths)=>{
                let members = memberAuths
                membersInfo.find().toArray().then((memberPersonalInfo)=>{

                    let data = {memberData: members, blogs: approvedBlogs, memberInfo: memberPersonalInfo}
                
                    resolve(data)
                }).catch((error)=>{
                    reject('Cannot fetch from DB')
                })
            }).catch((error)=>{
                reject('Cannot fetch from DB')
            })
        }).catch((error)=>{
            reject('Cannot fetch from DB')
        })
    })
    return loadPromise
}


Member.prototype.displayPostDataForEditPage = function(){
    let displayPostDataForEditPagePromise = new Promise((resolve, reject)=>{
       blog.findOne({_id: new mongodb.ObjectId(this.data)}).then((result)=>{
        resolve(result)
       }).catch((error)=>{
        reject('error finding data on DB')
       })

    })
    return displayPostDataForEditPagePromise
}


module.exports = Member