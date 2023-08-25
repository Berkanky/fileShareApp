const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    dialCode:{
        type:String,
        required:false
    },
    bio:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        required:false
    },
    name: {
      type: String,
      required: false,
    },
    surName:{
        type:String,
        required:false
    },
    fullName:{
        type:String,
        required:false
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    createdDate:{
        type:Date,
        default:Date.now,
        required:false
    },
    fireBaseId:{
        type:String,
        required:false
    },
    uniqueId:{
        type:String,
        required:false
    },
    userImage:{
        type:String,
        required:false
    },
    googleImage:{
        type:String,
        required:false
    },
    active:{
        type:Boolean,
        required:false,
        default:true
    },
    lastLoginDate:{
        type:String,
        required:false
    },
    safetyAnswer:{
        type:String,
        required:false
    },
    lastProfileUpdatedDate:{
        type:String,
        required:false
    },
    totalStorage:{
        type:Number,
        required:false,
        default:15
    }
  });

  const User = mongoose.model('User', UserSchema);
  module.exports = User