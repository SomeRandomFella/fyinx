const searchBar = document.getElementById("searchGames");

function loadGames(filter = "") {
  fetch("js/json/g.json")
    .then((res) => res.json())
    .then((games) => {
      const container = document.getElementById("games-container");
      container.innerHTML = "";
      const statusEl = document.getElementById("gameStatus");
      const grid = document.createElement("div");
      grid.className = "games-grid";

      const filteredGames = games.filter((g) =>
        g.name.toLowerCase().includes(filter.toLowerCase())
      );

      let loaded = 0;
      const total = filteredGames.length;
      statusEl.textContent = `loading ${loaded}/${total} games...`;

      if (filteredGames.length === 0) {
        return (statusEl.textContent = "No games found");
      }

      filteredGames.forEach((game, index) => {
        setTimeout(() => {
          const card = document.createElement("div");
          card.className = "game-card";
          const img = document.createElement("img");
          img.src = `img/games/${game.id}.webp`;
          img.alt = game.name;
          img.onerror = () => (img.src = "img/games/default.webp");
          const name = document.createElement("span");
          name.textContent = game.name;
          card.appendChild(img);
          card.appendChild(name);
          card.addEventListener("click", () => openGame(game.name, game.url));
          grid.appendChild(card);
          loaded++;
          statusEl.textContent =
            loaded < total
              ? `loading ${loaded}/${total} games...`
              : `showing ${total} games`;
        }, index * 10);
      });

      container.appendChild(grid);
    }) // imagine having error handling
    .catch((err) => {
      console.error("error loading games:", err);
      document.getElementById("gameStatus").textContent = "error loading games";
    });
}

loadGames();

// omg searching!! 
let searchTimeout;

searchBar.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadGames(searchBar.value);
  }, 300);
});
