const mongoose = require('mongoose');


const MyFilesSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    myfiles:[],
    specialFiles:[],
    shareds:[],
    notifies:[],
    downloads:[],
    deleteds:[],
    stars:[],
    mypermisseds:[],
    myNotes:[],
    welcomeMessage:[]
}) 

const MyFiles = mongoose.model('MyFiles',MyFilesSchema)
module.exports = MyFiles