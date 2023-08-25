const express = require('express');
const app = express.Router();
const { v4: uuidv4 } = require('uuid');
const MyFiles = require('../file/schema')
const downloadfunc = require('../download/download')
const getCurrentTime = require('../dateFunctions/date')

const posttodownloads = (allBody) => {

    const newObject = allBody.selectedData

    Object.assign(newObject,{downloadDate : new Date().toLocaleString()})

    allBody.myfiles.downloads.push(newObject)
}


const updateselecteddata = (allBody) => {
    const check = allBody.selectedData.hasOwnProperty('downloadDate')
    if(check){
        allBody.selectedData.downloadDate = getCurrentTime()
    }else{
        Object.assign(allBody.selectedData,{downloadDate : getCurrentTime()})
    }


    const findforupdate = allBody.myfiles.myfiles.find(object => String(object.fileId) ===  String(allBody.selectedData.fileId))
    if(findforupdate){
        Object.assign(findforupdate,allBody.selectedData)
    }

    allBody.myfiles.markModified('myfiles')

    return findforupdate
}


app.put('/:currentUserId/addToDownloads',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const selectedData = req.body.selectedData
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const allBody = {
                selectedData,currentUserId,myfiles
            }
            //posttodownloads(allBody)
            downloadfunc(allBody)
            const updateddata = updateselecteddata(allBody)
            myfiles.markModified(['downloads'])
            await myfiles.save()
            res.status(200).json({myfiles,updateddata})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


module.exports = app