const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')





const findselectednewfile = (allBody) => {
    const selectedfile = allBody.myfiles.myfiles.find(object => String(object.fileId) === String(allBody.currentFile.fileId))
    if(selectedfile){
       Object.assign(selectedfile,allBody.newSelectedFile,{fileId:selectedfile.fileId})
       return selectedfile
    }
}


app.put('/:currentUserId/updateSelectedFile',async(req,res) => {
    const {currentUserId} = req.params    
    try{
        const allBody = {
            currentFile:req.body.currentFile,
            newSelectedFile:req.body.newSelectedFile,
            currentUserId:currentUserId
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            
            Object.assign(allBody,{
                myfiles:myfiles
            })
            const slt = findselectednewfile(allBody)
            myfiles.markModified('myfiles')
            await myfiles.save()
            res.status(200).json({allBody,slt})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})






module.exports = app