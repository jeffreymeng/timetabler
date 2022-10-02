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
          <div class="m-2">
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
        map-type-id="terrain"
        style="width: 100vw; height: 900px"
      >
      </GMapMap>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
