import type { Ref } from "vue";

export default function initMap(
    stops: Ref<{ name: string; id: number; locked: boolean }[]>,
    update: Ref<any>,
    mapURL: Ref<any>,
    timetableValue: Ref<any>,
    departureTime: Ref<any>
) {
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
    const request = {
      origin: optimizedStops[0],
      waypoints: optimizedStops
          .slice(1, -1)
          .map((stop) => ({ location: stop })),
      optimizeWaypoints: false,
      destination: optimizedStops.at(-1),
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(Date.now()), // for the time N milliseconds from now.
      },
    };

    await directionsService.route(request as any, function (result, status) {
      console.log(result);
      if (status == "OK") {
        directionsRenderer.setDirections(result);
        mapURL.value =
            "https://www.google.com/maps/dir/?api=1&" +
            new URLSearchParams({
              origin: optimizedStops[0],
              origin_place_id: result?.geocoded_waypoints?.at(0)?.place_id || "",
              destination: optimizedStops.at(-1) || "",
              destination_place_id:
                  result?.geocoded_waypoints?.at(-1)?.place_id || "",
              waypoints: optimizedStops.slice(1, -1).join("|") || "",
              waypoints_place_ids:
                  result?.geocoded_waypoints
                      ?.slice(1, -1)
                      .map((wp) => wp.place_id)
                      .join("|") || "",
            }).toString();
      }
    });
  };

  calculateRoute();
  update.value = calculateRoute;
}
