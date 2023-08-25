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

    downloadsDialogActive:false

  }),
  actions: {
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
