const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')



const getonlysharedssize = (allBody) => {
    let totalSizeFirst = 0
    let totalSizeSecond = 0
    let onlyFiles = []
    let onlyFolders =  []

    allBody.myfiles.shareds.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(!check){
            onlyFolders.push(element)
        }else{
            onlyFiles.push(element)
        }
    });

    onlyFiles.forEach(element => {
        const val = Number(element.size)/Number(allBody.defaultVal)
        totalSizeFirst += val
    });

    onlyFolders.forEach(element => {
        element.files.forEach(el => {
            const val = Number(el.size)/Number(allBody.defaultVal)
            totalSizeSecond += val
        });
    })
    let total = totalSizeFirst + totalSizeSecond
    return total
}


const getonlyfilessize = (allBody) => {
    let totalSize = 0
    allBody.myfiles.myfiles.forEach(element => {
        const val = Number(element.size)/Number(allBody.defaultVal)
        totalSize += val
    });

    return totalSize
}

const getonlyspecialfiles = (allBody) => {
    let totalSize = 0

    allBody.myfiles.specialFiles.forEach(element => {
        element.files.forEach(el => {
            const val = Number(el.size)/Number(allBody.defaultVal)
            totalSize += val
        });
    });
    return totalSize
}

const  getonlystars = (allBody) => {
    let totalSize = 0
    let totalSizeSecond = 0

    let onlyFiles = []
    let onlyFolders = []

    allBody.myfiles.stars.forEach(element => {
        const check = element.hasOwnProperty('type')
        if(check){
            onlyFiles.push(element)
        }else{
            onlyFolders.push(element)
        }
    });

    onlyFiles.forEach(element => {
        const val = Number(element.size)/Number(allBody.defaultVal)
        totalSize += val
    })
    onlyFolders.forEach(element => {
        element.files.forEach(el => {
            const val = Number(el.size)/Number(allBody.defaultVal)
            totalSizeSecond += val
        });
    })

    let totalSizeVal = totalSize + totalSizeSecond
    return totalSizeVal

}

app.get('/:currentUserId/getTotalSize',async(req,res) => {
    const {currentUserId } = req.params
    try{
        const allBody = {
            currentUserId,
            defaultVal:'1073741824'
            //1048576
        }

        const myfiles = await MyFiles.findOne({userId : currentUserId})
        if(myfiles){

            Object.assign(allBody,{myfiles:myfiles})

            const totallengthformyfiles = getonlyfilessize(allBody)
            const totallengthforshareds = getonlysharedssize(allBody)
            const totallengthforspecialfiles  = getonlyspecialfiles(allBody)
            const totallengthforstars = getonlystars(allBody)

            let total = totallengthformyfiles + totallengthforshareds + totallengthforspecialfiles + totallengthforstars

            res.status(200).json({
                totallengthformyfiles,
                totallengthforshareds,
                totallengthforspecialfiles,
                totallengthforstars,
                total
            })
        }
    }catch(err){
        res.status(500).json({message:'Internal Server error'})
    }
})



module.exports = app