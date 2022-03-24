const { resolveInclude } = require('ejs');
const { reject } = require('lodash');

const membersLog = require('../db').db().collection('logs')


let Logs = function(data){
    this.data = data;
    this.errors = []
}

Logs.prototype.homeLog = function(data){
    let activity = 'Clicked/loaded on homepage'
    let homelogPromise = new Promise((resolve, reject) => {
        let newdata = {
            year: data.getFullYear(),
            month: data.getMonth(),
            day: data.getDate(),
            hour: this.hourConverter(data.getHours()),
            minute: data.getMinutes(),
            second: data.getSeconds(),
            TimeStamp: data,
            session: this.data,
            activity: activity
        }
        console.table(newdata)
        console.table(this.data)
    
        membersLog.insertOne(newdata).then((result) => {
            resolve(result)
        }).catch((result) => {
            reject(result)
        })
    })

    return homelogPromise
}

Logs.prototype.hourConverter = function(time){
    if(time>12){
        return time - 12
    } else {
        return time
    }
}

Logs.prototype.errorLog = function(category){
    // timestamp for error log into db
    let timestamp = new Date()
    console.log(timestamp)
    
    let errorLogPromise = new Promise((resolve, reject)=> {
        let errorMsgforDB = {
            timestamp: timestamp,
            category: category,
            errorData: this.data
        }

        membersLog.insertOne(errorMsgforDB).then((result)=> {
            resolve(result)
        }).catch((error)=>{
            reject(error, 'error while inserting to db')
        })
    })
    return errorLogPromise

}

module.exports = Logs