import { defineStore } from 'pinia';
import axios from 'axios'
export const useCounterStore = defineStore('counter', {
  state: () => ({
    //firebase ınfo
    firebaseInfoUser:{},
    //basic options
    pexelId:'563492ad6f917000010000018990b39d61f845559dab3acb2c9dd16d',
    window:{},
    newHeight:'',
    mobileActive:false,
    baseUrl:'http://localhost:3000',

    //signup
    signupDialogActive:false,
    myAccFromDb:{},

    //upload
    uploadDialogActive:false,

    //files
    myUpdatedFiles:[],
    specialFiles:[],

    //share
    shareDialogActive:false,
    sharedsList:[],


    //notify
    notifyDialogActive:false,
    notifyDetailDialogActive:false,
    notifyList:[],
    notifyDetailSharedsList:[],

    //userdetail

    userDetailDialogActive:false,

    //selectedUserId:{}
    selectedUserId:{},
    findedUser:{},

    //selectedfiledetail
    selectedFolderDetail:{},
    selectedfolderSpecialFolderActive:false,

    //profile page
    selectedprofileoption:{
      id:1,label:'Account',val:'account',icon:'person',class:'bg-grey-8 text-white'
    },

    //update comp
    updateFileComponentActive:false,

    //downlaods

    downloadsDialogActive:false,


    //folderDetail
    folderDetailSettingsDialogActive:false,
    allUsersList:[],
    permissionUsersOfferList:[],
    currentPermissedUsers:[],


    //menuOptions
    createNoteDialogActive:false,
    myNotes:[],
    myNotesFolders:[],
    readNotesDialogActive:false,
    selectedNote:{},
    selectedNoteParams:{},
    selectedNotes:[],
    moreOptionForSelectedNotesDialogActive:false,
    //note update
    noteUpdateDialogActive:false,


    importNotesDialogActive:false,
    extractNotesDialogActive:false,
    globalNoteDetail:{},

    //noteFolderDetail
    noteFolderNotes:[],
    noteFolderFolders:[]

  }),
  actions: {
    filterInputNoteFolderDetail(allBody){
      axios.put(`${this.baseUrl}/files/${allBody.id}/${allBody.noteId}/filterInput`, allBody)
        .then(res=>{
          console.log(res)
          this.noteFolderNotes = res.data.notes
          this.noteFolderFolders = res.data.folders
        })
        .catch(err => {
          console.log(err)
        })
    },
    getSelectedNoteFolderDetail(id,noteId){
      axios.get(`${this.baseUrl}/files/${id}/${noteId}/getSelectedNoteFolderDetail`)
        .then(res=>{
          console.log('getSelectedNoteFolderDetail',res)
          this.noteDetail = res.data.findnotefolder
          this.globalNoteDetail = this.noteDetail
          this.noteFolderNotes = res.data.notesList
          this.noteFolderFolders =  res.data.foldersList
        })
        .catch(err => {
          console.log(err)
        })
    },
    welcomeMessageWhenLogin(id){
      axios.put(`${this.baseUrl}/files/${id}/pushWelcomeMessage`)
        .then(res=>{
          console.log('pushWelcomeMessage',res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteSelectedNote(noteData){
      const id = this.myAccFromDb._id
      const noteId = noteData.noteId
      axios.put(`${this.baseUrl}/files/${id}/${noteId}/removeSelectedNote`)
        .then(res=>{
          console.log(res)

          this.myNotes = this.myNotes.filter(
            object => object.noteId !== res.data.findnote.noteId
          )
          this.readNotesDialogActive =! this.readNotesDialogActive


        })
        .catch(err=>{
          console.log(err)
        })
    },
    giveStarForNote(noteData){
      const allBody  = {
        selectedNote:noteData
      }
      const id = this.myAccFromDb._id
      const noteId = noteData.noteId
      axios.put(`${this.baseUrl}/files/${id}/${noteId}/giveStar`, allBody)
        .then(res=>{
          console.log(res)
          if(this.readNotesDialogActive){
            this.selectedNote = res.data.selectedNote
            console.log('this.selectedNote',this.selectedNote)
          }

        })
        .catch(err=>{
          console.log(err)
        })

    },
    getSelectedNoteDetail(id,noteId){
      console.log(id,noteId)
      axios.get(`${this.baseUrl}/files/${id}/${noteId}/getSelectedNoteDetail`)
        .then(res=>{
          console.log(res)
          this.selectedNote = res.data.findednote
          console.log('store.selectedNote',this.selectedNote)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getMyNotes(id){
      axios.get(`${this.baseUrl}/files/${id}/getMyNotes`)
        .then(res=>{
          console.log(res)
          this.myNotes = res.data.notes
          this.myNotesFolders = res.data.folders
        })
        .catch(err => {
          console.log(err)
        })
    },
    getMyId(){
      const check = this.myAccFromDb.hasOwnProperty('_id')
      if(check){
        return this.myAccFromDb._id
      }
    },
    getAllUsers(id){
      axios.get(`${this.baseUrl}/files/${id}/getAllUsers`)
        .then(res=>{
          console.log('getAllUsers',res)

          this.allUsersList = res.data.allUsers

        })
        .catch(err => {
          console.log(err)
        })
    },
    getTotalSizeAllFiles(id){
      axios.get(`${this.baseUrl}/files/${id}/getTotalSize`)
        .then(res=>{
          console.log('getTotalSizeAllFiles',res)

          const check = this.myAccFromDb.hasOwnProperty('currentStorage')
          if(!check){
            Object.assign(this.myAccFromDb,{currentStorage : res.data.total})
          }else{
            this.myAccFromDb.currentStorage = res.data.total
          }
          console.log('getTotalSizeAllFiles',this.myAccFromDb,res.data.total)
        })
        .catch(err => {
          console.log(err)
        })
    },
    updatedownlaodeddate(data){
      const check = data.hasOwnProperty('downloadDate')
      if(check){
        data.downloadDate = this.getCurrentTime()
      }else{
        Object.assign(data,{downloadDate:this.getCurrentTime()})
      }
    },
    getCurrentTime(){
      const date = new Date().toLocaleString()
      return date
    },
    downloadFile(data){
      console.log(data)
      const url = data.url;
      // Bir `a` öğesi oluşturalım ve `href` niteliğini `url` ile ayarlayalım.
      const a = document.createElement("a");
      a.href = url;
      // `a` öğesine bir `download` niteliği ekleyelim ve indirilecek dosyanın adını belirtelim.
      a.download = data.name;
      // `a` öğesini tıklayalım.
      a.click();

      this.updatedownlaodeddate(data)
    },
    getSelectedSpecialFileDetail(id,fileId){
      axios.put(`${this.baseUrl}/files/${id}/${fileId}/getFileDetail`)
        .then(res=>{
          console.log(res)
          this.selectedFolderDetail = res.data.resBody
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getSelectedUserDetail(id){
      axios.get(`${this.baseUrl}/files/${id}/getSelectedUserDetail`)
        .then(res=>{
          console.log(res)
          this.findedUser = res.data.findeduser
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getMyNotifies(id){
      axios.get(`${this.baseUrl}/files/${id}/getMyNotifies`)
        .then(res=>{
          console.log(res)
          this.notifyList = res.data.newList
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getMyShareds(id){
      axios.get(`${this.baseUrl}/files/${id}/getShareds`)
        .then(res=>{
          console.log('getShareds',res)
          this.sharedsList = res.data.shareds
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getAllMyFiles(id){
      axios.get(`${this.baseUrl}/files/${id}/getFiles`)
        .then(res=>{
          console.log('getFiles',res)
          this.myUpdatedFiles = res.data.myfilesonly.newList
          this.specialFiles = res.data.specialFiles
        })
        .catch(err=>{
          console.log(err)
        })
    },
    getMyAcc(id){
      axios.get(`${this.baseUrl}/files/${id}/getMyAcc`)
        .then(res=>{
          console.log('getMyAcc',res)
          this.myAccFromDb = res.data.myacc
        })
        .catch(err=>{
          console.log(err)
        })
    }
  },
});
