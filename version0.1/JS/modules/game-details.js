
document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');
    if (!gameId) return;
  
    //  element references
    const carouselInner = document.getElementById('carousel-slides');
    const titleEl       = document.getElementById('game-title');
    const descEl        = document.getElementById('game-description');
    const priceEl       = document.getElementById('game-price');
    const publisherEl   = document.getElementById('game-publisher');
    const developerEl   = document.getElementById('game-developer');
  
    //  fetching the game data
    fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`)
      .then(res => res.json())
      .then(data => {
        const info = data.info;
  
        //  updating text content
        titleEl.textContent     = info.title;
        priceEl.textContent     = `$${parseFloat(info.cheapestPriceEver.price).toFixed(2)}`;
        publisherEl.textContent = info.publisher || '—';
        developerEl.textContent = info.developer  || '—';
  
        // replacing placeholders in the description block
        descEl.innerHTML = descEl.innerHTML
          .replace(/\[GAME TITLE\]/g, info.title)
          .replace(/\[DEVELOPER\]/g, info.developer || 'the developers');
  
        //  building carousel slides
        carouselInner.innerHTML = ''; 
        info.screenshots.forEach((shot, i) => {
          const slide = document.createElement('div');
          slide.className = 'carousel-item' + (i === 0 ? ' active' : '');
          slide.innerHTML = `
            <img
              src="${shot.path_full}"
              class="d-block w-100"
              alt="${info.title} screenshot ${i + 1}"
            />
          `;
          carouselInner.append(slide);
        });
      })
      .catch(err => {
        console.error(err);
        titleEl.textContent = 'Failed to load game details.';
      });
  });
  