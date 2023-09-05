<template>
  <q-card
    v-touch-hold:1000.mouse="event => moreOption(data)"
    v-on:click="this.store.selectedNotes.length ? addToSelecteds(data) : selectNote(data)"
    v-for="(data,key) in this.myNotes" :key="key"
    class="ag-courses_item col-12 col-md-3 col-sm-3"
    >
    <q-card-section horizontal>
      <transition appear enter-active-class="animated fadeInLeft slower" leave-active-class="animated fadeOutLeft slower">
      <q-card-section
        v-if="this.checkSelectedNotes(data)"
        class="col-2 bg-grey-4">
        <q-btn icon="undo" flat class="full-height" v-on:click="addToSelecteds(data)"></q-btn>
      </q-card-section>
    </transition>
      <q-card-section class="ag-courses-item_link col" style="text-decoration:none;">
      <div class="ag-courses-item_bg"></div>
      <div class="ag-courses-item_title">
        {{ data.noteTitle ?? 'No Info Title' }}
      </div>
      <div class="ag-courses-item_description text-capitalize">
      {{ data.noteDescription ?? 'No Description' }}
    </div>
      <div class="ag-courses-item_date-box">
        Created Date :
        <span class="ag-courses-item_date">
          {{data.date ?? 'No Date'}}
        </span>
      </div>
    </q-card-section>
    </q-card-section>
  </q-card>
</template>
<script>
import axios from 'axios'
import { useCounterStore } from 'src/stores/store';
export default {
  setup(){
    const store  = useCounterStore()
    return{
      store
    }
  },
  data:function(){
    return{
      myNotes:[],
    }
  },
  methods:{
    addToSelecteds(data){
      const check =  this.checkSelectedNotes(data)
      if(check){
        this.store.selectedNotes = this.store.selectedNotes.filter(
          object => object.noteId !== data.noteId
        )
      }else{
        this.store.selectedNotes.push(data)
      }
    },
    checkSelectedNotes(data){
      const result = this.store.selectedNotes.some(
        object => object.noteId === data.noteId
      )
      return result
    },
    moreOption(data){
      console.log(data)
      const result = this.store.selectedNotes.some(
        object => object.noteId === data.noteId
      )
      if(!result){
        this.store.selectedNotes.push(data)
      }else{
        this.store.selectedNotes  = this.store.selectedNotes.filter(
          object => String(object.noteId) !== String(data.noteId)
        )
      }
      console.log(this.store.selectedNotes)
    },
    selectNote(data){
      //console.log(data)

      const id = this.$route.params.id
      const noteId = data.noteId
      Object.assign(this.store.selectedNoteParams,{
        id,noteId
      })
      this.store.selectedNote = data //22.37'de eklendi
      console.log(this.store.selectedNoteParams)
      this.store.readNotesDialogActive =! this.store.readNotesDialogActive

    },
    getMyNotes(){
      this.$watch('store.myNotes',(newValue) => {
        if(newValue.length){
          this.myNotes = newValue
          console.log(this.myNotes)
        }
      })
    }
  },
  created(){
    this.getMyNotes()
  },
  watch:{

  }
}
</script>

<style scoped>
.ag-courses_item {
  -ms-flex-preferred-size: calc(33.33333% - 30px);
  flex-basis: calc(33.33333% - 30px);

  margin: 0 15px 30px;

  overflow: hidden;

  border-radius: 28px;
}
.ag-courses-item_link {
  display: block;
  padding: 30px 20px;
  background-color: #121212;

  overflow: hidden;

  position: relative;
}
.ag-courses-item_link:hover,
.ag-courses-item_link:hover .ag-courses-item_date .ag-courses-item_description{
  text-decoration: none;
  color: #FFF;
}
.ag-courses-item_link:hover .ag-courses-item_bg {
  -webkit-transform: scale(10);
  -ms-transform: scale(10);
  transform: scale(10);
}
.ag-courses-item_description{
  font-weight: bold;
  color: #b6b6b5;

  -webkit-transition: color .5s ease;
  -o-transition: color .5s ease;
  transition: color .5s ease
}

.ag-courses-item_title {
  min-height: 87px;
  margin: 0 0 25px;

  overflow: hidden;
  text-decoration-line: none;
  font-weight: bold;
  font-size: 30px;
  color: #FFF;

  z-index: 2;
  position: relative;
}
.ag-courses-item_date-box {
  font-size: 18px;
  color: #FFF;

  z-index: 2;
  position: relative;
}
.ag-courses-item_date {
  font-weight: bold;
  color: #f9b234;

  -webkit-transition: color .5s ease;
  -o-transition: color .5s ease;
  transition: color .5s ease
}
.ag-courses-item_bg {
  height: 128px;
  width: 128px;
  background-color: #f9b234;

  z-index: 1;
  position: absolute;
  top: -75px;
  right: -75px;

  border-radius: 50%;

  -webkit-transition: all .5s ease;
  -o-transition: all .5s ease;
  transition: all .5s ease;
}
.ag-courses_item:nth-child(2n) .ag-courses-item_bg {
  background-color: #3ecd5e;
}
.ag-courses_item:nth-child(3n) .ag-courses-item_bg {
  background-color: #e44002;
}
.ag-courses_item:nth-child(4n) .ag-courses-item_bg {
  background-color: #952aff;
}
.ag-courses_item:nth-child(5n) .ag-courses-item_bg {
  background-color: #cd3e94;
}
.ag-courses_item:nth-child(6n) .ag-courses-item_bg {
  background-color: #4c49ea;
}



@media only screen and (max-width: 979px) {
  .ag-courses_item {
    -ms-flex-preferred-size: calc(50% - 30px);
    flex-basis: calc(50% - 30px);
  }
  .ag-courses-item_title {
    font-size: 24px;
  }
}

@media only screen and (max-width: 767px) {
  .ag-format-container {
    width: 96%;
  }

}
@media only screen and (max-width: 639px) {
  .ag-courses_item {
    -ms-flex-preferred-size: 100%;
    flex-basis: 100%;
  }
  .ag-courses-item_title {
    min-height: 72px;
    line-height: 1;

    font-size: 24px;
  }
  .ag-courses-item_link {
    padding: 22px 40px;
  }
  .ag-courses-item_date-box {
    font-size: 16px;
  }
}
</style>
