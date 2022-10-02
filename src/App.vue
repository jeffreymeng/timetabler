<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";
import draggable from "vuedraggable";
import { nextTick, ref, watchEffect } from "vue";
import Lock from "./components/Lock.vue";
import { onMounted } from "vue";
import PlacesAutocomplete from "./components/PlacesAutocomplete.vue";
import { XMarkIcon } from "@heroicons/vue/20/solid";
import initMap from "@/utils/initMap";

const stops = ref([
  { name: "Cupertino, CA", id: 0, locked: true },
  { name: "Fremont, CA", id: 1, locked: false },
  { name: "San Jose, CA", id: 2, locked: false },
  { name: "San Fransisco, CA", id: 3, locked: true },
  { name: "Vallejo, CA", id: 4, locked: false },
  { name: "San Rafael, CA", id: 5, locked: false },
  { name: "Stinson Beach, CA", id: 6, locked: false },
  { name: "Oakland, CA", id: 7, locked: true },
]);
const departureTime = ref("");
const timetableValue = ref(`Nathan Wang: 10:05am
Jeffrey Meng: 10:08am
Edwin Xie: 10:31am
10355 Tonita Way: 12:45pm`);

const update = ref();
const mapURL = ref();

// lmao idk if this actually works
const lastAddedInput = ref<{ inputRef: { value: HTMLInputElement } } | null>(
  null
);

const center = { lat: 51.093048, lng: 6.84212 };

const handleAddDestination = () => {
  stops.value.push({ name: "", id: Math.random(), locked: false });
  nextTick(() => lastAddedInput.value!.inputRef.el.focus());
};

onMounted(() => initMap(stops, update, mapURL));
</script>

<template>
  <div class="flex">
    <div className="w-96">
      <div className="m-4 font-bold text-lg">Destinations</div>
      <draggable v-model="stops" item-key="id" ghost-class="ghost">
        <template #item="{ element, index }">
          <div class="px-2 my-2 flex items-start">
            <div
              class="h-10 w-10 flex items-center justify-center"
              :class="[
                index !== 0 && index !== stops.length - 1
                  ? 'text-gray-400'
                  : 'text-gray-200',
              ]"
            >
              <Lock
                v-model="element.locked"
                :disabled="index === 0 || index === stops.length - 1"
              />
            </div>
            <PlacesAutocomplete v-model="element.name" ref="lastAddedInput" />
            <button
              class="h-10 w-10 flex items-center justify-center text-gray-400"
              @click="stops.splice(index, 1)"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
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
      <div class="ml-10">
        <button
          className="p-2 font-medium text-gray-600 hover:text-black"
          @click="update()"
        >
          Optimize Route
        </button>
      </div>
      <div class="ml-10">
        <a
          className="p-2 font-medium text-gray-600 hover:text-black"
          :href="mapURL"
          target="_blank"
        >
          Open in Google Maps
        </a>
      </div>
      <div class="ml-10 mr-2">
        <div class="p-2">
          <label
            for="departureTime"
            class="block text-sm font-medium text-gray-700"
            >Departure Time</label
          >
          <div class="mt-1">
            <input
              type="time"
              name="departureTime"
              id="departureTime"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              v-model="departureTime"
            />
          </div>
        </div>
      </div>

      <hr class="my-8" />

      <div className="m-4 font-bold text-lg">Timetable</div>
      <div class="m-4">
        <textarea
          :rows="timetableValue.split('\n').length"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :value="timetableValue"
          :readonly="true"
          @focus="$event.target.select()"
        />
      </div>
    </div>

    <div class="flex-1">
      <div id="map" style="width: 100%; height: 100vh"></div>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: theme("colors.gray.200");
}
</style>
