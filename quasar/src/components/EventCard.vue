<template>
  <router-link to="/event" class="fn-link cursor-pointer">
    <q-card v-if="small" bordered dark flat class="fit bg-lightdark">
      <div class="fit">
        <div class="row q-pa-md items-center">
          <div class="row q-col-gutter-md">
            <div height="100px">
              <q-img
                v-if="event?.image"
                :ratio="1"
                :src="event?.image"
                height="100px"
                width="100px"
              />
              <q-skeleton v-else dark size="100px" square />
            </div>
            <div class="col column">
              <div class="q-my-none q-py-none fn-lg fn-bold q-mb-md">
                {{ event?.title || 'Event' }}
              </div>
              <div class="fn-sm col">
                {{ event?.description || 'Lorem Ipsum' }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-grey-6 text-right fn-sm q-px-md">
          {{ subtitle || 'Community' }}
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
            v-if="event?.image"
            :height="extend ? '300px' : '200px'"
            :src="event?.image"
          />
          <q-skeleton v-else dark square :height="extend ? '300px' : '200px'" />
        </div>
        <h3 class="q-my-none q-py-none q-mt-md fn-xl">
          {{ event?.title || 'Event' }}
        </h3>
        <div class="col fn-md text-light">
          {{ event?.description || 'Lorem Ipsum Dolor' }}
        </div>
        <div class="text-grey-6 q-mt-lg">Community</div>
      </div>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { Event } from './models';

export default defineComponent({
  name: 'MainLayout',
  props: {
    extend: Boolean,
    small: Boolean,
    name: String,
    subtitle: String,
    event: Object as PropType<Event>,
  },
  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
