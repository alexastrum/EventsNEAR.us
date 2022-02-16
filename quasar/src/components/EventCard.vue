<template>
  <router-link
    :to="event?.id ? `/event/${event?.id}` : '/'"
    class="fn-link cursor-pointer"
  >
    <q-card v-if="small" bordered dark flat class="fit bg-lightdark">
      <div class="fit">
        <div class="row q-pa-md items-center">
          <div class="row q-col-gutter-md">
            <div height="100px">
              <q-img
                v-if="event?.data?.image"
                :ratio="1"
                :src="event?.data.image"
                height="100px"
                width="100px"
              />
              <q-skeleton v-else dark size="100px" square />
            </div>
            <div class="col column">
              <div class="q-my-none q-py-none fn-lg fn-bold q-mb-md">
                {{ event?.data?.title || 'Event' }}
              </div>
              <div class="fn-md col">
                {{ event?.data?.description || 'Lorem Ipsum' }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-grey-6 text-right fn-md q-px-md q-mb-md">
          {{ subtitle }}
        </div>
      </div>
    </q-card>
    <q-card
      v-else
      bordered
      dark
      flat
      class="bg-lightdark row"
      :class="extend ? 'full-height' : ''"
    >
      <div class="column q-pa-lg" :class="extend ? 'col' : 'fit'">
        <div>
          <q-img
            v-if="event?.data?.image"
            :height="large ? '300px' : '200px'"
            :src="event?.data.image"
          />
          <q-skeleton v-else dark square :height="extend ? '300px' : '200px'" />
        </div>
        <h3 class="q-my-lg q-py-none fn-lg fn-bold">
          {{ event?.data?.title || 'Event' }}
        </h3>
        <div class="col fn-md text-light">
          {{ event?.data?.description || 'Lorem Ipsum Dolor' }}
        </div>
        <div class="text-grey-6 q-mt-lg">Community</div>
      </div>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { Event, FirestoreDocument } from './models';

export default defineComponent({
  name: 'MainLayout',
  props: {
    extend: Boolean,
    small: Boolean,
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
