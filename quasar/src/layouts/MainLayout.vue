<template>
  <q-scroll-area style="width: 100%; height: 100vh">
    <q-layout>
      <!-- HEADER -->
      <q-header class="bg-transparent">
        <q-toolbar class="container q-mx-auto q-py-lg text-light row q-px-md">
          <!-- LOGO -->
          <router-link to="/" class="text-light fn-link">
            <h1 class="fn-xl text-left q-my-none q-py-none cursor-pointer">
              Events<b>NEAR</b>us
            </h1>
          </router-link>
          <!-- SEARCH -->
          <q-form class="col q-mx-lg" @submit="search">
            <q-input
              dark
              dense
              outlined
              v-model="searchQuery"
              input-class="txt-right"
              class="q-ml-md"
              color="white"
              bg-color="grey-10"
              placeholder="Search available events"
            >
              <template v-slot:prepend>
                <q-icon name="search"></q-icon>
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="searchQuery !== ''"
                  name="clear"
                  class="cursor-pointer"
                  @click="searchQuery = ''"
                ></q-icon>
              </template>
            </q-input>
          </q-form>
          <!-- LINKS -->
          <div class="row q-gutter-md items-center">
            <router-link to="/events" class="text-light fn-link">
              Events
            </router-link>
            <router-link to="/about" class="text-light fn-link">
              About
            </router-link>
            <router-link to="/organize" class="text-secondary fn-link">
              Host
            </router-link>
            <!-- AUTH -->

            <q-btn
              v-if="!currentUser"
              @click="near?.signIn"
              class="text-light fn-link"
              no-caps
              flat
              outline
            >
              <b>Login</b>
            </q-btn>
            <div v-else>
              <q-btn
                class="q-my-none fn-md fn-link"
                no-caps
                :label="currentUser?.accountId"
                outline
              >
                <q-menu fit no-caps color="bg-grey-10" outline>
                  <q-list dark bordered separator class="bg-grey-10 text-right">
                    <!-- EVENTS -->
                    <q-item clickable v-close-popup class="column">
                      <q-item-section class="fn-sm">
                        <router-link to="/my-events" class="text-light fn-link">
                          My events
                        </router-link>
                      </q-item-section>
                    </q-item>
                    <!-- LOGOUT -->
                    <q-item
                      clickable
                      v-close-popup
                      class="column"
                      @click="currentUser.signOut"
                    >
                      <q-item-section class="fn-sm">Sign out</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </q-toolbar>
      </q-header>

      <!-- MAIN -->
      <q-page-container>
        <router-view />
      </q-page-container>

      <!-- FOOTER -->
      <q-footer class="bg-transparent">
        <q-toolbar class="container q-mx-auto q-py-lg text-light row q-px-md">
          <div class="column q-col-gutter-sm">
            <div class="row q-gutter-md">
              <!-- <div>Market</div> -->
              <!-- <div>Activity</div> -->
              <!-- <div>FAQ</div> -->
              <!-- <div>White Paper</div> -->
            </div>
            <div class="row q-gutter-md">
              <!-- <div>Twitter</div>
              <div>Instagram</div> -->
              <!-- <div>Discord</div> -->
            </div>
          </div>
          <q-space />
          <div class="column q-col-gutter-sm">
            <div class="row justify-end q-gutter-md">
              <!-- <div>This project is in public alpha</div> -->
            </div>
            <div class="row justify-end q-gutter-md">
              <div>Assembled in 2022 during <b>NEAR</b> MetaBUILD</div>
            </div>
          </div>
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-scroll-area>
</template>

<script lang="ts">
// import { useFirestoreCollection } from 'src/hooks/firebase';
import { useCurrentUser, useNearContract } from 'src/hooks/near';
// import { Event } from 'src/models';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const searchQuery = ref<string>();
    const router = useRouter();
    const search = async () => {
      searchQuery.value &&
        (await router.push(`/search?q=${searchQuery.value}`));
    };

    const { data: near } = useNearContract();
    const { data: currentUser } = useCurrentUser();

    // const { data: eventsList } = useFirestoreCollection<Event>('events');

    // eventsList.value.values()
    // const events = computed(() =>
    //   ([...(eventsList.value?.values() ?? [])] as Event[]).map(
    //     (x: Event) => x.title
    //   )
    // );

    return { searchQuery, search, near, currentUser };
  },
});
</script>
