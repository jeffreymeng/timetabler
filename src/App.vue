<script setup lang="ts">
import draggable from "vuedraggable";
import { ref } from "vue";

const drag = ref(false);
const myArray = ref([
  { name: "John", id: 0 },
  { name: "Joao", id: 1 },
  { name: "Jean", id: 2 },
]);
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

    <div class="flex-1">My content</div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
