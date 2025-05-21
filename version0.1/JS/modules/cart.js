const API_GAME_URL = 'https://www.cheapshark.com/api/1.0/games?id=';
const API_GAME_URL2 = 'https://www.freetogame.com/api/games?start=';


function formatPrice(n) {
    return `$${n.toFixed(2)}`;
  }
  
  // calculating the total price of the games
  function updateSummary(cart) {
    const subtotal = cart.reduce((sum, it) => sum + it.normalPrice, 0);
    const tax = subtotal * 0.15;
    const shipping = cart.length ? 10 : 0;
    const total = subtotal + tax + shipping;
  
    document.getElementById('subtotal').textContent = 
      `Subtotal (${cart.length} items): ${formatPrice(subtotal)}`;
    document.getElementById('tax').textContent = 
      `Estimated Tax: ${formatPrice(tax)}`;
    document.getElementById('shipping').textContent = 
      `Shipping Fee: ${formatPrice(shipping)}`;
    document.getElementById('total').textContent = 
      `Order Total: ${formatPrice(total)}`;
  }
  
  async function initCart() {
    // loading the cart from localStorage 
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
    // normalizing and filter cart items
    cart = cart
      .map(item => {
        // if item has gameID convert to standard structure
        if (item.gameID) {
          return {
            id: item.gameID,
            normalPrice: item.normalPrice,
            title: item.title || 'Unknown Title',
            thumb: item.thumb || ''
          };
        }
        return item;
      })
      .filter(item => 
        item && 
        typeof item === 'object' && 
        'id' in item && 
        typeof item.normalPrice === 'number'
      );
  
    console.log('Processed cart:', cart);
  
    const container = document.getElementById('review-items');
    if (!cart.length) {
      container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
      updateSummary([]);
      return;
    }
  
    container.innerHTML = '';
    for (const item of cart) {
      const card = document.createElement('div');
      card.className = 'card mb-3 shadow-sm';
      card.innerHTML = `
        <div class="row g-0 align-items-center">
          <div class="col-md-4">
            <img src="${item.thumb}" class="img-fluid rounded-start" alt="${item.title}" style="max-height: 150px; object-fit: cover;">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title mb-2">${item.title}</h5>
              <p class="card-text mb-2">Price: ${formatPrice(item.normalPrice)}</p>
              <button class="btn btn-outline-danger btn-sm remove-btn" data-id="${item.id}">
                Remove
              </button>
            </div>
          </div>
        </div>`;
      container.appendChild(card);
    }
  
    updateSummary(cart);
  
    //  remove button functionality
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        // create new array excluding the iteam id 
        // saves the update cart to localstorage
        const newCart = cart.filter(it => it.id !== id);
        localStorage.setItem('cart', JSON.stringify(newCart));
        initCart(); 
      });
    });
  }
  document.getElementById('clear-cart').addEventListener('click',()=>{
localStorage.removeItem('cart');
initCart();
  })
  
  document.addEventListener('DOMContentLoaded', initCart);