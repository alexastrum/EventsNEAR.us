<template>
  <q-page>
    <near-auth-prompt>
      <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
        <!-- MAIN -->
        <div class="fit q-pb-md">
          <h2 class="q-my-none fn-xl fn-bold text-light q-mb-sm">
            Host an event
          </h2>

          <!-- MAIN ORGANIZE -->
          <div class="row q-col-gutter-md">
            <div class="col-7">
              <q-card bordered dark flat class="bg-lightdark row full-height">
                <div class="row q-pa-lg q-pb-none full-width">
                  <div class="q-mb-md fn-bold fn-lg">Banner Image</div>
                  <q-img v-if="form.image" :src="form.image" />
                  <div class="row full-width items-end">
                    <media-input class="col-12" v-model="form.image" />
                  </div>
                </div>
              </q-card>
            </div>
            <div class="col-5 column">
              <!-- DETAILS -->
              <q-card bordered dark flat class="bg-lightdark row col">
                <div class="q-pa-lg fit fn-lg">
                  <div class="q-mb-md fn-bold">Event Details</div>
                  <div class="row">
                    <text-input label="Name" class="col" v-model="form.title" />
                  </div>
                  <div class="row">
                    <text-input
                      label="Description"
                      class="col"
                      type="textarea"
                      autogrow
                      v-model="form.description"
                    />
                  </div>
                  <!--  -->
                  <div class="row">
                    <text-select-input
                      v-model="form.tag"
                      label="Tags"
                      class="col-12"
                      :options="tagOptions"
                      @update:model-value="tagAdd(form.tag)"
                    />
                  </div>
                  <div class="row q-mt-md">
                    <q-chip
                      removable
                      @remove="form.tags.splice(key, 1)"
                      v-for="(tag, key) in form.tags"
                      :key="key"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
          <!-- DISTRIBUTION -->
          <q-card bordered dark flat class="bg-lightdark row q-mt-md">
            <div class="q-pa-lg fit">
              <div class="q-ma-sm fn-lg fn-bold">
                Initial Ticket Distribution
              </div>
              <div class="column q-gutter-sm">
                <!-- FOR -->
                <div v-for="(dist, ind) in distribution" :key="ind">
                  <div class="row q-col-gutter-md q-px-sm">
                    <number-input
                      label="Quantity"
                      class="col"
                      v-model="distribution[ind].count"
                    />
                    <text-input
                      label="Description"
                      type="textarea"
                      autogrow
                      outline
                      class="col-6"
                      v-model="distribution[ind].description"
                    />
                    <text-select-input
                      label="Recipient wallet"
                      outline
                      class="col-3"
                      v-model="distribution[ind].walletAddress"
                      :options="allUsers"
                    />
                    <number-input
                      label="Price"
                      class="col"
                      v-model="distribution[ind].amount"
                    />

                    <!-- BTN -->
                    <div class="q-mt-md">
                      <q-btn
                        :disabled="distribution.length == 1"
                        @click="distributionDelete(ind)"
                        flat
                        dense
                        icon="close"
                      />
                    </div>
                  </div>
                </div>
                <!-- ADD MORE -->
                <div class="q-ml-md text-right">
                  <div>
                    <q-btn
                      @click="distributionAdd"
                      flat
                      class="col q-py-sm"
                      label="Add recipient"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card>
          <q-btn
            flat
            class="q-mt-md bg-primary text-grey-4 col q-py-sm"
            label="Create event &amp; mint tickets"
            @click="createEventAndMint"
          />
        </div>
      </div>
    </near-auth-prompt>
  </q-page>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import NearAuthPrompt from 'src/components/NearAuthPrompt.vue';
import MediaInput from 'src/forms/form/MediaInput.vue';
import NumberInput from 'src/forms/form/NumberInput.vue';
import TextInput from 'src/forms/form/TextInput.vue';
import { computed, defineComponent, ref } from 'vue';
import TextSelectInput from 'src/forms/form/TextSelectInput.vue';
import { useFirebaseDB } from 'src/hooks/firebase';
import { useCurrentUser } from 'src/hooks/near';

import firebase from 'firebase';
import 'firebase/firestore';

interface DistributionData {
  count: number;
  description: string;
  walletAddress: string;
  amount: number;
}

export default defineComponent({
  components: {
    MediaInput,
    TextInput,
    NearAuthPrompt,
    NumberInput,
    TextSelectInput,
  },
  setup() {
    const form = ref({
      title: '',
      description: '',
      image: undefined,
      tags: [] as string[],
      tag: '',
    });
    const emptyDist = {
      count: 1,
      description: '',
      walletAddress: '',
      amount: 0,
    };

    const { data: currentUser } = useCurrentUser();
    const distribution = ref<DistributionData[]>([
      { ...emptyDist, walletAddress: currentUser.value?.accountId || '' },
    ]);

    const distributionDelete = (i: number) => {
      distribution.value.splice(i, 1);
    };
    const distributionAdd = () => {
      distribution.value.push({
        ...emptyDist,
        walletAddress: currentUser.value?.accountId || '',
      });
    };

    //  TAGS
    const tagAdd = (v: string) => {
      form.value.tags.push(v);
    };
    const tagOptions = computed(() =>
      useFirebaseDB<string>(() => 'tags').data.value?.split(',')
    );

    // QUICK COMPLETE
    const fs = firebase.firestore();
    const allUsers = ref<string[]>();
    fs.collection('users').onSnapshot((snap) => {
      allUsers.value = snap.docs.map((d) => d.id);
    });

    // saving
    // const { data: contract } = useNearContract();
    const createEventAndMint = async () => {
      const event = await fs.collection('events').add({
        title: form.value.title,
        description: form.value.description,
        tags: form.value.tags,
        image: form.value.image,
      });

      // contract.value.contract.createEvent({ eventId: event.id });
      console.log(event.id);
    };

    return {
      form,
      distribution,
      distributionDelete,
      distributionAdd,
      allUsers,
      tagAdd,
      tagOptions,
      createEventAndMint,
    };
  },
});
</script>
