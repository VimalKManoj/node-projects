const locations = JSON.parse(document.getElementById('map').dataset.locations);

maptilersdk.config.apiKey = 'szkdIpF2GUtROAlga0QD';
const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [16.62662018, 49.2125578], // starting position [lng, lat]
  zoom: 6, // starting zoom
});

const bounds = new maptilersdk.LngLatBounds();

locations.forEach((loc) => {
  const el = document.createElement('div');

  el.className = 'marker';

  new maptilersdk.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new maptilersdk.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 200, right: 200, left: 200 },
});
