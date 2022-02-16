<template>
  <span v-if="currentUser">
    <slot />
  </span>
  <div v-else class="container q-mx-auto">
    <q-card bordered dark flat class="bg-lightdark">
      <div class="q-pa-lg q-pb-none full-width">
        <h3 class="q-my-none fn-lg fn-bold">
          Connect to a NEAR wallet to create events
        </h3>
        <div class="q-mt-md">
          <span class="q-mt-md fn-link cursor-pointer" @click="near?.signIn()">
            Click here to join the NEAR Network
          </span>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
import { useCurrentUser, useNearContract } from 'src/hooks/near';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'NearAuthPrompt',
  setup() {
    const searchQuery = ref<string>();
    const { data: currentUser } = useCurrentUser();
    const { data: near } = useNearContract();
    return { searchQuery, currentUser, near };
  },
});
</script>
