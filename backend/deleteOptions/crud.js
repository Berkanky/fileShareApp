const express = require('express');
const app = express.Router();
const User = require('../auth/schema')
const MyFiles = require('../file/schema')
const getCurrentTime = require('../dateFunctions/date')
const deleteFileAndPushMyDeleteds = require('../globalDeletedsPush/delete')

const pushToMyDeletedFiles = (allBody) => {
    let deleteds = [...allBody.findme.myfiles, ...allBody.findme.specialFiles];
    allBody.findme.deleteds.push(...deleteds)
    return deleteds
}

const clearAll = (allBody) => {
    allBody.findme.myfiles = []
    allBody.findme.specialFiles = []
    return allBody.findme
}


app.put('/:currentUserId/deleteAllFilesAndFolders',async(req,res) => {
    const {currentUserId} = req.params
    try{
        const findme = await MyFiles.findOne({userId : currentUserId})
        if(findme){
            
            const allBody = {
                findme,currentUserId
            }
            
            let deleteds = pushToMyDeletedFiles(allBody)
            const findmeupdated = clearAll(allBody)
            findme.markModified(['specialFiles','myfiles','deleteds'])
            await findme.save()
            const check = true
            res.status(200).json({findme,findmeupdated,deleteds,check})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})






//delete 1 file in index.vue
/* 
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

} */


app.put('/:currentUserId/deleteSelectedFile',async(req,res) => {
    const {currentUserId} = req.params
    try{

        const allBody = {
            selectedFile:req.body.selectedFile,
            currentUserId,
            fileActive:req.body.fileActive
        }
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            Object.assign(allBody,{myfiles:myfiles})


            if(allBody.fileActive === true){
                const deletedFile = deleteFileAndPushMyDeleteds(allBody)
                await myfiles.save()
                res.status(200).json({deletedFile,myfiles})
            }

            //res.status(200).json({allBody})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})




module.exports = app