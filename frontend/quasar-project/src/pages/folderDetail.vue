<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
        />

        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <q-icon name="folder"></q-icon>
          <span class="q-ml-sm">Folder Detail</span>
        </q-toolbar-title>
        <q-space />
        <q-input class="GNL__toolbar-input" outlined dense v-model="search" color="bg-grey-7 shadow-1" placeholder="Search for topics, locations & sources">
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              aria-label="Menu"
              icon="arrow_drop_down"
            >
            </q-btn>
          </template>
        </q-input>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn v-if="$q.screen.gt.sm" round dense flat color="text-grey-7" icon="apps">
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="grey-8" icon="notifications">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" v-if="!this.store.myAccFromDb.userImage && !this.store.myAccFromDb.googleImage">
              <img :src="this.store.myAccFromDb.userImage ?? this.store.myAccFromDb.googleImage" alt="">
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
      :width="280"
    >
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-8">
          <q-item
            v-on:Click="goHome(link)"
            class="GNL__drawer-item" v-ripple v-for="(link,key) in this.linksLeftOptions" :key="key" clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.label }}</q-item-label>
            </q-item-section>
          </q-item>
          <div class="q-mt-md">
            <div class="flex flex-center q-gutter-xs">
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Privacy">Privacy</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Terms">Terms</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="About">About Google</a>
            </div>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
      <q-card class="my-card" flat bordered>
      <q-card-section class="row">
        <div class="text-h6 text-grey-6 text-weight-bold">
          <q-btn icon="keyboard_backspace" flat color="grey-7" v-on:click="goBack"></q-btn>
          {{ this.myFolder }} <q-icon name="chevron_right"></q-icon>
          {{
            this.selectedFolderDetailLocal.selectedFile ? this.selectedFolderDetailLocal.selectedFile.fileName : ''
          }}
        </div>
        <q-space></q-space>
        <q-btn icon="admin_panel_settings" flat color="grey-7" v-on:click="openSettings"></q-btn>
      </q-card-section>
      <q-card-section class="text-right text-subtitle2">
        <div class="q-mr-xl">
          File - {{ this.lengthTotal() }}
        </div>
      </q-card-section>

      <q-card-section class="row">
        <q-card
          v-if="this.selectedFolderDetailLocal.seperatedFiles"
          style="border-radius:15px;"
          class="col-3 q-mt-xs bg-white text-dark"
          v-for="(data,key) in this.selectedFolderDetailLocal.seperatedFiles.folderList"
          :key="key"
        >
        <q-card-section style="height:140px;">
          <q-btn icon="folder" flat class="full-width full-height" size="xl" color="grey-7"></q-btn>
        </q-card-section>
        <q-card-section class="text-subtitle2 row">
          <q-icon name="info" color="grey-8"></q-icon>
          <span class="q-ml-sm" v-if="data.fileRealName || data.fileName">{{ data.fileRealName ?? data.fileName }}</span>
          <span v-if="data.message">{{ data.message }}</span>
          <q-space></q-space>
          <q-btn flat icon="more_vert">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  v-on:click="selectFolder(men,data)"
                  v-for="(men,key) in this.folderOptions" :key="key"
                  clickable v-close-popup>
                  <q-item-section>{{men.label}}</q-item-section>
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
        </q-card-section>
        </q-card>
      </q-card-section>
      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Owner</th>
            <th class="text-left">Last Modified Date</th>
            <th class="text-left">File GB</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="this.selectedFolderDetailLocal.seperatedFiles"
            v-for="(data,key) in this.selectedFolderDetailLocal.seperatedFiles.fileList" :key="key"
            >
            <td class="text-left">{{data.name ?? ''}}</td>
            <td class="text-left">
              <q-item
                v-on:click="showUserDetail(data)"
                clickable v-ripple>
                <q-item-section side>
                  <q-avatar rounded>
                    <q-btn
                      size="sm"
                      icon="person" color="dark" round v-if="!data.senderDetail.userImage && !data.senderDetail.googleImage"></q-btn>
                    <img
                      :src="data.senderDetail.userImage ?? data.senderDetail.googleImage" alt=""
                      v-if="data.senderDetail.userImage || data.senderDetail.googleImage">
                  </q-avatar>
                </q-item-section>
                <q-item-section side>
                  {{ data.senderId === this.store.myAccFromDb._id ? 'Me' : data.senderDetail.email ?? data.senderDetail.fullName }}
                </q-item-section>
              </q-item>
            </td>
            <td class="text-left">{{data.lastModifiedDate ?? ''}}</td>
            <td class="text-left">{{data.size ?? ''}}</td>
            <td class="text-left">
              <q-btn icon="more_vert" flat color="dark" size="sm">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-on:click="selectFile(men,data)"
                      v-for="(men,key) in this.folderOptions" :key="key"
                      clickable v-close-popup>
                      <q-item-section>{{men.label}}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
    </q-page-container>
    <userDetail v-if="this.store.userDetailDialogActive"/>
    <folderDetail
      :specialSelectedFolderDetail="this.specialSelectedFolderDetail"
      v-if="this.store.selectedfolderSpecialFolderActive"/>
    <settings
      v-if="this.store.folderDetailSettingsDialogActive"
    />
  </q-layout>
