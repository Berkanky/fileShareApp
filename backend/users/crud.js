const express = require('express');
const app = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../auth/schema')


const removemefromalluserslist = (allBody) => {
    allBody.allUsers = allBody.allUsers.filter(
        object => String(object._id) !== String(allBody.currentUserId)
    )
    return allBody.allUsers
}



app.get('/:currentUserId/getAllUsers',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const allBody = {
            currentUserId
        }
        let allUsers = await User.find()
        if(allUsers.length > 0){
            Object.assign(allBody,{allUsers:allUsers})

            allUsers = removemefromalluserslist(allBody)
            res.status(200).json({allUsers})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const getonlyemails = (result) => {
    let onlyEmail = []
    result.forEach(element => {
        const result = onlyEmail.some(object => String(object.email) === String(element.email))
        if(!result){
            onlyEmail.push(element.email)
        }
    });
    return onlyEmail
}


app.put('/:currentUserId/findUser',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const searchUserVal = req.body.searchUserVal
        let allUsers = await User.find()
        if(allUsers.length > 0 && searchUserVal){
            let result = allUsers.filter(object => {
                const email = String(object.email).includes(searchUserVal)
                const fullName = String(object.fullName).includes(searchUserVal)
                return email || fullName
            })
            if(result){

                let onlyEmails = getonlyemails(result)
                res.status(200).json({result:result,onlyEmails:onlyEmails})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})



const findselecteduserdetail = (allBody) => {
    const finduser = allBody.allUsersList.find(object => String(object._id) === String(allBody.selectedUserId))
    if(finduser){
        return finduser
    }else{
        return {message:'No User',findActive:false}
    }
}

app.get('/:selectedUserId/getSelectedUserDetail',async(req,res)=>{
    const {selectedUserId} = req.params
    try{
        let allUsersList = await User.find()
        if(allUsersList.length > 0){
            const allBody = {
                selectedUserId,allUsersList
            }
            const findeduser = findselecteduserdetail(allBody)
            if(findeduser){
                res.status(200).json({findeduser})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


module.exports = app