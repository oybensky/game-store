import { initMap } from "JS/modules/map.js"; // Make sure this path is correct
import { initCart } from "JS/modules/cart.js"; // Make sure this path is correct
//import { initCheckout } from 'JS/modules/checkout.js';  


document.addEventListener("DOMContentLoaded", function () {
 initCart();// Initialize the cart functionality
 initMap(); // Initialize the map functionality
// initCheckout();
});