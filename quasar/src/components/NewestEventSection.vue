<template>
  <div class="row q-col-gutter-x-md">
    <div class="fit">
      <h2 class="q-my-none fn-xl fn-bold text-light col-12">Top Events</h2>
      <q-card bordered dark flat class="full-width bg-lightdark q-pa-lg">
        <div class="row q-col-gutter-md">
          <div
            class="column col-3 q-col-gutter-md"
            v-for="col in [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
              [10, 11, 12],
            ]"
            :key="col"
          >
            <div v-for="i in col" :key="i">
              <div class="row">
                <div class="row q-mr-md items-center text-grey-6">{{ i }}</div>
                <div class="row">
                  <q-skeleton bordered size="60px" dark type="circle" />
                  <div class="column q-pa-sm">
                    <div>Event</div>
                    <div class="text-grey-6">10N</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.event {
  width: 200px;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const searchQuery = ref<string>();
    return { searchQuery };
  },
});
</script>
