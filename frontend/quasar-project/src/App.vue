<template>
  <div class="allApp">
    <transition-group apper enter-active-class="animated fadeIn slower" leave-active-class="animated fadeOut slower">
      <router-view />
    </transition-group>
  </div>
</template>

<script>
import {auth} from './firebase/index'
import { defineComponent } from 'vue'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from 'axios'
import { useCounterStore} from './stores/store';
export default defineComponent({
  name: 'App',
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{

    }
  },
  methods:{

    checkMySchema(){

    },

    welcomeMessage(){
      this.$q.notify({
        color:"blue-4",
        classes:'glossy',
        avatar:this.store.firebaseInfoUser.photoURL ?? '',
        position:'top',
        message:`${this.store.firebaseInfoUser.email ?? ''} Welcome .`
      })
    },
    handleResize() {
      this.store.window.width = window.innerWidth;
      this.store.window.height = window.innerHeight;
      //console.log('window',this.window)
    },
    checkCurrentUserStatus(){
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          // ...
          this.store.firebaseInfoUser = user
          console.log('firebaseInfoUser',this.store.firebaseInfoUser)
        } else {
          // User is signed out
          // ...
          this.$router.replace({path:'/login'})
        }
      });
    },
  },
  created(){
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch:{
    'store.myAccFromDb':{
      handler(newValue,oldValue){
        if(newValue._id){
          const id = newValue._id
          //console.log('this.$router',this.$router)
          this.store.getTotalSizeAllFiles(id)
        }
      },
      immediate:true,
      deep:true
    },
    $route:{
      handler(to,from){
        console.log(to,from)
        const path  = to.fullPath
        if(from.path === '/login'){
          this.welcomeMessage()

          this.$watch('store.myAccFromDb',(newVal) => {
            const check = newVal.hasOwnProperty('_id')
            if(check){
              const id = newVal._id
              console.log('newVal',newVal)
              this.store.welcomeMessageWhenLogin(id)
            }
          })

        }
        if(this.$route.path !== '/login'){
          this.checkCurrentUserStatus()
        }
      }
    },
    'store.window':{
      handler(newValue,oldValue){
        if(newValue.width<580){
          this.store.newHeight = 300
          this.store.mobileActive = true
          console.log('newHeight',this.store.newHeight)
          console.log('avatar',this.store.mobileActive)
        }else{
          this.store.newHeight = ''
          this.store.mobileActive = false
          console.log('avatar',this.store.mobileActive)
          console.log('newHeight',this.store.newHeight)
        }
      },
      immediate:true,
      deep:true
    },
    'store.firebaseInfoUser':{
      handler(newValue,oldValue){
        if(newValue.uid){
          const id = newValue.uid
          this.store.getMyAcc(id)
        }
      },
      immediate:true,
      deep:true
    }
  },
})
</script>

<style>
  .allApp{
    font-family: 'Roboto', sans-serif;
  }
</style>
