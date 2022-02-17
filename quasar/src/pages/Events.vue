<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xl fn-bold text-light q-mb-lg">All Events</h2>
        <div class="fit">
          <div class="row q-col-gutter-lg justify-between">
            <div
              class="col-6 col-md-3"
              v-for="event in eventsList"
              :key="event.id"
            >
              <event-card :event="event" extend />
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
import { defineComponent, computed, ref } from 'vue';
import firebase from 'firebase';
import 'firebase/firestore';
import { wrapSnapToDocument } from 'src/components/models';

export default defineComponent({
  components: { EventCard },
  name: 'SearchPage',
  props: { query: String },
  setup() {
    const fs = firebase.firestore();
    const eventsList = computed(() =>
      eventsListRaw.value?.map((snap) => wrapSnapToDocument(snap))
    );

    const eventsListRaw =
      ref<
        firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]
      >();

    fs.collection('events').onSnapshot((doc) => {
      eventsListRaw.value = doc.docs;
    });

    return { eventsList };
  },
});
</script>
