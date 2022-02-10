<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-lg">
          Organize an Event
        </h2>
        <div class="fit">
          <div class="text-grey fn-md">Organize an event</div>
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
