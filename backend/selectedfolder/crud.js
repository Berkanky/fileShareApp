const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')
const User = require('../auth/schema')
const getCurrentTime = require('../dateFunctions/date')

const forfolderlistgetsenderdetail = (newBody) => {
    if(newBody.folderList.length > 0 ){
        newBody.folderList.forEach(element => {
            if(element.files.length > 0 ){
                element.files.forEach(el => {
                    const check = el.hasOwnProperty('senderId')
                    if(check){
                        const result = newBody.AllUsersList.find(object => String(object._id) === String(el.senderId))
                        if(result){
                            Object.assign(el,{senderDetail:result})
                        }
                    }else{
                        const findme = newBody.AllUsersList.find(object => String(object._id) === String(newBody.currentUserId))
                        if(findme){
                            Object.assign(el,{
                                senderId:newBody.currentUserId,
                                senderDetail:findme
                            })
                        }
                    }
                });
            }
        });
    
        return newBody.folderList
    }
}

const forsharedfilesgetsenderdetail = (newBody) => {
    if(newBody.fileList.length > 0 ){
        newBody.fileList.forEach(element => {
            const check = element.hasOwnProperty('senderId')
            if(check){
                const result = newBody.AllUsersList.find(object => String(object._id) === String(element.senderId))
                if(result){
                    Object.assign(element,{senderDetail : result})
                }
            }else{
                const findme = newBody.AllUsersList.find(object => String(object._id) ===  String(newBody.currentUserId))
                if(findme){
                    Object.assign(element,{
                        senderId : newBody.currentUserId,
                        senderDetail:findme
                    })
                }
            }
        });
        return newBody.fileList
    }
}

const seperatesharedfiles = (allBody) => {
    let folderList = []
    let fileList = []
    allBody.selectedFile.files.forEach(element => {
        const lengthVal = Object.keys(element).length
        if(lengthVal > 5){
            fileList.push(element)
        }else{
            folderList.push(element)
        }
    });
    const newBody = {
        folderList:folderList,
        fileList:fileList,
        AllUsersList:allBody.AllUsersList,
        currentUserId:allBody.currentUserId
    }
    newBody.fileList = forsharedfilesgetsenderdetail(newBody)
    newBody.folderList = forfolderlistgetsenderdetail(newBody)
    return newBody
}

const findselectedfile = (allBody) => {
    const selectedFile = allBody.myfiles.specialFiles.find(object => String(object.fileId) === String(allBody.selectedFileId))
    if(selectedFile){
        return selectedFile
    }
}

const findspecialfolderinfiles = (allBody) => {
    //
}


const updatemyfiles = async (allBody) => {
    await allBody.myfiles.save()
}

const updatelastcheckeddate = (allBody) => {
    const check = allBody.selectedFile.hasOwnProperty('lastSeenDate')
    if(check){
        allBody.selectedFile.lastSeenDate = getCurrentTime()
    }else{
        Object.assign(allBody.selectedFile,{lastSeenDate : getCurrentTime()})
    }
    allBody.myfiles.markModified('specialFiles')
    return allBody.selectedFile

}


