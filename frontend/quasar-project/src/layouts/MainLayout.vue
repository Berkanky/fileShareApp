<template>
  <q-layout view="lHr LpR fFf">

    <q-header elevated class="bg-grey-1 text-dark"
      v-if="this.$route.name === 'onlypage'
        ">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <q-icon name="auto_stories"></q-icon>
          </q-avatar>
          MyPhotoss
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

<!--     <q-drawer show-if-above v-model="leftDrawerOpen" side="left" elevated v-if="leftDrawerOpen">

    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" elevated v-if="rightDrawerOpen">

    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },

      rightDrawerOpen,
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  }
}
</script>
