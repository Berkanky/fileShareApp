const express = require('express');
const app = express.Router();
const MyFiles = require('../file/schema')
const getCurrentTime = require('../dateFunctions/date')

const downloadfunc = async (allBody) => {
    //console.log(allBody)
    const check = allBody.selectedData.hasOwnProperty('downloadDate')
    if(!check){
        Object.assign(allBody.selectedData, {downloadDate : getCurrentTime()})
    }else{
        allBody.selectedData.downloadDate = getCurrentTime()
    }

    allBody.myfiles.downloads.push(allBody.selectedData)
}




module.exports = downloadfunc