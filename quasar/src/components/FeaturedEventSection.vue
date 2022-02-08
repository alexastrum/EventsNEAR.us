<template>
  <div class="q-pb-lg">
    <div class="row q-col-gutter-x-md q-pb-md">
      <!-- FEATURED EVENTS -->
      <div class="col-7">
        <div class="fit q-pb-md">
          <h2 class="q-my-none fn-xl fn-bold text-light">Featured Events</h2>
          <q-card bordered dark flat class="full-height bg-lightdark row">
            <div class="col column q-pa-lg">
              <q-skeleton dark height="300px" class="full-width" square />
              <h3 class="q-my-none q-py-none q-mt-md fn-xl">Event</h3>
              <div class="col fn-md text-light">Lorem Ipsum Dolor</div>
              <div class="text-grey-6">Community</div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- LATEST EVENTS -->
      <div class="col-5">
        <div class="fit">
          <h2 class="q-my-none fn-xl fn-bold text-light">Latest Events</h2>

          <div class="justify-between column q-col-gutter-md full-height">
            <div v-for="i in [1, 2, 3]" :key="i" class="col">
              <q-card bordered dark flat class="fit bg-lightdark">
                <div class="fit row q-pa-lg items-center">
                  <div class="row q-col-gutter-sm">
                    <q-skeleton dark size="100px" square />
                    <div class="col column q-py-none">
                      <div class="q-my-none q-py-none fn-lg col">Event</div>
                      <div class="fn-md col">Lorem Ipsum</div>
                      <div class="text-grey-6">Community</div>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
