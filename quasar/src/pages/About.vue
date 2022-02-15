<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <!-- WHAT IS -->
      <div>
        <h2 class="q-my-none fn-xl fn-bold text-light">
          What is EventsNEARus?
        </h2>
        <div class="text-white fn-md">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin congue
          vel mi eget posuere. Sed semper tortor eu risus dignissim suscipit.
          Suspendisse commodo gravida aliquam. Cras sodales dui ut risus
          sodales, non finibus felis volutpat. Nam vel ornare dui. Nulla sit
          amet odio vehicula, imperdiet quam in, aliquam erat. Quisque sem mi,
          semper et mi nec, efficitur ultricies sem. Vivamus ullamcorper lectus
          et orci ultrices sodales. Vestibulum in orci vitae elit ultrices
          tempor et at eros. Suspendisse consequat quam sit amet dui faucibus,
          vitae auctor felis dictum.
        </div>
      </div>
      <!-- HOW IT WORKS -->
      <div>
        <h2 class="q-my-none fn-xl fn-bold text-light">How it works</h2>
        <div class="row q-col-gutter-md">
          <div class="col-7">
            <q-skeleton dark height="350px" />
          </div>
          <div class="col-5 column">
            <div class="col">
              <h3 class="q-my-none fn-lg fn-bold text-light">Event Hosters</h3>
              <div class="text-white fn-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                congue vel mi eget posuere. Sed semper tortor eu risus dignissim
                suscipit. Suspendisse commodo gravida aliquam.
              </div>
            </div>
            <div class="col">
              <h3 class="q-my-none fn-lg fn-bold text-light">Event Goers</h3>
              <div class="text-white fn-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                congue vel mi eget posuere. Sed semper tortor eu risus dignissim
                suscipit. Suspendisse commodo gravida aliquam. Cras sodales dui
                ut risus sodales, non finibus felis volutpat. Nam vel ornare
                dui. Nulla sit amet odio vehicula, imperdiet quam in, aliquam
                erat.
              </div>
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
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchPage',
  props: { query: String },
  setup() {
    return;
  },
});
</script>
