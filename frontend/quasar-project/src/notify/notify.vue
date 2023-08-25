<template>
  <q-dialog
    v-model="this.store.notifyDialogActive"
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
        <q-btn
          v-if="this.checkStoreNotifyList()"
          icon="clear_all" flat color="red" v-on:Click="deleteAll"></q-btn>
      </q-card-section>
      <q-card-section>
        <q-card
          v-for="(data,key) in this.store.notifyList" :key="key"
          style="border-radius:15px;"
          class="bg-grey-3"
          bordered
        >
          <q-card-section horizontal>
            <q-card-section class="col-2">
              <q-btn
                :disable="data.nodata && data.nodata ===  true ? true : false"
                color="dark"
                flat
                icon="fa-sharp fa-regular fa-question fa-fade">
                <q-menu fit class="bg-dark text-white">
                  <q-list
                    style="min-width: 100px">
                    <q-item
                      v-on:click="selectOption(men,data)"
                      clickable v-for="(men,key) in this.options" :key="key">
                      <q-item-section>{{men.label}}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
                </q-btn>
            </q-card-section>
            <q-card-section class="col text-grey-7 text-weight-bold">
              <div class="text-subtitle2 ">
                <q-icon name="mail"></q-icon>
                {{ data.message }}
              </div>
              <div class="text-caption">
                <q-icon name="event"></q-icon>
                {{ data.date ?? 'No Date' }}
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>
    <notifyDetailVue v-if="this.store.notifyDetailDialogActive"/>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import {useCounterStore} from '../stores/store'
import notifyDetailVue from 'src/components/notifyDetail.vue'
export default {
  components:{
    notifyDetailVue
  },
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      options:[
        {id:1,label:'Delete',val:'delete'},
        {id:2,label:'Detail',val:'detail'}
      ]
    }
  },
  methods:{
    checkStoreNotifyList(){
      if(this.store.notifyList.length === 1){
        const check = this.store.notifyList.forEach(element => {
          const result = element.nodata && element.nodata === true ? false : true
          return result
        });
        return check
      }else if(this.store.notifyList.length > 1){
        return true
      }else if(!this.store.notifyList.length){
        return false
      }
    },
    deleteAll(){
      const allBody = {
        deleteAllCommandActive:true,
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/deleteSelectedNotify`,allBody)
        .then(res=>{
          console.log(res)
          this.store.notifyList = res.data.myfiles.notifies
        })
        .catch(err=>{
          console.log(err)
        })
    },
    newClassIfNotifyNone(data){
      const check = data.nodata && data.nodata === true ? true : false
      return check
    },
    deleteSelectedNotify(men,data){
      const allBody = {
        deleteAllCommandActive:false,
        dataNotifyId:data.notifyId
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/deleteSelectedNotify`,allBody)
        .then(res=>{
          console.log(res)
          this.store.notifyList = this.store.notifyList.filter(object => object.notifyId !== data.notifyId)
        })
        .catch(err=>{
          console.log(err)
        })
    },

    getNotifyIdShareds(men,data){
      const allBody = {
          notifyDetail:data
        }
        console.log(allBody)
        axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/getNotifiedIdShareds`,allBody)
        .then(res=>{
          console.log(res)
          this.store.notifyDetailSharedsList = res.data.newList
          this.store.notifyDetailDialogActive =! this.store.notifyDetailDialogActive
        })
        .catch(err=>{
          console.log(err)
        })
    },
    selectOption(men,data){
      console.log('men',men)
      console.log('data',data)
      if(men.id === 1){
        this.deleteSelectedNotify(men,data)
      }else if(men.id === 2){
        this.getNotifyIdShareds(men,data)
      }
    },
    goBack(){
      this.store.notifyDialogActive =! this.store.notifyDialogActive
    },

  },
  created(){

  },
  watch:{
    'store.myAccFromDb':{
      handler(newValue,oldValue){
        if(newValue._id){
          console.log(newValue)
          const id = newValue._id
          this.store.getMyNotifies(id)
         // this.store.getMyShareds(id)
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
