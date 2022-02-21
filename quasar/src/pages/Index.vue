<template>
  <q-page>
    <div class="container q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <featured-event-section />
      <top-event-section />
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
import TopEventSection from 'src/components/TopEventSection.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { FeaturedEventSection, TopEventSection },
  name: 'IndexPage',
  setup() {
    // empty
  },
});
</script>