</template>

<script>
import settings from '../folderDetailComp/settings.vue'
import axios from 'axios'
import folderDetail from 'src/components/folderDetail.vue';
import userDetail from 'src/components/userDetail.vue';
import { ref } from 'vue'
import { useCounterStore } from 'src/stores/store';
export default {
  components:{
    userDetail,
    folderDetail,
    settings
  },
  setup(){
    const leftDrawerOpen = ref(false)
    const store = useCounterStore()
    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }
    return{
      leftDrawerOpen,
      store,
      toggleLeftDrawer
    }
  },
  data:function(){
    return{
      linksLeftOptions:[
        {id:1,label:'Home',val:'home',icon:'home'},
        {id:2,label:'Spam',val:'spam',icon:'filter_list'},
        {id:3,label:'Trash',val:'trash',icon:'delete_forever'}
      ],
      myFolder:'My Folder',
      selectedFolderDetailLocal:{},
      folderOptions:[
        {id:1,label:'Select',value:'Select'},
        {id:2,label:'Open Folder',value:'OpenFolder'},
        {id:3,label:'External Transfer',val:'External transfer'}
      ],


      specialSelectedFolderDetail:{}
    }
  },
  beforeRouteEnter(to,from,next){
    next (vm => {
      const id = vm.store.myAccFromDb._id ?? ''
      const fileId = to.params.id
      if(id !== '' &&  fileId){
        vm.store.getSelectedSpecialFileDetail(id,fileId)
      }
    })
  },
  methods:{
    openSettings(){
      this.store.folderDetailSettingsDialogActive =! this.store.folderDetailSettingsDialogActive
    },
    selectFile(men,data){
      console.log(men,data)
      if(men.id === 3){
        const fileId = this.$route.params.id
        const id = this.store.myAccFromDb._id
        const selectedFolderId = data.fileId

        const allBody = {
          fileId,id,selectedFolderId
        }
        console.log(allBody)
        axios.put(`${this.store.baseUrl}/files/${id}/${fileId}/externalData`, allBody)
          .then(res=>{
            console.log(res)
            if(!res.data.checkforfile){
              this.selectedFolderDetailLocal.seperatedFiles.folderList = this.selectedFolderDetailLocal.seperatedFiles.folderList.filter(object => object.fileId !== res.data.selectedfolder.fileId)
            }else{
              //console.log(res.data.newObject.selectedfolder.fileId)
              console.log(this.store.selectedFolderDetail.seperatedFiles.fileList)
              this.store.selectedFolderDetail.seperatedFiles.fileList = this.store.selectedFolderDetail.seperatedFiles.fileList.filter(object => object.fileId !== res.data.newObject.selectedfolder.fileId)
            }
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    selectFolder(men,data){
      if(men.id === 1){
        console.log(data,this.store.myAccFromDb._id)
      }else if(men.id === 2){

        const allBody = {
          selectedFolder:data,
          currentFolder:this.selectedFolderDetailLocal.selectedFile
        }
        this.specialSelectedFolderDetail = allBody
        //console.log(allBody)
        this.store.selectedfolderSpecialFolderActive =! this.store.selectedfolderSpecialFolderActive
      }else if(men.id === 3){
        const fileId = this.$route.params.id
        const id = this.store.myAccFromDb._id
        const selectedFolderId = data.fileId

        const allBody = {
          fileId,id,selectedFolderId
        }
        console.log(allBody)
        axios.put(`${this.store.baseUrl}/files/${id}/${fileId}/externalData`, allBody)
          .then(res=>{
            console.log(res)
            if(!res.data.checkforfile){
              this.selectedFolderDetailLocal.seperatedFiles.folderList = this.selectedFolderDetailLocal.seperatedFiles.folderList.filter(object => object.fileId !== res.data.selectedfolder.fileId)
            }else{
              this.selectedFolderDetailLocal.seperatedFiles.files = this.selectedFolderDetailLocal.seperatedFiles.fileList.filter(object => object.fileId !== res.data.newObject.selectedfolder.fileId)
            }
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    lengthTotal(){
      if(this.selectedFolderDetailLocal.seperatedFiles){
        const fileListLength = this.selectedFolderDetailLocal.seperatedFiles.fileList ? this.selectedFolderDetailLocal.seperatedFiles.fileList.length : 0
        const folderListLength = this.selectedFolderDetailLocal.seperatedFiles.folderList ? this.selectedFolderDetailLocal.seperatedFiles.folderList.length : 0
        const totalLength = fileListLength + folderListLength
        return totalLength
      }else{
        return 0
      }
    },
    showUserDetail(data){
      console.log(data)
      this.store.selectedUserId._id = data.senderDetail._id
      this.store.userDetailDialogActive =! this.store.userDetailDialogActive
    },
    goBack(){
      this.$router.push({path:`/`})
    },
    goHome(link){
      this.$router.push({path:'/'})
    },
    getDetailWhenRefresh(){
      //bu fonskiyonu tamamla 18.23
      const newObject = {}
      this.$watch('store.myAccFromDb',(newValue) => {
        if(newValue){
         // console.log(newValue)
          newObject._id = newValue._id
          const id = newObject._id
          const fileId = this.$route.params.id
          console.log('store.myAccFromDb',newObject)
          console.log('routeparams',fileId)
          this.store.getSelectedSpecialFileDetail(id,fileId) //18.30 da yazdın bunu tam dışarı çıkmadan önce
          console.log('selectedFolderDetail',this.store.selectedFolderDetail)
        }
      })

    }
  },
  created(){
    //console.log(this.$route.params.id)
    this.getDetailWhenRefresh()

  },
  watch:{
    'store.firebaseInfoUser':{
      handler(newValue,oldValue){
        if(newValue.uid){
          const id = newValue.uid
          this.store.getMyAcc(id)
        }
      },
      immediate:true,
      deep:true
    },
    $route:{
      immediate:true,
      deep:true,
      handler(to,from){
        /*           this.$watch('store.selectedFolderDetail',(newValue) => {
            if(newValue){
              console.log('newValue',newValue)
              this.selectedFolderDetailLocal = newValue
            }
          }) */
      }
    },
    'store.selectedFolderDetail':{
      handler(newValue,oldValue){
        if(newValue){
          const check = newValue.hasOwnProperty('selectedFile')
          if(check){
            console.log('newValueselectedFolderDetail',newValue)
          }
          this.selectedFolderDetailLocal = newValue
          console.log('selectedFolderDetailLocal',this.selectedFolderDetailLocal)
        }
      }
    }
  }
}
</script>
<style lang="sass">
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>
