const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();


const uri = 'mongodb://localhost:27017/files'
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  mongoose.connect(uri, options)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

  app.use(cors({
    origin:'*',
  })); 
  app.use(express.json({ limit: '350mb' }));
  app.use(express.urlencoded({ limit: '350mb', extended: true }));

//test
const testCrud = require('./test/crud')

//user
const userCrud = require('./auth/crud')

//file

const fileCrud = require('./file/crud')

//share
const shareCrud = require('./share/crud')

//users
const usersCrud = require('./users/crud')


//filter
const filterCrud = require('./filter/crud')

//downloads

const downloadsCrud = require('./downloads/crud')


//selectedfile

const selectedfilecrud = require('./selectedfolder/crud')

//updateProfile
const updateProfileCrud = require('./updateProfile/crud')

//delete options
const deleteOptionsCrud = require('./deleteOptions/crud')

//updateFile

const updateFileCrud = require('./updateFile/crud')


//starcrud
const starCrud = require('./stars/crud')

//totalsizecrud
const totalsizecrud = require('./gettotalsize/crud')

//permissionforfolder
const permissionCrud = require('./givePermissionForFolder/crud')


//mynotescrud
const myNotesCrud = require('./myNotes/crud')

app.use('/files',
  testCrud,
  userCrud,
  fileCrud,
  shareCrud,
  usersCrud,
  filterCrud,
  downloadsCrud,
  selectedfilecrud,
  updateProfileCrud,
  deleteOptionsCrud,
  updateFileCrud,
  starCrud,
  totalsizecrud,
  permissionCrud,
  myNotesCrud
  )




const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});