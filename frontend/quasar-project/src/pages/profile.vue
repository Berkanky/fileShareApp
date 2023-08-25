<template>
  <q-page>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-3 text-grey-7"
      :width="270"
    >
      <q-img class="" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img
              v-if="this.myacc.userImage || this.myacc.googleImage"
              :src="this.myacc.userImage ?? this.myacc.googleImage"
              style="object-fit:cover;"
              >
            <q-btn v-if="!this.myacc.userImage && ! this.myacc.googleImage" icon="person" color="grey-8" round></q-btn>
          </q-avatar>
          <div class="text-weight-bold text-capitalize">
            {{ this.myacc.fullName ?? 'No Info About Name' }}
          </div>
          <div>@ {{ this.myacc.email ?? '' }}</div>
        </div>
      </q-img>
      <q-list>
        <q-item
          v-on:click="selectOption(data)"
          v-for="(data,key) in this.leftOptions" :key="key"
          clickable
          :class="this.checkSelectedOption(data) ?  'bg-white text-dark' : data.class"
          class="GPLAY__drawer-link">
          <q-item-section avatar>
            <q-icon :name="data.icon" />
          </q-item-section>
          <q-item-section >
            <q-item-label>{{data.label}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <transition-group enter-active-class="animated fadeInUp slower" appear>
      <accVue
      :myacc="this.myacc"
      v-if="this.store.selectedprofileoption.id === 1"/>
    </transition-group>
    <q-page-container>
      <q-page-sticky expand position="bottom">
        <q-toolbar class="GPLAY__sticky bg-white q-px-xl">
          <q-space />
          <q-btn icon="help" dense flat size="12px" class="GPLAY__sticky-help" />
          <q-btn icon="settings" dense flat class="GPLAY__sticky-settings q-ml-md" size="12px" />
        </q-toolbar>
      </q-page-sticky>
    </q-page-container>
  </q-page>
</template>

<script>
import {useCounterStore} from '../stores/store'
import accVue from 'src/profile/acc.vue'
export default {
  components:{
    accVue
  },
  setup(){
    const store = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      myacc:{},
      leftOptions:[
        {id:5,label:'Back',val:'back',icon:'keyboard_backspace',class:'bg-grey-8 text-white'},
        {id:1,label:'Account',val:'account',icon:'person',class:'bg-grey-8 text-white'},
        {id:2,label:'Security',val:'security',icon:'lock',class:'bg-orange-4 text-white'},
        {id:3,label:'Password',val:'password',icon:'password',class:'bg-red-4 text-white'},
        {id:4,label:'Notification',val:'notification',icon:'notifications',class:'bg-blue-4 text-white'}
      ]
    }
  },
  methods:{
    checkSelectedOption(data){
      const check = this.store.selectedprofileoption.id === data.id ? true : false
      return check
    },
    selectOption(data){
      if(data.id !== 5){
        this.store.selectedprofileoption = data
      }else{
        this.$router.push({path:`/`})
      }
    }
  },
  created(){

  },
  watch:{
    'store.myAccFromDb':{
      handler(newValue,oldValue){
        if(newValue._id){
          this.myacc = newValue
          console.log('myacc',this.myacc)
        }
      },
      immediate:true,
      deep:true
    },
    $route:{
      immediate:true,
      deep:true,
      handler(to,from){
        //console.log('to',to)

        const id = to.params.id
        if(id){
          this.store.getMyAcc(id)
        }
        console.log(id)
        //console.log('from',from)
      }
    },
  }
}
</script>

<style lang="sass">
.GPLAY

  &__toolbar
    height: 60px

  &__logo
    width: 183px
    height: 39px

  &__toolbar-input-container
    min-width: 100px
    width: 55%

  &__toolbar-input-btn
    border-radius: 0
    max-width: 60px
    width: 100%

  &__drawer-link

    .q-item__section--avatar
      margin: -8px 0 -8px -16px
      padding: 8px 0 8px 16px

    .q-item__section--main
      margin: -8px -16px -8px 16px
      padding: 8px 16px 8px 2px
      font-size: 18px
      font-weight: 300

    &--apps, &--movies, &--music, &--books, &--devices
      background: #f5f5f5!important
      &:hover
        color: #eee !important

    &--apps:hover
      background: #43a047!important

    &--movies:hover
      background: #e53935!important

    &--music:hover
      background: #fb8c00!important

    &--books:hover
      background: #1e88e5!important

    &--devices:hover
      background: #546e7a!important

  &__drawer-item
    padding: 6px 12px 6px 23px

  &__sticky
    min-height: 49px
    border-bottom: 1px solid rgba(0,0,0,0.12)

  &__sticky-help
    border: 1px solid #ccc
    padding-left: 8px
    padding-right: 8px

  &__sticky-settings
    padding-left: 17px
    padding-right: 17px
    border: 1px solid #ccc
</style>
