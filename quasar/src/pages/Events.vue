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
              <event-card />
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
import EventCard from 'src/components/EventCard.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { EventCard },
  name: 'SearchPage',
  props: { query: String },
  setup() {
    return;
  },
});
</script>