app.put('/:currentUserId/:selectedFileId/getFileDetail',async(req,res)=>{
    const {currentUserId, selectedFileId} = req.params
    try{
        let AllUsersList = await User.find()
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles && AllUsersList.length > 0){

            const allBody = {
                currentUserId,selectedFileId,myfiles,AllUsersList
            }
            const selectedFile = findselectedfile(allBody) //burayı bulamıyor specialFiles içerisinde
            if(selectedFile){
                Object.assign(allBody,{selectedFile : selectedFile})
                const seperatedFiles = seperatesharedfiles(allBody)
                Object.assign(selectedFile,updatelastcheckeddate(allBody))
                const resBody = {
                    selectedFile,seperatedFiles
                }
                
                await myfiles.save()

                res.status(200).json({
                    resBody
                })
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const findspecialselectedfolder = (allBody) => {
    const currentfile = allBody.myfile.specialFiles.find(object => String(object.fileId) === String(allBody.currentFolder.fileId))
    if(currentfile){
        const selectedspecialfolder = currentfile.files.find(object => String(object.fileId) === String(allBody.selectedFolder.fileId))
        if(selectedspecialfolder){
            return selectedspecialfolder
        }
    }
}


const updatefilesinspecialfolder = (allBody) => {
    let fileList = []
    let folderList = []

    if(allBody.selectedspecialfolder.files.length > 0 ){
        allBody.selectedspecialfolder.files.forEach(element => {
            const lengthVal = Object.keys(element).length
            if(lengthVal > 5){
                fileList.push(element)
            }else{
                folderList.push(element)
            }
        });

        const newObject = {
            fileList:fileList,
            folderList:folderList,
            AllUsersList:allBody.AllUsersList,
            currentUserId:allBody.currentUserId
        }

        newObject.fileList = updatefilelist(newObject)
        return newObject
    }
}


const updatefilelist = (newObject) => {
    if(newObject.fileList.length > 0 ){
        newObject.fileList.forEach(element => {
            const check = element.hasOwnProperty('senderId')
            if(check){
                const findacc = newObject.AllUsersList.find(object => String(object._id) === String(element.senderId))
                if(findacc){
                    Object.assign(element,
                    {
                        senderDetail:findacc
                    })
                }
            }else{
                const findme = newObject.AllUsersList.find(object => String(object._id) === String(newObject.currentUserId))
                if(findme){
                    Object.assign(element,
                        {
                            senderId:findme._id,
                            senderDetail:findme
                        })
                }
            }
        });
        return newObject.fileList
    }
}

app.put('/:currentUserId/getSelectedSpecialFolderDetail',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const allBody = req.body
        let AllUsersList = await User.find()
        const myfile = await MyFiles.findOne({userId : currentUserId})
        if(myfile && AllUsersList.length > 0){
            Object.assign(allBody,{
                myfile:myfile,
                AllUsersList:AllUsersList,
                currentUserId:currentUserId
            })
            const selectedspecialfolder = findspecialselectedfolder(allBody)
            if(selectedspecialfolder){
                Object.assign(allBody, {selectedspecialfolder:selectedspecialfolder})
                const newObject = updatefilesinspecialfolder(allBody)
                res.status(200).json({
                    selectedspecialfolder,
                    newObject
                })
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const deletefromcurrentfolder = (allBody) => {
    allBody.currentFolder.files = allBody.currentFolder.files.filter(object => String(object.fileId) !== String(allBody.selectedfolder.fileId))
    return allBody.currentFolder
}

const externalfile = (allBody) => {
    const result = allBody.myfiles.specialFiles.some(object => String(object.fileId) === String(allBody.selectedfolder.fileId))
    if(!result){
        allBody.myfiles.specialFiles.push(allBody.selectedfolder)
    }
    //burası çalışıyo siliyo ama kaydetmiyo 2.defa req yapıldığında kaydediyo

    const newObject = {
        currentFolder:deletefromcurrentfolder(allBody),
    }
    allBody.myfiles.markModified('specialFiles')
    return newObject
}

// external selectedfolder
app.put('/:currentUserId/:currentFolderId/externalData',async(req,res) => {
    const {currentUserId, currentFolderId} = req.params
    try{

        const allBody = req.body

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const currentFolder = myfiles.specialFiles.find(object => String(object.fileId) === String(currentFolderId))
            if(currentFolder){
                const selectedfolder = currentFolder.files.find(object => String(object.fileId) === String(allBody.selectedFolderId))
                if(selectedfolder){
                    
                    Object.assign(allBody,{
                        currentUserId:currentUserId,
                        currentFolderId:currentFolderId,
                        myfiles:myfiles,
                        currentFolder:currentFolder,
                        selectedfolder:selectedfolder
                    })
                    
                    const checkforfile = selectedfolder.hasOwnProperty('type')
                    if(!checkforfile){
                        const newObject = externalfile(allBody)

                        allBody.currentFolder.files = newObject.currentFolder.files
                        myfiles.markModified('specialFiles')
                        await myfiles.save()
                        
                        res.status(200).json({
                            allBody:allBody,
                            selectedfolder:allBody.selectedfolder,
                            checkforfile:checkforfile
                        })
                    }else{
                        const newObject = externselectedfile(allBody)
                        myfiles.markModified(['myfiles'])
                        await myfiles.save()
                        res.status(200).json({
                            newObject,
                            checkforfile
                        })
                    }
                }
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const externselectedfile = (allBody) => {
    const check = allBody.myfiles.myfiles.some(object => String(object.fileId) === String(allBody.selectedfolder.fileId))
    if(!check){
        allBody.myfiles.myfiles.push(allBody.selectedfolder)
    }

    allBody.currentFolder.files  = allBody.currentFolder.files.filter(object => String(object.fileId) !== String(allBody.selectedfolder.fileId))

    const newObject = {
        selectedfolder:allBody.selectedfolder,
        currentFolder:allBody.currentFolder
    }
    allBody.myfiles.markModified(['specialFiles'])

    return newObject
}




module.exports = app