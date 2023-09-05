<template>
  <q-dialog
    v-model="this.store.folderDetailSettingsDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    :position="this.store.mobileActive ? 'center' : 'top'"
    persistent
  >
  <q-card
    :style="{
      'width':this.store.mobileActive ? '100%' : '600px',
      'max-width':this.store.mobileActive ? '100%' : '600px',

    }"
  >
    <q-card-section class="">
      <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
    </q-card-section>
    <q-card-section class="">
      <usersSelect />
    </q-card-section>
    <q-card-section class="col-12 col-md-4 col-sm-4">
      <q-card v-for="(data,key) in this.store.permissionUsersOfferList"  :key="key">
        <q-card-section horizontal>
          <q-card-section class="col-2">
            <q-avatar>
              <img
                :src="data.userImage ?? data.googleImage"
                style="object-fit:cover" alt=""
                v-if="data.userImage || data.googleImage">
              <q-btn icon="person" v-else color="grey-7" round></q-btn>
            </q-avatar>
          </q-card-section>
          <q-card-section class="col">
            <div class="text-subtitle2">
              <q-icon name="mail" color="grey-6"></q-icon>
              {{ data.email ?? '' }}
            </div>
            <div class="text-caption text-weight-bold text-grey-6">
              <q-icon name="fiber_manual_record" :color="data.active ? 'green-4' : 'red-4'"></q-icon>
              <span>
                {{ data.active ? `ONLINE` : data.lastLoginDate}}
              </span>
            </div>
          </q-card-section>
          <q-card-section class="col-2">
            <q-btn icon="remove" color="red-4" flat v-on:click="removeFromAddedList(data)"></q-btn>
          </q-card-section>
        </q-card-section>
      </q-card>
      <q-card v-for="(data,key) in this.store.currentPermissedUsers"  :key="key">
        <q-card-section horizontal>
          <q-card-section class="col-2">
            <q-avatar>
              <img
                :src="data.userImage ?? data.googleImage"
                style="object-fit:cover" alt=""
                v-if="data.userImage || data.googleImage">
              <q-btn icon="person" v-else color="grey-7" round></q-btn>
            </q-avatar>
          </q-card-section>
          <q-card-section class="col">
            <div class="text-subtitle2">
              <q-icon name="mail" color="grey-6"></q-icon>
              {{ data.email ?? '' }}
            </div>
            <div class="text-caption text-weight-bold text-grey-6">
              <q-icon name="fiber_manual_record" :color="data.active ? 'green-4' : 'red-4'"></q-icon>
              <span>
                {{ data.active ? `ONLINE` : data.lastLoginDate}}
              </span>
            </div>
          </q-card-section>
          <q-card-section class="col-2">
            <q-btn icon="delete_forever" color="red-4" flat v-on:click="deletePermisser(data)"></q-btn>
          </q-card-section>
        </q-card-section>
      </q-card>
    </q-card-section>
    <q-card-section class="text-right" v-if="this.store.permissionUsersOfferList.length">
      <q-btn icon="clear_all" color="red-4" no-caps label="Clear" v-on:click="clearAll"></q-btn>
      <q-btn icon="edit" color="green-4" no-caps label="Add" v-on:click="givePermission"></q-btn>
    </q-card-section>
  </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import usersSelect from '../users/usersSelect.vue'
import {useCounterStore} from '../stores/store'
export default {
  components:{
    usersSelect
  },
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      currentPermissedUsers:[]
    }
  },
  methods:{
    deletePermisser(data){
      const id = this.store.myAccFromDb._id
      const fileId = this.$route.params.id
      const allBody = {
        selectedUserId:data._id,
        selectedFolder:this.store.selectedFolderDetail.selectedFile
      }

      axios.put(`${this.store.baseUrl}/files/${id}/${fileId}/removeFromPermissed`, allBody)
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    givePermission(){

      let onlyIdForList = []

      this.store.permissionUsersOfferList.forEach(element => {
        onlyIdForList.push({userId:element._id})
      });

      const allBody = {
        permissionUsersOfferList:onlyIdForList,
        selectedFolder:this.store.selectedFolderDetail.selectedFile
      }
      console.log(allBody)
      const id = this.store.myAccFromDb._id
      const folderId = this.$route.params.id
      axios.put(`${this.store.baseUrl}/files/${id}/${folderId}/givePermissions`, allBody)
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
        })


    },
    clearAll(){
      this.store.permissionUsersOfferList = []
    },
    getSelectedFolderPermissionsFunction(allBody){
      axios.get(`${this.store.baseUrl}/files/${allBody.currentUserId}/${allBody.selectedFolderId}/getPermissedUsers`)
        .then(res=>{
          console.log(res)

          if(res.data.resBody){
            if(res.data.resBody.permissionslistdetail){
              this.store.currentPermissedUsers = res.data.resBody.permissionslistdetail
              console.log('currentPermissedUsers',this.store.currentPermissedUsers)
            }else{
              this.store.currentPermissedUsers = []
            }
          }else{
            this.store.currentPermissedUsers = []
          }

        })
        .catch(err=>{
          console.log(err)
        })
    },
    getSelectedFolderPermissions(){

      const allBody = {}

      const check = this.store.myAccFromDb.hasOwnProperty('_id')
      if(check){
        const id = this.store.myAccFromDb._id
        Object.assign(allBody,{currentUserId:id})
      }

      const fileId = this.$route.params.id
      Object.assign(allBody,{selectedFolderId:fileId})
      console.log('allBody',allBody)

      this.getSelectedFolderPermissionsFunction(allBody)

    },
    removeFromAddedList(data){
      this.store.permissionUsersOfferList = this.store.permissionUsersOfferList.filter(
        object => object._id !== data._id
      )
    },
    goBack(){
      this.store.folderDetailSettingsDialogActive =! this.store.folderDetailSettingsDialogActive
    }
  },
  created(){

  },
  mounted(){
    this.getSelectedFolderPermissions()
  },
  watch:{

  }
}
</script>

<style>

</style>
