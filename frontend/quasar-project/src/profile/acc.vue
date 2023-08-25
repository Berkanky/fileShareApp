<template>
  <q-card

    style="margin:0 auto;"
    :style="{
      'width':this.store.mobileActive ? '100%' : '50%',
      'height':(this.$q.screen.height + 300) + 'px'
    }"
    class="bg-grey-2">
    <q-card-section class="text-subtitle2 text-weight-bold text-grey-7">
      <q-icon name="settings" color="grey-7" size="md"></q-icon>
      <span style="font-size:18px;">
        Account Settings
      </span>
    </q-card-section>
    <q-card-scetion class="q-ml-lg text-subtitle2 text-weight-bold  text-grey-6">
      <q-icon name="info"></q-icon>
      {{ this.myaccdb.lastProfileUpdatedDate ? `Last Profile Updated Date - ${this.myaccdb.lastProfileUpdatedDate}`  : 'No Last Updated Date' }}
    </q-card-scetion>
    <q-card-section class="text-center">
      <q-avatar size="130px">
        <img
          v-if="this.myaccdb.userImage&&!this.updateData.userImage" style="object-fit:cover;"
          :src="this.myaccdb.userImage" alt="">
          <img
            v-else-if="this.updateData.userImage" style="object-fit:cover;"
            :src="this.updateData.userImage" alt="">
        <q-btn
          size="40px"
          icon="person" color="grey-7" round v-else v-on:click="changeProfilePic"></q-btn>
      </q-avatar>
      <q-file
        color="blue-4"
        @update:model-value="selectNewPic"
        v-model="this.newUserImage"
        label="Pick one file"
        filled
        style="max-width:50%;margin:1% auto;"
      >
        <template v-slot:prepend>
          <q-icon name="edit"></q-icon>
        </template>
      </q-file>
    </q-card-section>
    <q-card-section class="row">
      <q-input
        filled
        color="blue-4"
        type="email"
        class="col-12 col-md-6 col-sm-6"
        :label="this.myaccdb.email ?? 'Email'"
        v-model="this.updateData.email"
        :disable="true"
      >
        <template v-slot:prepend>
          <q-icon name="email"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        class="col-12 col-md-6 col-sm-6"
        :label="this.myaccdb.password ?? 'Change Password'"
        v-model="this.updateData.password"
        :disable="true"
      >
        <template v-slot:prepend>
          <q-icon name="password"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        type="text"
        class="col-12 col-md-6 col-sm-6 q-mt-sm"
        :label="this.myaccdb.name ?? 'Enter Your First Name'"
        v-model="this.updateData.name"
      >
        <template v-slot:prepend>
          <q-icon name="person"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        type="text"
        class="col-12 col-md-6 col-sm-6 q-mt-sm"
        :label="this.myaccdb.surName ?? 'Enter Your Second Name'"
        v-model="this.updateData.surName"
      >
        <template v-slot:prepend>
          <q-icon name="person"></q-icon>
        </template>
      </q-input>
      <q-select
        use-input
        @filter="filterPhoneCodes"
        color="blue-4"
        class="col-12 q-mt-sm"
        filled
        v-model="this.updateData.dialCode" :options="this.phoneCodes"
        :label="this.myaccdb.dialCode ?? 'Enter Country Dial Code'">

          <template v-slot:prepend>
            <q-icon name="phone"></q-icon>
          </template>

          <template v-slot:append v-if="this.updateData.dialCode">
            <q-btn icon="remove" flat color="red-4" size="sm" v-on:click="this.updateData.dialCode = ''"></q-btn>
          </template>

        </q-select>
      <q-input
        filled
        type="text"
        color="blue-4"
        class="col-12 col-md-6 col-sm-6 q-mt-sm"
        :label="this.myaccdb.fullName ?? 'Enter Your Full Name'"
        v-model="this.updateData.fullName"
      >
        <template v-slot:prepend>
          <q-icon name="person"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        type="tel"
        class="col-12 col-md-6 col-sm-6 q-mt-sm"
        :label="this.myaccdb.phoneNumber ?? 'Enter Your Phone Number'"
        v-model="this.updateData.phoneNumber"
      >
        <template v-slot:prepend>
          <q-icon name="phone"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        type="textarea"
        class="col-12 q-mt-sm"
        :label="this.myaccdb.bio ?? 'Enter Your Bio'"
        v-model="this.updateData.bio"
      >
        <template v-slot:prepend>
          <q-icon name="description"></q-icon>
        </template>
      </q-input>
      <q-input
        filled
        color="blue-4"
        type="text"
        class="col-12 q-mt-sm"
        :label="this.myaccdb.safetyAnswer ?? 'Enter Safety Answer'"
        v-model="this.updateData.safetyAnswer"
      >
        <template v-slot:prepend>
          <q-icon name="question_mark"></q-icon>
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="text-subtitle2 text-weight-bold text-grey-7">
      <div>
        <q-icon name="info" size="sm"></q-icon>
        Number of Uploaded Files - <q-btn
          size="md"
          :color="this.myTotalFileVal ? 'green-4' : 'red-4'"
          :label="this.myTotalFileVal ?? 'No File'"></q-btn>
      </div>
      <div class="q-mt-sm">
        <q-icon name="share" size="sm"></q-icon>
        Number of Shared Files - <q-btn
          size="md"
          color="green-4"
          :label="this.checkSharedsForMeLength()"></q-btn>
      </div>
      <div class="q-mt-sm" style="font-size:16px;">
        <q-icon name="event" size="sm"></q-icon>
        Created Date  : {{ this.myaccdb.createdDate ?? '' }}
      </div>
      <div key="" class="font-size:16px; q-mt-sm">
        <q-icon name="info" size="sm"></q-icon>
        #id - {{ this.myaccdb._id ?? '' }}
      </div>
      <div key="" class="font-size:16px; q-mt-sm" v-if="this.myaccdb.googleImage">
        <q-icon name="fa-brands fa-google" size="sm"></q-icon> -
        <q-avatar size="130px" class="q-ml-lg">
          <img :src="this.myaccdb.googleImage" style="object-fit:cover;" alt="">
        </q-avatar>
      </div>
    </q-card-section>
    <q-card-section class="text-right">
      <q-btn
        :disable="this.checkMyAccDb() ? false : true"
        icon="clear_all" no-caps label="Clear All" color="red-4" v-on:click="clearAll"></q-btn>
        <q-btn
        :disable="this.checkMyAccDb() ? false : true"
        icon="edit" no-caps label="Update" color="green-4" v-on:click="updateMyAcc"></q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
