<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1 indexPage">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mx-md"
        />

        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <!-- <img src="https://cdn.quasar.dev/img/layout-gallery/logo-google.svg"> -->
          <span class="q-ml-sm">ShareFile</span>
        </q-toolbar-title>
        <q-space />
        <q-input class="GPL__toolbar-input" dense standout="bg-primary" v-model="this.search" placeholder="Search" v-on:keyup.enter="searchFile">
          <template v-slot:prepend>
            <q-icon v-if="this.search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="this.search = '';this.cancelProcess()" />
          </template>
        </q-input>
        <q-btn
          v-on:click="createFile"
          v-if="$q.screen.gt.xs" flat dense no-wrap color="primary" icon="add" no-caps label="Create" class="q-ml-sm q-px-md">
          <q-menu anchor="top end" self="top end">
            <q-list class="text-grey-8" style="min-width: 100px">
              <q-item aria-hidden="true">
                <q-item-section class="text-uppercase text-grey-7" style="font-size: 0.7rem">Create New</q-item-section>
              </q-item>
              <q-item v-for="menu in createMenu" :key="menu.text" clickable v-close-popup aria-hidden="true" v-on:click="createnewFile(menu)">
                <q-item-section avatar>
                  <q-icon :name="menu.icon" />
                </q-item-section>
                <q-item-section>{{ menu.text }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          v-on:click="openUploadDialog"
          v-if="$q.screen.gt.xs" flat dense no-wrap color="primary" icon="cloud_upload" no-caps label="Upload" class="q-ml-sm q-px-md" />

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat color="text-grey-7" icon="apps">
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="grey-8" icon="notifications" v-on:Click="openNotifies">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px" v-on:click="goProfile">
              <img
                :src="this.store.myAccFromDb.userImage ?? this.store.myAccFromDb.googleImage"
                style="object-fit:cover;"
              >
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
          <q-btn icon="logout" flat color="grey-8" round dense v-on:click="updateActiveWhenLogout"></q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      behavior="mobile"
      @click="leftDrawerOpen = false"
    >
      <q-scroll-area class="fit">
        <q-toolbar class="GPL__toolbar">
          <q-toolbar-title class="row items-center text-grey-8">
            <img class="q-pl-md" src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg">
            <span class="q-ml-sm">Photos</span>
          </q-toolbar-title>
        </q-toolbar>

        <q-list padding>
          <q-item
            v-on:click="selectLink(link)"
            v-for="link in links1" :key="link.text" clickable class="GPL__drawer-item">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item clickable class="GPL__drawer-item GPL__drawer-item--storage">
            <q-item-section avatar>
              <q-icon name="cloud" />
            </q-item-section>
            <q-item-section top>
              <q-item-label>Storage</q-item-label>
              <q-linear-progress :value="this.getCurrentStorage()" class="q-my-sm"/>
              <q-item-label caption>
                  {{ this.getCurrentStorageMessage() }}
                  of {{this.store.myAccFromDb.totalStorage ?? 'None'}} GB
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="GPL__page-container">
      <router-view />
      <q-page-sticky v-if="$q.screen.gt.sm" expand position="left">
        <div class="fit q-pt-xl q-px-sm column">
          <q-btn
            v-on:click="selectBarOption(data)"
            v-for="(data,key) in this.leftBarOptions" :key="key"
            round flat stack no-caps size="26px" class="GPL__side-btn" :color="this.checkCurrentLeftBapOption(data) ? 'white' : 'grey-7'"
            :class="this.checkCurrentLeftBapOption(data) ? 'bg-grey-7 text-white' : 'text-dark'"
            >
            <q-icon size="22px" :name="data.icon" />
            <div class="GPL__side-btn__label">{{data.label}}</div>
          </q-btn>
        </div>
      </q-page-sticky>
      <div class="text-right">
        <q-btn icon="remove" color="red-4" label="Cancel" no-caps v-if="this.selectedFiles.length&&this.selectedFile.fileId" v-on:Click="cancelProcess"></q-btn>
        <q-btn icon="upload" color="green-4" label="Upload" no-caps v-if="this.selectedFiles.length&&this.selectedFile.fileId" v-on:Click="confirmProcess"></q-btn>
        <q-btn-dropdown
          icon="settings"
          v-if="this.selectedFiles.length || this.selectedSpecialFiles.length &&!this.selectedFile.fileId"
          color="grey-9" label="Options">
          <q-list>
            <q-item
              v-for="(data,key) in this.generalOptions" :key="key"
              clickable v-close-popup @click="selectOptionForSelectedFiles(data)">
              <q-item-section>
                <q-item-label>{{data.label}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <q-page-container class="row">
        <q-card
          v-if="!this.selectFileActive"
          style="border-radius:15px;"
          class="col-3 q-mt-xs"
          :class="this.checkSelectedFiles(data) ? 'bg-dark text-grey-6' : 'text-grey-8'"
          v-for="(data,key) in this.store.myUpdatedFiles"
          :key="key"
        >
        <q-card-section style="height:140px;" class="text-center">
          <q-btn
            size="xl"
            icon="file_copy" class="full-width full-height" flat color="grey-8" v-if="!data.imageCheck&&!this.checkSelectedFiles(data)"></q-btn>
          <q-img
            style="object-fit:cover;height:140px;border-radius:7px;"
            :src="data.url"
            v-if="data.imageCheck&&!this.checkSelectedFiles(data)"
          ></q-img>
          <q-btn
            v-on:Click="removeFromSelectedFiles(data)"
            size="xl"
            class="full-width full-height"
            icon="history" flat color="grey-6" v-if="this.checkSelectedFiles(data)"></q-btn>
        </q-card-section>
        <q-card-section class="text-subtitle2 row q-mt-md">
          <q-btn flat icon="info" no-caps :label="(data.name.slice(0,25) + '...') ?? '' " size="sm" v-if="data.name"></q-btn>
          <span v-if="data.message">{{ data.message }}</span>
          <q-space></q-space>
          <q-btn
                v-if="!this.checkSelectedFiles(data)"
                v-on:click="!this.checkSelectedFiles(data) ? '' : removeFromSelectedFiles(data)"
                :icon="this.checkSelectedFiles(data) ? 'remove' : 'more_vert'"
                flat
                :color="this.checkSelectedFiles(data) ? 'red-4' : 'dark'"
                >
                <q-menu v-if="!this.checkSelectedFiles(data)">
                  <q-list style="min-width: 100px">
                    <q-item
                      v-on:click="selectOption(menu,data)"
                      clickable v-close-popup v-for="(menu,key) in this.fileOptions" :key="key">
                      <q-item-section v-if="menu.id !== 5">{{ menu.label }}</q-item-section>
                      <q-item-section v-if="menu.id === 5">
                        {{ this.checkforstar(data) ? 'Remove Start'  : 'Star' }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
        </q-card-section>
        <q-card-section v-if="checkforstar(data)" class="text-caption q-mt-xs">
          <div class="">
            <q-icon name="star" size="sm" color="orange-4"></q-icon>
            {{ data.starDate ?? 'No Info About Star Date' }}
          </div>
        </q-card-section>
        <q-card-section
          class="text-caption q-mt-xs"
          >
          <div>
            <q-icon name="info" color="grey-7"></q-icon>
            {{ data.type ?? 'No Info About Type' }}
          </div>
          <div>
            <q-icon name="event"></q-icon>
            {{ data.date ?? 'No Date Info'}}
          </div>
          <div>
            <q-icon name="download" :color="checkfordownloaded(data) ? 'green-4' : 'red-4'"></q-icon>
            {{ this.checkfordownloaded(data) ? `${data.downloadDate} Downloaded` : '' }}
          </div>
        </q-card-section>
        </q-card>
        <q-card
          style="border-radius:15px;"
          class="col-3 q-mt-xs"
          :class="this.checkselectSpecialFileOption(data) ? 'bg-dark text-grey-6' : 'bg-white text-dark'"
          v-for="(data,key) in this.store.specialFiles"
          :key="key"
        >
        <q-card-section style="height:140px;">
          <q-btn
            v-on:click="removeSelected(data)"
            size="xl"
            icon="history" flat
            color="white"
            v-if="this.checkselectSpecialFileOption(data) " class="full-width full-height"></q-btn>
          <q-btn
            v-if="!this.checkselectSpecialFileOption(data) "
            v-on:click="selectFileForTransfer(data)"
            :icon="this.checkSelectedSpecialFile(data) ? 'check' : 'folder'"
            class="full-width"
            flat
            :color="this.checkSelectedSpecialFile(data) ? 'dark' : 'dark'"
            style="height:140px;" size="xl"></q-btn>
        </q-card-section>
        <q-card-section v-if="checkforstar(data)" class="text-caption q-mt-xs">
          <div class="">
            <q-icon name="star" size="sm" color="orange-4"></q-icon>
            {{ data.starDate ?? 'No Info About Star Date' }}
          </div>
        </q-card-section>
        <q-card-section class="text-subtitle2 row">
          <q-icon name="info" color="grey-8"></q-icon>
          <span class="q-ml-sm" v-if="data.fileRealName || data.fileName">{{ data.fileRealName ?? data.fileName }}</span>
          <span v-if="data.message">{{ data.message }}</span>
          <q-space></q-space>
          <q-btn flat icon="more_vert" v-if="!this.checkselectSpecialFileOption(data)">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  v-on:click="selectSpecialFileOption(menu,data)"
                  v-for="(menu,key) in this.folderOptions" :key="key"
                  clickable v-close-popup>
                  <q-item-section v-if="menu.id !== 3">{{ menu.label }}</q-item-section>
                  <q-item-section v-if="menu.id === 3">{{this.checkforstar(data) ? 'Remove Star' : 'Star'}}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-card-section>
        <q-card-section class="text-caption">
          <div>
            <q-icon name="event"></q-icon>
            {{ data.date ?? 'No Info About Date' }}
          </div>
          <div class="">
            <q-icon name="visibility" :color="this.checkforlastvisited(data) ? 'green-4' : 'red-4'"></q-icon>
            {{ this.checkforlastvisited(data) ? `${data.lastSeenDate} Last Visited` : '' }}
          </div>
        </q-card-section>
        </q-card>
      </q-page-container>
      <indexShareds />
    </q-page-container>
    <uploadVue
      @newuploadedfiles="getnewuploadedfiles"
      v-if="this.store.uploadDialogActive"/>
    <shareVue
      :selectedFiles="this.selectedFiles.length ? this.selectedFiles : []"
      :selectedSpecialFiles="this.selectedSpecialFiles.length ? this.selectedSpecialFiles : []"
      v-if="this.store.shareDialogActive"/>
    <notifyVue
      v-if="this.store.notifyDialogActive"
    />

    <userDetail
      v-if="this.store.userDetailDialogActive"
    />


    <update
      :selectedFileForUpdate="this.selectedFileForUpdate"
      v-if="this.store.updateFileComponentActive"
    ></update>
  </q-layout>
</template>

<script>
import KProgress from 'k-progress';
import update from 'src/components/update.vue';
import userDetail from 'src/components/userDetail.vue';
import indexShareds from 'src/components/indexShareds.vue';
import notifyVue from '../notify/notify.vue'
import shareVue from '../share/share.vue'
import axios, { all } from 'axios'
import { useCounterStore } from 'src/stores/store';
import { ref } from 'vue'
import { getAuth, signOut } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import uploadVue from 'src/upload/upload.vue';
import { set } from 'firebase/database';
export default {
  name: 'GooglePhotosLayout',
  components:{
    uploadVue,
    shareVue,
    notifyVue,
    indexShareds,
    userDetail,
    update,
    KProgress
  },
  setup () {
    const store = useCounterStore()
    const leftDrawerOpen = ref(false)
    const search = ref('')
    const storage = ref(0.26)

    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    return {
      store,
      leftDrawerOpen,
      search,
      storage,

      links1: [
        { id:1,icon: 'photo', text: 'Photos' },
        { id:2,icon: 'photo_album', text: 'Albums' },
        { id:3,icon: 'assistant', text: 'Assistant' },
        { id:4,icon: 'people', text: 'Sharing' },
        { id:5,icon: 'book', text: 'Photo books' },
        { id:6,icon:'download',text:'Downloads'}
      ],
      links2: [
        { icon: 'archive', text: 'Archive' },
        { icon: 'delete', text: 'Trash' }
      ],
      links3: [
        { icon: 'settings', text: 'Settings' },
        { icon: 'help', text: 'Help & Feedback' },
        { icon: 'get_app', text: 'App Downloads' }
      ],
      createMenu: [
        { id:1,icon: 'photo_album', text: 'Album' },
        { id:2,icon: 'people', text: 'Shared Album' },
        { id:3,icon: 'movie', text: 'Movie' },
        { id:4,icon: 'library_books', text: 'Animation' },
        { id:5,icon: 'dashboard', text: 'Collage' },
        { id:6,icon: 'book', text: 'Photo book' },
        { id:7,icon:'edit',text:'New File'}
      ],

      toggleLeftDrawer
    }
  },
  data:function(){
    return{
      newFile:{},
      fileOptions:[
        {id:1,label:'Select',value:'Select'},
        {id:2,label:'Delete',value:'Delete'},
        {id:3,label:'Download',value:'Download'},
        {id:5,label:'Star',value:'Star'},
        {id:4,label:'Update',value:'update'}
      ],
      selectedFiles:[],
      generalOptions:[
        {id:1,label:'Transfer To Selected File'},
        {id:2,label:'Delete Selected Files'},
        {id:4,label:'Share Selected Files'},
        {id:3,label:'Clear List'}
      ],
      folderOptions:[
        {id:1,label:'Select',value:'Select'},
        {id:3,label:'Star',value:'star'},
        {id:2,label:'Open Folder',value:'OpenFolder'}
      ],
      selectFileActive:false,
      selectedFile:{},
      selectedSpecialFiles:[],
      search:'',
      leftBarOptions:[
        {id:1,label:'All Docs',val:'all',icon:'filter_list'},
        {id:2,label:'Photos',val:'photos',icon:'collections_bookmark'},
        {id:3,label:'Files',val:'files',icon:'description'},
        {id:4,label:'Folders',val:'folders',icon:'folder'},
        {id:5,label:'Shareds',val:'shareds',icon:'share'},
        {id:7,label:'Downloads',val:'downlaodeds',icon:'download'},
        {id:8,label:'Trash',val:'trash',icon:'delete_forever'},
        {id:9,label:'Stars',val:'star',icon:'star'},
        {id:6,label:'Clear_All',val:'clear',icon:'delete_forever'}
      ],
      selectedLeftBarOption:{},
      selectedFileForUpdate:{}
    }
  },
  created(){

  },
  methods:{
    getCurrentStorage(){
      let val = 0
      if(this.store.myAccFromDb._id){
        const check = this.store.myAccFromDb.hasOwnProperty('currentStorage')
        if(check){
          val = this.store.myAccFromDb.currentStorage
        }else{
          val = 0
        }
      }else{
        val = 0
      }
      console.log('Number(val)',Number(val))
      return Number(val)*15 // default 0<x<1 olduğu için 15 max gb olduğu için *15 yaptık.
    },
    getCurrentStorageMessage(){
      let val = 0
      if(this.store.myAccFromDb._id){
        const check = this.store.myAccFromDb.hasOwnProperty('currentStorage')
        if(check){
          val = this.store.myAccFromDb.currentStorage
        }else{
          val = 0
        }
      }else{
        val = 0
      }
      console.log('getCurrentStorageMessage',val)
      let newVal = `${val} GB`
      return newVal
    },
    checkforstar(data){
      const check = data.hasOwnProperty('starDate') ? true : false
      return check
    },
    checkforlastvisited(data){
      const check = data.hasOwnProperty('lastSeenDate')
      if(check){
        const checksec = data.lastSeenDate !== '' ? true : false
        return checksec
      }else{
        return false
      }
    },
    checkfordownloaded(data){
      const check = data.hasOwnProperty('downloadDate')
      if(check){
        const checksec = data.downloadDate !== '' ? true : false
        return checksec
      }else{
        return false
      }
    },
    selectLink(link){
      if(link.id === 6){
        this.$router.push({path:`/downloads/${this.store.myAccFromDb._id}`,params:{id:this.store.myAccFromDb._id}})
      }
    },
    goProfile(){
      this.$router.push({path:`/profile/${this.store.myAccFromDb._id}`,params:{id:this.store.myAccFromDb._id}})
    },
    checkCurrentLeftBapOption(data){
      const check = data.id === this.selectedLeftBarOption.id ? true : false
      if(check){
        return true
      }else{
        return false
      }
    },
    deleteAllFileAndFolderFunction(){
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/deleteAllFilesAndFolders`)
        .then(res=>{
          console.log(res)
          if(res.data.check){
            const id = this.store.myAccFromDb._id
            this.store.getAllMyFiles(id)
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    selectBarOption(data){
      if(data.id === 6){
        this.$q.dialog({
          cancel:true,
          fullHeight:this.store.mobileActive ? true : false,
          maximized:this.store.mobileActive ? true : false,
          title:'Warning',
          message:'Are You Sure For Clear All Files and Shareds ?'
        }).onOk(() => {
          this.deleteAllFileAndFolderFunction()
        }).onCancel(() => {

        })
      }else{
        if(this.selectedLeftBarOption.id){
          if(this.selectedLeftBarOption.id === data.id){
            this.selectedLeftBarOption = {}
          }else{
            this.selectedLeftBarOption = data
          }
        }else{
          this.selectedLeftBarOption = data
        }
      }
    },
    openNotifies(){
      this.store.notifyDialogActive =! this.store.notifyDialogActive
    },
    searchFile(){
      if(this.search){
        console.log(this.search)
        const allBody = {
          searchValue:this.search
        }
        axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/filterFiles`, allBody)
          .then(res=>{
            console.log(res)
            this.store.myUpdatedFiles = res.data.findFiles
            this.store.specialFiles = res.data.findSpecialFiles
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    removeSelected(data){
      this.selectedFile = {}
      this.selectedSpecialFiles = this.selectedSpecialFiles.filter(object => object.fileId !== data.fileId)
    },
    checkselectSpecialFileOption(data){
      const result = this.selectedSpecialFiles.some(object => object.fileId === data.fileId)
      return result
    },
    selectSpecialFileOption(menu,data){
      console.log(data)
      console.log(menu)
      if(menu.id === 1){
        const result = this.selectedSpecialFiles.some(object => String(object.fileId) === String(data.fileId))
        if(result){
          this.selectedSpecialFiles = this.selectedSpecialFiles.filter(object => String(object.fileId) !== String(data.fileId))
        }else{
          this.selectedSpecialFiles.push(data)
        }
      }else if(menu.id === 2){
        this.$router.push({path:`/folderDetail/${data.fileId}`,params:{id:data.fileId}})
      }else if(menu.id === 3){
        this.giveStar(menu,data)
      }
      console.log(this.selectedSpecialFiles)
    },
    getnewuploadedfiles(data){
      if(data){
        this.store.myUpdatedFiles.push(...data)
      }
    },
    checkSelectedSpecialFile(data){
      const check = this.selectedFile.fileId === data.fileId ? true : false
      return check
    },
    confirmProcess(){
      const allBody = {
        selectedFiles:this.selectedFiles,
        selectedFile:this.selectedFile,
        selectedSpecialFiles:this.selectedSpecialFiles
      }
      console.log(allBody)
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/${this.selectedFile.fileId}/transferToSelectedFile`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.uploaded && res.data.uploaded === true){
            setTimeout(() =>{
              this.cancelProcess()
            },1000)
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    cancelProcess(){
      this.selectedSpecialFiles = []
      this.selectedFiles = []
      this.selectedFile = {}
      this.selectFileActive === true ? this.selectFileActive =! this.selectFileActive  : this.selectFileActive
      const id = this.store.myAccFromDb._id
      this.store.getAllMyFiles(id)
    },
    selectFileForTransfer(data){
      if(this.selectFileActive && this.selectedFiles.length){
        if(this.selectedFile){
          if(this.selectedFile.fileId !== data.fileId){
            this.selectedFile = data
            this.store.specialFiles = this.store.specialFiles.filter(object => object.fileId === this.selectedFile.fileId)
            console.log(this.selectedFile)
          }else {
            this.selectedFile = {}
          }
        }else{
          this.selectedFile = data
        }
      }
    },
    deleteSelectedFiles(){
      const allBody = {
        selectedFiles:this.selectedFiles,
        selectedSpecialFiles:this.selectedSpecialFiles
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/removeSelectedFiles`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.removed && res.data.removed === true){
            this.cancelProcess()
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    selectOptionForSelectedFiles(data){
      console.log(data)
      if(data.id === 1){
        this.selectFileActive =! this.selectFileActive
        if(this.selectedSpecialFiles.length){
          this.store.specialFiles.forEach(element => {
            const check = this.selectedSpecialFiles.some(object => object.fileId === element.fileId)
            if(check){
              this.store.specialFiles = this.store.specialFiles.filter(object => object.fileId !== element.fileId)
            }
          });
        }
      }else if(data.id === 3){
        this.cancelProcess()
      }else if(data.id === 2){
        this.deleteSelectedFiles()
      }else if(data.id ===4){
        this.store.shareDialogActive =! this.store.shareDialogActive
      }
    },
    removeFromSelectedFiles(data){
      console.log(data)
      this.selectedFiles = this.selectedFiles.filter(object => object.fileId !== data.fileId)
    },
    checkSelectedFiles(data){
      const result = this.selectedFiles.some(object => object.fileId === data.fileId)
      return result
    },
    giveStar(menu,data){
      const id = this.store.myAccFromDb._id

      const allBody = {
        selectedFile:data,
        fileActive:true,
        folderActive:false
      }

      axios.put(`${this.store.baseUrl}/files/${id}/giveStar`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.sendBody.fileActive){
            if(res.data.check){
              Object.assign(data,res.data.updateddata)
            }else{
              delete data.starDate
            }
          }else if(res.data.sendBody.folderActive){
            if(res.data.check){
              Object.assign(data,res.data.updateddata)
            }else{
              delete data.starDate
            }
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    selectOption(menu,data){
      //console.log(data,menu)
      if(menu.id === 1){
        const result = this.selectedFiles.some(object => object.fileId === data.fileId)
        if(!result){
          this.selectedFiles.push(data)
        }else{
          this.selectedFiles = this.selectedFiles.filter(object => object.fileId !== data.fileId)
        }
        console.log(this.selectedFiles)
      }else if(menu.id === 3){
        this.openFile(data)
      }else if(menu.id === 4){
        console.log(menu)
        this.selectedFileForUpdate = data
        this.store.updateFileComponentActive =! this.store.updateFileComponentActive
      }else if(menu.id === 2){
        console.log('delete',data)
        this.deleteSelectedFileOnly(menu,data)
      }else if(menu.id === 5){
        this.giveStar(menu,data)
      }
    },
    deleteSelectedFileOnly(menu,data){
      const id = this.store.myAccFromDb._id
      const allBody = {
        selectedFile:data,
        fileActive:true
      }
      axios.put(`${this.store.baseUrl}/files/${id}/deleteSelectedFile`, allBody)
        .then(res=>{
          console.log(res)
          this.store.myUpdatedFiles = this.store.myUpdatedFiles.filter(object => object.fileId !== data.fileId)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    posttomydownloads(data){
      const allBody = {
        selectedData:data
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/addToDownloads`, allBody)
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
        })
    },

    openFile(data){

      this.store.downloadFile(data)
      this.posttomydownloads(data)

    },
    createNewFileToDb(){

    },
    createnewFile(menu){
      console.log(menu)
      if(menu.id === 7){
        this.$q.dialog({
          title: 'New File',
          color:'blue-4',
          message: 'Type New File Name',
          prompt: {
            model: this.newFile.name,
            type: 'text' // optional
          },
          cancel: true,
          persistent: true
        }).onOk(data => {
          console.log(data)
          const newfile = {
            id:uuidv4(),
            icon:'edit',
            text:data
          }
          const allBody = {newfile}
          axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/createNewFile`, allBody)
          .then(res=>{
            console.log(res)
            this.store.specialFiles.push(res.data.newFile)
          })
          .catch(err=>{
            console.log(err)
          })
        }).onCancel(() => {
          // console.log('>>>> Cancel')
        }).onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
      }else{
        const allBody = {
          newfile:menu
        }
        console.log(this.store.myAccFromDb._id)
        axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/createNewFile`, allBody)
          .then(res=>{
            console.log(res)
            this.store.specialFiles.push(res.data.newFile)
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    createFile(){

    },
    openUploadDialog(){
      this.store.uploadDialogActive =! this.store.uploadDialogActive
    },
    updateActiveWhenLogout(){
      axios.put(`${this.store.baseUrl}/files/${this.store.firebaseInfoUser.uid}/logoutUpdate`)
        .then(res=>{
          console.log(res)
          if(res.data.myacc){
            this.logoutFromAcc()
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    logoutFromAcc(){
      const auth = getAuth();
      signOut(auth).then(() => {
        // Sign-out successful.
        this.store.firebaseInfoUser = {}
        this.$router.replace({path:'/login'})
      }).catch((error) => {
        // An error happened.
      });
    }
  },
  watch:{
    selectedLeftBarOption:{
      handler(newValue,oldValue){
        if(newValue.id){
          console.log(newValue.val)
          if(newValue.id === 1){
            this.$q.loading.show()
            const id = this.store.myAccFromDb._id
            this.store.getAllMyFiles(id)
            this.$q.loading.hide()
          }else if(newValue.id !== '' && newValue.id !== null){
            this.$q.loading.show()
            const allBody = {
              selectedLeftBarOption:this.selectedLeftBarOption,
              myUpdatedFiles:this.store.myUpdatedFiles,
              specialFiles:this.store.specialFiles
            }
            axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/filterMyFiles`,allBody)
              .then(res=>{
                console.log(res)
                this.store.myUpdatedFiles = res.data.myUpdatedFiles
                this.store.specialFiles = res.data.specialFiles
                this.$q.loading.hide()
              })
              .catch(err=>{
                console.log(err)
              })
          }
        }
      },
      immediate:true,
      deep:true
    },
    'store.myAccFromDb':{
      handler(newValue,oldValue){
        if(newValue._id){
          const id = newValue._id
          this.store.getAllMyFiles(id)
        }
      },
      immediate:true,
      deep:true
    },
    'store.firebaseInfoUser':{
      handler(newValue,oldValue){
        if(newValue.uid){
          const id = newValue.uid
          this.store.getMyAcc(id)
        }
      },
      immediate:true,
      deep:true
    }
  }
}
</script>

<style lang="sass">
.GPL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 35%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      padding-left: 12px
      .q-icon
        color: #5f6368

    .q-item__label:not(.q-item__label--caption)
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

    &--storage
      border-radius: 0
      margin-right: 0
      padding-top: 24px
      padding-bottom: 24px

  &__side-btn
    &__label
      font-size: 12px
      line-height: 24px
      letter-spacing: .01785714em
      font-weight: 500

  @media (min-width: 1024px)
    &__page-container
      padding-left: 94px
</style>
