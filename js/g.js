//findsmy games in my json file, loading them one by one.
fetch('js/json/g.json')
    .then(response => response.json())
    .then(games => {
        const container = document.getElementById('games-container');
        const statusEl = document.getElementById('gameStatus');
        const grid = document.createElement('div');
        grid.className = 'games-grid';
        
        let loaded = 0;
        const total = games.length;
        
        statusEl.textContent = `loading ${loaded}/${total} games...`;
        //loads the games on a grid
        games.forEach((game, index) => {
            setTimeout(() => {
                const card = document.createElement('div');
                card.className = 'game-card';
                
                const img = document.createElement('img');
                img.src = `img/games/${game.id}.webp`;
                img.alt = game.name;
                img.onerror = function() {
                    this.src = 'img/games/default.webp';
                };
                
                const name = document.createElement('span');
                name.textContent = game.name;
                
                card.appendChild(img);
                card.appendChild(name);
                
                card.addEventListener('click', () => {
                    openGame(game.name, game.url);
                });
                
                grid.appendChild(card);
                
                loaded++;
                if (loaded < total) {
                    statusEl.textContent = `loading ${loaded}/${total} games...`;
                } else {
                    statusEl.textContent = `showing ${total} games`;
                }
            }, index * 10);
        });
        
        container.appendChild(grid);
    })
    //this shows if the games broke or smth.
    .catch(error => {
        console.error('error loading games:', error);
        document.getElementById('gameStatus').textContent = 'error loading games';
    });
