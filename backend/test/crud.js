const express = require('express');
const app = express.Router();
const TestSchema = require('./schema')



app.post('/sendTest',async(req,res)=>{
    try{
        const newTestDeneme = new TestSchema(req.body.testData)
        await newTestDeneme.save() 
        res.status(200).json({newTestDeneme})
    }catch(err){
        res.status(500).json({message:'Internal  Server Error'})
    }
})


module.exports = app