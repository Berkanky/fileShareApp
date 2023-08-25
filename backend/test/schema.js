const mongoose = require('mongoose');
const TestSchema = mongoose.model('TestSchema',{
    name:{
        type:String,
        required:false
    },
})


module.exports = TestSchema