<template>
  <div class="q-pb-lg">
    <div class="row q-col-gutter-x-md q-pb-md">
      <!-- FEATURED EVENTS -->
      <div class="col-7">
        <div class="fit q-pb-md">
          <h2 class="q-my-none fn-xl fn-bold text-light">Featured Events</h2>
          <router-link to="/event" class="fn-link cursor-pointer">
            <event-card extend />
          </router-link>
        </div>
      </div>

      <!-- LATEST EVENTS -->
      <div class="col-5">
        <div class="fit">
          <h2 class="q-my-none fn-xl fn-bold text-light">Latest Events</h2>

          <div class="justify-between column q-col-gutter-md full-height">
            <div v-for="i in [1, 2, 3]" :key="i" class="col">
              <event-card small />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import EventCard from './EventCard.vue';

export default defineComponent({
  components: { EventCard },
  name: 'MainLayout',

  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
