<template>
  <q-dialog
    v-model="this.store.importNotesDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'left'"
  >
    <q-card

      style="border-top-right-radius: 7px;border-bottom-right-radius:7px;"

      :style="{
        'width':this.store.mobileActive ? '100%' : '600px',
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <q-btn
          v-if="!this.selectedList.length"
          icon="filter_list" flat color="dark"></q-btn>
        <q-btn :label="this.selectedList.length" v-else flat color="red-4" icon-right="clear_all" v-on:Click="clearAllSelecteds"></q-btn>
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
      <q-separator></q-separator>
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
            v-for="(data,key) in this.store.myNotes" :key="key"
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
              <q-btn icon="publish" color="dark" flat v-on:click="uploadFile(data)">
                <q-tooltip>If Not Exist Upload, or Updating</q-tooltip>
              </q-btn>
            </td>
          </tr>
          <tr
            v-for="(data,key) in this.store.myNotesFolders" :key="key"
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
              <q-btn icon="publish" color="dark" flat v-on:click="uploadFile(data)">
                <q-tooltip>If Not Exist Upload, or Updating</q-tooltip>
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
      selectedList:[],
      options:[
        {id:1,label:'Upload All Selecteds'},
      ]
    }
  },
  methods:{
    notifyMessage(){
      this.$q.notify({
            type:'positive',
            message:'Uploaded !',
            icon:'check',
            position:'right'
          })
    },
    uploadAllSelecteds(){
      const allBody = {
        selectedNotes:this.selectedList
      }
      const id = this.$route.params.id
      const noteId = this.$route.params.noteId
      axios.put(`${this.store.baseUrl}/files/${id}/${noteId}/uploadSelectedNotesToFolder`, allBody)
        .then(res=>{
          console.log(res)
          this.notifyMessage()
          this.clearAllSelecteds()
        })
        .catch(err => {
          console.log(err)
        })
    },
    selectOption(data){
      if(data.id === 1){
        this.uploadAllSelecteds()
      }
    },
    clearAllSelecteds(){
      this.selectedList = []
    },
    addToList(data){
      if(!this.checkList(data)){
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
    uploadFile(data){
      const id = this.$route.params.id
      const noteId = this.$route.params.noteId

      const allBody = {
        selectedNote:data
      }

      axios.put(`${this.store.baseUrl}/files/${id}/${noteId}/uploadNoteToFolder`, allBody)
        .then(res=> {
          console.log(res)

          //this.store.globalNoteDetail.notes.push(data)

          const id =  this.$route.params.id
          const noteId = this.$route.params.noteId
          this.store.getSelectedNoteFolderDetail(id,noteId)

          this.notifyMessage()
        })
        .catch(err => {
          console.log(err)
        })
    },
    getMyNotesFunction(){
      const check = this.store.myAccFromDb.hasOwnProperty('_id')
      if(check){
        const id = this.store.myAccFromDb._id
        this.store.getMyNotes(id)
      }
    },
    goBack(){
      this.store.importNotesDialogActive =! this.store.importNotesDialogActive
    }
  },
  mounted(){
    this.getMyNotesFunction()
  },
  watch:{

  }
}
</script>

<style>

</style>
