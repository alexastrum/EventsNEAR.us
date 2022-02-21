<template>
  <router-link
    :to="id && !showTickets ? `/event/${id}` : ''"
    @click="
      () => {
        showTickets && openTicketPrompt();
      }
    "
    class="fn-link cursor-pointer"
    :class="extend ? 'col' : ''"
  >
    <q-card
      v-if="small || smaller"
      bordered
      dark
      flat
      class="fit bg-lightdark col"
    >
      <div class="fit">
        <div class="row q-pa-md items-center">
          <!-- CONTENT -->
          <div v-if="event" class="col row q-col-gutter-y-md">
            <div
              v-if="quantity && quantity > 1"
              class="q-mr-sm items-center row"
            >
              {{ quantity }} x
            </div>
            <div :height="smaller ? '90px' : '120px'">
              <q-img
                v-if="event?.image"
                :ratio="1"
                :src="event.image"
                :height="smaller ? '90px' : '120px'"
                :width="smaller ? '90px' : '120px'"
              />
            </div>
            <q-item class="col column">
              <h3
                class="q-my-none q-py-none fn-bold"
                :class="smaller ? 'fn-md' : 'fn-lg q-mb-sm'"
              >
                {{ event?.title || 'Untitled event' }}
              </h3>
              <q-item-section :class="smaller ? 'fn-sm q-mb-sm' : 'fn-md'">
                <q-item-label :lines="2">
                  {{ description || event?.description || 'No description' }}
                </q-item-label>
              </q-item-section>

              <div class="col row items-end">
                <div
                  class="row col justify-between text-grey-6"
                  :class="smaller ? 'fn-sm' : 'fn-md'"
                >
                  <div class="text-grey-6">
                    <template v-if="subtitle">
                      {{ subtitle }}
                    </template>
                    <template v-else> Hosted by {{ event.ownerUid }} </template>
                  </div>
                  <div class="text-grey-6">
                    <template v-if="subtitle2">
                      {{ subtitle2 }}
                    </template>
                    <template v-else>{{ event.date }} </template>
                  </div>
                </div>
              </div>
            </q-item>
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
      <div class="column q-pa-lg" :class="extend ? 'col' : 'fit'" v-if="event">
        <div>
          <q-img
            v-if="event?.image"
            :height="large ? '300px' : '200px'"
            :src="event.image"
          />
          <q-skeleton v-else dark square :height="extend ? '300px' : '200px'" />
        </div>
        <h3 class="q-mt-md q-mb-sm q-py-none fn-lg fn-bold">
          {{ event?.title || 'Untitled event' }}
        </h3>
        <q-item-section class="col fn-md text-light">
          <q-item-label :lines="2">
            {{ description || event?.description || 'No description' }}
          </q-item-label>
        </q-item-section>

        <div class="row justify-between">
          <div class="text-grey-6 q-mt-lg">
            <template v-if="subtitle">
              {{ subtitle }}
            </template>
            <template v-else> Hosted by {{ event.ownerUid }} </template>
          </div>
          <div class="text-grey-6 q-mt-lg">
            <template v-if="subtitle2">
              {{ subtitle2 }}
            </template>
            <template v-else>{{ event.date }} </template>
          </div>
        </div>
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
import { useQuasar } from 'quasar';
import { useFirestoreDoc } from 'src/hooks/firebase';
import { defineComponent, PropType } from 'vue';
import { Event } from '../models';
import TicketInfo from './TicketInfo.vue';

export default defineComponent({
  name: 'EventCard',
  props: {
    id: String,
    quantity: Number,
    extend: Boolean,
    small: Boolean,
    smaller: Boolean,
    large: Boolean,
    subtitle: String,
    subtitle2: String,
    description: String,
    event: Object as PropType<Event>,
    showTickets: Boolean,
  },
  setup(props) {
    const { data: ownerUser } = useFirestoreDoc(
      'users',
      () => props.event?.ownerUid
    );

    const $q = useQuasar();
    const openTicketPrompt = () => {
      $q.dialog({
        component: TicketInfo,
        componentProps: { id: props.id, event: props.event },
      });
    };
    return { ownerUser, openTicketPrompt };
  },
});
</script>
