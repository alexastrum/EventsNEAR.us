<template>
  <q-layout>
    <q-header class="bg-dark">
      <q-toolbar class="container q-mx-auto q-py-lg text-light row q-px-md">
        <!-- LOGO -->
        <h1 class="fn-xl text-left q-my-none cursor-pointer" to="/">
          Events<b>NEAR</b>us
        </h1>
        <!-- SEARCH -->
        <div class="col q-mx-lg">
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

    <!-- FOOTER -->
    <q-footer class="bg-dark">
      <q-toolbar class="container q-mx-auto q-py-lg text-light row q-px-md">
        <div class="column q-col-gutter-sm">
          <div class="row q-gutter-md">
            <div>Market</div>
            <div>Activity</div>
            <div>FAQ</div>
            <div>White Paper</div>
          </div>
          <div class="row q-gutter-md">
            <div>Twitter</div>
            <div>Instagram</div>
            <div>Discord</div>
          </div>
        </div>
        <q-space />
        <div class="column q-col-gutter-sm">
          <div class="row justify-end q-gutter-md">
            <div>This project is in public beta</div>
          </div>
          <div class="row justify-end q-gutter-md">
            <div>2021 Events<b>NEAR</b>us | Powered by NEAR</div>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
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
