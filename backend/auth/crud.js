const express = require('express');
const app = express.Router();
const User = require('./schema')
const { v4: uuidv4 } = require('uuid');
const findmefunction = require('../auth/findmefunction')

const checkUser = (allBody) =>{
    const result = allBody.allUsers.find(object => String(object.email) === String(allBody.loginData.email))
    if(result){
        return true
    }else{
        return false
    }
}

const signup = async (allBody) => {
    const newUser = new User(allBody.loginData)
    await newUser.save()
    return newUser
}

const updateUserActiveStatus =async (sendBody) => {
    sendBody.myacc.active =! sendBody.myacc.active
    sendBody.myacc.lastLoginDate = ''
    await sendBody.myacc.save()
}


//when logout make active = false

app.put('/:currentUserId/logoutUpdate',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const myacc = await User.findOne({fireBaseId:currentUserId})
        if(myacc){
            myacc.active =! myacc.active
            myacc.lastLoginDate = new Date().toLocaleString()
            await myacc.save()
            res.status(200).json({myacc})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const findme = (allBody) => {
    const myacc = allBody.allUsers.find(object => String(object.email) === String(allBody.loginData.email))
    if(myacc){
        return myacc
    }
}

app.put('/checkUser',async(req,res)=>{
    try{
        let allUsers = await User.find()
        const loginData = req.body.loginData
        const allBody = {
            loginData,allUsers
        }
        if(allUsers.length > 0  && loginData){
            const check = checkUser(allBody)
            if(check === true){
                const myacc = findme(allBody)
                const sendBody  = {
                    allBody,myacc
                }
                updateUserActiveStatus(sendBody)
                res.status(200).json({user:myacc})
            }else{
                const newUser = signup(allBody)
                res.status(200).json({user:newUser})
            }
        }else{
            const newUser = signup(allBody)
            res.status(200).json({user:newUser})
        }
        
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})



//get only my details

app.get('/:currentUserId/getMyAcc',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const myacc = await User.findOne({fireBaseId : currentUserId})
        if(myacc){
           // const myaccfunction = findmefunction()
            res.status(200).json({myacc})
        }else{
            res.status(200).json({myacc:{},message:'Cant Found Acc'})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

module.exports = app