<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MY EVENTS -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-md">My Tickets</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg">
            <div class="col-4" v-for="[id, event] in myTickets" :key="id">
              <event-card
                showTickets
                :id="id"
                :event="event"
                smaller
                extend
                subtitle="Quantity: 1"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- HOSTED -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-md">
          Hosted Events
        </h2>
        <div class="fit">
          <div class="row q-col-gutter-lg">
            <div
              class="col-6 col-md-3"
              v-for="[id, event] in hostedEvents"
              :key="id"
            >
              <event-card :id="id" :event="event" subtitle=" " extend />
            </div>
          </div>
        </div>
      </div>
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-md">
          Attended Events
        </h2>
        <div class="fit">
          <div class="row q-col-gutter-lg">
            <div
              class="col-6 col-md-3"
              v-for="[id, event] in attendedEvents"
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
import { useCurrentUser } from 'src/hooks/near';

export default defineComponent({
  components: { EventCard },
  setup() {
    const { data: user } = useCurrentUser();
    const { data: myTickets } = useFirestoreCollection<Event>('events', () => ({
      // orderBy: ['created', 'desc'],
      limit: 5,
    }));

    const { data: hostedEvents } = useFirestoreCollection<Event>(
      'events',
      () => ({
        // orderBy: ['created', 'desc'],
        whereEquals: { ownerUid: user.value?.accountId || '' },
        limit: 4,
      })
    );

    const { data: attendedEvents } = useFirestoreCollection<Event>(
      'events',
      () => ({
        orderBy: ['title', 'asc'],
        limit: 4,
      })
    );

    return { myTickets, hostedEvents, attendedEvents };
  },
});
</script>
