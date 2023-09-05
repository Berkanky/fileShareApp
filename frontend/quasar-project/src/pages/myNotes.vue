<template>
  <q-layout view="hHh LpR fFf" class="bg-grey-3 entireLayout">
    <q-header class="bg-grey-3 text-grey-9" reveal height-hint="60">
      <q-toolbar class="GPLAY__toolbar text-grey-6">
        <q-btn
          v-if="$q.platform.is.mobile || !leftDrawerOpen"
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
        />

        <div class="q-pr-lg" v-if="$q.screen.gt.xs">
          <img class="GPLAY__logo" src="https://cdn.quasar.dev/img/layout-gallery/logo-google-play.png">
        </div>

        <q-space />

        <div class="GPLAY__toolbar-input-container row no-wrap">
          <q-input dense outlined square v-model="search" placeholder="Search" class="bg-white col" />
          <q-btn class="GPLAY__toolbar-input-btn" color="primary" icon="search" unelevated />
        </div>

        <q-space />
        <q-btn icon="apps" flat color="dark">
          <q-menu class="row">
            <q-card
              style="height:120px;"
              v-for="(data,key) in this.appButtonOptions" :key="key"
              class="col-12">
              <q-btn :color="data.color" v-on:click="selectAppOption(data)" class="full-width full-height">
                <q-avatar size="26px" :icon="data.icon"></q-avatar>
                <q-tooltip class="q-ma-sm">{{data.label}}</q-tooltip>
              </q-btn>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-3 text-grey-7"
      :width="200"
    >
      <q-list>

        <q-item
          v-on:click="selectLeftBarOption(data)"
          v-for="(data,key) in this.leftBarOptions" :key="key"
          clickable class="GPLAY__drawer-link GPLAY__drawer-link--devices">
          <q-item-section avatar class="devices-icon bg-blue-grey-7 text-grey-1 text-center">
            <q-icon :name="data.icon" />
          </q-item-section>
          <q-item-section class="devices-text">
            <q-item-label>{{data.label}}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <!--       <q-card-section v-for="(data,key) in this.noteList" :key="key">
        <div v-html="`${data}`"></div>
      </q-card-section> -->
      <div class="row">
        <notes />
        <folders />
      </div>
    </q-page-container>
    <readNotes v-if="this.store.readNotesDialogActive"/>
    <createNoteVue v-if="this.store.createNoteDialogActive"/>
    <moreOption v-if="this.store.moreOptionForSelectedNotesDialogActive"/>
  </q-layout>
</template>

<script>
import moreOption from 'src/myNotesComp/moreOption.vue'
import readNotes from 'src/myNotesComp/readNotes.vue'
import folders from 'src/myNotesComp/folder.vue'
import notes from 'src/myNotesComp/notes.vue'
import { useCounterStore } from 'src/stores/store'
import { ref } from 'vue'
import createNoteVue from 'src/myNotesComp/createNote.vue'
import axios from 'axios'
export default {
  components:{
    createNoteVue,
    notes,
    folders,
    readNotes,
    moreOption
  },
  name: 'GooglePlayLayout',
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
      toggleLeftDrawer
    }
  },
  data:function(){
    return{
      leftBarOptions:[
        {id:1,label:'Back',icon:'keyboard_backspace'},
        {id:2,label:'Devices',icon:'devices'}
      ],
      appButtonOptions:[
        {id:1,label:'Create Note',icon:'add',color:'green-4'},
        {id:2,label:'Create Folder',icon:'folder',color:'dark'}
      ],
      currentRouter:{}
    }
  },
  methods:{
    selectAppOption(data){
      if(data.id === 1){
        this.createNoteOpen()
      }else if(data.id === 2){
        this.createFolder()
      }
    },
    selectLeftBarOption(data){
      if(data.id === 1){
        this.$router.push({path:`/`})
        //this.$router.go(-1)
      }else if(data.id == 3){
        this.store.moreOptionForSelectedNotesDialogActive =! this.store.moreOptionForSelectedNotesDialogActive
      }
    },
    createFolderAxiosFunction(sendBody){
      const allBody = {
        folderName:sendBody.folderName
      }
      const id = this.$route.params.id
      axios.put(`${this.store.baseUrl}/files/${id}/createFolder`, allBody)
        .then(res=>{
          console.log(res)
          this.store.myNotesFolders.push(res.data.folderData)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    createFolder(){

      this.$q.dialog({
        dark: true,
        title: 'Folder Title',
        message: 'Enter Folder Name...',
        prompt: {
          model: '',
          type: 'text' // optional
        },
        cancel: true,
        persistent: true,
        maximized:this.store.mobileActive ? true : false,
        fullHeight:this.store.mobileActive ? true : false
      }).onOk(data => {
        console.log(data)

        const sendBody = {
          folderName:data
        }

        this.createFolderAxiosFunction(sendBody)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })

    },
    createNoteOpen(){
      this.store.createNoteDialogActive =! this.store.createNoteDialogActive
    },
    getMyNotesLocal(){
      this.$watch('currentRouter',(newValue) => {
        const check = newValue.hasOwnProperty('id')
        if(check){
          const id = newValue.id
          this.store.getMyNotes(id)
        }
      })
    },
    checkCurrentRouter(){
      const currentRouter = this.$route.params
      this.currentRouter = currentRouter
    }
  },
  created(){
    this.getMyNotesLocal()
    this.checkCurrentRouter()
  },
  watch:{
    'store.selectedNotes':{
      handler(newVal){
        if(newVal.length){
          const check = this.leftBarOptions.some(
            object => object.id === 3
          )
          if(!check){
            this.leftBarOptions.push(
              {id:3,label:'More Option',icon:'more_vert'}
            )
          }
        }else{
          this.leftBarOptions = this.leftBarOptions.filter(
            object => object.id !== 3
          )
        }
      },
      immediate:true,
      deep:true
    }
  }
}
</script>

<style lang="sass">
.GPLAY

  &__toolbar
    height: 60px

  &__logo
    width: 183px
    height: 39px

  &__toolbar-input-container
    min-width: 100px
    width: 55%

  &__toolbar-input-btn
    border-radius: 0
    max-width: 60px
    width: 100%

  &__drawer-link

    .q-item__section--avatar
      margin: -8px 0 -8px -16px
      padding: 8px 0 8px 16px

    .q-item__section--main
      margin: -8px -16px -8px 16px
      padding: 8px 16px 8px 2px
      font-size: 18px
      font-weight: 300

    &--apps, &--movies, &--music, &--books, &--devices
      background: #f5f5f5!important
      &:hover
        color: #eee !important

    &--apps:hover
      background: #43a047!important

    &--movies:hover
      background: #e53935!important

    &--music:hover
      background: #fb8c00!important

    &--books:hover
      background: #1e88e5!important

    &--devices:hover
      background: #546e7a!important

  &__drawer-item
    padding: 6px 12px 6px 23px

  &__sticky
    min-height: 49px
    border-bottom: 1px solid rgba(0,0,0,0.12)

  &__sticky-help
    border: 1px solid #ccc
    padding-left: 8px
    padding-right: 8px

  &__sticky-settings
    padding-left: 17px
    padding-right: 17px
    border: 1px solid #ccc
</style>
