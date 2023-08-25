const express = require('express');
const app = express.Router();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const User = require('../auth/schema')
const MyFiles = require('../file/schema')
const sendEmail = (allBody) =>{
    const emailTemplate = `
    Dear ${allBody.selectedEmail ?? ''},
    
    You have message from ${allBody.senderMail ?? ''};
    
    ${allBody.messageVal}
    
    Thanks,
    AutoTrader
    `
    const myemail = 'yusufbk92@gmail.com'
    const mypass  = 'otmsflxkznxnbdln'
    let transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: myemail,
        pass: mypass
      }
   });
   const mailOptions = {
    from: myemail, // Sender address
    to: allBody.selectedEmail, // List of recipients
    subject: 'Message', // Subject line
    text: emailTemplate, // Plain text body
    };
    
    transport.sendMail(mailOptions, function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
          res.status(200).json({emailTemplate,mailOptions})
        }
    });
}



const sendnotifiestoselecteduser = (sendBody) =>{

    const totalLength = sendBody.allBody.selectedFilesLocal.length + sendBody.allBody.selectedSpecialFilesLocal.length

    const notifyMessage = {
        message:`${sendBody.allBody.senderMail} Shared Files ( ${totalLength} ) With You.`,
        date:new Date().toLocaleString(),
        detail:sendBody.allBody.senderId,
        notifyId:sendBody.notifyId
    }

    sendBody.selecteduserfiles.notifies.push(notifyMessage)

}


const sendselectedfilestoselecteduser = async (allBody) => {


    const randomId = uuidv4()
    const shareId = uuidv4()
    const addDateToObjects = (objects) => {
        for(const object of objects){
            object['date'] = new Date().toLocaleString()
            object['senderId'] = allBody.senderId
            object['message'] = allBody.messageVal,
            object['notifyId'] = randomId,
            object['shareId'] = shareId
        }
    }
    addDateToObjects(allBody.selectedFilesLocal)
    addDateToObjects(allBody.selectedSpecialFilesLocal)


    const findeduser = await User.findOne({email : allBody.selectedEmail})
    if(findeduser){
        const selecteduserfiles = await MyFiles.findOne({userId : findeduser._id})
        if(selecteduserfiles){
            selecteduserfiles.shareds.push(...allBody.selectedFilesLocal)
            selecteduserfiles.shareds.push(...allBody.selectedSpecialFilesLocal)

            const sendBody = {
                allBody:allBody,
                selecteduserfiles:selecteduserfiles,
                notifyId:randomId
            }

            sendnotifiestoselecteduser(sendBody)

            selecteduserfiles.markModified('shareds')
            await selecteduserfiles.save()
        }else{
            let concatFiles = allBody.selectedFilesLocal.concat(allBody.selectedSpecialFilesLocal)
            const newSelectedUserFile = new MyFiles(
                {
                    userId : findeduser._id,
                    shareds:[],
                    myfiles:[],
                    specialFiles:[],
                    notifies:[]
                }
            )

          const sendBody = {
                allBody:allBody,
                selecteduserfiles:newSelectedUserFile,
                notifyId:randomId
            }

            sendnotifiestoselecteduser(sendBody)

            newSelectedUserFile.shareds.push(...concatFiles)
            await newSelectedUserFile.save()
        }
    }
}


