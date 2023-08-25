<template>
  <q-dialog
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    v-model="this.store.shareDialogActive"
  >
    <q-card
      style="border-radius:15px;"
      :style="{
        'width':this.store.mobileActive ? '100%'  : '600px',
        'max-width':this.store.mobileActive ? '100%' : '600px'
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="grey-8" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <div class="text-overline text-grey-7 text-weight-bold">
          ( {{ this.checkLengthSelecteds() }} ) Share Selected Files
        </div>
      </q-card-section>
      <q-card-section>
<!--         <q-input
          v-on:keyup.enter="searchUserFunction"
          color="grey-8"
          filled label="Type User Name or Email and Enter" v-model="this.searchUserVal">
          <template v-slot:prepend>
            <q-icon name="person"></q-icon>
          </template>
          <template v-slot:append v-if="this.searchUserVal">
            <q-btn icon="remove" flat color="red-4" size="sm" v-on:click="this.searchUserVal = ''"></q-btn>
          </template>
        </q-input> -->
        <q-select
          @input-value="inputValFunction"
          use-input
          class="full-width"
          color="grey-8"
          filled v-model="this.selectedEmail" :options="this.onlyEmails" label="Type User Name or Email..." >
            <template v-slot:prepend>
              <q-icon name="person"></q-icon>
            </template>
            <template v-slot:append v-if="this.selectedEmail">
              <q-btn icon="remove" color="red-4" size="sm" v-on:click="this.selectedEmail = ''"></q-btn>
            </template>
          </q-select>
      </q-card-section>
      <q-card-section v-if="this.selectedEmail" class="text-subtitle2 text-grey-7 text-weight-bold">
        <q-checkbox
          v-model="this.sendNotificationActive"
          :label="`Send Notification To ${this.selectedEmail ?? ''}`"
          checked-icon="swipe_left"
          unchecked-icon="swipe_right"
          :color="this.sendNotificationActive  ? 'green-4': 'red-4'"
          keep-color
        />
      </q-card-section>
      <q-card-section v-if="this.selectedEmail">
        <q-input
          label="Enter Your Message"
          type="textarea" filled
          v-model="this.messageVal"
          color="grey-8"
        >
          <template v-slot:prepend>
            <q-icon name="mail"></q-icon>
          </template>
          <template v-slot:append v-if="this.messageVal">
            <q-btn icon="remove" color="red-4" size="sm" v-on:click="this.messageVal = ''"></q-btn>
          </template>
        </q-input>
      </q-card-section>
      <q-card-section class="text-right">
        <q-btn color="red-4" label="Cancel" no-caps rounded icon="remove" v-on:click="cancelProcess" :disable="this.checkSelectedEmail() ? false : true"></q-btn>
        <q-btn
          v-on:click="shareSelectedFiles"
          color="green-4" label="Share" no-caps rounded icon="share" :disable="this.checkSelectedEmail() ? false : true"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import {useCounterStore} from '../stores/store'
export default {
  props:['selectedFiles','selectedSpecialFiles'],
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      selectedFilesLocal:[],
      selectedSpecialFilesLocal:[],
      searchUserVal:'',
      findedUsers:[],
      onlyEmails:[],
      selectedEmail:'',
      messageVal:'',
      sendNotificationActive:false
    }
  },
  methods:{
    shareFunction(){
      const allBody = {
        selectedEmail:this.selectedEmail,
        messageVal:this.messageVal,
        selectedFilesLocal:this.selectedFilesLocal,
        selectedSpecialFilesLocal:this.selectedSpecialFilesLocal,
        senderMail:this.store.myAccFromDb.email,
        senderId:this.store.myAccFromDb._id,
        sendNotificationActive:this.sendNotificationActive
      }
      axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/shareSelectedPosts`, allBody)
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
        })
    },
    shareSelectedFiles(){
      this.$q.dialog({
        title:'Warning',
        message:`Are You Sure for Share Selected Files With ${this.selectedEmail} ?`,
        cancel:true,
        maximized:this.store.mobileActive ? true : false,
        fullHeight:this.store.mobileActive ? true : false
      }).onOk(()=>{
        this.shareFunction()
      })
    },
    checkSelectedEmail(){
      const check = this.selectedEmail ? true : false
      return check
    },
    cancelProcess(){
      this.selectedEmail = ''
      this.searchUserVal = ''
      this.messageVal = ''
    },
    checkLengthSelecteds(){
      const selectedFilesLength = this.selectedFilesLocal.length
      const selectedSpecialFilesLength = this.selectedSpecialFilesLocal.length

      const total = selectedFilesLength + selectedSpecialFilesLength
      return total
    },
    inputValFunction(val){
      if(val){
        const allBody = {
          searchUserVal:val
        }
        axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/findUser`, allBody)
          .then(res=>{
            console.log(res)
            this.findedUsers = res.data.result
            this.onlyEmails = res.data.onlyEmails
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    searchUserFunction(){
      if(this.searchUserVal){
        console.log(this.searchUserVal)
        const allBody = {
          searchUserVal:this.searchUserVal
        }
        axios.put(`${this.store.baseUrl}/files/${this.store.myAccFromDb._id}/findUser`, allBody)
          .then(res=>{
            console.log(res)
            this.findedUsers = res.data.result
          })
          .catch(err=>{
            console.log(err)
          })
      }
    },
    goBack(){
      this.store.shareDialogActive =! this.store.shareDialogActive
    },
    getAllUsers(){
      axios.get(`${this.store.baseUrl}/files/getAllUsers`)
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
        })
    }
  },
  created(){
    this.getAllUsers()
  },
  watch:{
    selectedEmail:{
      handler(newValue,oldValue){
        if(newValue){
          console.log('newValue',newValue)
        }
      },
      immediate:true,
      deep:true
    },
    selectedSpecialFiles:{
      handler(newValue,oldValue){
        if(newValue.length){
          this.selectedSpecialFilesLocal = newValue
          console.log('selectedSpecialFilesLocal',this.selectedSpecialFilesLocal)
        }
      },
      immediate:true,
      deep:true
    },
    selectedFiles:{
      handler(newValue,oldValue){
        if(newValue.length){
          this.selectedFilesLocal = newValue
          console.log('selectedFilesLocal',this.selectedFilesLocal)
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
