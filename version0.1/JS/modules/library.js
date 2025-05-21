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
    console.error('Error loading catalog:', err.status);
    
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
    console.log("Fetching items");
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
        <p>Critic Score: ${parseFloat(d.metacriticScore)}%</p>
       
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

      // does not work yet
      card.onclick = (e) => {
        if (!e.target.matches('button')) {
          sessionStorage.setItem('selectedProduct', d.gameID);
          sessionStorage.setItem('selectedThumbnail', d.thumb);
          window.location.href = 'game-details.html';
        }
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

// ass the user clicks on the add to cart button the evenlistener
// will get the target game and will create an object of that game for later in the cart js

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
      alert(' Added to cart!');
    } else {
      alert('Already in your cart.');
    }
  }
});


function formatPrice(n) {
  return `$${n.toFixed(2)}`;
}


// bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();      
  loadDeals();        
  initInfiniteScroll();
  initButtons();
});



const searchInput = document.querySelector("input[type='search']");


// store all game cards for searching
let allGameCards = [];

// search function
function performSearch(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();
  
  // geting all game cards currently in the DOM as node list
  const catalogCards = document.querySelectorAll('#catalogContainer .game-card');
  const apiCards = document.querySelectorAll('#apiDealsContainer .game-card');
  
  // combine both sets of cards
  allGameCards = [...catalogCards, ...apiCards];
  
  // If search is empty shows all cards
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


searchInput.addEventListener('input', (e) => {
  const value = e.target.value;
  performSearch(value);
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



//random game button

async function showRandomGame() {
  const apiContainer = document.getElementById('apiDealsContainer');
  apiContainer.innerHTML = ''; 

  try {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?pageNumber=0&pageSize=50`);
    if (!res.ok) throw new Error(res.statusText);
    const deals = await res.json();

    if (deals.length === 0) {
      console.log('No deals found');
      apiContainer.innerHTML = '<p>No deals available at the moment.</p>';
      return;
    }

    const randomIndex = Math.floor(Math.random() * deals.length);
    const randomDeal = deals[randomIndex];

    const heading = document.createElement('h3');
    heading.textContent = "Here's a random game for you!";
    heading.className = 'text-center mb-3';
    apiContainer.appendChild(heading);

    const card = document.createElement('div');
    card.className = 'game-card random-game-card';
    card.innerHTML = `
      <div class="game-image">
        <img src="${randomDeal.thumb}" alt="${randomDeal.internalName}" />
      </div>
      <h3>${randomDeal.title}</h3>
      <p>Price: $${parseFloat(randomDeal.normalPrice).toFixed(2)}</p>
      <p>Sale: $${parseFloat(randomDeal.salePrice).toFixed(2)}</p>
      <p>Critic Score: ${parseFloat(randomDeal.metacriticScore)}%</p>
      <button class="btn btn-success add-to-cart" 
        data-id="${randomDeal.gameID}" 
        data-price="${parseFloat(randomDeal.normalPrice).toFixed(2)}" 
        data-title="${randomDeal.title}" 
        data-thumb="${randomDeal.thumb}">
        Add to Cart
      </button>
      <button class="btn btn-outline-primary add-to-wishlist" data-deal="${randomDeal.dealID}">
        Wishlist
      </button>
      
    `;

    card.onclick = (e) => {
      if (!e.target.matches('button')) {
        sessionStorage.setItem('selectedProduct', randomDeal.gameID);
        window.location.href = 'game-details.html';
      }
    };

    apiContainer.appendChild(card);
  } catch (err) {
    console.error('Error fetching random game:', err);
    apiContainer.innerHTML = '<p>Error loading random game. Please try again.</p>';
  }
}

document.getElementById('random-game').addEventListener('click',showRandomGame);