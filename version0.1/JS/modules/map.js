export async function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.45056521648996, lng: -73.6141017240869 },
        zoom: 14,
        mapId: "db641b33843059ef"
    });

    try{
        fetch("places.json")
            .then(response => response.json())
            .then(data => {
                data.forEach(location => {
                    const marker = new google.maps.Marker({
                        position: { lat: location.latitude, lng: location.longitude },
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
            });
    } catch (error) {
        console.error("Error fetching places.json:", error);
    }

    const marker = new google.maps.Marker({
        position: { lat: 45.45056521648996, lng: -73.6141017240869 },
        map: map,
        title: "Best Buy!"
    });

    const infoWindow = new google.maps.InfoWindow({
        content: "<h1>Best Buy</h1><p>Best Buy is a leading retailer of consumer electronics and appliances.</p>"
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}
