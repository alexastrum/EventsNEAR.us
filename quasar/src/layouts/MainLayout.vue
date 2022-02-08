<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-dark">
      <q-toolbar
        class="container q-mx-auto q-py-lg text-light row q-col-gutter-sm"
      >
        <!-- LOGO -->
        <div class="fn-lg">Events<b>NEAR</b>us</div>
        <!-- SEARCH -->
        <div class="col">
          <q-input
            dark
            dense
            outlined
            v-model="searchQuery"
            input-class="txt-right"
            class="q-ml-md"
            color="white"
            bg-color="grey-10"
          >
            <template v-slot:append>
              <q-icon v-if="searchQuery === ''" name="search"></q-icon>
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchQuery = ''"
              ></q-icon>
            </template>
          </q-input>
        </div>
        <!-- LINKS -->
        <div class="row q-gutter-md q-ml-xs">
          <div>Events</div>
          <div>Organize</div>
          <div>Login</div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
