<template>
  <router-link to="/event" class="fn-link cursor-pointer">
    <q-card v-if="small" bordered dark flat class="fit bg-lightdark">
      <div class="fit row q-pa-lg items-center">
        <div class="row q-col-gutter-sm">
          <q-skeleton dark size="100px" square />
          <div class="col column q-py-none">
            <div class="q-my-none q-py-none fn-lg col">
              {{ name || 'Event' }}
            </div>
            <div class="fn-md col">Lorem Ipsum</div>
            <div class="text-grey-6">{{ subtitle || 'Community' }}</div>
          </div>
        </div>
      </div>
    </q-card>
    <q-card
      v-else
      bordered
      dark
      flat
      class="bg-lightdark row"
      :class="extend ? 'full-height' : ''"
    >
      <div class="column q-pa-lg" :class="extend ? 'col' : 'fit'">
        <q-skeleton dark :height="extend ? '300px' : '200px'" square />
        <h3 class="q-my-none q-py-none q-mt-md fn-xl">Event</h3>
        <div class="col fn-md text-light">Lorem Ipsum Dolor</div>
        <div class="text-grey-6 q-mt-lg">Community</div>
      </div>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',
  props: { extend: Boolean, small: Boolean, name: String, subtitle: String },
  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
