<template>
  <div class="q-pb-md">
    <!-- CONTENT -->
    <div class="row q-col-gutter-md">
      <!-- FEATURED EVENTS -->
      <div class="col-12 col-md-7 column">
        <h2 class="q-my-none row fn-xl fn-bold text-light">Featured Event</h2>
        <event-card
          v-for="[id, event] in featuredEvents"
          :key="id"
          extend
          large
          :id="id"
          :event="event"
        />
      </div>

      <!-- LATEST EVENTS -->
      <div class="col-12 col-md-5">
        <h2 class="q-my-none fn-xl fn-bold text-light">Latest Events</h2>
        <div class="justify-between column q-col-gutter-md">
          <div v-for="[id, event] in latestEvents" :key="id" class="col">
            <event-card
              small
              :id="id"
              :event="event"
              subtitle="Happening today"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventCard from './EventCard.vue';
import { Event } from 'src/models';
import { useFirestoreCollection } from 'src/hooks/firebase';

export default defineComponent({
  components: { EventCard },

  setup() {
    const { data: latestEvents } = useFirestoreCollection<Event>(
      'events',
      () => ({
        // orderBy: ['created', 'desc'],
        limit: 3,
      })
    );

    const { data: featuredEvents } = useFirestoreCollection<Event>(
      'events',
      () => ({
        whereEquals: { featured: true },
        limit: 1,
      })
    );

    return { latestEvents, featuredEvents };
  },
});
</script>
