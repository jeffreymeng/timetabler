<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";
import draggable from "vuedraggable";
import { nextTick, ref } from "vue";
import Lock from "./components/Lock.vue";
import { onMounted } from "vue";

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

const update = ref();

// lmao idk if this actually works
const lastAddedInput = ref<HTMLInputElement | null>(null);

const center = { lat: 51.093048, lng: 6.84212 };

const handleAddDestination = () => {
  stops.value.push({ name: "", id: Math.random(), locked: false });
  nextTick(() => lastAddedInput.value!.focus());
};

function initMap() {
  // basically, we split up the destinations into 'groups', where groups contain stops which need their order
  // to be optimized within the groups. We then optimize the order of each of the groups individually,
  // before getting the directions to the entire route in the optimized order. This is because google
  // maps doesn't support waypoints with some fixed orders and some orders to be optimized.
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  /**
   * Optimizes the order of an array containing two or more destinations.
   * The first and last element will always remain the same, while the middle
   * elements will be reordered to minimize driving time.
   * @param stops - An array of stops.
   * @returns result - An array with the index of each stop from `stops`, ordered in the optimal order.
   */
  async function optimizeOrder(
    start: string,
    stops: string[],
    destination: string
  ): Promise<number[]> {
    console.log(start, stops, destination);
    return new Promise((res, rej) => {
      directionsService.route(
        {
          origin: start,
          waypoints: stops.map((stop) => ({ location: stop })),
          optimizeWaypoints: true,
          destination: destination,
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
              console.log(acc, name)
              // create a new group if it's locked or if the previous element is locked.
              if (
                i === 0 ||
                i === arr.length - 1 ||
                locked ||
                arr[i - 1].locked
              ) {
                return [...acc, [{ name, i }]] as {
                  name: string;
                  i: number;
                }[][];
              }
              return [...acc.slice(0, -1), [...acc.at(-1)!, { name, i }]] as {
                name: string;
                i: number;
              }[][];
            },
            []
          )
          .map((arr, i, bigArr) => {
            if (arr.length > 1 && i !== 0 && i < bigArr.length - 1) {
              return optimizeOrder(
                bigArr[i - 1].at(-1)!.name,
                arr.map((el) => el.name),
                bigArr[i + 1][0].name
              ).then((order) => order.map((i) => arr[i].i));
            }
            return Promise.resolve(arr[0].i);
          })
      )
    ).flat();

    const optimizedStops = optimizedOrder.map((i) => stops.value[i].name);
    console.log(optimizedStops);
    const request = {
      origin: optimizedStops[0],
      waypoints: optimizedStops
        .slice(1, -1)
        .map((stop) => ({ location: stop })),
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
