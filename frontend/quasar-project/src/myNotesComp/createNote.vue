<template>
  <q-dialog
    v-model="this.store.createNoteDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'top'"
  >
    <q-card :style="{
      'width':this.store.mobileActive ? '100%' : '600px',
    }">
      <q-card-section>
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-section>
        <q-input
          v-model="this.noteData.noteTitle"
          label="Enter Note Title" class="q-mb-sm" color="blue-4">
          <template v-slot:prepend>
            <q-icon name="title"></q-icon>
          </template>
        </q-input>

        <q-editor
          :fullscreen="this.store.mobileActive ? true : false"
          v-model="this.noteData.qeditor"
          :dense="$q.screen.lt.md"
          @update:model-value="editNewData"
          :toolbar="[
            [
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify']
              },
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                options: ['left', 'center', 'right', 'justify']
              }
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['print', 'fullscreen'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                  'p',
                  'h1',
                  'h2',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                  'code'
                ]
              },
              {
                label: $q.lang.editor.fontSize,
                icon: $q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'size-1',
                  'size-2',
                  'size-3',
                  'size-4',
                  'size-5',
                  'size-6',
                  'size-7'
                ]
              },
              {
                label: $q.lang.editor.defaultFont,
                icon: $q.iconSet.editor.font,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'default_font',
                  'arial',
                  'arial_black',
                  'comic_sans',
                  'courier_new',
                  'impact',
                  'lucida_grande',
                  'times_new_roman',
                  'verdana'
                ]
              },
              'removeFormat'
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

            ['undo', 'redo'],
            ['viewsource']
          ]"
          :fonts="{
            arial: 'Arial',
            arial_black: 'Arial Black',
            comic_sans: 'Comic Sans MS',
            courier_new: 'Courier New',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana'
          }"
        />
        <q-input
          type="textarea"
          color="blue-4"
          filled class="q-mt-sm"
          label="Enter Note Description"
          v-model="this.noteData.noteDescription"
        >
          <template v-slot:prepend>
            <q-icon name="description"></q-icon>
          </template>
        </q-input>
      </q-card-section>
      <q-separator></q-separator>
      <transition-group appear enter-active-class="animated fadeInUp slower" leave-active-class="animated fadeOutUp slower">
      <q-card-section class="text-right" v-if="this.checkForVal()">
        <q-btn icon="clear_all" color="red-4" v-on:click="clearAll" no-caps label="Clear" ></q-btn>
        <q-btn icon="edit" color="red-4" flat v-on:click="editNote" no-caps  label="Create" ></q-btn>
      </q-card-section>
    </transition-group>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import {useCounterStore} from '../stores/store'
export default {
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      noteData:{
        qeditor:'Enter Your Note',
        qeditorFullDetailVal:''
      },
      noteList:[]
    }
  },
  methods:{
    pushToDb(){
      const allBody = {
        noteData:this.noteData
      }
      const id = this.store.myAccFromDb._id
      axios.post(`${this.store.baseUrl}/files/${id}/postToMyNotes`, allBody)
        .then(res=>{
          console.log(res)
          this.$q.notify({
            type:'positive',
            message:'Note Created',
            position:'right'
          })
          const newData = res.data.allBody.uploadedData
          this.store.myNotes.push(newData)

          this.clearAll()
        })
        .catch(err=>{
          console.log(err)
        })
    },
    clearAll(){
      this.noteData = {}
    },
    checkForVal(){
      const obj = this.noteData
      const hasValue = Object.keys(obj).some(key => obj[key]);
      return hasValue
    },
    editNote(){
      console.log(this.noteData)
      this.pushToDb()
    },
    pushToList(){
      this.noteList.push(this.noteData.qeditorFullDetailVal )
      console.log(this.noteList)
    },
    goBack(){
      this.store.createNoteDialogActive =! this.store.createNoteDialogActive
    },
    editNewData(val){
      if(val){
        console.log(val)
        this.noteData.qeditorFullDetailVal = val
      }
    }
  },
  created(){

  },
  watch:{
    noteData:{
      handler(newVal){
        if(newVal.noteData){
          this.editNewData(val)
        }
      }
    }
  }
}
</script>

<style>

</style>
