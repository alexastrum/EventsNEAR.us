<template>
  <q-page>
    <near-auth-prompt>
      <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
        <!-- MAIN -->
        <div class="fit q-pb-md">
          <h2 class="q-my-none fn-xl fn-bold text-light q-mb-lg">
            Organize an Event
          </h2>

          <!-- MAIN ORGANIZE -->
          <div class="row q-col-gutter-md">
            <div class="col-7">
              <q-card bordered dark flat class="bg-lightdark row full-height">
                <div class="row q-pa-lg q-pb-none full-width">
                  <div class="row full-width items-end">
                    <media-input class="col-12" v-model="form.image" />
                  </div>
                </div>
              </q-card>
            </div>
            <div class="col-5 column">
              <!-- DETAILS -->
              <q-card bordered dark flat class="bg-lightdark row">
                <div class="q-pa-lg fit">
                  <div class="q-mb-md fn-bold">Event Details</div>
                  <div class="row">
                    <text-input
                      label="Event name"
                      class="col"
                      v-model="form.title"
                    />
                  </div>
                  <div class="row">
                    <text-input
                      label="Event description"
                      class="col"
                      type="textarea"
                      v-model="form.title"
                    />
                  </div>
                  <div class="row">
                    <text-input
                      label="Event name"
                      class="col"
                      v-model="form.title"
                    />
                  </div>
                </div>
              </q-card>
              <!-- DISTRIBUTION -->
              <q-card bordered dark flat class="bg-lightdark row q-mt-md">
                <div class="q-pa-lg fit">
                  <div class="q-mb-lg fn-bold">Tickets Distribution</div>
                  <div class="column q-gutter-sm">
                    <!-- FOR -->
                    <div v-for="(dist, ind) in distribution" :key="ind">
                      <div class="row q-col-gutter-md q-px-sm">
                        <text-select-input
                          label="Wallet Address"
                          outline
                          class="col-7"
                          v-model="distribution[ind].walletAddress"
                          :options="allUsers"
                        />

                        <number-input
                          label="Amount"
                          class="col"
                          v-model="distribution[ind].amount"
                        />
                        <div>
                          <q-btn
                            :disabled="distribution.length == 1"
                            @click="distributionDelete(ind)"
                            flat
                            dark
                            class="bg-red"
                            dense
                            icon="close"
                          />
                        </div>
                      </div>
                    </div>
                    <!-- ADD MORE -->
                    <q-btn
                      @click="distributionAdd"
                      flat
                      dark
                      class="bg-secondary text-grey-4 col q-py-sm"
                      label="ADD recipient"
                    />
                  </div>
                </div>
              </q-card>
              <q-btn
                flat
                dark
                class="q-mt-md bg-primary text-grey-4 col q-py-sm"
                label="CREATE EVENT"
              />
            </div>
          </div>
        </div>
      </div>
      {{ allUsers }}
    </near-auth-prompt>
  </q-page>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import NearAuthPrompt from 'src/components/NearAuthPrompt.vue';
import MediaInput from 'src/forms/form/MediaInput.vue';
import NumberInput from 'src/forms/form/NumberInput.vue';
import TextInput from 'src/forms/form/TextInput.vue';
import { defineComponent, ref } from 'vue';
import firebase from 'firebase';
import 'firebase/firestore';
import TextSelectInput from 'src/forms/form/TextSelectInput.vue';

interface DistributionData {
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
  name: 'SearchPage',
  props: { query: String },
  setup() {
    const form = ref({
      title: '',
      image: undefined,
    });
    const emptyDist = {
      walletAddress: '',
      amount: 0,
    };
    const distribution = ref<DistributionData[]>([{ ...emptyDist }]);

    const distributionDelete = (i: number) => {
      distribution.value.splice(i, 1);
    };
    const distributionAdd = () => {
      distribution.value.push({
        ...emptyDist,
        amount: distribution.value.length,
      });
    };

    // QUICK COMPLETE
    const fs = firebase.firestore();
    const allUsers = ref<string[]>();
    fs.collection('users').onSnapshot((snap) => {
      allUsers.value = snap.docs.map((snap) => snap.id);
    });
    // const usersList =
    return {
      form,
      distribution,
      distributionDelete,
      distributionAdd,
      allUsers,
    };
  },
});
</script>
