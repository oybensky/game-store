// export async function initCheckout() {
//     const paymentForm = document.getElementById("payment-form");

//     if (!paymentForm) return;


//     paymentForm.querySelector('input[placeholder="Name"]').value = savedCard.name || "";
//     document.getElementById('txtCardNumber').value = savedCard.number || "";
//     document.getElementById('txtCardExpiry').value = savedCard.expiry || "";
//     document.getElementById('txtCardCVC').value = savedCard.cvv || "";
// }

// paymentForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const name = paymentForm.querySelector('input[placeholder="Name"]').value.trim();
//     const number = document.getElementById('txtCardNumber').value.trim();
//     const expiry = document.getElementById('txtCardExpiry').value.trim();
//     const cvv = document.getElementById('txtCardCVC').value.trim();

//     if (!name || !number || !expiry || !cvv) {
//         alert("Please fill out all payment fields.");
//         return;
//     }

//     const cardRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
//     const expiryRegex = /^\d{2}\/\d{2}$/;
//     const cvvRegex = /^\d{3}$/;

//     if (!cardRegex.test(number)) {
//         alert("Card number must be in xxxx-xxxx-xxxx-xxxx format.");
//         return;
//     }

//     if (!expiryRegex.test(expiry)) {
//         alert("Expiry must be in MM/YY format.");
//         return;
//     }

//     if (!cvvRegex.test(cvv)) {
//         alert("CVV must be 3 digits.");
//         return;
//     }

//     alert("Card successfully added!");
// });
