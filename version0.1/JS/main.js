import { initMap } from "JS/modules/map.js"; // Make sure this path is correct
import { initCart } from "JS/modules/cart.js"; // Make sure this path is correct

document.addEventListener("DOMContentLoaded", function () {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        initMap(); // one call, handles both map + marker
    } else {
        console.error("Map element not found.");
    }
});
document.addEventListener("DOMContentLoaded", function () {
 initCart();// Initialize the cart functionality
 initMap(); // Initialize the map functionality
});