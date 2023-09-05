const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')
const User = require('../auth/schema.js')
const getCurrentTime = require('../dateFunctions/date')

const getPermissedUsers = (allBody) => {
    const check = allBody.findedfolder.hasOwnProperty('permissions')
    if(check){
        let permissionList = allBody.findedfolder.permissions
        if(permissionList.length > 0){
            return allBody.findedfolder
        }
    }
}

const findfolder  = (allBody) => {
    const result = allBody.myfiles.specialFiles.find(
        object => String(object.fileId) === String(allBody.selectedFolderId)
    )
    if(result){
        return result
    }
}


app.get('/:currentUserId/:selectedFolderId/getPermissedUsers',async(req,res) => {
    const {currentUserId, selectedFolderId} = req.params
    try{
        let allUsersList = await User.find()
        if(allUsersList.length > 0){
            const allBody = {
                currentUserId,selectedFolderId,allUsersList
            }
    
            const myfiles = await MyFiles.findOne(
                {userId : currentUserId}
            )
            if(myfiles){
                Object.assign(allBody,{myfiles:myfiles})
    
                const findedfolder = findfolder(allBody)
    
                Object.assign(allBody,{findedfolder:findedfolder})
    
                const checkforpermission  = getPermissedUsers(allBody)
                
    
                const resBody = {
                    checkforpermission,findedfolder
                }
                
                const checkforpermissions = findedfolder.hasOwnProperty('permissions')
                if(checkforpermissions){
                    Object.assign(allBody,{
                        permissionList:findedfolder.permissions
                    })
                    let newList = getDetailsForEachId(allBody)
                    if(newList.length > 0){
                        Object.assign(resBody,{
                            permissionslistdetail:newList
                        })
                    }
                }

                res.status(200).json({resBody})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const getDetailsForEachId = (allBody) => {
    let newList = []
    allBody.permissionList.forEach(element => {
        const result = allBody.allUsersList.find(object => String(object._id) === String(element.userId))
        if(result){
            newList.push(result)
        }
    });
    return newList
}


app.put('/:currentUserId/:selectedFolderId/givePermissions',async(req,res) => {
    const {currentUserId, selectedFolderId} = req.params
    try{
        let allmyfileslist = await MyFiles.find()

        if(allmyfileslist.length > 0 ){
            const allBody = {
                permissionUsersOfferList:req.body.permissionUsersOfferList,
                allmyfileslist:allmyfileslist,
                selectedFolder:req.body.selectedFolder
            }
            const myfiles = await MyFiles.findOne({userId : currentUserId})
            if(myfiles){
                const findfolder = myfiles.specialFiles.find(object => String(object.fileId) === String(selectedFolderId))
                if(findfolder){
                    const check = findfolder.hasOwnProperty('permissions')
                    if(check){
                        findfolder.permissions.push(...allBody.permissionUsersOfferList)
                    }else{
                        Object.assign(findfolder,{
                            permissions:allBody.permissionUsersOfferList
                        })
                    }
    

                    const findmyfiles = givepermissedtoselecteduser(allBody)
                    
                    myfiles.markModified('specialFiles')
                    await myfiles.save()
                    res.status(200).json({
                        permissionUsersOfferList:allBody.permissionUsersOfferList,
                        myfiles:myfiles,
                        permissions:findfolder.permissions,
                        allmyfileslist:allmyfileslist,
                        findmyfiles:findmyfiles
                    })
                }
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal  Server Error'})
    }
})


const givepermissedtoselecteduser = (allBody) => {
    allBody.permissionUsersOfferList.forEach( async (element) => {
        const findmyfiles = await MyFiles.findOneAndUpdate(
            {userId : element.userId},
            {$push : {mypermisseds : {
                userId : element.userId,
                folderDetail:allBody.selectedFolder,
                folderId:allBody.selectedFolder.fileId,
                permissedDate:getCurrentTime()
            }}},
            {
                new:true,
                upsert:true
            }
            )
            if(findmyfiles){
                findmyfiles.markModified('mypermisseds')
                await findmyfiles.save()
            }
    });

    return allBody.permissionUsersOfferList
    

} // eklenen kullanıcların mypermisseds'larına da ekleme yapılacak


const deletepermisionfromusermyfiles  = async (allBody)  => {
    const findmyfiles = await MyFiles.findOne({userId : allBody.selectedUserId})
    if(findmyfiles){
        findmyfiles.mypermisseds = findmyfiles.mypermisseds.filter(
            object => String(object.folderId) !== String(allBody.selectedFolder.fileId)
        )
        findmyfiles.markModified('mypermisseds')
        await findmyfiles.save()
        return findmyfiles
    }
}

app.put('/:currentUserId/:selectedFolderId/removeFromPermissed',async(req,res) => {
    const {currentUserId, selectedFolderId} = req.params
    try{
        const allBody = {
            selectedUserId:req.body.selectedUserId,
            selectedFolder:req.body.selectedFolder
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const findfolder = myfiles.specialFiles.find(
                object => String(object.fileId) === String(selectedFolderId)
            )
            if(findfolder){
                findfolder.permissions = findfolder.permissions.filter(
                    object => String(object.userId) !== String(allBody.selectedUserId)
                )


                const findmyfiles = deletepermisionfromusermyfiles(allBody)

                myfiles.markModified('specialFiles')
                await myfiles.save()
                res.status(200).json({myfiles,allBody,findmyfiles})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server errr'})
    }
})

module.exports = app