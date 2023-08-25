<template>
  <q-dialog
    v-model="this.store.notifyDetailDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'right'"
  >
    <q-card
      class="bg-dark text-white"
      :style="{
        'width':this.store.mobileActive ? '100%'  :'500px',
        'max-width':this.store.mobileActive ? '100%' : '500px',
        'border-radius':'15px'
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="white" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <div>
          ( {{ this.notifyDetailSharedsListLocal.length }} )
        </div>
      </q-card-section>
      <q-card-section>
        <q-card
          v-for="(data,key) in this.notifyDetailSharedsListLocal" :key="key"
          style="border-radius:15px;"
          class="bg-grey-3 text-dark"
        >
          <q-card-section horizontal class="text-subtitle2 text-grey-7">
            <q-card-section class="col">
              <div>
    <!--             <q-icon name="info" size="sm"></q-icon>
                {{ data.name ?? '' }} -->
                <q-btn icon="info" color="grey-7" flat :label="data.name ?? ''" no-caps v-on:click="detailFile(data)"></q-btn>
              </div>
              <div class="text-caption">
                <span>LTD</span>
                {{ data.lastModifiedDate ?? '' }}
              </div>
            </q-card-section>
            <q-card-section class="col-2">
              <q-btn icon="delete" flat color="red-4" v-on:Click="deleteSharedFile(data)"></q-btn>
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
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      notifyDetailSharedsListLocal:[],
      deleteList:[]
    }
  },
  methods:{
    detailFile(data){
      console.log(data)
    },
    deleteSharedFile(data){
      console.log(data)

      const allBody = {
        selectedShared:data,
        deleteList:this.deleteList,
        deleteAllSharedsActive:false
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/removeSelectedShared`, allBody)
        .then(res=>{
          console.log(res)
          this.store.notifyDetailSharedsList = this.store.notifyDetailSharedsList.filter(object => object.fileId !== data.fileId)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    goBack(){
      this.store.notifyDetailSharedsList = []
      this.store.notifyDetailDialogActive =! this.store.notifyDetailDialogActive
    }
  },
  created(){

  },
  watch:{
    'store.notifyDetailSharedsList':{
      handler(newValue,oldValue){
        if(newValue){
          this.notifyDetailSharedsListLocal = newValue
          console.log('notifyDetailSharedsListLocal',this.notifyDetailSharedsListLocal)
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
