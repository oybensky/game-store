const freetogameContainer = document.getElementById('freetogameContainer');
let ftgPageNumber = 0;
let isFTGFetching = false;
const proxy = "https://cors-anywhere.herokuapp.com/"; //To run, you need to get the automatic permission
const apiUrl = `${proxy}https://www.freetogame.com/api/games?start=${ftgPageNumber * 20}&limit=20`;


async function loadFreeToPlayGames() {
  if (isFTGFetching) return;
  isFTGFetching = true;

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
    console.log("library2.js is loading");

    const games = await response.json();

    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-card';

      card.innerHTML = `
        <div class="game-image">
          <img src="${game.thumbnail}" alt="${game.title}" />
        </div>
        <h3>${game.title}</h3>
        <p>Genre: ${game.genre}</p>
        <p>Platform: ${game.platform}</p>
        <a href="${game.game_url}" target="_blank" class="btn btn-primary">Play Now</a>
        <button class="btn btn-success add-to-cart" 
                data-id="ftg-${game.id}" 
                data-title="${game.title}" 
                data-thumb="${game.thumbnail}" 
                data-price="0.00">Add to Cart</button>
        <button class="btn btn-primary add-to-wishlist"
        data-id="ftg-${game.id}"
        data-title="${game.title}"
        data-thumb="${game.thumbnail}"
        data-price="0.00">
  Wishlist
</button>
      `;

      card.onclick = (e) =>{
        if(!e.target.matches('button')){
          window.location.href = 'game-details.html';
        }
      };

      freetogameContainer.appendChild(card);
    });

    ftgPageNumber++;
  } catch (err) {
    console.error("Failed to fetch FreeToGame games:", err);
  } finally {
    isFTGFetching = false;
  }
}
function initButtons() {
  document.body.addEventListener('click', e => {
    e.stopPropagation();

    let key = null;
    let id = null;
    let item = null;

    if (e.target.matches('.add-to-cart')) {
      key = 'cart';
      id = e.target.dataset.id;
      item = {
        id,
        title: e.target.dataset.title,
        thumb: e.target.dataset.thumb,
        normalPrice: parseFloat(e.target.dataset.price)
      };

    }     
    function showToast(message) {
      const toastEl = document.getElementById('cartToast');
      const toastBody = toastEl.querySelector('.toast-body');
      toastBody.textContent = message;

      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }

    if (e.target.matches('.add-to-wishlist')) {
      key = 'wishlist';
      id = e.target.dataset.id;
    }

    if (!key || !id) return;

    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (key === 'cart') {
      const exists = stored.some(game => game.id === id);
      if (!exists) {
        stored.push(item);
        localStorage.setItem(key, JSON.stringify(stored));
        showToast("Added to cart!");
      } else {
        showToast("This game is already in your cart.");
      }
    }
if (key === 'wishlist') {
  const exists = stored.some(game => game.id === id);
  if (!exists) {
    const wishlistItem = {
      id,
      title: e.target.dataset.title || `Game #${id}`,
      thumb: e.target.dataset.thumb || 'images/placeholder.jpg',
      price: e.target.dataset.price || '0.00'
    };
    stored.push(wishlistItem);
    localStorage.setItem(key, JSON.stringify(stored));
    showToast("Added to wishlist!");
  } else {
    showToast("This game is already in your wishlist.");
  }
}

  });
}
document.addEventListener('DOMContentLoaded', () => {
  loadFreeToPlayGames();
  initButtons();
});