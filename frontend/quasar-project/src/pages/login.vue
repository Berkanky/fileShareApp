<template>
  <q-page
    class="loginPageClass"
    :style="{'height':this.$q.screen.height + 'px'}"
  >
    <div class="container">
      <q-card
        class="bg-white "
        style="margin:0 auto;border-radius:7px;"
        :style="{
          'width':this.store.mobileActive ? '100%' : '570px',
          'max-width':this.store.mobileActive ? '100%' : '570px',
          'height':this.store.mobileActive ? this.$q.screen.height + 'px' : '70%'
        }"
      >
        <q-card-section class="text-center text-h6 text-weight-bold text-grey-9" style="font-size:27px;">
          <q-avatar size="110px">
            <img :src="image" style="" alt="">
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <q-input
            type="mail"
            filled
            label="Type Your Email"
            color="grey-7"
            v-model="this.loginData.email"
          >
          <template v-slot:prepend>
            <q-icon name="mail"></q-icon>
          </template>
          <template v-slot:append v-if="this.loginData.email">
            <q-btn icon="remove" size="sm" color="red-4" v-on:click="this.loginData.email = ''"></q-btn>
          </template>
          </q-input>
          <q-input
            class="q-mt-md"
            color="grey-8"
            label="Type Your Password"
            v-model="this.loginData.password"
            filled :type="this.options.isPwd ? 'password' : 'text'"
            >
            <template v-slot:append>
              <q-icon
                :name="this.options.isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="this.options.isPwd = !this.options.isPwd"
              />
              <q-btn icon="remove" color="red-4" size="sm" v-on:click="this.loginData.password = ''" v-if="this.loginData.password" round></q-btn>
            </template>
            <template v-slot:prepend>
              <q-icon name="lock"></q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="text-right text-subtitle2 text-grey-6">
          Forgot Your Password <q-btn icon="question_mark" flat color="grey-8"></q-btn>
        </q-card-section>
        <q-card-section class="text-center" style="width:70%;margin:0 auto;">
          <q-btn
            :disable="this.checkLoginData() ? false : true"
            v-on:click="signInWithEmailAndPassFunction"
            class="full-width"
            text-color="grey-3"
            style=" background: linear-gradient(to left, #a8c0ff, #3f2b96)"
            icon-right="login" label="Login" no-caps rounded></q-btn>
        </q-card-section>
        <q-card-section class="text-center">
          <q-btn icon="fa-brands fa-google fa-spin" round color="red-4" size="lg" v-on:click="loginWithGoogle"></q-btn>
        </q-card-section>
        <q-card-section class="text-center">
          <q-btn icon="person_add" flat no-caps label="Sign Up" color="grey-8" v-on:click="signupButton"></q-btn>
        </q-card-section>
      </q-card>
    </div>
    <register v-if="this.store.signupDialogActive"/>
  </q-page>
</template>

<script>
import register from '../register/register.vue'
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword  } from "firebase/auth";
import image from '../images/logo.png'
import axios from 'axios'
import { useCounterStore } from 'src/stores/store';
export default {
  components:{
    register
  },
  setup(){
    const store = useCounterStore()
    return{
      store,
      image
    }
  },
  data:function(){
    return{
      loginData:{},
      options:{
        isPwd:false
      }
    }
  },
  methods:{
    checkLoginData(){
      let checkVal = 0
      for(const key in this.loginData){
        if(this.loginData[key] === '' || this.loginData[key] === null){
          return false
        }else{
          checkVal = checkVal + 1
        }
      }
      const check = checkVal === 2 ? true : false
      return check
    },
    signInWithEmailAndPassFunction(){
      const auth = getAuth();
      const email = this.loginData.email
      const password = this.loginData.password
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          const newLoginData = {
            email:user.email,
            fullName:user.displayName ?? '',
            fireBaseId:user.uid,
            googleImage:user.photoURL ?? '',
          }
          this.sendInformatinoToDb(newLoginData)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    },
    signupButton(){
      this.store.signupDialogActive =! this.store.signupDialogActive
      console.log(this.store.signupDialogActive)
    },
    sendInformatinoToDb(newLoginData){
      const allBody = {
        loginData:newLoginData
      }
      axios.put(`${this.store.baseUrl}/files/checkUser`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.user){
            this.$router.push({path:'/'})
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    loginWithGoogle(){
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          console.log(user)

          const newLoginData = {
            email:user.email,
            fullName:user.displayName ?? '',
            fireBaseId:user.uid,
            googleImage:user.photoURL ?? '',
          }

          this.sendInformatinoToDb(newLoginData)
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
    }
  },
  created(){

  },
  watch:{

  }
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height:100%;
}
.loginPageClass{
  background: linear-gradient(to right, #a8c0ff, #3f2b96)
}
</style>
