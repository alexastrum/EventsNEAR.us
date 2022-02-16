<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->

      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xxl fn-bold text-light">
          {{ event?.data?.title }}
        </h2>

        <div class="q-mt-md">
          <q-card bordered dark flat class="bg-lightdark column">
            <q-img v-if="event?.data?.image" :src="event?.data.image" />
            <q-skeleton v-else dark height="500px" square />
            <div class="q-pa-lg">
              <h3 class="q-my-md q-py-none fn-lg fn-bold text-light">About</h3>
              <div class="col fn-md text-light">
                {{ event?.data.description }}
              </div>
              <div class="text-grey-6 q-mt-lg text-right">Organized by GCT</div>
            </div>
          </q-card>
        </div>
      </div>
      <!-- TICKETS -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light">Tickets</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div class="col-4" v-for="i in [1, 2, 3]" :key="i">
              <event-card
                small
                subtitle="10N"
                :event="{ data: { title: 'Ticket' } }"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- EVENT LIST -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light">Similar Events</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div class="col-3" v-for="i in [1, 2, 3, 4]" :key="i">
              <event-card />
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
import { defineComponent, ref } from 'vue';
import firebase from 'firebase';
import 'firebase/firestore';
import {
  Event,
  FirestoreDocument,
  wrapSnapToDocument,
} from 'src/components/models';

export default defineComponent({
  components: { EventCard },
  name: 'SearchPage',
  props: { eventId: String },
  setup(props) {
    const fs = firebase.firestore();
    const event = ref<FirestoreDocument<Event>>();
    fs.collection('events')
      .doc(props.eventId)
      .onSnapshot((snap) => {
        event.value = wrapSnapToDocument(snap);
      });

    return { event };
  },
});
</script>
