import { initMap } from "./map.js"; // Make sure this path is correct

document.addEventListener("DOMContentLoaded", function () {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        initMap(); // one call, handles both map + marker
    } else {
        console.error("Map element not found.");
    }
});
