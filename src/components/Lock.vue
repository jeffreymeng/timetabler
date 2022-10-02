<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps<{
  modelValue: boolean;
  disabled: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const handleEvent = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>

<template>
  <button @click="handleEvent" :disabled="props.disabled">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      view-box="0 0 20 20"
      fill="currentColor"
      class="w-5 h-5"
      v-if="props.modelValue || props.disabled"
    >
      <path
        fill-rule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clip-rule="evenodd"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      view-box="0 0 20 20"
      fill="currentColor"
      class="w-5 h-5"
      v-else
    >
      <path
        fill-rule="evenodd"
        d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>
