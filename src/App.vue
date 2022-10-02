<script setup lang="ts">
import draggable from "vuedraggable";
import { ref } from "vue";

const drag = ref(false);
const myArray = ref([
  { name: "Jeffery", id: 0 },
  { name: "Nathan", id: 1 },
  { name: "Jason", id: 2 },
]);

const center = {lat: 51.093048, lng: 6.842120};
</script>

<template>
  <div class="h-full flex">
    <div className="w-96">
      My Sidebar
      <draggable
        v-model="myArray"
        group="people"
        @start="drag = true"
        @end="drag = false"
        item-key="id"
        ghost-class="ghost"
      >
        <template #item="{ element }">
          <div>{{ element.name }}</div>
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
