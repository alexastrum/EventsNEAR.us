<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-lg">
          Featured Events
        </h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div class="col-3" v-for="i in [1, 2, 3, 4, 5]" :key="i">
              <q-card bordered dark flat class="bg-lightdark row">
                <div class="column q-pa-lg fit">
                  <q-skeleton dark height="200px" square />
                  <h3 class="q-my-none q-py-none q-mt-md fn-xl">Event</h3>
                  <div class="col fn-md text-light">Lorem Ipsum Dolor</div>
                  <div class="text-grey-6 q-mt-lg">Community</div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// .section {
//   height: 200px;
// }
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchPage',
  props: { query: String },
  setup() {
    return;
  },
});
</script>
