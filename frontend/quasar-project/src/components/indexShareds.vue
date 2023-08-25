<template>
    <q-card
      class="bg-transparent" flat>
      <q-card-section>
        <div class="text-h6">
          <q-icon name="share"></q-icon>
          Shareds With Me</div>
      </q-card-section>

      <q-markup-table
        style="border-radius:15px;"
      >
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Sharer</th>
            <th class="text-left">Shared Date</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(data,key) in this.store.sharedsList"  :key="key"
          >
            <td class="text-left">{{ data.name ?? 'No File Name' }}</td>
            <td class="text-left">
              <q-avatar v-on:click="showProfileDetail(data)">
                <img
                  style="object-fit:cover;"
                  v-if="data.senderUserDetail && data.senderUserDetail.userImage || data.senderUserDetail.googleImage"
                  :src="data.senderUserDetail.userImage ?? data.senderUserDetail.googleImage" alt="">
                <q-btn
                  icon="person" color="grey-7" round
                  size="sm"
                  v-else
                ></q-btn>
              </q-avatar>
              <span>
                {{ checkName(data) }}
              </span>
            </td>
            <td class="text-left">{{data.date ?? 'No Date'}}</td>
            <td class="text-left">
              <q-btn icon="more_vert" flat color="dark">
                <q-menu auto-close>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-on:click="selectOption(men,data)"
                      v-for="(men,key) in this.options" :key="key"
                      clickable>
                      <q-item-section>{{men.label}}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
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
      options:[
        {id:1,label:'Select',val:'select'},
        {id:2,label:'Download',val:'download'},
        {id:3,label:'Delete',val:'delete'}
      ]
    }
  },
  methods:{
    selectOption(men,data){
      if(men.id === 3){
        this.deleteSharedFile(data)
      }else if(men.id === 2){
        console.log(data)
        this.store.downloadFile(data)
      }
    },
    showProfileDetail(data){
      console.log(data)
      this.store.selectedUserId._id = data.senderId
      this.store.userDetailDialogActive =! this.store.userDetailDialogActive
    },
    deleteSharedFile(data){
      console.log(data)
      const allBody = {
        selectedShared:data,
        deleteList:[],
        deleteAllSharedsActive:false
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/removeSelectedShared`, allBody)
        .then(res=>{
          console.log(res)
          this.store.sharedsList = this.store.sharedsList.filter(object => object.fileId !== data.fileId)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    checkName(data){
      if(data.senderUserDetail.fullName){
        const name = data.senderUserDetail.fullName
        return name
      }else if(data.senderUserDetail.email && !data.senderUserDetail.fullName){
        const email = data.senderUserDetail.email
        return email
      }else{
        const val = 'No Info'
        return val
      }
    }
  },
  created(){

  },
  watch:{
    'store.myAccFromDb':{
      handler(newValue,oldValue){
        if(newValue._id){
          const id = newValue._id
          this.store.getMyShareds(id)
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
