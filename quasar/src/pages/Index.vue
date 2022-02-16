<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <featured-event-section
        class="section"
        :featuredEvent="featuredEvent"
        :latestEvents="latestEvents"
      />
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
import { computed, defineComponent, ref } from 'vue';
import firebase from 'firebase';
import 'firebase/firestore';
import { Event } from 'src/components/models';

export default defineComponent({
  components: { FeaturedEventSection, TopEventSection },
  name: 'IndexPage',
  setup() {
    const fs = firebase.firestore();
    const featuredEvent = ref<Event>();
    const latestEvents = computed(() =>
      latestEventsList.value?.map((snap) => snap.data())
    );

    const latestEventsList =
      ref<
        firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]
      >();

    fs.collection('events')
      .doc('nX01eXlmfb8Pj32LsD2g')
      .onSnapshot((snap) => {
        featuredEvent.value = snap.data() as Event;
        latestEventsList.value = [
          snap as firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
          snap as firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
          snap as firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
        ];
      });

    // fs.collection('events')
    //   .limit(3)
    //   .where('featured', '==', true)
    //   .onSnapshot((doc) => {
    //     latestEventsList.value = doc.docs;
    //   });

    return { featuredEvent, latestEvents };
  },
});
</script>
