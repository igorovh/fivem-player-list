import { STORAGE_KEYS } from './utils/constants.js';
import { fetchServer } from './fetch.js';
import { showNotification } from './notifications.js';

let favorites = [];
let activePlayerIds = new Set(); 

export const initFavorites = () => {
  loadFavorites();
  
  document.addEventListener('click', (e) => {
    if (e.target.closest('.table-favorite img')) {
      const row = e.target.closest('tr');
      if (!row) return;
      
      const playerId = row.querySelector('.table-id').textContent;
      const playerName = row.querySelector('.table-name').textContent;
      
      togglePlayerFavorite(playerId, playerName, e.target);
    }
  });
  
  const favoritesMenu = document.querySelector('#favorites-menu');
  if (favoritesMenu) {
    renderFavoritesMenu();
    
    const favoritesButton = document.querySelector('#favorites-button');
    if (favoritesButton) {
      favoritesButton.addEventListener('click', () => {
        favoritesMenu.classList.toggle('show');
      });
      
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#favorites-button') && !e.target.closest('#favorites-menu')) {
          favoritesMenu.classList.remove('show');
        }
      });
    }
  }

  // Render favorite players initially
  renderFavoritePlayers();
};

const loadFavorites = () => {
  const storedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  if (storedFavorites) {
    try {
      favorites = JSON.parse(storedFavorites);
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      favorites = [];
    }
  }
};

const saveFavorites = () => {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
};

export const toggleServerFavorite = (serverId, serverName, serverIcon) => {
  const existingIndex = favorites.findIndex(fav => 
    fav.type === 'server' && fav.id === serverId
  );
  
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    showNotification(`Server "${serverName}" removed from favorites`, 'info');
  } else {
    favorites.push({
      type: 'server',
      id: serverId,
      name: serverName,
      icon: serverIcon,
      timestamp: Date.now()
    });
    showNotification(`Server "${serverName}" added to favorites`, 'success');
  }
  
  saveFavorites();
  renderFavoritesMenu();
};

export const togglePlayerFavorite = (playerId, playerName, imgElement) => {
  const existingIndex = favorites.findIndex(fav => 
    fav.type === 'player' && fav.id === playerId
  );
  
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    imgElement.src = 'img/empty-star.svg';
    showNotification(`Player "${playerName}" removed from favorites`, 'info');
  } else {
    favorites.push({
      type: 'player',
      id: playerId,
      name: playerName,
      timestamp: Date.now()
    });
    imgElement.src = 'img/star.svg';
    showNotification(`Player "${playerName}" added to favorites`, 'success');
  }
  
  saveFavorites();
  renderFavoritesMenu();
  renderFavoritePlayers();
};

export const isPlayerFavorite = (playerId) => {
  return favorites.some(fav => fav.type === 'player' && fav.id === playerId);
};

export const isServerFavorite = (serverId) => {
  return favorites.some(fav => fav.type === 'server' && fav.id === serverId);
};

export const updateActivePlayers = (players) => {
  activePlayerIds = new Set(players.map(p => p.id.toString()));
  renderFavoritePlayers();
};

const renderFavoritesMenu = () => {
  const favoritesMenu = document.querySelector('#favorites-menu');
  if (!favoritesMenu) return;
  
  const serverFavorites = favorites.filter(fav => fav.type === 'server');
  const playerFavorites = favorites.filter(fav => fav.type === 'player');
  
  let html = '';
  
  if (serverFavorites.length === 0 && playerFavorites.length === 0) {
    html = '<div class="no-favorites">No favorites yet</div>';
  } else {
    if (serverFavorites.length > 0) {
      html += '<div class="favorites-section"><h3>Favorite Servers</h3><ul>';
      serverFavorites.forEach(server => {
        html += `
          <li>
            <button class="favorite-item" data-server-id="${server.id}">
              <img class="server-icon" src="${server.icon || 'https://fivem.net/favicon.png'}" alt="">
              <span>${server.name}</span>
            </button>
          </li>
        `;
      });
      html += '</ul></div>';
    }
    
    if (playerFavorites.length > 0) {
      html += '<div class="favorites-section"><h3>Favorite Players</h3><ul>';
      playerFavorites.forEach(player => {
        html += `
          <li>
            <span class="favorite-player">${player.name} (ID: ${player.id})</span>
          </li>
        `;
      });
      html += '</ul></div>';
    }
  }
  
  favoritesMenu.innerHTML = html;
  
  favoritesMenu.querySelectorAll('.favorite-item').forEach(button => {
    button.addEventListener('click', () => {
      const serverId = button.getAttribute('data-server-id');
      if (serverId) {
        fetchServer(serverId);
        favoritesMenu.classList.remove('show');
      }
    });
  });
};

export const renderFavoritePlayers = () => {
  const favoritesTable = document.getElementById('favorites-table');
  if (!favoritesTable) return;

  const headerRow = favoritesTable.querySelector('#favorites-table-header');
  const rows = [...favoritesTable.querySelectorAll('tr')];
  const footerRow = favoritesTable.querySelector('.table-footer');

  rows.forEach(row => {
    if (row !== headerRow && row !== footerRow) {
      row.remove();
    }
  });

  const playerFavorites = favorites.filter(fav => fav.type === 'player');
  
  if (playerFavorites.length === 0) {
    if (footerRow) {
      footerRow.querySelector('td').innerHTML = '<span>No favorite players yet. Click on the star icon next to a player to add them to favorites.</span>';
    }
    return;
  }

  let index = 1;
  playerFavorites.forEach(player => {
    const isOnline = activePlayerIds.has(player.id);
    const tr = document.createElement('tr');
    if (!isOnline) {
      tr.classList.add('player-offline');
    }

    const no = document.createElement('td');
    const star = document.createElement('td');
    const id = document.createElement('td');
    const name = document.createElement('td');
    const socials = document.createElement('td');
    const ping = document.createElement('td');

    no.className = 'table-no';
    star.className = 'table-favorite';
    id.className = 'table-id';
    name.className = 'table-name';
    socials.className = 'table-socials';
    ping.className = 'table-ping';

    no.textContent = index++ + '.';
    star.innerHTML = `<img src="img/star.svg" alt="Remove from Favorites" title="Remove from Favorites">`;
    id.textContent = player.id;
    name.textContent = player.name;
    ping.textContent = isOnline ? 'Online' : 'Offline';

    tr.appendChild(no);
    tr.appendChild(star);
    tr.appendChild(id);
    tr.appendChild(name);
    tr.appendChild(socials);
    tr.appendChild(ping);

    tr.querySelector('.table-favorite img').addEventListener('click', function() {
      togglePlayerFavorite(player.id, player.name, this);
      renderFavoritePlayers();
    });

    if (footerRow && footerRow.parentNode === favoritesTable) {
      favoritesTable.insertBefore(tr, footerRow);
    } else {
      favoritesTable.appendChild(tr);
    }
  });

  if (footerRow) {
    footerRow.querySelector('td').innerHTML = `<span>Showing ${playerFavorites.length} favorite player${playerFavorites.length !== 1 ? 's' : ''}.</span>`;
  }
};
