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
          card.onclick = () => {
            sessionStorage.setItem('selectedProduct', p.itemId);
            window.location.href = 'game-details.html';
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

// 2) Infinite‐scroll live deals 
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
  
        // Use internalName and normalPrice from the API
        card.innerHTML = `
          <div class="game-image">
            <img src="${d.thumb}" alt="${d.internalName}" />
          </div>
          <h3>${d.title}</h3>
          <p>Price: $${parseFloat(d.normalPrice).toFixed(2)}</p>
          <p>Sale: $${parseFloat(d.salePrice).toFixed(2)}</p>
         
          <button class="btn btn-success add-to-cart"     data-deal="${d.dealID}">
            Add to Cart
          </button>
          <button class="btn btn-outline-primary add-to-wishlist" data-deal="${d.dealID}">
            Wishlist
          </button>
        `;
  
        // click  details page
        card.onclick = () => {
          sessionStorage.setItem('selectedDeal', d.dealID);
          window.location.href = 'game-details.html';
        };
  
        apiContainer.appendChild(card);
      });
  
      pageNumber++;
    } catch (err) {
      console.error('Error loading deals:', err);
    } finally {
      isFetching = false;
    }
  }

// 3) Hook up scroll & buttons
function initInfiniteScroll(){
  window.addEventListener('scroll', () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) loadDeals();
  });
}
function initButtons(){
  document.body.addEventListener('click', e => {
    let key, id;
    if (e.target.matches('.add-to-cart')) {
      key = 'cart';    id = e.target.dataset.deal || e.target.dataset.id;
    }
    if (e.target.matches('.add-to-wishlist')) {
      key = 'wishlist'; id = e.target.dataset.deal || e.target.dataset.id;
    }
    if (!key) return;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(key, JSON.stringify(arr));
      alert(`Added to ${key}`);
    }
  });
}

// 4) Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();      // <--  JSON section
  loadDeals();        // <-- first page of API deals
  initInfiniteScroll();
  initButtons();
});

const searchInput = document.querySelector("input[type='search']");
const searchForm = document.querySelector("form[role='search']");

// Store all game cards for searching
let allGameCards = [];

// Enhanced search function
function performSearch(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();
  
  // Get all game cards currently in the DOM
  const catalogCards = document.querySelectorAll('#catalogContainer .game-card');
  const apiCards = document.querySelectorAll('#apiDealsContainer .game-card');
  
  // Combine both sets of cards
  allGameCards = [...catalogCards, ...apiCards];
  
  // If search is empty, show all cards
  if (searchTerm === '') {
    allGameCards.forEach(card => {
      card.style.display = 'flex';
    });
    return;
  }
  
  // Filter cards based on search term
  allGameCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Update the existing event listener or create a new one
searchInput.addEventListener('input', (e) => {
  const value = e.target.value;
  performSearch(value);
});

// Handle form submission to prevent page reload
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch(searchInput.value);
});

// Modify the original document DOMContentLoaded event to add search after everything loads
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener = function(event, callback) {
  if (event === 'DOMContentLoaded') {
    const enhancedCallback = function() {
      callback();
      // Initialize search after catalog and deals have loaded
      setTimeout(() => {
        performSearch('');
      }, 1000); // Give time for catalog and deals to load
    };
    originalDOMContentLoaded.call(document, event, enhancedCallback);
  } else {
    originalDOMContentLoaded.call(document, event, callback);
  }
};