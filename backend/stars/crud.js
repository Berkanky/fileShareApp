const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')
const User = require('../auth/schema')
const getCurrentTime = require('../dateFunctions/date')



const updatefunction = (sendBody) => {
    let findfile = {}
    const checkforfile = sendBody.selectedFile.hasOwnProperty('type')
    if(checkforfile){
        sendBody.fileActive = true
        sendBody.folderActive = false
        findfile= sendBody.myfiles.myfiles.find(
            object => String(object.fileId) === String(sendBody.selectedFile.fileId)
        )
    }else{
        sendBody.fileActive = false
        sendBody.folderActive = true
        findfile = sendBody.myfiles.specialFiles.find(
            object => String(object.fileId) === String(sendBody.selectedFile.fileId)
        )
    }
    const checkstars = sendBody.myfiles.stars.some(object => String(object.fileId) === String(sendBody.selectedFile.fileId))
    if(!checkstars){
        sendBody.myfiles.stars.push(findfile)
        const check = findfile.hasOwnProperty('starDate')
        if(!check){
            Object.assign(findfile,{starDate:getCurrentTime()})
        }else{
            findfile.starDate  = getCurrentTime()
        }
    }else{
        sendBody.myfiles.stars = sendBody.myfiles.stars.filter(
            object => String(object.fileId) !== String(sendBody.selectedFile.fileId)
        )
        const check = findfile.hasOwnProperty('starDate')
        if(check){
            delete findfile.starDate
        }
    }

    sendBody.myfiles.markModified('stars')

    return findfile

}

app.put('/:currentUserId/giveStar',async(req,res) => {
    const {currentUserId} = req.params
    try{

        const sendBody = {}

        const selectedFile = req.body.selectedFile

        const myfiles = await MyFiles.findOne(
            {userId : currentUserId}
        )
        if(myfiles){

            Object.assign(sendBody,{
                selectedFile:selectedFile,
                myfiles:myfiles,
                currentUserId:currentUserId,
                fileActive:req.body.fileActive,
                folderActive:req.body.folderActive
            })
            const updateddata = updatefunction(sendBody)
            const check = updateddata.hasOwnProperty('starDate')
            myfiles.markModified('myfiles')
            myfiles.markModified('specialFiles')
            await myfiles.save()
            res.status(200).json({myfiles,sendBody,updateddata,check})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})











module.exports = app