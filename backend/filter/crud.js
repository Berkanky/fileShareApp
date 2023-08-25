const express = require('express');
const app = express.Router();
const { v4: uuidv4 } = require('uuid');
const MyFiles = require('../file/schema')
const User = require('../auth/schema')

const filterfiles = (allBody) => {
    allBody.myUpdatedFiles.forEach(element => {
        if(element.imageCheck && element.imageCheck === true){
            allBody.myUpdatedFiles = allBody.myUpdatedFiles.filter(object => String(object.fileId) !== String(element.fileId))
        }
    });
    return allBody.myUpdatedFiles
}

const filterforphotos = (allBody) => {
    allBody.myUpdatedFiles.forEach(element =>{
        if(!element.imageCheck){
            allBody.myUpdatedFiles = allBody.myUpdatedFiles.filter(object => String(object.fileId) !== String(element.fileId))
        }
    });
    allBody.myUpdatedFiles = allBody.myUpdatedFiles.filter(object => object.imageCheck === true)
    return allBody.myUpdatedFiles
}

const filtershareds = (allBody) => {
    allBody.myUpdatedFiles = allBody.shareds
    allBody.myUpdatedFiles = allBody.myUpdatedFiles.length ? allBody.myUpdatedFiles : [{message:'No Info'}]
    return allBody.myUpdatedFiles
}

app.put('/:currentUserId/filterMyFiles',async(req,res)=>{
    const {currentUserId} = req.params
    try{
        const selectedLeftBarOption  = req.body.selectedLeftBarOption
       // let myUpdatedFiles = req.body.myUpdatedFiles
       // let specialFiles = req.body.specialFiles
        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){
            let shareds = myfiles.shareds

            let myUpdatedFiles = myfiles.myfiles
            let specialFiles = myfiles.specialFiles
            
            myUpdatedFiles.forEach(element => {
                if(element.type === 'image/jpeg' || element.type === 'image/png'){
                    Object.assign(element,{imageCheck : true})
                }else{
                    Object.assign(element,{imageCheck : false})
                }
            });

            const allBody = {
                currentUserId,
                selectedLeftBarOption,
                myfiles,
                myUpdatedFiles,
                specialFiles,
                shareds:shareds
            }

            Object.assign(allBody,{deleteds:myfiles.deleteds})

            if(req.body.selectedLeftBarOption.id === 2){
                let myUpdatedFiles = filterforphotos(allBody)
                specialFiles = []
                shareds = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds})
            }else if(req.body.selectedLeftBarOption.id === 3){
                let myUpdatedFiles = filterfiles(allBody)
                specialFiles = specialFiles
                res.status(200).json({myUpdatedFiles,specialFiles,shareds})
            }else if(req.body.selectedLeftBarOption.id === 4){
                myUpdatedFiles = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds})
            }else if(req.body.selectedLeftBarOption.id === 5){
                myUpdatedFiles = filtershareds(allBody)
                specialFiles = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds})
            }else if(req.body.selectedLeftBarOption.id === 7){
                myUpdatedFiles = filterfordownloadeds(allBody)
                specialFiles = []
                shareds = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds})
            }else if(req.body.selectedLeftBarOption.id === 8){
                myUpdatedFiles = filterfortrashlist(allBody)
                specialFiles = []
                shareds = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds,myfiles,allBody})
            }else if(req.body.selectedLeftBarOption.id === 9 ){
                myUpdatedFiles = filterforstasr(allBody).myUpdatedFiles
                specialFiles = filterforstasr(allBody).specialFiles
                shareds = []
                res.status(200).json({myUpdatedFiles,specialFiles,shareds,myfiles,allBody})
            }
        }
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})

const filterforstasr = (allBody) => {

    let typeList = ['image/png','image/jpeg']

    const newBody = {
        specialFiles:[],
        myUpdatedFiles:[]
    }

    allBody.myfiles.stars.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(!check){
            newBody.specialFiles.push(element)
        }else if(check){
            const checkforimage = typeList.some(
                object => String(object) === String(element.type)
            )
            if(checkforimage){
                Object.assign(element,{imageCheck:true})
            }else{
                Object.assign(element,{imageCheck:false})
            }
            newBody.myUpdatedFiles.push(element)
        }
    });

    return newBody

}


const filterfordownloadeds = (allBody) => {
    allBody.myUpdatedFiles.forEach(element => {
        const check = element.hasOwnProperty('downloadDate')
        if(!check){
            allBody.myUpdatedFiles = allBody.myUpdatedFiles.filter(object => String(object.fileId) !== String(element.fileId))
        }
    });
    return allBody.myUpdatedFiles
}

const filterfortrashlist = (allBody) => {
    allBody.myUpdatedFiles = allBody.deleteds
    allBody.myUpdatedFiles.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(!check){
            allBody.myUpdatedFiles = allBody.myUpdatedFiles.filter(object => String(object.fileId) !== String(element.fileId))
        }
    });
    //folder için başka liste yazılacak
    return allBody.myUpdatedFiles
}



module.exports = app