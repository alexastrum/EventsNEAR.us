<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <featured-event-section class="section" />
      <newest-event-section />
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// .section {
//   height: 200px;
// }
</style>

<script lang="ts">
import FeaturedEventSection from 'src/components/FeaturedEventSection.vue';
import NewestEventSection from 'src/components/NewestEventSection.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { FeaturedEventSection, NewestEventSection },
  name: 'PageIndex',
  setup() {
    return;
  },
});
</script>
