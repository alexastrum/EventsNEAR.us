<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->

      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xxl fn-bold text-light">
          {{ event?.title }}
        </h2>

        <div class="q-mt-md">
          <q-card bordered dark flat class="bg-lightdark column">
            <q-img v-if="event?.image" :src="event?.image" />
            <q-skeleton v-else dark height="500px" square />
            <div class="q-pa-lg">
              <h3 class="q-my-md q-py-none fn-lg fn-bold text-light">About</h3>
              <div class="col fn-md text-light">
                {{ event?.description }}
              </div>
              <div class="text-grey-6 q-mt-lg text-right">
                Hosted by {{ event?.ownerUid }}
              </div>
            </div>
          </q-card>
        </div>
      </div>
      <!-- TICKETS -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light">Tickets for sale</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div class="col-4" v-for="i in [1, 2, 3]" :key="i">
              <event-card
                smaller
                :quantity="10 - i * i"
                :subtitle="`a13x.near • ${i * 10} NEAR`"
                :description="`Tier #${i} ticket`"
                :event="event"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- EVENT LIST -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light">Similar events</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div class="col-3" v-for="[id, event] in relatedEvents" :key="id">
              <event-card extend :id="id" :event="event" />
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
import { useFirestoreCollection, useFirestoreDoc } from 'src/hooks/firebase';
import { Event } from '../models';

export default defineComponent({
  components: { EventCard },
  props: { eventId: String },
  setup(props) {
    const { data: event } = useFirestoreDoc<Event>(
      'events',
      () => props.eventId
    );

    const { data: relatedEvents } = useFirestoreCollection<Event>(
      'events',
      () => ({
        limit: 4,
      })
    );

    return { event, relatedEvents };
  },
});
</script>
