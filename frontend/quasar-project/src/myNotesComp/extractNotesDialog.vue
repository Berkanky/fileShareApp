<template>
  <q-dialog
    v-model="this.store.extractNotesDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'right'"
  >
    <q-card

    style="border-top-left-radius: 7px;border-bottom-left-radius:7px;"

    :style="{
      'width':this.store.mobileActive ? '100%' : '600px',
    }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <q-btn icon="clear_all" flat color="red-4" v-if="this.selectedList.length" v-on:click="clearAll"></q-btn>
        <q-btn icon="more_vert" flat color="dark">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                v-on:Click="selectOption(data)"
                v-for="(data,key) in this.options" :key="key"
                clickable v-close-popup>
                <q-item-section>{{data.label}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card-section>
      <q-separator size="2px"></q-separator>
      <q-markup-table class="">
        <thead>
          <tr>
            <th class="text-left"></th>
            <th class="text-left">Name</th>
            <th class="text-left">Date</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(data,key) in this.currentNoteFolderNotes" :key="key"
          >
            <td class="text-left">
              <q-btn
                flat color="red-4"
                v-on:click="addToList(data)"
                icon="remove" v-if="!this.checkList(data)"></q-btn>
              <q-btn
                flat color="green-4"
                icon="check" v-else v-on:click="addToList(data)"></q-btn>
            </td>
            <td class="text-left">
              <q-icon name="note" color="grey-8"></q-icon>
              {{data.noteTitle ?? 'No Title'}}</td>
            <td class="text-left">{{data.date ?? 'NO Date'}}</td>
            <td class="text-left">
              <q-btn icon="upload" color="dark" flat v-on:click="extractFile(data)">
                <q-tooltip>Extract Note From Folder</q-tooltip>
              </q-btn>
            </td>
          </tr>
          <tr
            v-for="(data,key) in this.currentNoteFolderFolders" :key="key"
          >
            <td class="text-left">
              <q-btn
                flat color="red-4"
                v-on:click="addToList(data)"
                icon="remove" v-if="!this.checkList(data)"></q-btn>
              <q-btn
                flat color="green-4"
                icon="check" v-else v-on:click="addToList(data)"></q-btn>
            </td>
            <td class="text-left">
              <q-icon name="folder" color="grey-8"></q-icon>
              {{data.folderName ?? 'No Title'}}</td>
            <td class="text-left">{{data.date ?? 'NO Date'}}</td>
            <td class="text-left">
              <q-btn icon="upload" color="dark" flat v-on:click="extractFile(data)">
                <q-tooltip>Extract Note From Folder</q-tooltip>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import { useCounterStore } from 'src/stores/store';
export default {
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      currentNoteFolderNotes:[],
      currentNoteFolderFolders:[],
      selectedList:[],
      options:[
        {id:1,label:'Extract All Selecteds'}
      ]
    }
  },
  methods:{
    notifyMessage(){
      this.$q.notify({
        type:'positive',
        message:'Extracted All Selecteds !',
        icon:'check',
        position:'left'
      })
    },
    extractAllSelectedNotes(){
      const allBody = {
        selectedNotes:this.selectedList
      }
      const id = this.$route.params.id
      axios.put(`${this.store.baseUrl}/files/${id}/extractAllSelecteds`, allBody)
        .then(res => {
          console.log(res)
          this.notifyMessage()
          this.clearAll()
        })
        .catch(err => {
          console.log(err)
        })
    },
    selectOption(data){
      if(data.id === 1){
        this.extractAllSelectedNotes()
      }
    },
    extractFile(data){
      const allBody = {
        selectedNote:data
      }
      const id = this.$route.params.id
      const noteId = this.$route.params.noteId
      axios.put(`${this.store.baseUrl}/files/${id}/${noteId}/extractSelectedNote`, allBody)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    clearAll(){
      this.selectedList = []
    },
    addToList(data){
      const result = this.selectedList.some(
        object => object.noteId === data.noteId
      )
      if(!result){
        this.selectedList.push(data)
      }else{
        this.selectedList = this.selectedList.filter(
          object => object.noteId !== data.noteId
        )
      }
    },
    checkList(data){
      const result = this.selectedList.some(
        object => object.noteId === data.noteId
      )
      return result
    },
    getDetail(allBody){
      axios.put(`${this.store.baseUrl}/files/${allBody.id}/${allBody.noteId}/seperateFoldersAndNotes`, allBody)
        .then(res => {
          console.log(res)
          this.currentNoteFolderNotes = res.data.notes
          this.currentNoteFolderFolders = res.data.folders
        })
        .catch(err => {
          console.log(err)
        })
    },
    goBack(){
      this.store.extractNotesDialogActive =! this.store.extractNotesDialogActive
    },
    getCurrentRouterParams(){
      const allBody = {}

      const id = this.$route.params.id
      const noteId = this.$route.params.noteId
      const currentNoteFolder = this.store.globalNoteDetail
      Object.assign(allBody,{
        id,noteId,currentNoteFolder
      })
      console.log(allBody)
      this.getDetail(allBody)
    }
  },
  created(){
    this.getCurrentRouterParams()
  },
  watch:{

  }
}
</script>

<style>

</style>
