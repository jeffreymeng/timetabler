<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";
import draggable from "vuedraggable";
import { nextTick, ref } from "vue";
import Lock from "./components/Lock.vue";
import { onMounted } from "vue";

const stops = ref([
  { name: "10355 Tonita Way, Cupertino, CA 95014", id: 0, locked: true },
  { name: "22562 Alcade Road, Cupertino, CA 95014", id: 1, locked: false },
  { name: "12345 Rainbow Drive, Cupertino, CA 95014", id: 2, locked: true },
]);

const update = ref();

// lmao idk if this actually works
const lastAddedInput = ref<HTMLInputElement | null>(null);

const center = { lat: 51.093048, lng: 6.84212 };

const handleAddDestination = () => {
  stops.value.push({ name: "", id: Math.random(), locked: false });
  nextTick(() => lastAddedInput.value!.focus());
};

function initMap() {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  /**
   * Optimizes the order of an array containing two or more destinations.
   * The first and last element will always remain the same, while the middle
   * elements will be reordered to minimize driving time.
   * @param stops - An array of stops.
   * @returns result - An array with the index of each stop from `stops`, ordered in the optimal order.
   */
  async function optimizeOrder(stops: string[]): Promise<number[]> {
    return new Promise((res, rej) => {
      directionsService.route(
        {
          origin: stops[0],
          waypoints: stops.slice(1, -1).map((stop) => ({ location: stop })),
          optimizeWaypoints: true,
          destination: stops[stops.length - 1],
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(Date.now() + 24 * 60 * 1000), // for the time N milliseconds from now.
          },
        },
        function (result, status) {
          if (status == "OK") {
            if (!result) {
              alert("Error: Unable to calculate route.");
              return rej("No results found.");
            }
            return res(result.routes[0].waypoint_order);
          } else {
            return rej(result);
          }
        }
      );
    });
  }

  const map = new google.maps.Map(document.getElementById("map")!, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

  directionsRenderer.setMap(map);

  if (!stops.value || stops.value.length < 2) {
    throw new Error("Fewer than two stops!");
  }

  const calculateRoute = async () => {
    const optimizedOrder = (
      await Promise.all(
        stops.value
          .reduce(
            (
              acc: { name: string; i: number }[][],
              { name, locked },
              i,
              arr
            ) => {
              if (i === 0 || i === arr.length - 1 || locked) {
                return [...acc, [{ name, i }]] as {
                  name: string;
                  i: number;
                }[][];
              }
              return [...acc.slice(0, -1), [...acc.slice(-1), { name, i }]] as {
                name: string;
                i: number;
              }[][];
            },
            []
          )
          .map((arr) => {
            if (arr.length > 1) {
              return optimizeOrder(arr.map((el) => el.name)).then((order) =>
                order.map((i) => arr[i].i)
              );
            }
            return Promise.resolve(arr[0].i);
          })
      )
    ).flat();

    const optimizedStops = optimizedOrder.map(i => stops.value[i].name);

    const request = {
      origin: optimizedStops[0],
      waypoints: optimizedStops.slice(1, -1),
      optimizeWaypoints: false,
      destination: optimizedStops.at(-1),
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(Date.now() + 24 * 60 * 1000), // for the time N milliseconds from now.
      },
    };

    await directionsService.route(request as any, function (result, status) {
      if (status == "OK") {
        directionsRenderer.setDirections(result);
      }
    });
  };

  calculateRoute();
  update.value = calculateRoute;
}

onMounted(() => initMap());
</script>

<template>
  <div class="flex">
    <div className="w-96">
      <div className="m-4 font-bold text-lg">Destinations</div>
      <draggable v-model="stops" item-key="id" ghost-class="ghost">
        <template #item="{ element }">
          <div class="px-2 my-2 flex items-start">
            <div
              class="h-10 w-10 flex items-center justify-center text-gray-400"
            >
              <Lock v-model="element.locked" />
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
      <div class="ml-10">
        <button
          className="p-2 font-medium text-gray-600 hover:text-black"
          @click="update()"
        >
          Optimize Route
        </button>
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
