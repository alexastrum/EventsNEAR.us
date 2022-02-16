<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- MAIN -->
      <div class="fit q-pb-md">
        <h2 class="q-my-none fn-xxl fn-bold text-light">Event</h2>

        <div class="q-mt-md">
          <q-card bordered dark flat class="bg-lightdark column">
            <q-skeleton dark height="500px" square />
            <div class="q-pa-lg">
              <h3 class="q-my-none q-py-none fn-lg fn-bold text-light">
                About
              </h3>
              <div class="col fn-md text-light">Lorem Ipsum Dolor</div>
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
              <event-card small :event="{ title: 'Ticket' }" subtitle="10N" />
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
import { defineComponent } from 'vue';

export default defineComponent({
  components: { EventCard },
  name: 'SearchPage',
  props: { query: String },
  setup() {
    return;
  },
});
</script>
