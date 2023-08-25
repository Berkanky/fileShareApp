const express = require('express');
const app = express.Router();
const User = require('../auth/schema')
const phoneCodes = require('../phoneCodes/CountryCodes.json')
const MyFiles = require('../file/schema')

const findmefunction = (allBody) => {
    const myacc = allBody.allUsersList.find(object => String(object._id) === String(allBody.currentUserId))
    if(myacc){
        return myacc
    }else{
        return {message:'NoACC'}
    }
}


const getCurrentDate  = () => {
    const date = new Date().toLocaleString()
    return date
}

app.put('/:currentUserId/updateMyProfile',async(req,res)=> {
    const {currentUserId} = req.params
    try{

        const check = req.body.updateData.hasOwnProperty('lastProfileUpdatedDate')
        if(check){
            req.body.updateData.lastProfileUpdatedDate = getCurrentDate()
        }else{
            Object.assign(req.body.updateData,{
                lastProfileUpdatedDate:getCurrentDate()
            })
        }

        const updatemyacc = await User.findOneAndUpdate(
            {_id : currentUserId},
            {$set : req.body.updateData},
            {new:true}
        )
        if(updatemyacc){
            res.status(200).json({updatemyacc})

        }else{
            res.status(200).json({message:'Hata'})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const readPhoneCodes = (allBody) => {
    let newList = []
    allBody.phoneCodes.forEach(element => {
        newList.push(element.dial_code)
    });

    const onlyDialCodes = Object.values(newList)

    return onlyDialCodes
}


app.get('/:currentUserId/getPhoneCodes',async(req,res)=> {
    const {currentUserId} = req.params
    try{
        const findme = await User.findOne({_id : currentUserId})
        if(findme){
            const allBody = {
                currentUserId,phoneCodes
            }

            let dialCodes = readPhoneCodes(allBody)
            res.status(200).json({findme,dialCodes})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


//get file length all


app.get('/:currentUserId/getAllFileLength',async(req,res) => {
    const {currentUserId} = req.params
    try{
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const sharedsForMeLength = {}
            const lengths = {};
            for (const arrayName in myfiles) {
                if (Array.isArray(myfiles[arrayName]) && arrayName !== 'shareds') {
                    lengths[arrayName] = myfiles[arrayName].length;
                }else if(arrayName === 'shareds'){
                    sharedsForMeLength[arrayName] = myfiles[arrayName].length
                }
            }

            const sum = Object.values(lengths).reduce((accumulator, value) => {
                return accumulator + value;
              }, 0);

            res.status(200).json({myfiles, lengths,sum,sharedsForMeLength}) 
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


module.exports = app