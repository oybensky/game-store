// library.js
const apiKey = "8dcc7e4ee8dc43d3aadc429278b91b94";
let trendingPage = 1;
let recommendedPage = 1;
let isFetchingTrending = false;
let isFetchingRecommended = false;

const trendingContainer = document.getElementById("trendingGamesContainer");
const recommendedContainer = document.getElementById("recommendedGamesContainer");


function createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

  
    const imageUrl = game.background_image || "https://via.placeholder.com/300x200.png?text=No+Image";

    card.innerHTML = `
        <div class="game-image">
            <img src="${imageUrl}" alt="${game.name}" />
        </div>
        <h3>${game.name}</h3>
        <p>Studio: Placeholder Studio</p>
        <p>Rating: ${game.rating}</p>
        <p>Price: $${(Math.random() * 60 + 10).toFixed(2)}</p>
        <button class="btn btn-success">Add to Cart</button>
        <button class="btn btn-outline-primary">Add to Wishlist</button>
    `;

    return card;
}


async function loadTrendingGames() {
    if (isFetchingTrending) return;
    isFetchingTrending = true;

    try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page=${trendingPage}`);
        const data = await response.json();

        data.results.forEach(game => {
            trendingContainer.appendChild(createGameCard(game));
        });

        trendingPage++;
    } catch (error) {
        console.error("Error loading trending games:", error);
    } finally {
        isFetchingTrending = false;
    }
}

// Fetch recommended games
async function loadRecommendedGames() {
    if (isFetchingRecommended) return;
    isFetchingRecommended = true;

    try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page=${recommendedPage + 5}`);
        const data = await response.json();

        data.results.forEach(game => {
            recommendedContainer.appendChild(createGameCard(game));
        });

        recommendedPage++;
    } catch (error) {
        console.error("Error loading recommended games:", error);
    } finally {
        isFetchingRecommended = false;
    }
}

// Detect when scrolling hits bottom
window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadTrendingGames();
        loadRecommendedGames();
    }
});

// Initial load
loadTrendingGames();
loadRecommendedGames();