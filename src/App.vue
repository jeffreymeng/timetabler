<script setup lang="ts">
import draggable from "vuedraggable";
import { ref } from "vue";

const myArray = ref([
  { name: "10355 Tonita Way, Cupertino, CA 95014", id: 0 },
  { name: "22562 Alcade Road, Cupertino, CA 95014", id: 1 },
  { name: "12345 Rainbow Drive, Cupertino, CA 95014", id: 2 },
]);

const center = { lat: 51.093048, lng: 6.84212 };
</script>

<template>
  <div class="h-full flex">
    <div className="w-96">
      <div className="m-4 font-bold text-lg">Destinations</div>
      <draggable v-model="myArray" item-key="id" ghost-class="ghost">
        <template #item="{ element }">
          <div class="px-2 my-2 flex items-start">
            <div class="h-10 w-10 flex items-center justify-center">
              <span
                class="inline-block h-4 w-4 border border-gray-300 rounded-full"
              />
            </div>
            <input
              v-model="element.name"
              class="p-2 rounded w-full border border-gray-200"
            />
          </div>
        </template>
      </draggable>
    </div>

    <div class="flex-1">
      <GMapMap
        :center="center"
        :zoom="7"
        gesture-handling="greedy"
              >
      </GMapMap>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: theme("colors.gray.200");
}
</style>
