export async function initCart() {
    // version0.1/JS/modules/cart.js
    const canadianTax = 0.15;
    const shippingCost = 10.00;

    // Function to update the total price
    function updateTotal() {
        const cartItems = document.querySelectorAll('.card.mb-3');
        let subtotal = 0;

        cartItems.forEach(item => {
            const price = parseFloat(item.querySelector('.card-text').textContent.replace('$', ''));
            subtotal += price;
        });

        const tax = subtotal * canadianTax;
        const total = subtotal + tax + shippingCost;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shippingCost.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
    const removeButtons = document.querySelectorAll('#removeBtn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = btn.closest('.card.mb-3');
            if (card) card.remove();
            updateTotal();
        });
    });
    updateTotal();
};

// Function to validate the form
const formRegistration = document.querySelector('#formRegistration')
formRegistration.addEventListener('submit', validateForm);

function validateForm(event) {
    event.preventDefault();
    const pCode = document.getElementById("txtPostalCode").value;
    const cardNumber = document.getElementById("txtCardNumber").value;
    const cardExpiry = document.getElementById("txtCardExpiry").value;
    const cardCVC = document.getElementById("txtCardCVC").value;

    const regexPostalCode = /^[a-zA-Z]\d[a-zA-Z] \d[a-zA-Z]\d$/;
    const regexCardNumber = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    const regexCardExpiry = /^[a-zA-Z][a-zA-Z] [a-zA-Z][a-zA-Z]$/
    const regexCVC = /^\d{3}$/;
    let isFormValid = true;
    if (!regexPostalCode.test(pCode)) {
        isFormValid = false;
        showAlert('Invalid postal code format. Expected format: A1A 1A1', 'danger');
    }
    if (!regexCardNumber.test(cardNumber)) {
        isFormValid = false;
        showAlert('Invalid card number format. Expected format: 1234-5678-9012-3456', 'danger');
    }
    if (!regexCardExpiry.test(cardExpiry)) {
        isFormValid = false;
        showAlert('Invalid card expiry format. Expected format: MM/YY', 'danger');
    }
    if (!regexCVC.test(cardCVC)) {
        isFormValid = false;
        showAlert('Invalid CVC format. Expected format: 123', 'danger');
    }
}
function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('bsPlaceHolder')
    alertPlaceholder.innerHTML = "";
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}
// Function to show a success message
