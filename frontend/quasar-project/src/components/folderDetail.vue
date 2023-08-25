<template>
  <q-dialog
    v-model="this.store.selectedfolderSpecialFolderActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'top'"
    transition-show="slide-down"
    transition-hide="slide-up"
    transition-duration="500"
  >
    <q-card
      class="bg-dark text-white"
      :style="{
        'width':this.store.mobileActive ? '100%'  :'550px',
        'max-width':this.store.mobileActive ? '100%' : '550px',
        'border-radius':'7px'
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="white" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <div class="text-subtitle2">
          @ {{ this.selectedSpecialFolder.fileRealName ?? this.selectedSpecialFolder.fileName }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-card
          v-for="(data,key) in this.newObject.fileList" :key="key"
          flat
          class="bg-transparent text-white">
          <q-card-section horizontal>
            <q-card-section class="col-2">
              <q-btn icon="note" flat color="white"></q-btn>
            </q-card-section>
            <q-card-section class="col">
              <div class="text-subtitle2 text-weight-bold text-grey-6">
                {{ data.name ?? '' }}
              </div>
              <div class="text-caption text-weight-bold text-grey-7">
                <q-icon name="info"></q-icon>
                {{ data.type ?? '' }}
              </div>
            </q-card-section>
            <q-card-section class="col-2">
              <q-btn icon="more_vert" flat color="white">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-on:Click="selectMen(men,data)"
                      v-for="(men,key) in this.optionsList" :key="key"
                      clickable v-close-popup>
                      <q-item-section>{{men.label}}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-section>
          </q-card-section>
        </q-card>
        <q-card
          v-for="(data,key) in this.newObject.folderList" :key="key"
          flat
          class="bg-transparent text-white">
          <q-card-section horizontal>
            <q-card-section class="col-2">
              <q-btn icon="note" flat color="white"></q-btn>
            </q-card-section>
            <q-card-section class="col">
              <div class="text-subtitle2 text-weight-bold text-grey-6">
                {{ data.fileRealName ?? data.fileName }}
              </div>
              <div class="text-caption text-weight-bold text-grey-7">
                <q-icon name="info"></q-icon>
                {{ data.date ?? '' }}
              </div>
            </q-card-section>
            <q-card-section class="col-2">
              <q-btn icon="more_vert" flat color="white">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-on:Click="selectMen(men,data)"
                      v-for="(men,key) in this.optionsList" :key="key"
                      clickable v-close-popup>
                      <q-item-section>{{men.label}}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import { useCounterStore } from 'src/stores/store';
export default {
  props:['specialSelectedFolderDetail'],
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      allBody:{},
      selectedSpecialFolder:{},
      newObject:{},
      optionsList:[
        {id:1,label:'Download',val:'download'},
        {id:2,label:'Select',val:'select'},
        {id:3,label:'External Transfer',val:'External transfer'}
      ]
    }
  },
  methods:{
    selectMen(men,data){
      console.log('men',men)
      console.log('data',data)
      if(men.id === 1){
        this.store.downloadFile(data)
      }
    },
    getLengthFolderAndFile(){
      const filelength = this.newObject.fileList ? this.newObject.fileList.length : 0
      const folderlength = this.newObject.folderList ? this.newObject.folderList.length : 0
      const totalLength = filelength + folderlength
      return totalLength
    },
    goBack(){
      this.store.selectedfolderSpecialFolderActive =! this.store.selectedfolderSpecialFolderActive
    },
    getDetail(allBody){
      const id = this.store.myAccFromDb._id
      const sendBody = {
        currentFolder:allBody.currentFolder,
        selectedFolder:allBody.selectedFolder
      }
      axios.put(`${this.store.baseUrl}/files/${id}/getSelectedSpecialFolderDetail`, sendBody)
        .then(res=>{
          console.log(res)
          this.selectedSpecialFolder = res.data.selectedspecialfolder
          this.newObject = res.data.newObject
        })
        .catch(err=>{
          console.log(err)
        })
    }
  },
  created(){
  },
  watch:{
    specialSelectedFolderDetail:{
      handler(newValue,oldValue){
        if(newValue){
          const allBody = newValue
          this.getDetail(allBody)
          console.log('allBody',allBody)
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
