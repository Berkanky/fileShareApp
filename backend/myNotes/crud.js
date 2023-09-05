const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')
const User = require('../auth/schema')
const { v4: uuidv4 } = require('uuid');

const pushdatatomyfiles = (allBody) => {
    allBody.myfiles.myNotes.push(allBody.noteData)
    allBody.myfiles.markModified('myNotes')
    return allBody.noteData
}

const findmyfiles = (allBody) => {
    const myfiles = allBody.MyFilesList.find(
        object => String(object.userId) === String(allBody.currentUserId)
    )
    if(myfiles){
        return myfiles
    }
}


app.post('/:currentUserId/postToMyNotes',async(req,res) => {
    const {currentUserId} = req.params
    try{

        const noteData = {
            qeditor:req.body.noteData.qeditorFullDetailVal,
            date:new Date().toLocaleString(),
            noteId:uuidv4(),
            createrId:currentUserId,
            type:'note',
            noteDescription:req.body.noteData.noteDescription,
            noteTitle:req.body.noteData.noteTitle
        }


        const allBody = {
            noteData:noteData,
            currentUserId:currentUserId
        }
        let MyFilesList = await MyFiles.find()
        if(MyFilesList.length > 0 ){
            Object.assign(allBody,{
                MyFilesList:MyFilesList
            })

            const myfiles = findmyfiles(allBody)
            Object.assign(allBody,{
                myfiles:myfiles
            })

            const uploadedData = pushdatatomyfiles(allBody)
            myfiles.save()

            Object.assign(allBody,{
                uploadedData:uploadedData
            })

            res.status(200).json({allBody})

        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const createfolder  = (allBody) => {
    allBody.myfiles.myNotes.push(allBody.folderData)

    allBody.myfiles.markModified('myNotes')
    return allBody.myfiles
}

app.put('/:currentUserId/createFolder',async(req,res) => {
    const {currentUserId} = req.params
    try{
        
        const allBody = {
            folderName:req.body.folderName,
            currentUserId:currentUserId
        }

        let MyFilesList = await MyFiles.find()
        if(MyFilesList.length > 0){
            Object.assign(allBody,{
                MyFilesList:MyFilesList
            })
            const myfiles = findmyfiles(allBody)
            Object.assign(allBody,{
                myfiles:myfiles
            })

            const folderData = {
                folderName:allBody.folderName ?? '',
                qeditor:'',
                date:new Date().toLocaleString(),
                noteId:uuidv4(),
                createrId:allBody.currentUserId,
                type:'folder',
                notes:[]
            }
            Object.assign(allBody,{
                folderData
            })
            const createfolderFunc = createfolder(allBody)

            Object.assign(allBody,{
                createfolderFunc
            })

            await createfolderFunc.save()
            res.status(200).json({allBody,folderData})
        }
    }catch(err){
        res.status(500).json({message:'Internal  Server Error'})
    }
})

const seperatemynotes = (allBody) => {
    const newBody = {
        notes:[],
        folders:[]
    }
    
    allBody.myfiles.myNotes.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(check){

            const findcreater = allBody.allUsersList.find(
                object => String(object._id) === String(element.createrId)
            )
            if(findcreater){
                Object.assign(element,{
                    createrDetail:findcreater
                })
            }

            const seccheck = element.type === 'note' ? true  : false
            if(seccheck){
                newBody.notes.push(element)
            }else{
                newBody.folders.push(element)
            }
        }
    });

    return newBody

}

app.get('/:currentUserId/getMyNotes',async(req,res) => {
    const {currentUserId} = req.params
    try{
        const allBody = {
            currentUserId
        }
        let MyFilesList = await MyFiles.find()
        let allUsersList = await User.find()
        if(MyFilesList.length > 0 && allUsersList.length > 0){
            Object.assign(allBody,{
                MyFilesList,
                allUsersList
            })
            const myfiles = findmyfiles(allBody)
            Object.assign(allBody,{
                myfiles
            })

            const newBody = seperatemynotes(allBody)

            Object.assign(allBody,{
                newBody
            })
            res.status(200).json({
                allBody:allBody,
                notes:newBody.notes,
                folders:newBody.folders
            })
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Err'})
    }
})


const findselectednote = (allBody) => {
    //return allBody.myfiles.myNotes
    const findnote = allBody.myfiles.myNotes.find(
        object => String(object.noteId) === String(allBody.noteId)
    )
    if(findnote){
        return findnote
    }else{
        return  {message:'Err',allBody:allBody}
    }
}


app.get('/:currentUserId/:noteId/getSelectedNoteDetail',async(req,res) => {
    const {currentUserId,noteId} = req.params
    try{
        const allBody = {
            currentUserId,
            noteId
        }
        let MyFilesList = await MyFiles.find()
        if(MyFilesList.length > 0){
            Object.assign(allBody,{
                MyFilesList
            })
            const myfiles = findmyfiles(allBody)
            Object.assign(allBody,{
                myfiles
            })

            const findednote = findselectednote(allBody)

            const finduserdetail = await User.findOne({_id : findednote.createrId})
            if(finduserdetail){
                Object.assign(findednote,{
                    createrDetail:finduserdetail
                })
            }

            res.status(200).json({allBody,findednote})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server  Error'})
    }
})

app.put('/:currentUserId/:noteId/giveStar',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            selectedNote:req.body.selectedNote
        }
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const selectedNote = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            if(selectedNote){
                const check = selectedNote.hasOwnProperty('starDate')
                if(!check){
                    Object.assign(selectedNote,{
                        starDate:new Date().toLocaleString()
                    })
                }else{
                    delete selectedNote.starDate
                }

                myfiles.markModified('myNotes')
                await myfiles.save()
                res.status(200).json({myfiles,selectedNote})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Err'})
    }
})



app.put('/:currentUserId/:noteId/updateNote',async(req,res) =>{
    const {currentUserId,noteId} = req.params
    try{
        const allBody = {
            updatedData:req.body.updatedData
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const findnote = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            if(findnote){
                Object.assign(findnote,allBody.updatedData,{
                    updatedDate:new Date().toLocaleString()
                })

                myfiles.markModified('myNotes')
                await myfiles.save()
                res.status(200).json({findnote})
            }
        }

    }catch(err){
        res.status(500).json({message:'Intenral Server Err'})
    }
})


app.put('/:currentUserId/:noteId/removeSelectedNote',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const findnote = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            myfiles.myNotes = myfiles.myNotes.filter(
                object => String(object.noteId) !== String(findnote.noteId)
            )
            myfiles.markModified('myNotes')
            await myfiles.save()
            res.status(200).json({findnote})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const deleteAllSelecteds = (allBody) => {
    allBody.selectedNotes.forEach(element => {
        allBody.myfiles.myNotes = allBody.myfiles.myNotes.filter(
            object => String(object.noteId) !== String(element.noteId)
        )
    });

    return allBody.myfiles

}

app.put('/:currentUserId/removeSelectedNotes',async(req,res) => {
    const {currentUserId} = req.params
    try{
        const allBody = {
            currentUserId:currentUserId,
            selectedNotes:req.body.selectedNotes
        }
        const myfiles = await MyFiles.findOne(
            {userId : currentUserId}
        )
        if(myfiles){
            Object.assign(allBody,{
                myfiles:myfiles
            })

            deleteAllSelecteds(allBody)

            myfiles.markModified('myNotes')
            await myfiles.save()
            res.status(200).json({myfiles:myfiles,selectedNotes:req.body.selectedNotes})
        }


    }catch(err){
        res.status(500).json({message:'Internal Server err'})
    }
})


const giveStarToAllSelecteds = ( allBody ) => {
    allBody.selectedNotes.forEach(element => {
        const result = allBody.myfiles.myNotes.find(
            object => String(object.noteId) === String(element.noteId)
        )
        if(result){
            const check = result.hasOwnProperty('starDate')
            if(!check){
                Object.assign(result,{
                    starDate:new Date().toLocaleString()
                })
            }else{
                result.starDate = new Date().toLocaleString()
            }
        }
    });
    return allBody.myfiles
}

app.put('/:currentUserId/giveStarToSelecteds',async(req,res) =>{
    const {currentUserId} = req.params
    try{
        const allBody = {
            currentUserId:currentUserId,
            selectedNotes:req.body.selectedNotes
        }

        const myfiles = await MyFiles.findOne(
            {userId : currentUserId}
        )
        if(myfiles){
            Object.assign(allBody,{
                    myfiles:myfiles
            })
            giveStarToAllSelecteds(allBody)

            myfiles.markModified('myNotes')
            await myfiles.save()

            res.status(200).json({myfiles})
        }

    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const currentTime = () => {
    const date = new Date().toLocaleString()
    return date
}

const updatelastseendate = (allBody) => {
    const check = allBody.findnotefolder.hasOwnProperty('lastSeenDate')
    if(!check){
        Object.assign(allBody.findnotefolder,{
            lastSeenDate:currentTime()
        })
    }else{
        allBody.findnotefolder.lastSeenDate = currentTime()
    }
}

const seperatefiles = (allBody) =>{

    const newBody = {
        notes:[],
        folders:[]
    }

    allBody.findnotefolder.notes.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(check){
            if(element.type === 'note'){
                newBody.notes.push(element)
            }else if(element.type === 'folder'){
                newBody.folders.push(element)
            }
        }
    });

    return newBody

}

app.get('/:currentUserId/:noteId/getSelectedNoteFolderDetail',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            currentUserId,noteId
        }
        const myfiles = await MyFiles.findOne(
            {userId : currentUserId}
        )
        if(myfiles){
            const findnotefolder = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            if(findnotefolder){
                Object.assign(allBody,{
                    findnotefolder
                })

                updatelastseendate(allBody)

                let notesList = seperatefiles(allBody).notes
                let foldersList = seperatefiles(allBody).folders

                myfiles.markModified('myNotes')
                await myfiles.save()

                res.status(200).json({findnotefolder,notesList,foldersList})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})



app.put('/:currentUserId/:noteId/uploadNoteToFolder',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            currentUserId:currentUserId, noteId:noteId,
            selectedNote:req.body.selectedNote
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const findnote = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            if(findnote){
                Object.assign(allBody,{
                    myfiles,findnote
                })

                const check = findnote.notes.find(
                    object => String(object.noteId) === String(allBody.selectedNote.noteId)
                )
                if(!check){

                    Object.assign(allBody.selectedNote,{
                        addedNotesDate:new Date().toLocaleString()
                    })

                    findnote.notes.push(allBody.selectedNote)
                }else{
                    Object.assign(check,allBody.selectedNote,{
                        addedNotesDate:new Date().toLocaleString()
                    })
                }

                myfiles.markModified('myNotes')
                await myfiles.save()
                res.status(200).json({
                    selectedNote:allBody.selectedNote
                })
            }
        }   
    }catch(err){
        res.status(500).json({message:'Internal Server Err'})
    }
})


const uploadallselectedstofolder = (allBody) => {
    allBody.selectedNotes.forEach(element => {
        const result = allBody.findfolder.notes.find(
            object => String(object.noteId) === String(element.noteId)
        )
        if(!result){
            Object.assign(element,{
                addedNotesDate:currentTime()
            })
            allBody.findfolder.notes.push(element)
        }else{
            Object.assign(result,element,{
                addedNotesDate:currentTime()
            })
        }
    });
}


app.put('/:currentUserId/:noteId/uploadSelectedNotesToFolder',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            currentUserId:currentUserId,
            noteId:noteId,
            selectedNotes:req.body.selectedNotes,
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const findfolder = myfiles.myNotes.find(
                object => String(object.noteId) === String(noteId)
            )
            if(findfolder){
                Object.assign(allBody,{
                    findfolder
                })
                uploadallselectedstofolder(allBody)
                myfiles.markModified('myNotes')
                await myfiles.save()
                res.status(200).json({myfiles})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const seperateFilesSecond = (allBody) => {
    const newBody ={
        notes:[],
        folders:[]
    }
    
    allBody.result.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(check){
            if(element.type === 'note'){
                newBody.notes.push(element)
            }else if(element.type === 'folder'){
                newBody.folders.push(element)
            }
        }
    });
    return newBody
}

app.put('/:currentUserId/:noteId/filterInput',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            currentUserId:currentUserId,
            noteId:noteId,
            totalList:req.body.totalList,
            searchNote:req.body.searchNote
        }

        const result = allBody.totalList.filter(
            object => (object.folderName || object.noteTitle).toLowerCase().includes(allBody.searchNote.toLowerCase())
        )
        if(result){

            Object.assign(allBody,{
                result
            })

            let notes = seperateFilesSecond(allBody).notes
            let folders = seperateFilesSecond(allBody).folders
            res.status(200).json({result,notes,folders})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})



