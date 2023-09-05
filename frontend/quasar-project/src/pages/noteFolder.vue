<template>
  <q-page>

    <q-header
      elevated class="bg-dark text-white" height-hint="64">
      <q-toolbar horizontal>
        <q-btn
          class="col-1"
          :icon="this.leftDrawerOpen ? 'arrow_left' : 'arrow_right'"
          color="white"
          flat
          no-caps v-on:click="openLeftBar"></q-btn>
        <q-input
          class="q-ma-xs col-4 q-ml-md text-white"
          v-model="this.searchNote"
          v-on:keyup="searchNoteFunction"
          label="Search Note"
          dark
          color="white"
        >
          <template v-slot:prepend>
            <q-icon name="notes" color="white"></q-icon>
          </template>
          <template v-slot:after >
            <q-btn
              icon="search" flat color="white" v-if="!this.searchNote"></q-btn>
            <q-btn icon="remove" flat color="red-4" v-else v-on:Click="clearInput"></q-btn>
          </template>
        </q-input>
        <q-space></q-space>
        <q-btn
          icon="add"
          :icon-right="this.showMoreOption ? 'expand_more' : 'expand_less'"
          v-on:Click="this.showMoreOption =! this.showMoreOption">
          <q-menu>
          <q-list style="min-width: 120px" class="text-center">
            <q-item
              v-on:Click="selectOption(data)"
              v-for="(data,key) in this.options" :key="key"
              clickable v-close-popup>
              <q-item-section>
                {{ data.label }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>

          </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      elevated
      v-model="this.leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-2 text-grey-7"
      :width="270"
    >
      <q-list padding class="text-grey-8">
        <q-item
          style="border:1px solid rgb(238, 237, 237);"
          clickable
          v-on:click="selectOptionLeftBar(link)"
          :class="this.checkHoverOnlink(link)"
          v-on:mouseover="mouseOnFunction(link)"
          v-on:mouseleave="this.hoverOnLink = {}"
          v-for="(link,key) in this.linksLeftOptions" :key="key"
        >
          <q-item-section avatar class="">
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container class="">
      <div class="row">
        <q-card
          :class="checkMouseOnData(data)"
          v-for="(data,key) in this.store.noteFolderNotes" :key="key"
          v-on:mouseover="mouseOnButton(data)"
          v-on:mouseleave="mouseLeaveButton(data)"
          style="height:190px;"
          class="col-12 col-md-3 col-sm-3 q-ma-xs">
          <q-btn
            v-if="!this.checkMouseOnDataBoolean(data)"
            icon="note"
            class="full-width full-height"
            :color="this.checkMouseOnDataBoolean(data) ? 'white' : 'grey-8'"
            flat
            size="xl"></q-btn>
            <q-card-section v-if="this.checkMouseOnDataBoolean(data)" class="text-subtitle2">
              <div class="text-capitalize">
                <q-icon name="title"></q-icon>
                -
                {{ data.noteTitle ?? '' }}
              </div>
              <div class="text-capitalize">
                <q-icon name="event"></q-icon>
                -
                {{ data.date ?? '' }}
              </div>
              <div class="text-capitalize">
                Type/{{ data.type ?? 'No Type Info' }}
              </div>
              <q-btn icon="login" class="full-width" v-on:click="readNote(data)"></q-btn>
            </q-card-section>
        </q-card>
        <q-card
          :class="checkMouseOnData(data)"
          v-for="(data,key) in this.store.noteFolderFolders" :key="key"
          v-on:mouseover="mouseOnButton(data)"
          v-on:mouseleave="mouseLeaveButton(data)"
          style="height:190px;"
          class="col-12 col-md-3 col-sm-3 q-ma-xs">
          <q-btn
            v-if="!this.checkMouseOnDataBoolean(data)"
            icon="folder"
            class="full-width full-height"
            :color="this.checkMouseOnDataBoolean(data) ? 'white' : 'grey-8'"
            flat
            size="xl"></q-btn>
            <q-card-section v-if="this.checkMouseOnDataBoolean(data)" class="text-subtitle2">
              <div class="text-capitalize">
                <q-icon name="title"></q-icon>
                -
                {{ data.folderName ?? '' }}
              </div>
              <div class="text-capitalize">
                <q-icon name="event"></q-icon>
                -
                {{ data.date ?? '' }}
              </div>
              <div class="text-capitalize">
                Type/{{ data.type ?? 'No Type Info' }}
              </div>
              <q-btn class="full-width" icon="login" v-on:click="goFolder(data)"></q-btn>
            </q-card-section>
        </q-card>
      </div>
    </q-page-container>
    <readNotes v-if="this.store.readNotesDialogActive"/>
    <importNotesDialog v-if="this.store.importNotesDialogActive"/>
    <extractNotesDialog v-if="this.store.extractNotesDialogActive"/>
  </q-page>
</template>

<script>
import extractNotesDialog from 'src/myNotesComp/extractNotesDialog.vue';
import readNotes from 'src/myNotesComp/readNotes.vue';
import notes from 'src/myNotesComp/notes.vue';
import importNotesDialog from 'src/myNotesComp/importNotesDialog.vue';
import axios from 'axios'
import { useCounterStore } from 'src/stores/store';
export default {
  components:{
    importNotesDialog,
    extractNotesDialog,
    notes,
    readNotes
  },
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      searchNote:'',

      showMoreOption:false,
      routerParams:{},
      noteDetail:{},
      leftDrawerOpen:true,
      options:[
        {id:1,label:'Extract Files'},
        {id:2,label:'Import Files'}
      ],
      linksLeftOptions:[
        {id:1,label:'Go Back',icon:'keyboard_backspace',class:''},
        {id:2,label:'Home',icon:'home',class:''},
        {id:3,label:'Account',icon:'person',class:''},
        {id:4,label:'My Files',icon:'filter_list',class:''}
      ],
      hoverOnLink:{},
      myNotes:[],
      myNotesFolders:[],
      mouseOnData:{}
    }
  },
  methods:{
    clearInput(){
      this.searchNote = ''

      const id =  this.$route.params.id
      const noteId = this.$route.params.noteId
      this.store.getSelectedNoteFolderDetail(id,noteId)

    },
    readNote(data){
      const allBody = {
        id:this.$route.params.id,
        noteId:data.noteId
      }
      this.store.selectedNoteParams = allBody

      this.store.selectedNote = data //22.37'de eklendi

      console.log(allBody)
      this.store.readNotesDialogActive =! this.store.readNotesDialogActive
    },
    goFolder(data){

      const allBody = {

      }

      const id = this.$route.params.id
      const noteId = data.noteId

      Object.assign(allBody,{
        id,noteId
      })

      this.$router.push(
        {
          path:`/noteFolder/${id}/${noteId}`,
          params:{allBody}
        }
      )


    },
    checkMouseOnDataBoolean(data){
      const check = this.mouseOnData.hasOwnProperty('noteId')
      if(check){
        if(this.mouseOnData.noteId === data.noteId){
          return true
        }else{
          return false
        }
      }else{
        return false
      }
    },
    checkMouseOnData(data){
      const check = this.mouseOnData.hasOwnProperty('noteId')
      if(check){
        if(this.mouseOnData.noteId === data.noteId){
          return 'bg-dark text-white'
        }else{
          return ''
        }
      }else{
        return ''
      }
    },
    mouseLeaveButton(data){
      setTimeout(() => {
        this.mouseOnData = {}
      },1500)
    },
    mouseOnButton(data){
      //console.log(data)
      this.mouseOnData = data
    },
    selectOptionLeftBar(link){
      console.log(link)
      if(link.id === 1){
        const id = this.$route.params.id
        //this.$router.push({path:`/myNotes/${id}`,params:{id:id}})
        this.$router.go(-1)
      }else if(link.id === 2){
        const id = this.$route.params.id
        this.$router.push(
          {
            path:`/myNotes/${id}`,
            params:{id:id}
          }
        )
      }else if(link.id === 3){
        const id = this.$route.params.id
        this.$router.push(
          {
            path:`/profile/${id}`,
            params:{id:id}
          }
        )
      }else if(link.id === 4){
        this.$router.push({path:'/'})
      }
    },
    checkHoverOnlink(link){
      const check = this.hoverOnLink.hasOwnProperty('id')
      if(check){
        const id = this.hoverOnLink.id
        if(id === link.id){
          return 'bg-dark text-white'
        }else{
          return ''
        }
      }else{
        return ''
      }
    },
    mouseOnFunction(link){
      if(link){
        this.hoverOnLink = link
      }
    },
    selectOption(data){
      if(data.id === 2){
        this.store.importNotesDialogActive =! this.store.importNotesDialogActive
      }else if(data.id === 1){
        this.store.extractNotesDialogActive =! this.store.extractNotesDialogActive
      }
    },
    searchNoteFunction(){
      if(this.searchNote){
        let totalList = this.store.noteFolderNotes.concat(this.store.noteFolderFolders)
        const allBody = {
          id:this.$route.params.id,
          noteId:this.$route.params.noteId,
          totalList:totalList,
          searchNote:this.searchNote
        }
        this.store.filterInputNoteFolderDetail(allBody)
      }else{
        this.clearInput()
      }
    },
    openLeftBar(){
      this.leftDrawerOpen =! this.leftDrawerOpen
    },
    getSelectedNoteFolderDetail(id,noteId){
      this.store.getSelectedNoteFolderDetail(id,noteId)
    }
  },
  created(){

  },
  watch:{
    'store.globalNoteDetail':{
      handler(newVal,oldVal){
        if(newVal){
          this.noteDetail = newVal
        }
      },
      immediate:true,
      deep:true
    },
    $route:{
      handler(to,from){
        console.log(to,from)
        const check = to.hasOwnProperty('params')
        if(check){
          const id = to.params.id
          const noteId = to.params.noteId
          Object.assign(this.routerParams,{
            id:id,
            noteId:noteId
          })

         // this.getSelectedNoteFolderDetail(id,noteId)
         this.store.getSelectedNoteFolderDetail(id,noteId)
        }
      },
      immediate:true,
      deep:true
    }
  }
}
</script>

<style>

</style>
