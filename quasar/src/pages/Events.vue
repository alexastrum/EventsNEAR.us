<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-lg">
          Available events
        </h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div
              class="col-6 col-md-3"
              v-for="[id, event] in eventsList"
              :key="id"
            >
              <event-card :id="id" :event="event" extend />
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
import { useFirestoreCollection } from 'src/hooks/firebase';
import { Event } from '../models';

export default defineComponent({
  components: { EventCard },
  setup() {
    const { data: eventsList } = useFirestoreCollection<Event>('events');

    return { eventsList };
  },
});
</script>