const seperateFilesForExtractDialog = (allBody) => {
    const newBody = {
        notes:[],
        folders:[]
    }
    allBody.currentNoteFolder.notes.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(check){
            if(element.type === 'note'){
                newBody.notes.push(element)
            }else if(element.type === 'folder'){
                newBody.folders.push(element)
            }
        }
    });

    return newBody
}

app.put('/:currentUserId/:noteId/seperateFoldersAndNotes',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = req.body

        const notes = seperateFilesForExtractDialog(allBody).notes
        const folders = seperateFilesForExtractDialog(allBody).folders

        res.status(200).json({allBody,notes,folders})
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

app.put('/:currentUserId/:noteId/extractSelectedNote',async(req,res) => {
    const {currentUserId, noteId} = req.params
    try{
        const allBody = {
            selectedNote:req.body.selectedNote
        }

        const check = allBody.selectedNote.hasOwnProperty('noteId')
        if(check){
            allBody.selectedNote.noteId = uuidv4()
        }else{
            Object.assign(allBody.selectedNote,{
                noteId:uuidv4()
            })
        }

        const secondCheck = allBody.selectedNote.hasOwnProperty('extractedDate')
        if(secondCheck){
            allBody.selectedNote.extractedDate = new Date().toLocaleString()
        }else{
            Object.assign(allBody.selectedNote,{
                extractedDate:new Date().toLocaleString()
            })
        }


        const pushedDataToMyNotes = await MyFiles.findOneAndUpdate(
            {userId : currentUserId},
            {$push : {myNotes : allBody.selectedNote}},
            {new:true,upsert:true}
        )
        res.status(200).json({pushedDataToMyNotes:pushedDataToMyNotes,selectedNote:allBody.selectedNote})
        
    }catch(err){
        res.status(500).json({message:'Internal Server Errorr'})
    }
})

app.put('/:currentUserId/extractAllSelecteds',async(req,res) =>{
    const {currentUserId} = req.params
    try{
        let selectedNotes = req.body.selectedNotes

        selectedNotes.forEach((element) => {

            element.noteId = uuidv4()

            const check = element.hasOwnProperty('extractDate')
            if(check){
                element.extractedDate = new Date().toLocaleString()
            }else{
                Object.assign(element,{
                    extractedDate:new Date().toLocaleString()
                })
            }
        });
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            myfiles.myNotes.push(...selectedNotes)
            myfiles.markModified('myNotes')
            await myfiles.save()
            res.status(200).json({myfiles,selectedNotes})
        }
    }catch(err){
        res.status(500).json({message:'Internal  Server ERror'})
    }
})


module.exports = app