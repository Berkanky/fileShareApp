<template>
  <q-dialog
    v-model="this.store.noteUpdateDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'top'"
  >
    <q-card
      :style="{
        'width':this.store.mobileActive ? '100%' : '720px',
        'max-width':this.store.mobileActive  ? '100%' : '720px'
      }"
    >
      <q-card-section class="">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-section>
        <q-input
          v-model="this.updatedData.noteTitle"
          :label="this.store.selectedNote.noteTitle ?? 'Enter New Note Title'" class="q-mb-sm" color="blue-4">
          <template v-slot:prepend>
            <q-icon name="title"></q-icon>
          </template>
        </q-input>

        <q-editor
          :fullscreen="this.store.mobileActive ? true : false"
          v-model="this.updatedData.qeditor"
          :dense="$q.screen.lt.md"
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
          :label="this.store.selectedNote.noteDescription ?? 'Enter Note Description'"
          v-model="this.updatedData.noteDescription"
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
        <q-btn icon="edit" color="green-4" flat v-on:click="updateNote" no-caps  label="Update" ></q-btn>
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
      updatedData:{}
    }
  },
  methods:{
    updateNote(){
      console.log(this.updatedData)

      const allBody = {
        updatedData:this.updatedData
      }
      const id = this.$route.params.id
      const noteId = this.store.selectedNote.noteId
      axios.put(`${this.store.baseUrl}/files/${id}/${noteId}/updateNote`, allBody)
        .then(res=>{
          console.log(res)

          this.$q.notify({
            type:'positive',
            message:`#${this.store.selectedNote.noteId} Successfully Updated.`,
            position:'bottom'
          })

          this.store.selectedNote = res.data.findnote

          this.store.noteUpdateDialogActive =! this.store.noteUpdateDialogActive

        })
        .catch(err=>{
          console.log(err)
        })
    },
    clearAll(){
      this.updatedData = {}
    },
    checkForVal(){
      const obj = this.updatedData
      const hasValue = Object.keys(obj).some(key => obj[key]);
      return hasValue
    },
    goBack(){
      this.clearAll()
      this.store.noteUpdateDialogActive =! this.store.noteUpdateDialogActive
    },
    getSelectedNote(){
      this.updatedData.qeditor = this.store.selectedNote.qeditor
    }
  },
  created(){
    this.getSelectedNote()
  },
  watch:{
    updatedData:{
      handler(newVal){
        if(newVal){
          console.log('updatedData',newVal)
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
