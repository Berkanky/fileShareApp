<template>
  <q-menu
    transition-show="flip-right"
    transition-hide="flip-left"
    class="bg-dark text-white"
    style=""
  >
  <div class="row">
    <div
      v-on:click="selectMenu(data)"
      v-for="(data,key) in this.options" :key="key"
      class="col-12 ">
      <q-card style="height:150px;" class="bg-transparent">
        <q-btn
          class="full-width full-height"
          :icon="data.icon"
          flat :color="data.color"
        >
        <q-tooltip>{{data.label}}</q-tooltip>
        </q-btn>
      </q-card>
    </div>
  </div>
  </q-menu>
</template>

<script>
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
        {id:1,label:'Notes',icon:'note',color:'orange-4'},
        {id:2,label:'Profile',icon:'person',color:'blue-4'}
      ]
    }
  },
  methods:{
    selectMenu(data){
      if(data.id === 1){
        this.$router.push(
          {
            path:`/myNotes/${this.store.myAccFromDb._id}`,
            params:{id:this.store.myAccFromDb._id}
          })
      }else if(data.id === 2){
        const id = this.store.getMyId()
        this.$router.push({path:`/profile/${id}`,params:{id:id}})
      }
    },
  },
  created(){
  },
  mounted(){

  }
}
</script>

<style>

</style>
