

/* 

        const allBody = {
            selectedFile:req.body.selectedFile,
            currentUserId,
            fileActive:req.body.fileActive
        }
        Object.assign(allBody,{myfiles:myfiles})
*/


const getCurrentTime = require('../dateFunctions/date')


const deleteFileAndPushMyDeleteds = (allBody) => {
    allBody.myfiles.myfiles = allBody.myfiles.myfiles.filter(object => String(object.fileId) !== String(allBody.selectedFile.fileId))

    const check = allBody.selectedFile.hasOwnProperty('deletedDate')
    if(!check){
        Object.assign(allBody.selectedFile,{deletedDate:getCurrentTime()})
    }else{
        allBody.selectedFile.deletedDate = getCurrentTime()
    }
    allBody.myfiles.deleteds.push(allBody.selectedFile)

    allBody.myfiles.markModified(['myfiles','deleteds'])

    return allBody.selectedFile

}


module.exports = deleteFileAndPushMyDeleteds