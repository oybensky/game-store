const catalogContainer = document.getElementById('catalogContainer');
const apiContainer     = document.getElementById('apiDealsContainer');

let pageNumber         = 0;
let isFetching         = false;

//loading  JSON catalog
async function loadCatalog() {
  try {
    const res = await fetch('./data/product-catalog.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { categories, products } = await res.json();

    categories.forEach(cat => {
      const section = document.createElement('section');
      section.className = 'mb-5';
      section.innerHTML = `<h2>${cat.categoryName}</h2>`;

      const grid = document.createElement('div');
      grid.className = 'game-container';

      products
        .filter(p => p.categoryId === cat.categoryId)
        .forEach(p => {
          const card = document.createElement('div');
          card.className = 'game-card';
          card.innerHTML = `
            <div class="game-image">
              <img src="${p.thumbnailImage}" alt="${p.itemTitle}" />
            </div>
            <h3>${p.itemTitle}</h3>
            <p>Studio: ${p.brand}</p>
            <p>Rating: ${p.rating ?? 'N/A'}</p>
            <p>Price: $${p.unitPrice.toFixed(2)}</p>
            <button class="btn btn-success add-to-cart"     data-id="${p.itemId}">Add to Cart</button>
            <button class="btn btn-outline-primary add-to-wishlist" data-id="${p.itemId}">Wishlist</button>
          `;
          card.onclick = (e) => {
            // only navigate if not clicking a button
            if (!e.target.matches('button')) {
              sessionStorage.setItem('selectedProduct', p.itemId);
              window.location.href = 'game-details.html';
            }
          };
          grid.appendChild(card);
        });

      section.appendChild(grid);
      catalogContainer.appendChild(section);
    });
  } catch (err) {
    console.error('Error loading catalog:', err);
    const errMsg = document.createElement('p');
    errMsg.textContent = ` Couldn’t load catalog: ${err.message}`;
    catalogContainer.appendChild(errMsg);
  }
}

//  infinite‐scroll live deals 
async function loadDeals() {
  if (isFetching) return;
  isFetching = true;

  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/deals?pageNumber=${pageNumber}&pageSize=20`
    );
    if (!res.ok) throw new Error(res.statusText);
    const deals = await res.json();

    deals.forEach(d => {
      const card = document.createElement('div');
      card.className = 'game-card';

      
      card.innerHTML = `
        <div class="game-image">
          <img src="${d.thumb}" alt="${d.internalName}" />
        </div>
        <h3>${d.title}</h3>
        <p>Price: $${parseFloat(d.normalPrice).toFixed(2)}</p>
        <p>Sale: $${parseFloat(d.salePrice).toFixed(2)}</p>
       
        <button class="btn btn-success add-to-cart" 
        data-id="${d.gameID}" 
        data-price="${parseFloat(d.normalPrice).toFixed(2)}" 
        data-title="${d.title}" 
        data-thumb="${d.thumb}">
        Add to Cart
      </button>
        <button class="btn btn-outline-primary add-to-wishlist" data-deal="${d.dealID}">
          Wishlist
        </button>
      `;

      card.querySelector('.add-to-cart').addEventListener('click', e => {
        e.stopPropagation();
        const btn = e.currentTarget;
        const game = {
          id: btn.dataset.id,
          normalPrice: parseFloat(btn.dataset.price),
          title: btn.dataset.title,
          thumb: btn.dataset.thumb
        };
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.find(item => item.id === game.id)) {
          cart.push(game);
          localStorage.setItem('cart', JSON.stringify(cart));
          console.log('Cart now:', cart);
          alert('✔ Added to cart!');
        } else {
          alert('Already in your cart.');
        }
      });

      apiContainer.appendChild(card);
    });

    pageNumber++;
  } catch (err) {
    console.error('Error loading deals:', err);
  } finally {
    isFetching = false;
  }
}

//  hooking up scroll & buttons
function initInfiniteScroll(){
  window.addEventListener('scroll', () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) loadDeals();
  });
}

function initButtons(){
  document.body.addEventListener('click', e => {
 
    if (e.target.matches('.add-to-wishlist')) {
      e.stopPropagation(); 
      
      let key, id;
    
      if (e.target.matches('.add-to-wishlist')) {
        key = 'wishlist'; 
        id = e.target.dataset.deal || e.target.dataset.id;
      }
      
      if (!key) return;
      
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem(key, JSON.stringify(arr));
        alert(`Added to ${key}!`);
      } else {
        alert(`This game is already in your ${key}.`);
      }
    }
  });
}

document.body.addEventListener('click', e => {
  if (e.target.matches('.add-to-cart')) {
    const btn = e.target;
    if (!btn.dataset.id || !btn.dataset.price || !btn.dataset.title || !btn.dataset.thumb) {
      console.error('Missing data attributes:', btn.dataset);
      return;
    }
    const game = {
      id: btn.dataset.id,
      normalPrice: parseFloat(btn.dataset.price),
      title: btn.dataset.title,
      thumb: btn.dataset.thumb
    };
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.find(item => item.id === game.id)) {
      cart.push(game);
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Cart updated:', cart);
      alert('✔ Added to cart!');
    } else {
      alert('Already in your cart.');
    }
  }
});


async function initCart() {
  // load cart from localStorage default to empty array if not present
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // normalize and filter cart items
  cart = cart
    .map(item => {
      // if item has gameID, convert it to the expected structure
      if (item.gameID) {
        return {
          id: item.gameID,
          normalPrice: item.normalPrice,
          title: item.title || 'Unknown Title', // fallback if title is missing
          thumb: item.thumb || '' // allback if thumb is missing
        };
      }
      return item;
    })
    .filter(item => 
      item && 
      typeof item === 'object' && 
      'id' in item && 
      'normalPrice' in item
    );

  console.log('Loaded cart:', cart);

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
      const newCart = cart.filter(it => it.id !== id);
      localStorage.setItem('cart', JSON.stringify(newCart));
      initCart(); // Re-render
    });
  });
}

function formatPrice(n) {
  return `$${n.toFixed(2)}`;
}

function updateSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.normalPrice, 0);
  // updating DOM with subtotal, tax, total, etc.
  console.log('Subtotal:', subtotal);
}

// bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();      
  loadDeals();        
  initInfiniteScroll();
  initButtons();
});

const searchInput = document.querySelector("input[type='search']");
const searchForm = document.querySelector("form[role='search']");

// store all game cards for searching
let allGameCards = [];

// search function
function performSearch(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();
  
  // geting all game cards currently in the DOM
  const catalogCards = document.querySelectorAll('#catalogContainer .game-card');
  const apiCards = document.querySelectorAll('#apiDealsContainer .game-card');
  
  // combine both sets of cards
  allGameCards = [...catalogCards, ...apiCards];
  
  // If search is empty, show all cards
  if (searchTerm === '') {
    allGameCards.forEach(card => {
      card.style.display = 'flex';
    });
    return;
  }
  
  // filtering cards based on search term
  allGameCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// updating the existing event listener or create a new one
searchInput.addEventListener('input', (e) => {
  const value = e.target.value;
  performSearch(value);
});

// handling form submission to prevent page reload
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch(searchInput.value);
});

// modifying the original document DOMContentLoaded event to add search after everything loads
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener = function(event, callback) {
  if (event === 'DOMContentLoaded') {
    const enhancedCallback = function() {
      callback();
      // initializing search after catalog and deals have loaded
      setTimeout(() => {
        performSearch('');
      }, 1000); 
    };
    originalDOMContentLoaded.call(document, event, enhancedCallback);
  } else {
    originalDOMContentLoaded.call(document, event, callback);
  }
};