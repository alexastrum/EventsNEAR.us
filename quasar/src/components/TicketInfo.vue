<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card bordered dark flat class="dialog bg-lightdark">
      <q-card-section>
        <q-item class="col row">
          <div class="col column">
            <div class="text-grey-6 fn-md text-uppercase">Owned Tickets</div>
            <h2 class="q-my-none fn-bold fn-xxl">{{ event?.title }}</h2>
          </div>
          <div><q-btn flat round icon="close" @click="onDialogCancel" /></div>
        </q-item>
        <q-separator dark />
      </q-card-section>
      <!-- TICKET MANAGEMENT -->
      <q-card-section>
        <!-- TICKET LIST -->

        <!-- TICKET -->

        <div class="row q-col-gutter-md">
          <div>
            <qrcode :size="300" :margin="1" :value="qrCode" />
          </div>

          <div class="col column q-col-gutter-md">
            <!-- SEND TICKETS -->
            <div class="column q-col-gutter-sm">
              <div>
                <h3 class="q-my-none q-py-none fn-lg fn-bold">
                  Send tickets to a friend
                </h3>
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-3">
                  <number-input
                    label="Quantity"
                    class="q-my-none q-py-none"
                    dense
                  />
                </div>
                <div class="col">
                  <text-input
                    label="Address"
                    class="q-my-none q-py-none"
                    dense
                  />
                </div>

                <!-- LIST -->
                <div>
                  <q-btn flat class="bg-primary fit">Send</q-btn>
                </div>
              </div>
            </div>
            <!-- SELL TICKETS -->
            <div class="column q-col-gutter-sm q-my-sm">
              <div>
                <h3 class="q-my-none q-py-none fn-lg fn-bold">Sell tickets</h3>
              </div>
              <!-- LISTING -->
              <div>
                <div class="q-my-none q-py-none">
                  <h4
                    class="q-my-none q-py-none fn-sm text-uppercase text-grey-6"
                  >
                    List tickets for sale
                  </h4>
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-3">
                    <number-input
                      label="Quantity"
                      class="q-my-none q-py-none"
                      dense
                    />
                  </div>
                  <div class="col">
                    <number-input
                      currency
                      label="Price"
                      class="q-my-none q-py-none"
                      dense
                    />
                  </div>
                  <div>
                    <q-btn flat class="bg-primary fit"
                      >List on the market</q-btn
                    >
                  </div>
                </div>
              </div>
              <!-- UNLIST -->
              <div class="q-mt-sm">
                <q-btn flat class="fit">Unlist all</q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <!-- INFO -->
      <q-card-section>
        <div class="col text-grey-6 items-end row fn-sm">
          <div>
            <p>Show this QR code to the host to gain access.</p>
            <div>
              This QR code changes every minute, don't worry if someone saw it.
            </div>
          </div>
        </div>
        <q-separator dark class="q-mt-md" />
      </q-card-section>
      <!-- DETAILS -->
      <q-card-section>
        <div class="q-mb-md">
          <h3 class="q-my-none q-py-none fn-lg fn-bold">Your extra tickets</h3>
        </div>
        <q-list dark bordered separator>
          <q-item dark>
            <q-item-section class="text-grey-6 fn-sm text-uppercase"
              >Safely stored in your wallet</q-item-section
            >
            <q-item-section class="text-right">0</q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section class="text-grey-6 fn-sm text-uppercase"
              >Listed for sale</q-item-section
            >
            <q-item-section class="text-right">20</q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section class="text-grey-6 fn-sm text-uppercase"
              >Used</q-item-section
            >
            <q-item-section class="text-right">0</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.dialog {
  // max-height: 800px;
  width: 100%;
  max-width: 800px;
}
</style>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { Event } from 'src/models';
import { defineComponent, PropType, ref } from 'vue';
import Qrcode from 'qrcode.vue';
import TextInput from 'src/forms/form/TextInput.vue';
import NumberInput from 'src/forms/form/NumberInput.vue';
import { useCurrentUser } from 'src/hooks/near';
export default defineComponent({
  props: {
    id: String,
    event: Object as PropType<Event>,
  },
  components: { Qrcode, TextInput, NumberInput },
  setup(props) {
    const { dialogRef, onDialogHide, onDialogCancel } =
      useDialogPluginComponent();
    const { data: near } = useCurrentUser();
    const qrCode = ref('');

    async function tick() {
      const signature =
        (await near.value?.signMessage(JSON.stringify(Date.now())))?.substring(
          -10
        ) || '';
      const hash = (JSON.parse(signature) as string[])[4];
      qrCode.value = props.id
        ? 'https://eventsnear.us/scan/' + props.id + '/' + hash.substring(0, 10)
        : '';
    }
    setInterval(() => void tick(), 5 * 1000);
    void tick();
    return { onDialogHide, dialogRef, onDialogCancel, qrCode };
  },
});
</script>
