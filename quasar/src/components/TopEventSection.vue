<template>
  <div class="row q-col-gutter-x-md">
    <div class="fit">
      <h2 class="q-my-none fn-xl fn-bold text-light col-12">Top members</h2>
      <q-card bordered dark flat class="full-width bg-lightdark q-pa-lg">
        <div class="row q-col-gutter-md">
          <div
            class="column col-3 q-col-gutter-md"
            v-for="(col, index) in users"
            :key="index"
          >
            <div v-for="([id, user], index2) in col" :key="id">
              <div class="row">
                <div class="row q-mr-md items-center text-grey-6">
                  {{ index * 3 + index2 + 1 }}
                </div>
                <div class="row">
                  <q-skeleton bordered size="60px" dark type="circle" />
                  <div class="column q-px-sm">
                    <div class="fn-sm">{{ id }}</div>
                    <div class="text-grey-6 fn-sm">
                      Hosted: {{ user.hostedEventsCount || 0 }}<br />
                      Attended: {{ user.attendedEventsCount || 0 }}<br />
                    </div>
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
import { useFirestoreCollection } from 'src/hooks/firebase';
import { computed, defineComponent } from 'vue';
import { User } from '../models';

function listToMatrix<T>(list: T[], elementsPerSubArray: number) {
  var matrix: T[][] = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const { data: users } = useFirestoreCollection<User>('users', () => ({
      limit: 12,
      // orderBy: ['ticketCount', 'desc'],
    }));
    return {
      users: computed(() =>
        users.value ? listToMatrix([...users.value.entries()], 3) : []
      ),
    };
  },
});
</script>