import axios from 'axios'
import {useCounterStore} from '../stores/store'
export default {
  props:['myacc'],
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      accountData:{},
      myaccdb:{},
      updateData:{},
      newUserImage:{},
      phoneCodes:[],
      myTotalFileVal:null,
      sharedsForMeLength : {}
    }
  },
  methods:{
    checkSharedsForMeLength(){
      const check = this.sharedsForMeLength.hasOwnProperty('shareds')
      if(check){
        const val = Object.values(this.sharedsForMeLength)
        return val
      }else{
        return 0
      }
    },
    findmytotalfilesval(id){
      axios.get(`${this.store.baseUrl}/files/${id}/getAllFileLength`)
        .then(res=>{
          console.log(res)
          this.myTotalFileVal = res.data.sum
          this.sharedsForMeLength = res.data.sharedsForMeLength
        })
        .catch(err => {
          console.log(err)
        })
    },
    filterPhoneCodes(val,update){
      update(() => {
        if(val){
          console.log(val)
          this.phoneCodes = this.phoneCodes.filter(object => object.includes(val))
        }else{
          const id = this.myaccdb._id
          this.getPhonesCodes(id)
        }
      })
    },
    selectNewPic(val){
      const newObject = {
        __key:val.__key,
        url:'',
        date:new Date().toLocaleString(),
        lastModified:val.lastModified,
        lastModifiedDate:val.lastModifiedDate,
        name:val.name,
        size:val.size,
        type:val.type,
        webkitRelativePath:val.webkitRelativePath
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
          newObject.url = reader.result
          console.log(newObject)
          if(newObject.url){
            this.updateData.userImage = newObject.url
            console.log(this.updateData)
          }
      };
      reader.readAsDataURL(val);
    },
    updateMyAcc(){
      console.log(this.updateData)

/*       if(this.updateData.phoneNumber){
        this.updateData.phoneNumber = Number(this.updateData.phoneNumber)
      } */

      const allBody = {
        updateData:this.updateData
      }

      axios.put(`${this.store.baseUrl}/files/${this.myaccdb._id}/updateMyProfile`, allBody)
        .then(res=>{
          console.log(res)
          if(res.data.updatemyacc){
            this.clearAll()
            //this.getMyAccDetail()
            this.myaccdb  = res.data.updatemyacc
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    checkMyAccDb(){
      let lengthObject = Object.keys(this.updateData).length
      if(lengthObject > 0) {
        return true
      }else{
        return false
      }
    },
    clearAll(){
      this.updateData = {}
    },
    getMyAccDetail(){
      const id = this.myaccdb._id
      this.store.getMyAcc(id)
    },
    getPhonesCodes(id){
      axios.get(`${this.store.baseUrl}/files/${id}/getPhoneCodes`)
        .then(res=>{
          console.log(res)
          this.phoneCodes = res.data.dialCodes
        })
        .catch(err=>{
          console.log(err)
        })
    }
  },
  created(){

  },
  watch:{
    updateData:{
      handler(newValue,oldValue){
        if(newValue){
          console.log('updateData',newValue)
        }
      },
      immediate:true,
      deep:true
    },
    myacc:{
      handler(newValue,oldValue){
        if(newValue._id){
          this.myaccdb = newValue
          const id = newValue._id
          this.getPhonesCodes(id)
          this.findmytotalfilesval(id)
          console.log('accVue',this.myaccdb)
        }
      },
      immediate:true,
      deep:true
    }
  }
}
</script>

<style scoped>
</style>
