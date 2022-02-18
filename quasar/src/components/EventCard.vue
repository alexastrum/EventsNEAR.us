<template>
  <router-link
    :to="event?.id ? `/event/${event?.id}` : '/'"
    class="fn-link cursor-pointer"
  >
    <q-card v-if="small || smaller" bordered dark flat class="fit bg-lightdark">
      <div class="fit">
        <div class="row q-pa-md items-center">
          <!-- CONTENT -->
          <div v-if="event?.data" class="col row q-col-gutter-y-md">
            <div :height="smaller ? '90px' : '120px'">
              <q-img
                v-if="event?.data?.image"
                :ratio="1"
                :src="event?.data.image"
                :height="smaller ? '90px' : '120px'"
                :width="smaller ? '90px' : '120px'"
              />
            </div>
            <div class="col q-ml-md column">
              <h3
                class="q-my-none q-py-none fn-bold"
                :class="smaller ? 'fn-md' : 'fn-lg q-mb-sm'"
              >
                {{ event?.data?.title || 'Event' }}
              </h3>
              <div :class="smaller ? 'fn-sm' : 'fn-md'">
                {{ event?.data?.description || 'Lorem Ipsum' }}
              </div>

              <div
                class="row col items-end justify-end text-grey-6"
                v-if="subtitle"
              >
                {{ subtitle }}
              </div>
            </div>
          </div>
          <!-- SKELETON -->
          <div v-else class="col row q-col-gutter-y-md">
            <div height="120px">
              <q-skeleton dark size="120px" square />
            </div>
            <div class="col q-ml-md column">
              <q-skeleton class="q-my-none q-mb-md" dark height="30px" />
              <q-skeleton class="col q-my-none" dark />
            </div>
          </div>
        </div>
      </div>
    </q-card>
    <!-- LARGE CARD -->
    <q-card
      v-else
      bordered
      dark
      flat
      class="bg-lightdark row"
      :class="extend ? 'full-height' : ''"
    >
      <!-- CONTENT -->
      <div
        class="column q-pa-lg"
        :class="extend ? 'col' : 'fit'"
        v-if="event?.data"
      >
        <div>
          <q-img
            v-if="event?.data?.image"
            :height="large ? '300px' : '200px'"
            :src="event?.data.image"
          />
          <q-skeleton v-else dark square :height="extend ? '300px' : '200px'" />
        </div>
        <h3 class="q-mt-md q-mb-sm q-py-none fn-lg fn-bold">
          {{ event?.data?.title || 'Event' }}
        </h3>
        <div class="col fn-md text-light">
          {{ event?.data?.description || 'Lorem Ipsum Dolor' }}
        </div>
        <div class="text-grey-6 q-mt-lg">Community</div>
      </div>
      <!-- SKELETON -->
      <div v-else class="column q-pa-lg" :class="extend ? 'col' : 'fit'">
        <q-skeleton dark square :height="extend ? '300px' : '200px'" />

        <q-skeleton class="q-mt-md q-mb-md" dark height="30px" />
        <q-skeleton class="col q-my-none" dark />
      </div>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { Event, FirestoreDocument } from './models';

export default defineComponent({
  name: 'EventCard',
  props: {
    extend: Boolean,
    small: Boolean,
    smaller: Boolean,
    large: Boolean,
    name: String,
    subtitle: String,
    event: Object as PropType<FirestoreDocument<Event>>,
  },
  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
