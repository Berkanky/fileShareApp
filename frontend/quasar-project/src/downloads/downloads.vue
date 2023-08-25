<template>
  <q-dialog
    persistent
    v-model="this.store.downloadsDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    :position="this.store.mobileActive ? 'center' : 'top'"

  >
  <q-card
    :style="{
        'width':this.store.mobileActive ? '100%' : '500px',
        'max-width':this.store.mobileActive ? '100%' : '500px',
        'height':this.store.mobileActive  ? '100%' : this.$q.screen.height + 'px'
      }"
  >
      <q-card-section class="">
        <q-btn icon="keyboard_backspace" flat color="dark"></q-btn>
      </q-card-section>
  </q-card>
  </q-dialog>
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

    }
  },
  methods:{

  },
  created(){

  },
  watch:{

  }
}
</script>

<style>

</style>
