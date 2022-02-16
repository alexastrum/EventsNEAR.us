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
              <q-card bordered dark flat class="bg-lightdark row">
                <div class="q-pa-lg fit">
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
    </near-auth-prompt>
  </q-page>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import NearAuthPrompt from 'src/components/NearAuthPrompt.vue';
import MediaInput from 'src/forms/form/MediaInput.vue';
import TextInput from 'src/forms/form/TextInput.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: { MediaInput, TextInput, NearAuthPrompt },
  name: 'SearchPage',
  props: { query: String },
  setup() {
    const form = ref({
      title: '',
      image: undefined,
    });
    return { form };
  },
});
</script>
