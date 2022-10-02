<script setup lang="ts">
import draggable from "vuedraggable";
import { nextTick, ref } from "vue";

const myArray = ref([
  { name: "10355 Tonita Way, Cupertino, CA 95014", id: 0 },
  { name: "22562 Alcade Road, Cupertino, CA 95014", id: 1 },
  { name: "12345 Rainbow Drive, Cupertino, CA 95014", id: 2 },
]);

// lmao idk if this actually works
const lastAddedInput = ref<HTMLInputElement | null>(null);

const center = { lat: 51.093048, lng: 6.84212 };

const handleAddDestination = () => {
  myArray.value.push({ name: "", id: Math.random() });
  nextTick(() => lastAddedInput.value!.focus());
};
</script>

<template>
  <div class="flex">
    <div className="w-96">
      <div className="m-4 font-bold text-lg">Destinations</div>
      <draggable v-model="myArray" item-key="id" ghost-class="ghost">
        <template #item="{ element }">
          <div class="px-2 my-2 flex items-start">
            <div class="h-10 w-10 flex items-center justify-center">
              <span
                class="inline-block h-4 w-4 border border-gray-300 rounded-full"
              ></span>
            </div>
            
            <input
              v-model="element.name"
              class="p-2 rounded w-full border border-gray-200"
              ref="lastAddedInput"
            />
          </div>
        </template>
      </draggable>
      <div class="ml-10">
        <button
          className="p-2 font-medium text-gray-600 hover:text-black"
          @click="handleAddDestination()"
        >
          Add destination
        </button>
      </div>
    </div>

    <div class="flex-1">
      <iframe class="h-full w-full" :src="`https://www.google.com/maps/embed/v1/directions?${
        new URLSearchParams({
          key: "AIzaSyDbDbQCr2WO9glUq_LCf9J_fSiqKGKR5JY",
          origin: "Oslo+Norway",
          destination: "Telemark+Norway",
          avoid: "tolls|highways",
          mode: "driving",
        }).toString()
      }`"></iframe>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: theme("colors.gray.200");
}
</style>
