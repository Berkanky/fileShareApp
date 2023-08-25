<template>
  <q-dialog
    persistent
    v-model="this.store.signupDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
  >
    <q-card
      class="bg-white "
        style="border-radius:7px;"
        :style="{
          'width':this.store.mobileActive ? '100%' : '530px',
          'max-width':this.store.mobileActive ? '100%' : '530px',
        }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="grey-8" v-on:click="goBack"></q-btn>
<!--         <q-space></q-space>
        <q-avatar icon="person_add" text-color="grey-8"></q-avatar> -->
      </q-card-section>
      <q-card-section class="text-center">
        <q-avatar size="120px">
          <q-btn icon="person_add" round color="grey-8" size="45px"></q-btn>
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <q-input
          type="text"
          filled
          color="grey-8"
          label="Type Your Full Name"
          v-model="this.registerData.fullName"
        >
          <template v-slot:prepend>
            <q-icon name="person"></q-icon>
          </template>
          <template v-slot:append v-if="this.registerData.fullName">
            <q-btn icon="remove" size="sm" color="red-4" v-on:click="this.registerData.fullName = ''"></q-btn>
          </template>
        </q-input>
        <q-input
          class="q-mt-sm"
          filled
          type="email"
          color="grey-8"
          label="Type Your Email"
          v-model="this.registerData.email"
        >
          <template v-slot:prepend>
            <q-icon name="email"></q-icon>
          </template>
          <template v-slot:append v-if="this.registerData.email">
            <q-btn icon="remove" size="sm" color="red-4" v-on:click="this.registerData.email = ''"></q-btn>
          </template>
        </q-input>
        <q-input
          no-error-icon label="Type Your Passsword"
          color="grey-8"
          class="q-mt-sm"
          v-model="this.registerData.password"
          filled :type="this.isPwd ? 'password' : 'text'"
          >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="this.isPwd = !this.isPwd"
          />
          <q-btn
            round icon="remove" size="sm" color="red-4"
            v-on:click="this.registerData.password = ''" v-if="this.registerData.password"></q-btn>
        </template>
        <template v-slot:prepend>
          <q-icon name="lock"></q-icon>
        </template>
      </q-input>
      </q-card-section>
      <q-card-section>
        <q-btn
          rounded
          v-on:click="registerButton"
          class="full-width"
          text-color="grey-3"
          no-caps label="Register" icon="person_add"
          style=" background: linear-gradient(to left, #a8c0ff, #3f2b96)"
        ></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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
      registerData:{},
      isPwd:false
    }
  },
  methods:{
    sendInformatinoToDb(newLoginData){
      const allBody = {
        loginData:newLoginData
      }
      axios.put(`${this.store.baseUrl}/files/checkUser`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.user){
            this.registerData = {}
            this.$router.push({path:'/'})
            this.store.signupDialogActive =! this.store.signupDialogActive
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    signupFunction(){
      const auth = getAuth();
      const email = this.registerData.email
      const password = this.registerData.password
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // ...
          this.store.firebaseInfoUser = user
          const newLoginData = {
            email:user.email ?? '',
            fullName:user.displayName ?? '',
            fireBaseId:user.uid,
            googleImage:user.photoURL ?? '',
          }
          this.sendInformatinoToDb(newLoginData)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    },
    goBack(){
      this.store.signupDialogActive =! this.store.signupDialogActive
    },
    registerButton(){
      this.signupFunction()
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
