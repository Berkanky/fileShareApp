const express = require('express');
const app = express.Router();
const MyFiles = require('./schema')
const { v4: uuidv4 } = require('uuid');
const findmyfilesfunction = require('../file/findmyfiles')
const User = require('../auth/schema')

const pushSelectedFiles = async (myselectedfiles, currentUserId) => {
    const myfiles = await MyFiles.findOne({ userId: currentUserId });
    if(myfiles){
        myfiles.myfiles.push(...myselectedfiles);
        await myfiles.save();
    }else{
        const newmyfiles = new  MyFiles({
            userId:currentUserId,
            myfiles:myselectedfiles
        })
        await newmyfiles.save()
    }
  };
  
  app.post('/:currentUserId/postMySelectedFiles', async (req, res) => {
    const { currentUserId } = req.params;
    try{
        const myselectedfiles = req.body.newFiles;
        await pushSelectedFiles(myselectedfiles, currentUserId);
        res.status(200).json({ myselectedfiles:myselectedfiles,uploaded:true });
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
  });


app.put('/:currentUserId/createNewFile',async(req,res)=>{
    const { currentUserId } = req.params;
    try{
        const newfilename = req.body.newfile.icon
        const myfile = await MyFiles.findOne({userId : currentUserId})
        if(myfile){
            const newFile = {fileId:uuidv4(),fileName:newfilename,fileRealName:req.body.newfile.text,files:[],date:new Date().toLocaleString()}
            myfile.specialFiles.push(newFile)
            await myfile.save()
            res.status(200).json({newFile})
        }else{
            const newFile = {fileId:uuidv4(),fileName:newfilename,files:[],fileRealName:req.body.newfile.text,date:new Date().toLocaleString()}
            const newmyfile = new MyFiles({
                userId:currentUserId,
                myfiles:[],
                specialFiles:[newFile]
            })
            await newmyfile.save()
            res.status(200).json({newFile})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const findimages = (allBody) => {
    let newList = []
    allBody.myfiles.myfiles.forEach(element => {

        const newObject = element

        if(element.type === 'image/jpeg' || element.type === 'image/png'){
            newObject.imageCheck = true
            newList.push(newObject)
        }else{
            newObject.imageCheck = false
            newList.push(newObject)
        }
    });
    const listObject = {
        newList
    }
    return listObject
}

/* const myfiles = await MyFiles.findOne({userId : currentUserId})
if(myfiles){
    const allBody = {myfiles,currentUserId}
    const myfilesonly = findimages(allBody)
    const getmyfileswithfunc = findmyfilesfunction(currentUserId)
    res.status(200).json({
        myfilesonly:myfilesonly,
        specialFiles:myfiles.specialFiles ?? [],
        myfiles:myfiles,
        getmyfileswithfunc:getmyfileswithfunc
    })
}else{
    res.status(200).json({message:'Nothing Here'})
} */

app.get('/:currentUserId/getFiles',async(req,res)=>{
    const { currentUserId } = req.params;
    try{
        let allFilesList = await MyFiles.find()
        const sendBody = {
            currentUserId
        }
        if(allFilesList.length > 0 ){
            Object.assign(sendBody,{allFilesList:allFilesList})
            const myfiles = findmyfilesfunction(sendBody)
            if(myfiles){
                const allBody = {myfiles,currentUserId}
                const check = allBody.hasOwnProperty('myfiles') && allBody.hasOwnProperty('currentUserId');
                if(check){
                    const myfilesonly = findimages(allBody)
                    res.status(200).json({
                        myfilesonly:myfilesonly,
                        specialFiles:myfiles.specialFiles,
                        myfiles:myfiles,
                    })
                }
                // res.status(200).json({myfiles})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const getfilesfunction = () => {
    app.get('/:currentUserId/getFiles',async(req,res)=>{
        const { currentUserId } = req.params;
        try{
            const myfiles = await MyFiles.findOne({userId : currentUserId})
            if(myfiles){
                const allBody = {myfiles,currentUserId}
                const myfilesonly = findimages(allBody)
                res.status(200).json({myfilesonly:myfilesonly,specialFiles:myfiles.specialFiles ?? [],myfiles:myfiles})
            }else{
                res.status(200).json({message:'Nothing Here'})
            }
        }catch(err){
            res.status(500).json({message:'Internal Server Error'})
        }
    })
    
}


const removefrommyfiles = (allBody) => {
    if(allBody.selectedFiles.length > 0){
        allBody.selectedFiles.forEach(element => {
            allBody.myfile.myfiles = allBody.myfile.myfiles.filter(object => String(object.fileId) !== String(element.fileId))
        });
        return allBody.myfile.myfiles
    }else{
        allBody.myfile.markModified('myfiles')  // 01.13 saatinde ekledin en son bu  
        allBody.myfile.myfiles
    }
}


const removeselectedspecialfileaftertransfer =  (allBody) => {
    if(allBody.selectedSpecialFiles.length > 0 ){
        allBody.selectedSpecialFiles.forEach(element => {
            allBody.myfile.specialFiles = allBody.myfile.specialFiles.filter(object => String(object.fileId) !== String(element.fileId))
        })
        return allBody.myfile.specialFiles
    }else{
        allBody.myfile.markModified('specialFiles')
        return allBody.myfile.specialFiles //burası çözdü sorunu aga unutma akşam
    }
}


app.put('/:currentUserId/:selectedFileId/transferToSelectedFile',async(req,res)=>{
    const {currentUserId, selectedFileId} = req.params
    try{
        let selectedFiles = req.body.selectedFiles
        let selectedSpecialFiles = req.body.selectedSpecialFiles
        let concatFiles = selectedFiles.concat(selectedSpecialFiles)
        const selectedFile = req.body.selectedFile
        const myfile = await MyFiles.findOne({userId : currentUserId})
        if(myfile){
            const findspecialfile = myfile.specialFiles.find(object => String(object.fileId) === String(selectedFile.fileId))
            if(findspecialfile){
                findspecialfile.files.push(...concatFiles)
                const allBody = {
                    currentUserId,selectedFiles,selectedFile,myfile,selectedSpecialFiles,
                }   
                let myfileslast = removefrommyfiles(allBody)
                let specialfileslast = removeselectedspecialfileaftertransfer(allBody)
                myfile.markModified(['specialFiles','myfiles'])
                await myfile.save()
                res.status(200).json({findspecialfile:findspecialfile,uploaded:true,allBody:allBody,concatFiles:concatFiles,myfileslast:myfileslast,specialfileslast:specialfileslast})
            }
        }   
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const removeselectedspecialfiles = (allBody) => {
    allBody.myfile.specialFiles.forEach(element => {
        const check =  allBody.selectedSpecialFiles.some(object => String(object.fileId) === String(element.fileId))
        if(check){
            allBody.myfile.specialFiles = allBody.myfile.specialFiles.filter(object => String(object.fileId) !== String(element.fileId))
        }
    });
}


app.put('/:currentUserId/removeSelectedFiles',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const myfile = await MyFiles.findOne({userId : currentUserId})
        if(myfile){
            let myselectedfiles = req.body.selectedFiles
            let selectedSpecialFiles = req.body.selectedSpecialFiles
            if(myselectedfiles.length > 0 ){
                myfile.myfiles.forEach(element => {
                    const result = myselectedfiles.some(object => String(object.fileId) === String(element.fileId))
                    if(result){
                        myfile.myfiles = myfile.myfiles.filter(object => String(object.fileId) !== String(element.fileId))
                    }
                });
            }
            const allBody = {
                myfile,selectedSpecialFiles
            }
            if(selectedSpecialFiles.length > 0 ){
                removeselectedspecialfiles(allBody)
            }
            myfile.markModified('myfiles')
            await myfile.save()
            res.status(200).json({myfile:myfile,removed:true,myfiles:myfile.myfiles})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})



app.put('/:currentUserId/filterFiles',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const searchValue = req.body.searchValue
        const myfile = await MyFiles.findOne({userId : currentUserId})
        if(myfile){

            let findFiles = myfile.myfiles.filter(object => String(object.name).includes(searchValue))
            let findSpecialFiles = myfile.specialFiles.filter(object => String(object.fileRealName ?? object.fileName).includes(searchValue))

            res.status(200).json({
                findFiles:findFiles.length > 0 ? findFiles : [{message:'No File, Try Again'}],
                findSpecialFiles:findSpecialFiles.length > 0 ? findSpecialFiles  : [{message:'No Folder, Try Again'}]
            })
            
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})





module.exports = app