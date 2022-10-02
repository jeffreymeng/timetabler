<script setup lang="ts">
import draggable from "vuedraggable";
import { nextTick, ref } from "vue";
import Lock from "./components/Lock.vue";

const myArray = ref([
  { name: "10355 Tonita Way, Cupertino, CA 95014", id: 0, locked: false },
  { name: "22562 Alcade Road, Cupertino, CA 95014", id: 1, locked: false },
  { name: "12345 Rainbow Drive, Cupertino, CA 95014", id: 2, locked: true },
]);

// lmao idk if this actually works
const lastAddedInput = ref<HTMLInputElement | null>(null);

const center = { lat: 51.093048, lng: 6.84212 };

const handleAddDestination = () => {
  myArray.value.push({ name: "", id: Math.random() });
  nextTick(() => lastAddedInput.value!.focus());
};

const mapParams = ref(
  new URLSearchParams({
    key: "AIzaSyDbDbQCr2WO9glUq_LCf9J_fSiqKGKR5JY",
    origin: "Oslo+Norway",
    destination: "Telemark+Norway",
    avoid: "tolls|highways",
    mode: "driving",
  }).toString()
);
</script>

<template>
  <div class="flex">
    <div className="w-96">
      <div className="m-4 font-bold text-lg">Destinations</div>
      <draggable v-model="myArray" item-key="id" ghost-class="ghost">
        <template #item="{ element, index }">
          <div class="px-2 my-2 flex items-start">
            <div
              class="h-10 w-10 flex items-center justify-center text-gray-400"
            >
              <Lock
                v-model="element.locked"
                v-if="index !== 0 && index !== myArray.length - 1"
              />
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
      <iframe
        class="h-screen w-full"
        :src="`https://www.google.com/maps/embed/v1/directions?${mapParams}`"
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: theme("colors.gray.200");
}
</style>
