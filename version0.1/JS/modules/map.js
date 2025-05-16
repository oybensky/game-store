export async function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.45056521648996, lng: -73.6141017240869 },
        zoom: 14,
        mapId: "db641b33843059ef"
    });
    
    try {
        const response = await fetch('./data/places.json');
        const data = await response.json();
        console.log("Loaded places.json:", data);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data.places.forEach(location => {
            const marker = new google.maps.marker.AdvancedMarkerElement({
                position: {
                    lat: location.location.latitude,
                    lng: location.location.longitude
                },
                map: map,
                title: location.name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<h1>${location.name}</h1><p>${location.description}</p>`
            });

            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
        });
    } catch (error) {
        console.error("Error loading places.json:", error);
    }
}
window.initMap = initMap;

