<template>
  <q-dialog
    class="entireDialog"
    v-model="this.store.readNotesDialogActive"
    :full-height="this.store.mobileActive ? true : false"
    :maximized="this.store.mobileActive ? true : false"
    persistent
    :position="this.store.mobileActive ? 'center' : 'top'"
  >
    <q-card class="entireCard"
      :style="{
        'width':this.store.mobileActive ? '100%' : '720px',
        'max-width':this.store.mobileActive  ? '100%' : '720px'
      }"
    >
      <q-card-section class="row">
        <q-btn icon="keyboard_backspace" flat color="dark" v-on:click="goBack"></q-btn>
        <q-space></q-space>
        <q-btn icon="star" color="orange-4" flat v-if="this.checkForStar()">
          <q-tooltip>
            {{ this.getStarDate() }}
          </q-tooltip>
        </q-btn>
        <div class="q-pa-sm text-subtitle2 text-weight-bold text-grey-7 text-capitalize">
          @{{ this.store.selectedNote.noteTitle ?? '' }}
        </div>
        <q-btn icon="more_vert" flat color="grey-8">
          <q-menu
          transition-show="flip-right"
          transition-hide="flip-left"
        >
          <q-list style="min-width: 100px">
            <q-item
              v-on:Click="selectNoteOption(data)"
              v-for="(data,key) in this.readNoteOptions" :key="key"
              clickable>
              <q-item-section v-if="data.id !== 2">{{data.label}}</q-item-section>
              <q-item-section v-if="data.id === 2">
                {{
                  this.checkForStar() ? 'Remove Star' : 'Star'
                }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        </q-btn>
      </q-card-section>
      <q-separator size="2px"></q-separator>
      <q-card-section
        class="bg-dark text-white"
      >
      <!--<q-card-section v-for="(data,key) in this.noteList" :key="key">
        <div v-html="`${data}`"></div>
      </q-card-section> -->

      <div v-html="`${this.store.selectedNote.qeditor}`" style="width:100%;"></div>
      </q-card-section>
      <q-btn
        :icon="this.showDetail ? 'expand_less' : 'expand_more'"
        class="full-width" label="More Detail" no-caps
        v-on:click="this.showDetail =! this.showDetail">
      </q-btn>
      <transition-group appear enter-active-class="animated fadeInUp slower" leave-active-class="animated fadeOutUp slower">
      <q-card-section v-if="this.showDetail">
        <q-separator size="2px"></q-separator>
          <q-card-section class="text-capitalize bg-grey-2" >
            <q-input
              type="textarea"
              label="Description : "
              readonly
              v-model="this.store.selectedNote.noteDescription"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="grey-7"></q-icon>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="text-subtitle2 text-weight-bold text-grey-7 bg-grey-2">
            <div>
              Created Date - {{ this.store.selectedNote.date ?? 'No Date' }}
            </div>
            <div class="q-mt-sm" v-if="this.checkUpdated()">
              Updated Date - {{ this.store.selectedNote.updatedDate ?? 'No Date' }}
            </div>
            <div class="q-mt-md">
              Creater -
              <q-avatar size="70px">
                <img :src="this.findimage()" style="object-fit:cover;" alt="">
              </q-avatar>
              <span>
                - {{ this.findemail() }}
              </span>
            </div>
            <div class="q-mt-sm text-capitalize">
              Type - {{ this.store.selectedNote.type ?? 'No Type Info' }}
            </div>
            <div class="q-mt-sm text-capitalize">
              #ID - {{ this.store.selectedNote.noteId ?? 'No Info' }}
            </div>
          </q-card-section>
      </q-card-section>
    </transition-group>
    </q-card>
    <updateNotesVue v-if="this.store.noteUpdateDialogActive"/>
  </q-dialog>
</template>

<script>
import updateNotesVue from './update.vue';
import { useCounterStore } from 'src/stores/store';
export default {
  components:{
    updateNotesVue
  },
  setup(){
    const store  = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      readNoteOptions:[
        {id:1,label:'Update',icon:'edit'},
        {id:2,label:'Star',icon:'star'},
        {id:3,label:'Delete',icon:'delete_forever'}
      ],
      showDetail:false
    }
  },
  methods:{
    checkUpdated(){
      const check = this.store.selectedNote.hasOwnProperty('updatedDate')
      return check
    },
    getStarDate(){
      const check = this.store.selectedNote.hasOwnProperty('starDate')
      if(check){
        const message = `Gived Star at ${this.store.selectedNote.starDate}`
        return message
      }
    },
    checkForStar(){
      const check = this.store.selectedNote.hasOwnProperty('starDate')
      if(check){
        return true
      }else{
        return false
      }
    },
    selectNoteOption(data){
      if(data.id === 1){
        const id = this.store.myAccFromDb._id
        const check = this.store.selectedNote.createrId === id ? true : false
        if(check){
          this.store.noteUpdateDialogActive =! this.store.noteUpdateDialogActive
          console.log('noteUpdateDialogActive',this.store.noteUpdateDialogActive)
        }
      }else if(data.id === 2){
        const noteData = this.store.selectedNote
        this.store.giveStarForNote(noteData)
      }else if(data.id === 3){
        const noteData = this.store.selectedNote
        this.store.deleteSelectedNote(noteData)
      }
    },
    findemail(){
      const check = this.store.selectedNote.hasOwnProperty('createrDetail')
      if(check){
        const emailVal = this.store.selectedNote.createrId === this.$route.params.id ? 'Siz' : this.store.selectedNote.createrDetail.email
        return emailVal
      }
    },
    findimage(){
      const check = this.store.selectedNote.hasOwnProperty('createrDetail')
      if(check){
        const checkimg = this.store.selectedNote.createrDetail.userImage || this.store.selectedNote.createrDetail.googleImage ? true : false
        if(checkimg){
          return this.store.selectedNote.createrDetail.userImage  ?? this.store.selectedNote.createrDetail.googleImage
        }
      }
    },
    goBack(){
      this.store.readNotesDialogActive =! this.store.readNotesDialogActive
    },
    getSelectedNote(){
      console.log('selectedNoteParams',this.store.selectedNoteParams)
      this.$watch('store.selectedNoteParams',(newVal,oldVal) => {
        if(newVal){
        }
      })
    }
  },
  created(){
  },
  watch:{
    'store.selectedNoteParams':{
      handler(newVal,oldVal){
        const lengthObj = Object.keys(newVal).length
        if(lengthObj){
          const id = newVal.id
          const noteId = newVal.noteId
        //  this.store.getSelectedNoteDetail(id,noteId)
        }
      },
      immediate:true,
      deep:true
    }
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
