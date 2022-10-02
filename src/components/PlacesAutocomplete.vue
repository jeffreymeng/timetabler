<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// const handleEvent = () => {
//   emit("update:modelValue", !props.modelValue);
// };

const displaySuggestions = function (
  predictions: google.maps.places.QueryAutocompletePrediction[] | null,
  status: google.maps.places.PlacesServiceStatus
) {
  if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
    alert(status);
    return;
  }

  predictions.forEach((prediction) => {
    const li = document.createElement("li");

    li.appendChild(document.createTextNode(prediction.description));
    (document.getElementById("results") as HTMLUListElement).appendChild(li);
  });
};

const service = new google.maps.places.AutocompleteService();

service.getQueryPredictions({ input: "pizza near Syd" }, displaySuggestions);
</script>

<template>
  <input
    :value="props.modelValue"
    class="p-2 rounded w-full border border-gray-200"
    ref="lastAddedInput"
  />
</template>
