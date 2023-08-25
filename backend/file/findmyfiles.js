const MyFiles = require('../file/schema')


const findmyfilesfunction = (sendBody) => {

    const myfiles = sendBody.allFilesList.find(
        object => String(object.userId) === String(sendBody.currentUserId)    
    )
    if(myfiles){
        return myfiles
    }

};
  



module.exports = findmyfilesfunction