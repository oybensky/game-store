export async function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 45.50230408701957, lng: -73.57387065444038 },
    zoom: 12,
    mapId: "db641b33843059ef"
  });

  try {
    const response = await fetch('./data/places.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("Loaded places.json:", data);

    const infoWindow = new google.maps.InfoWindow();
    const markers = [];

    data.places.forEach(location => {
      const marker = new google.maps.Marker({
        position: {
          lat: location.location.latitude,
          lng: location.location.longitude
        },
        map: map,
        title: location.name
      });

      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="max-width: 250px;">
            <h5>${location.name}</h5>
            <p>${location.description}</p>
            ${location.image ? `<img src="${location.image}" alt="${location.name}" style="width:100%; border-radius: 8px;" />` : ""}
          </div>
        `);
        infoWindow.open(map, marker);
      });

      markers.push({ marker, location });
    });

    const searchInput = document.getElementById("searchButton");
    const resultList = document.getElementById("searchResults");

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      resultList.innerHTML = ""; // Clear previous results

      if (query === "") return;

      const matches = markers.filter(({ location }) =>
        location.name.toLowerCase().includes(query)
      );

      matches.forEach(({ marker, location }) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = location.name;

        li.addEventListener("click", () => {
          map.panTo(marker.getPosition());
          map.setZoom(14);

          infoWindow.setContent(`
            <div style="max-width: 250px;">
              <h5>${location.name}</h5>
              <p>${location.description}</p>
              ${location.image ? `<img src="${location.image}" alt="${location.name}" style="width:100%; border-radius: 8px;" />` : ""}
            </div>
          `);
          infoWindow.open(map, marker);

          resultList.innerHTML = ""; // clear results after selection
        });

        resultList.appendChild(li);
      });
    });

  } catch (error) {
    console.error("Error loading places.json:", error);
  }
}

window.initMap = initMap;
