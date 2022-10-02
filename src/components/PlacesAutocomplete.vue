<script setup lang="ts">
import { defineProps, defineEmits, defineExpose, ref, nextTick } from "vue";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputRef = ref(null);
defineExpose({
  inputRef,
});

const predictionResults = ref<string[]>([]);

const service = new google.maps.places.AutocompleteService();

const handleChange = (event: Event) => {
  const newVal = (event.target as HTMLInputElement).value;
  emit("update:modelValue", newVal);
  service.getPlacePredictions(
    { input: newVal },
    (
      predictions: google.maps.places.AutocompletePrediction[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
        console.error(status);
        return;
      }

      const predictionTexts = predictions.map((prediction) => {
        return prediction.description;
      });

      predictionResults.value = predictionTexts;
    }
  );
};
</script>

<template>
  <Combobox
    as="div"
    :modelValue="props.modelValue"
    @update:modelValue="(x) => $emit('update:modelValue', x)"
    class="w-full"
  >
    <div class="w-full relative">
      <ComboboxInput
        class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        @change="handleChange"
        :display-value="(x) => x ?? ''"
        ref="inputRef"
      />
      <ComboboxButton
        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
      >
        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>

      <ComboboxOptions
        v-if="predictionResults.length > 0"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="prediction in predictionResults"
          :key="prediction"
          :value="prediction"
          as="template"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              'relative cursor-default select-none py-2 pl-3 pr-9',
              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
            ]"
          >
            <span :class="['block truncate', selected && 'font-semibold']">
              {{ prediction }}
            </span>

            <span
              v-if="selected"
              :class="[
                'absolute inset-y-0 right-0 flex items-center pr-4',
                active ? 'text-white' : 'text-indigo-600',
              ]"
            >
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
  <!-- <div class="relative w-full">
    <input
      :value="props.modelValue"
      @input="handleChange"
      class="p-2 rounded w-full border border-gray-200"
      ref="lastAddedInput"
    />

    <div
      v-if="predictionResults"
      class="absolute top-0 left-0 w-full bg-white border border-gray-200 rounded-b"
    >
      <div
        v-for="prediction in predictionResults"
        :key="prediction"
        class="p-2 border-b border-gray-200"
      >
        {{ prediction }}
      </div>
    </div> -->
  <!-- </div> -->
</template>
