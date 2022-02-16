<template>
  <div class="q-pb-md">
    <!-- CONTENT -->
    <div class="row q-col-gutter-md">
      <!-- FEATURED EVENTS -->
      <div class="col-12 col-md-7 column">
        <h2 class="q-my-none row fn-xl fn-bold text-light">Featured Events</h2>
        <router-link to="/event" class="fn-link cursor-pointer col">
          <event-card extend large :event="featuredEvent" />
        </router-link>
      </div>

      <!-- LATEST EVENTS -->
      <div class="col-12 col-md-5">
        <h2 class="q-my-none fn-xl fn-bold text-light">Latest Events</h2>
        <div class="justify-between column q-col-gutter-md">
          <div v-for="i in [0, 1, 2]" :key="i" class="col">
            <event-card small :event="latestEvents?.[i]" subtitle="Community" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import EventCard from './EventCard.vue';
import { Event, FirestoreDocument } from 'src/components/models';

export default defineComponent({
  components: { EventCard },
  name: 'MainLayout',
  props: {
    featuredEvent: Object as PropType<FirestoreDocument<Event>>,
    latestEvents: Object as PropType<FirestoreDocument<Event>[]>,
  },

  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
