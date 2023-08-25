<template>
  <q-dialog
    v-model="this.store.uploadDialogActive"
    persistent
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
  >
  <q-card
    :style="{
      'width':this.store.mobileActive ? '100%' : '450px',
      'max-width':this.store.mobileActive ? '100%' : '450px'
    }"
  >
    <q-card-section class="text-right">
      <q-btn icon="cancel" flat color="red-4" v-on:click="goBack"></q-btn>
    </q-card-section>
    <q-card-section>
      <q-file
        @update:model-value="getFiles"
        v-model="files"
        label="Pick files"
        color="grey-8"
        filled
        counter
        use-chips
        class="full-width"
        :counter-label="counterLabelFn"
        multiple
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
    </q-card-section>
    <q-card-section class="row">
      <q-btn
        class="col-4"
        v-for="(data,key) in this.newFiles" :key="key" no-caps :label="data.name"></q-btn>
    </q-card-section>
    <q-card-section class="text-right">
      <q-btn icon="clear_all" color="red-4" rounded v-if="this.checkfiles()" v-on:click="clearAll()"></q-btn>
      <q-btn
        v-if="this.checkfiles()"
        icon="cloud_upload" rounded color="blue-4" v-on:click="uploadAllFiles()"></q-btn>
    </q-card-section>
  </q-card>
  </q-dialog>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
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
      fileUrl:'',
      files:[],
      newFiles:[]
    }
  },
  methods:{
    clearAll(){
      this.files = []
      this.newFiles = []
    },
    checkfiles(){
      if(this.newFiles.length){
        return true
      }else{
        return false
      }
    },
    uploadAllFiles(){
      console.log(this.newFiles)
      const allBody = {
        newFiles:this.newFiles
      }
      axios.post(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/postMySelectedFiles`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.uploaded){
            this.clearAll()
            const myselectedfiles = res.data.myselectedfiles
            this.$emit('newuploadedfiles',myselectedfiles)
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    makeurlforeachfile(val){
      let newList = []
      val.forEach(element => {
        // Encode the file using the FileReader API
        const newObject = {
          fileId: uuidv4(),
          url: '',
          _key: element._key ?? '',
          lastModified: element.lastModified ?? '',
          lastModifiedDate: element.lastModifiedDate ?? '',
          name: element.name ?? '',
          size: element.size ?? '',
          type: element.type ?? '',
          webKitRelativePath: element.webKitRelativePath ?? '',
          date: new Date().toLocaleString()
        };

        const reader = new FileReader();
        reader.onloadend = () => {
            // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
              newObject.url = reader.result
        };
        reader.readAsDataURL(element);

        newList.push(newObject)
      });

      this.newFiles = newList
      console.log('newFiles',this.newFiles)
    },
    getFiles(val){
      console.log(val)
      this.makeurlforeachfile(val)
    },
    counterLabelFn ({ totalSize, filesNumber, maxFiles }) {
      return `${filesNumber} files of ${maxFiles ?? 'NO Max File Size'} | ${totalSize}`
    },
    goBack(){
      this.store.uploadDialogActive =! this.store.uploadDialogActive
    }
  },
  created(){

  },
  watch:{

  }
}
</script>

<style>

</style>
