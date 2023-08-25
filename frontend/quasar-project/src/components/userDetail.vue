<template>
  <q-dialog
    v-model="this.store.userDetailDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'right'"
  >
    <q-card
      class=""
      :style="{
        'width':this.store.mobileActive ? '100%'  :'500px',
        'max-width':this.store.mobileActive ? '100%' : '500px',
        'border-radius':'15px'
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <q-btn icon="more_vert" flat color="dark"></q-btn>
      </q-card-section>
      <q-card-section>
        <q-card
          flat class="bg-transparent text-dark"
        >
          <q-card-section horizontal>
            <q-card-section class="col">
              <div class="text-subtitle2">
                <q-icon name="person" color="grey-7"></q-icon>
                {{ this.findedUser.fullName !== '' && this.findedUser.fullName !== null ? this.findedUser.fullName : this.findedUser.email }}
              </div>
              <div class="text-caption text-grey-6">
                <q-btn
                  label="Online"
                  icon="fiber_manual_record"
                  v-if="this.findedUser.active && this.findedUser.active === true"
                  color="green" flat no-caps></q-btn>
                <q-btn v-else no-caps :label="this.findedUser.lastLoginDate" flat color="dark"></q-btn>
              </div>
            </q-card-section>
            <q-card-section class="col-3">
              <q-avatar size="100px">
                <img
                  v-if="this.checkUserImage()"
                  style="object-fit:Cover;"
                  :src="this.findUserImage()" alt="">
                <q-btn icon="person" v-if="!this.checkUserImage()" color="grey-7" round size="xl"></q-btn>
              </q-avatar>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
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
      findedUser:{}
    }
  },
  methods:{
    checkUserImage(){
      if(this.findedUser.userImage || this.findedUser.googleImage){
        return true
      }else{
        return false
      }
    },
    findUserImage(){
      if(this.findedUser.userImage && !this.findedUser.googleImage){
        const image = this.findedUser.userImage
        return image
      }else if(this.findedUser.googleImage && !this.findedUser.userImage){
        const image = this.findedUser.googleImage
        return image
      }
    },
    goBack(){
      this.store.userDetailDialogActive =! this.store.userDetailDialogActive
    }
  },
  created(){

  },
  watch:{
    'store.findedUser':{
      handler(newValue,oldValue){
        if(newValue){
          this.findedUser = newValue
          console.log('findedUser',this.findedUser)
        }
      },
      immediate:true,
      deep:true
    },
    'store.selectedUserId':{
      handler(newValue,oldValue){
        if(newValue){
          const id = newValue._id
          this.store.getSelectedUserDetail(id)
          console.log(id)
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
