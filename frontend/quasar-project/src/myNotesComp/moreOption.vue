<template>
  <q-dialog
    v-model="this.store.moreOptionForSelectedNotesDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'left'"
  >
    <q-card
      :style="{
        'width':this.store.mobileActive ? '100%' : '400px',
        'max-width':this.store.mobileActive ? '100%' : '400px',
      }"

    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <q-btn icon-right="clear_all" flat color="red-4" :label="this.store.selectedNotes.length" v-on:click="clearAllSelecteds"></q-btn>
      </q-card-section>
      <q-card-section>
        <q-btn-dropdown
          icon="filter_list"
          class="full-width" no-caps split
          color="pink" label="Dropdown Button" dropdown-icon="change_history">
          <q-list>
            <q-item
              v-for="(data,key) in this.options" :key="key"
              clickable v-close-popup @click="selectOption(data)">
              <q-item-section avatar>
                <q-avatar :icon="data.icon" :color="data.color" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{data.label}}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="info" color="amber" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
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
      options:[
        {id:1,label:'Delete All',icon:'delete_forever',color:'red-4'},
        {id:2,label:'Star All',icon:'star',color:'orange-4'}
      ]
    }
  },
  methods:{
    giveStarToSelectedNotes(){
      const allBody = {
        selectedNotes:this.store.selectedNotes
      }
      const id = this.$route.params.id
      axios.put(`${this.store.baseUrl}/files/${id}/giveStarToSelecteds`, allBody)
        .then(res => {
          console.log(res)
          this.clearAllSelecteds()

          this.store.getMyNotes(id)

        })
        .catch(err => {
          console.log(err)
        })


    },
    deleteAllFunction(){
      const allBody = {
        selectedNotes:this.store.selectedNotes
      }
      const id = this.$route.params.id
      axios.put(`${this.store.baseUrl}/files/${id}/removeSelectedNotes`, allBody)
        .then(res => {
          console.log(res)
          this.store.selectedNotes = []

          this.store.getMyNotes(id)

          this.store.moreOptionForSelectedNotesDialogActive =! this.store.moreOptionForSelectedNotesDialogActive
        })
        .catch(err => {
          console.log(res)
        })

    },
    selectOption(data){
      if(data.id === 1){
        this.deleteAllFunction()
      }else if(data.id === 2){
        this.giveStarToSelectedNotes()
      }
    },
    clearAllSelecteds(){
      this.store.selectedNotes = []
      this.store.moreOptionForSelectedNotesDialogActive =! this.store.moreOptionForSelectedNotesDialogActive
    },
    goBack(){
      this.store.moreOptionForSelectedNotesDialogActive =! this.store.moreOptionForSelectedNotesDialogActive
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
