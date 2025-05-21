document.addEventListener('DOMContentLoaded', () => {
  const gameId = sessionStorage.getItem('selectedProduct');
  const thumbnail = sessionStorage.getItem('selectedThumbnail');
  const carouselInner = document.querySelector('#carouselExampleAutoplaying .carousel-inner');
  const titleEl = document.getElementById('game-title');
  const descEl = document.getElementById('game-description');
  const priceEl = document.getElementById('game-price');
  const publisherEl = document.getElementById('game-publisher');
  const developerEl = document.getElementById('game-developer');

  if (!gameId) {
    titleEl.textContent = 'No game selected.';
    return;
  }

  fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`)
    .then(res => res.json())
    .then(data => {
      const info = data.info;

      titleEl.textContent = info.title;

      
      const currentDeals = data.deals || [];
      if (currentDeals.length > 0) {
        const cheapestDeal = currentDeals.reduce((min, deal) =>
          parseFloat(deal.price) < parseFloat(min.price) ? deal : min
        , currentDeals[0]);
        priceEl.textContent = `Current Best Price: $${parseFloat(cheapestDeal.price).toFixed(2)}`;
      } else {
        priceEl.textContent = 'No current deals available.';
      }

      publisherEl.textContent = info.publisher || '—';
      developerEl.textContent = info.developer || '—';

      descEl.innerHTML = descEl.innerHTML
        .replace(/\[GAME TITLE\]/g, info.title)
        .replace(/\[DEVELOPER\]/g, info.developer || 'the developers');

      carouselInner.innerHTML = '';
      if (thumbnail) {
        const slide = document.createElement('div');
        slide.className = 'carousel-item active';
        slide.innerHTML = `
          <img
            src="${thumbnail}"
            class="d-block w-100"
            alt="${info.title} thumbnail"
          />
        `;
        carouselInner.append(slide);
      } else {
        carouselInner.innerHTML = '<p>No images available.</p>';
      }
    })
    .catch(err => {
      console.error(err);
      titleEl.textContent = 'Failed to load game details.';
    });
});