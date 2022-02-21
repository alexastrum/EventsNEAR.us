<template>
  <q-item class="q-pt-none q-pa-none">
    <q-item-section v-if="modelValue" avatar>
      <image-renderer :content="modelValue" />
    </q-item-section>
    <q-item-section>
      <q-file
        dark
        v-model="uploadFile"
        type="file"
        :label="label"
        v-bind="$attrs"
      />
    </q-item-section>
    <q-item-section side>
      <q-spinner v-if="isLoading"></q-spinner>
      <boolean-renderer v-else :content="uploadStatus" />
    </q-item-section>
    <q-item-section side>
      <q-btn
        :disabled="!uploadFile"
        @click="upload"
        label="Upload"
        color="primary"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import firebase from 'firebase/app';
import 'firebase/storage';
import { defineComponent, ref, computed } from 'vue';
import BooleanRenderer from '../renderers/BooleanRenderer.vue';
import ImageRenderer from '../renderers/ImageRenderer.vue';
import { date } from 'quasar';

export default defineComponent({
  name: 'MediaInput',
  components: { BooleanRenderer, ImageRenderer },
  props: {
    label: String,
    modelValue: String,
    fieldPath: String,
    uploadPath: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const uploadFile = ref<File>();
    const isLoading = ref<boolean>(false);
    const uploadStatus = ref<boolean>();

    const path = computed(() =>
      (props.uploadPath || ':path/:date-:name')
        .replace(/:path\b/, props.fieldPath || '')
        .replace(/:date\b/, date.formatDate(Date.now(), 'YYYYMMDD-HHMMSS'))
        .replace(/:name\b/, uploadFile.value?.name || '')
    );

    async function upload() {
      if (!uploadFile.value) {
        return;
      }
      isLoading.value = true;
      uploadStatus.value = false;
      try {
        const storageRef = firebase.storage().ref(path.value);
        const res = await storageRef.put(uploadFile.value);
        const mediaUrl = (await res.ref.getDownloadURL()) as string;
        emit('update:modelValue', mediaUrl);
        uploadFile.value = undefined;
        uploadStatus.value = true;
      } finally {
        isLoading.value = false;
      }
    }

    return { isLoading, uploadFile, uploadStatus, upload, path };
  },
});
</script>