app.put('/:currentUserId/shareSelectedPosts',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const allBody = req.body
        if(allBody){
            const check = allBody.sendNotificationActive
            if(check === true){
                sendEmail(allBody)
            }
            sendselectedfilestoselecteduser(allBody)
            res.status(200).json({allBody})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const getsharedsfunction = (allBody) => {
    let newList = allBody.shareds
    newList.forEach(element => {
        const result = allBody.allUsersList.find(object => String(object._id) === String(element.senderId))
        if(result){
            Object.assign(element, {senderUserDetail : result})
        }
    });
    return newList
}


app.get('/:currentUserId/getShareds',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        let allUsersList = await User.find()
        if(allUsersList.length > 0 ){
            const myfiles = await MyFiles.findOne({userId : currentUserId})
            if(myfiles){
    
                const allBody = {
                    shareds:myfiles.shareds,
                    allUsersList:allUsersList
                }
    
                let newList  = getsharedsfunction(allBody)
                res.status(200).json({shareds:newList})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const getdetailsenderId = (allBody) => {
    let newList = allBody.myfiles.notifies
    newList.forEach(element => {
        const result =  allBody.allUsersList.find(object => String(object._id) === String(element.detail))
        if(result){
            Object.assign(element,{senderUserDetail:result})
        }
    });
    const ifnewlistnone = {message:'No Any Notify !',nodata:true}
    return newList.length ? newList : [ifnewlistnone]
}

app.get('/:currentUserId/getMyNotifies',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        let allUsersList = await User.find()
        if(allUsersList.length > 0 ){
            const myfiles = await MyFiles.findOne({userId : currentUserId})
            if(myfiles){
                const allBody = {
                    myfiles,
                    currentUserId,
                    allUsersList
                }
                let newList = getdetailsenderId(allBody)
                res.status(200).json({newList})
            }
        }
    }catch(err){

    }
})


const removeselectednotify = (allBody) =>{
    allBody.myfiles.notifies = allBody.myfiles.notifies.filter(object => String(object.notifyId) !== String(allBody.notifyId))
}

const removeallnotifies = (allBody) => {
    allBody.myfiles.notifies = []
}


app.put('/:currentUserId/deleteSelectedNotify',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const checkAllNotifyDeleteCommand = req.body.deleteAllCommandActive
        const dataNotifyId = req.body.dataNotifyId ?? ''

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const allBody = {
                currentUserId:currentUserId,
                notifyId:dataNotifyId,
                myfiles:myfiles
            }

            if(!checkAllNotifyDeleteCommand){
                removeselectednotify(allBody)
            }else if(checkAllNotifyDeleteCommand){
                removeallnotifies(allBody)
            }

            myfiles.markModified('notifies')
            await myfiles.save()
            res.status(200).json({myfiles})

        }
    }catch(err){

    }
})


const findshareds = (allBody) => {
    let newList = allBody.myfiles.shareds

    newList.forEach(element => {
        if(!element.notifyId){
            newList = newList.filter(object => String(object.shareId) !== String(element.shareId))
        }
    })

    newList = newList.filter(object => String(object.notifyId) === String(allBody.notifyDetail.notifyId))

    return newList

}

app.put('/:currentUserId/getNotifiedIdShareds',async(req,res)=>{
    const {currentUserId} = req.params
    try{

        const notifyDetail = req.body.notifyDetail

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const allBody = {
                myfiles,currentUserId,notifyDetail
            }
            let newList = findshareds(allBody)
            res.status(200).json({newList})
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


const checknotifyIdShareds = (allBody) => {
    let newList = allBody.myfiles.shareds.filter(object => String(object.notifyId) === String(allBody.selectedShared.notifyId))
    if(newList.length < 1){
        allBody.myfiles.notifies = allBody.myfiles.notifies.filter(object => String(object.notifyId) !==  String(allBody.selectedShared.notifyId))
    }
}


const deleteSelectedShared = (allBody) => {
    allBody.myfiles.shareds = allBody.myfiles.shareds.filter(object => String(object.fileId) !== String(allBody.selectedShared.fileId))
    checknotifyIdShareds(allBody)
}

app.put('/:currentUserId/removeSelectedShared',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const selectedShared = req.body.selectedShared
        const deleteAllSharedsActive = req.body.deleteAllSharedsActive

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            const allBody = {
                currentUserId,selectedShared,myfiles
            }
            if(!deleteAllSharedsActive){
                deleteSelectedShared(allBody)
            }else{
                //
            }

            myfiles.markModified(['shareds','notifies'])
            await myfiles.save()
            res.status(200).json({myfiles:myfiles})

        }

    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})


module.exports = app