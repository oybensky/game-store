document.addEventListener('DOMContentLoaded', () => {
  loadWishlist();
  setupButtonListeners();
});

// loading wishlist items from localStorage and display them
async function loadWishlist() {
  //get the wishlistContainer 
  const wishlistContainer = document.getElementById('wishlistContainer');

  // clear the container
  wishlistContainer.innerHTML = '';

  const wishlistRaw = JSON.parse(localStorage.getItem('wishlist') || '[]');

  // Normalize to string IDs
  const wishlistIds = wishlistRaw.map(item => typeof item === 'string' ? item : item.id);
  const ftgGames = wishlistRaw.filter(item => typeof item === 'object' && item.id?.startsWith('ftg-'));

  ftgGames.forEach(game => {
    const item = createWishlistItem(
      game.id,
      game.thumb || 'images/placeholder.jpg',
      game.title || `Game #${game.id}`,
      game.price || '0.00',
      false // not a deal
    );
    wishlistContainer.appendChild(item);
  });
  // check if wishlist is empty
  if (wishlistIds.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-center my-5';
    emptyMsg.innerHTML = `
        <i class="bi bi-heart text-danger mb-3" style="font-size: 3rem;"></i>
        <h4>Your wishlist is empty</h4>
        <p>Find games you like in the <a href="library.html" class="text-white">library</a> and add them to your wishlist!</p>
      `;
    wishlistContainer.appendChild(emptyMsg);
    return;
  }

  // load catalog items
  try {
    const catalogRes = await fetch('./data/product-catalog.json');
    if (!catalogRes.ok) throw new Error(`HTTP error ${catalogRes.status}`);
    const { categories, products } = await catalogRes.json();

    // filter products that are in the wishlist
    const wishlistProducts = products.filter(p => wishlistIds.includes(p.itemId));

    // add catalog items to wishlist
    wishlistProducts.forEach(p => {
      const item = createWishlistItem(
        p.itemId,
        p.thumbnailImage,
        p.itemTitle,
        p.unitPrice,
        false
      );
      wishlistContainer.appendChild(item);
    });

    // load API deals
    const apiRes = await fetch('https://www.cheapshark.com/api/1.0/deals?pageNumber=0&pageSize=50');
    if (!apiRes.ok) throw new Error(`API error ${apiRes.status}`);
    const deals = await apiRes.json();

    // filter deals that are in the wishlist
    const wishlistDeals = deals.filter(d => wishlistIds.includes(d.dealID));

    // API deals to wishlist
    wishlistDeals.forEach(d => {
      const item = createWishlistItem(
        d.dealID,
        d.thumb,
        d.title,
        d.salePrice,
        true
      );
      wishlistContainer.appendChild(item);
    });

    // If no items were found, showing message for missing items
    if (wishlistProducts.length === 0 && wishlistDeals.length === 0 && wishlistIds.length > 0) {
      // some IDs in wishlist didn't match any products/deals
      const unknownIds = wishlistIds.filter(id =>
        !products.some(p => p.itemId === id) &&
        !deals.some(d => d.dealID === id) &&
        !id.startsWith('ftg-')
      );

      unknownIds.forEach(id => {
        const item = createWishlistItem(
          id,
          'images/placeholder.jpg',
          `Game #${id.substring(0, 8)}...`,
          0,
          false
        );
        wishlistContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Error loading wishlist:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'alert alert-danger';
    errorMsg.textContent = `Couldn't load wishlist: ${err.message}`;
    wishlistContainer.appendChild(errorMsg);
  }
}

// creating a wishlist item element
function createWishlistItem(id, image, title, price, isDeal) {
  const item = document.createElement('div');
  item.className = 'wishlistItem';

  item.innerHTML = `
      <img src="${image}" alt="${title}" onerror="this.src='images/placeholder.jpg'">
      <div class="wishlistDetails">
        <h3 class="wishlistGameName">${title}</h3>
        <p class="wishlistGamePrice">$${parseFloat(price).toFixed(2)}</p>
      </div>
      <div class="wishlistActions">
        <button class="btn btn-outline-danger btn-sm remove-wishlist" data-id="${id}">Remove</button>
        <button class="btn btn-success btn-sm add-to-cart" ${isDeal ? `data-deal="${id}"` : `data-id="${id}"`}>Add to Cart</button>
      </div>
    `;

  return item;
}

// set up button click handlers
function setupButtonListeners() {
  document.body.addEventListener('click', e => {
    // Handle remove from wishlist
    if (e.target.matches('.remove-wishlist')) {
      const id = e.target.dataset.id;
      removeFromWishlist(id);
    }

    // Handle add to cart from wishlist page
    if (e.target.matches('.add-to-cart')) {
      const id = e.target.dataset.deal || e.target.dataset.id;
      addToCart(id);
    }
  });
}

// remove item from wishlist
function removeFromWishlist(id) {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  const updatedWishlist = wishlist.filter(item => {
    if (typeof item === 'string') {
      return item !== id;
    } else if (typeof item === 'object') {
      return item.id !== id;
    }
    return true; // Keep unknown types just in case
  });

  localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  loadWishlist(); // Reload the wishlist display
} 

// add item to cart
function addToCart(id) {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // Check if item already exists in cart
  const exists = cart.some(item => {
    if (typeof item === 'string') return item === id;
    if (typeof item === 'object') return item.id === id;
    return false;
  });

  if (exists) {
    alert('This game is already in your cart.');
    return;
  }

  // Try to find FTG item from wishlist
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const ftgItem = wishlist.find(item =>
    typeof item === 'object' && item.id === id
  );

  if (ftgItem) {
    cart.push(ftgItem); // Add full FTG item
  } else {
    cart.push(id); // Just push the ID
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
}
