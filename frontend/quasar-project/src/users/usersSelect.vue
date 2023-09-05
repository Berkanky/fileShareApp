<template>
      <q-btn-dropdown
      class="full-width"
      split
      color="orange-4"
      push
      no-caps
      icon="groups"
      label="Select User"
      @click="onMainClick"
    >
      <q-list>
        <q-item
          v-for="(data,key) in this.allUsersList" :key="key"
          clickable v-close-popup @click="selectUser(data)">
          <q-item-section avatar>
            <q-avatar>
              <img :src="data.userImage ?? data.googleImage" alt="" style="object-fit:cover;" v-if="data.userImage||data.googleImage">
              <q-btn icon="person" color="grey-8" round v-else></q-btn>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{data.email ?? ''}}</q-item-label>
            <q-item-label caption>
              {{ data.active ? `ONLINE` : data.lastLoginDate }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="info" color="amber" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
</template>

<script>
import axios from 'axios'
import { useCounterStore} from '../stores/store';
export default {
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      allUsersList:[]
    }
  },
  methods:{
    selectUser(data){

      const checkforcurrentpermissionlist= this.store.currentPermissedUsers.some(
        object => object._id === data._id
      )

      const result = this.store.permissionUsersOfferList.some(
        object => object._id === data._id
      )
      if(result === false && checkforcurrentpermissionlist === false){
        this.store.permissionUsersOfferList.push(data)
      }else if(result === false && checkforcurrentpermissionlist === true){
        this.$q.notify({
          type:'negative',
          message:'Already Gived Permission !',
          position:'right',
          icon:'warning'
        })
      }
      console.log('permissionUsersOfferList',this.store.permissionUsersOfferList)
    },
    getAllUsers(){
      const check = this.store.myAccFromDb.hasOwnProperty('_id')
      if(check){
        const id = this.store.myAccFromDb._id
        this.store.getAllUsers(id)
      }
    }

  },
  mounted(){
    this.getAllUsers()
  },
  watch:{
    'store.allUsersList':{
      handler(newValue,oldValue){
        if(newValue.length){
          this.allUsersList = newValue
          console.log('allUsersList',this.allUsersList)
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
