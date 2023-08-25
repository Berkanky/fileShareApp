<template>
  <q-dialog
    v-model="this.store.updateFileComponentActive"
    persistent
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    :position="this.store.mobileActive ? 'center' : 'top'"
  >
    <q-card
      :style="{
        'width':this.store.mobileActive ? '100%' : '500px',
        'max-width':this.store.mobileActive ? '100%' : '500px',
        'height':this.store.mobileActive  ? '100%' : this.$q.screen.height + 'px'
      }"
    >
      <q-card-section class="">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
      </q-card-section>
      <q-separator size="2px" class="q-mb-md"></q-separator>
      <q-card-section class="text-right" v-if="this.selectedFileStatus">
        <q-btn icon="clear_all" color="red-4" label="Clear" v-on:click="clearAll"></q-btn>
      </q-card-section>
      <q-card-section class="row">
        <q-card
          style="height:400px;"
          bordered
          class="col-6">
          <q-img
            style="object-fit:cover;border-radius:4px;height:150px;"
            :src="this.selectedFile.url"
            v-if="this.selectedFile.imageCheck"></q-img>
          <q-btn v-else icon="folder" size="lg" flat color="grey-8" class="full-width" style="height:150px"></q-btn>
          <q-card-section

            class="text-caption text-weight-bold text-grey-7">
            <div class="">
              <q-icon name="info"></q-icon>
              {{ this.selectedFile.name ?? '' }}
            </div>
            <div class="">
              <q-icon name="description"></q-icon>
              {{ this.selectedFile.type ? this.selectedFile.type.slice(0,50) + '...' :  '' }}
            </div>
            <div class="">
              <q-icon name="event"></q-icon>
              {{ this.checkLastModifiedDate() }}
            </div>
          </q-card-section>
        </q-card>
        <q-card
          style="height:400px;"
          bordered
          v-if="this.selectedFileStatus"
          class="col-6">
          <q-img
          style="object-fit:cover;border-radius:4px;height:150px;"
            :src="this.newSelectedFile.url"
            v-if="this.newSelectedFile.imageCheck"></q-img>
          <q-btn v-else icon="folder" size="lg" flat color="grey-8" class="full-width" style="height:150px"></q-btn>
          <q-card-section

            class="text-caption text-weight-bold text-grey-7">
            <div class="">
              <q-icon name="info"></q-icon>
              {{ this.newSelectedFile.name ?? '' }}
            </div>
            <div class="">
              <q-icon name="description"></q-icon>
              {{ this.newSelectedFile.type ? this.newSelectedFile.type.slice(0,50) + '...' :  '' }}
            </div>
          </q-card-section>
        </q-card>
        <q-card
          v-if="!this.selectedFileStatus"
          style="height:400px;"
          bordered
          class="col-6">
            <q-btn icon="edit" class="full-width full-height" color="grey-7" v-on:click="openFile"></q-btn>
            <q-file ref="fileInput" v-model="this.image" style="display: none" @update:model-value="selectNewFile"/>
        </q-card>

      </q-card-section>
      <q-card-section class="q-mt-lg" v-if="this.selectedFileStatus">
        <q-btn icon="upgrade" class="full-width" color="green-4" no-caps label="Update" v-on:Click="updateSelectedFile"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import { useCounterStore } from 'src/stores/store';
export default {
  props:['selectedFileForUpdate'],
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      selectedFile:{},
      newSelectedFile:{},
      selectedFileStatus:false,
      updateStatus:false,
      imageTypesList:['image/png','image/jpeg']
    }
  },
  methods:{
    updateSelectedFileFunction(){
      console.log('currentFile',this.selectedFile)
      console.log('selectedFile',this.newSelectedFile)


      const allBody = {
        currentFile:this.selectedFile,
        newSelectedFile:this.newSelectedFile
      }
      const id  = this.store.myAccFromDb._id
      axios.put(`${this.store.baseUrl}/files/${id}/updateSelectedFile`, allBody)
        .then(res=>{
          console.log(res)
          this.$q.notify({
            type:'positive',
            message:'Updated.',
            position:'right',
            timeout:700
          })
          const id = this.store.myAccFromDb._id
          this.store.getAllMyFiles(id)
        })
        .catch(err=>{
          console.log(err)
        })

    },
    updateSelectedFile(){
      this.$q.dialog({
        cancel:true,
        title:'Warning',
        message:`If You Apply Process #${this.newSelectedFile.fileId} Will Be Update !`
      }).onOk(() => {
        this.updateSelectedFileFunction()
      }).onCancel(() => {
        //
      })
    },
    clearAll(){
      this.newSelectedFile = {}
      this.selectedFileStatus = false
    },
    checkLastModifiedDate(){
      const check = this.selectedFile.hasOwnProperty('lastUpdatedDate')
      if(!check){
        return 'No Last Update Date'
      }else{
        const lastuptdate = this.selectedFile.lastUpdatedDate
        return lastuptdate
      }
    },
    goBack(){
      this.store.updateFileComponentActive =!  this.store.updateFileComponentActive
    },
    openFile(){
      this.$refs.fileInput.$el.click()
    },
    async selectNewFile(e){
      //console.log(e)
       const newObject = {
          fileId: uuidv4(),
          url: '',
          _key: e._key ?? '',
          lastModified: e.lastModified ?? '',
          lastModifiedDate: e.lastModifiedDate ?? '',
          name: e.name ?? '',
          size: e.size ?? '',
          type: e.type ?? '',
          webKitRelativePath: e.webKitRelativePath ?? '',
          date: new Date().toLocaleString()
        };

        const reader = new FileReader();
        reader.onloadend = () => {
            // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
              newObject.url = reader.result
              console.log(newObject)

              const checkforimagetype = this.imageTypesList.some(object => object === newObject.type)
              if(checkforimagetype){
                Object.assign(newObject,{
                  imageCheck:true
                })
              }else{
                Object.assign(newObject,{
                  imageCheck:false
                })
              }

              this.newSelectedFile = newObject
        };
        reader.readAsDataURL(e);
    }
  },
  created(){
  },
  watch:{
    newSelectedFile:{
      handler(newValue,oldValue){
        if(newValue.fileId){
          this.selectedFileStatus = true
        }
      },
      immediate:true,
      deep:true
    },
    selectedFileForUpdate:{
      handler(newValue,oldValue){
        if(newValue.fileId){
          this.selectedFile = newValue
          console.log('selectedFile',this.selectedFile)
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
