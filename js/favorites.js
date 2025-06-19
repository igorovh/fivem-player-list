import { STORAGE_KEYS } from './utils/constants.js';
import { fetchServer } from './fetch.js';
import { showNotification } from './notifications.js';
import { getSteamId, getDiscordId } from './utils/user.js';

let favorites = [];
let activePlayerKeys = new Set(); 

export const getPlayerKey = (player) => {
  if (player.socials && player.socials.steam) return `steam:${player.socials.steam}`;
  if (player.socials && player.socials.discord) return `discord:${player.socials.discord}`;
  return `name:${player.name}`;
};

const getPlayerKeyFromRow = (row) => {
  const key = row.getAttribute('data-player-key');
  if (key) return key;
  const playerName = row.querySelector('.table-name').textContent;
  const playerId = row.querySelector('.table-id').textContent;
  return `name:${playerName}|id:${playerId}`;
};

export const initFavorites = () => {
  loadFavorites();
  
  document.addEventListener('click', (e) => {
    if (e.target.closest('.table-favorite img')) {
      const row = e.target.closest('tr');
      if (!row) return;
      
      const playerName = row.querySelector('.table-name').textContent;
      const playerKey = getPlayerKeyFromRow(row);
      togglePlayerFavorite(playerKey, playerName, e.target);
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

export const togglePlayerFavorite = (playerKey, playerName, imgElement) => {
  const existingIndex = favorites.findIndex(fav => 
    fav.type === 'player' && fav.key === playerKey
  );
  
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    imgElement.src = 'img/empty-star.svg';
    showNotification(`Player "${playerName}" removed from favorites`, 'info');
  } else {
    favorites.push({
      type: 'player',
      key: playerKey,
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

export const isPlayerFavorite = (playerKey) => {
  return favorites.some(fav => fav.type === 'player' && fav.key === playerKey);
};

export const isServerFavorite = (serverId) => {
  return favorites.some(fav => fav.type === 'server' && fav.id === serverId);
};

export const updateActivePlayers = (players) => {
  activePlayerKeys = new Set(players.map(p => getPlayerKey(p)));
  renderFavoritePlayers();
};

const renderFavoritesMenu = () => {
  const favoritesMenu = document.querySelector('#favorites-menu');
  if (!favoritesMenu) return;

  while (favoritesMenu.firstChild) {
    favoritesMenu.removeChild(favoritesMenu.firstChild);
  }

  const serverFavorites = favorites.filter(fav => fav.type === 'server');
  const playerFavorites = favorites.filter(fav => fav.type === 'player');

  if (serverFavorites.length === 0 && playerFavorites.length === 0) {
    const noFavDiv = document.createElement('div');
    noFavDiv.className = 'no-favorites';
    noFavDiv.textContent = 'No favorites yet';
    favoritesMenu.appendChild(noFavDiv);
  } else {
    if (serverFavorites.length > 0) {
      const section = document.createElement('div');
      section.className = 'favorites-section';
      const h3 = document.createElement('h3');
      h3.textContent = 'Favorite Servers';
      section.appendChild(h3);
      const ul = document.createElement('ul');
      serverFavorites.forEach(server => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'favorite-item';
        button.setAttribute('data-server-id', server.id);

        const img = document.createElement('img');
        img.className = 'server-icon';
        img.src = server.icon || 'https://fivem.net/favicon.png';
        img.alt = '';

        const span = document.createElement('span');
        span.textContent = server.name;

        button.appendChild(img);
        button.appendChild(span);
        li.appendChild(button);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      favoritesMenu.appendChild(section);
    }

    if (playerFavorites.length > 0) {
      const section = document.createElement('div');
      section.className = 'favorites-section';
      const h3 = document.createElement('h3');
      h3.textContent = 'Favorite Players';
      section.appendChild(h3);
      const ul = document.createElement('ul');
      playerFavorites.forEach(player => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'favorite-player';
        span.textContent = `${player.name} (${player.key})`;
        li.appendChild(span);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      favoritesMenu.appendChild(section);
    }
  }

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
      const td = footerRow.querySelector('td');
      if (td) {
        while (td.firstChild) td.removeChild(td.firstChild);
        const span = document.createElement('span');
        span.textContent = 'No favorite players yet. Click on the star icon next to a player to add them to favorites.';
        td.appendChild(span);
      }
    }
    return;
  }

  let index = 1;
  playerFavorites.forEach(player => {
    const isOnline = activePlayerKeys.has(player.key);
    const tr = document.createElement('tr');
    if (!isOnline) {
      tr.classList.add('player-offline');
    }
    tr.setAttribute('data-player-key', player.key);

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
    const starImg = document.createElement('img');
    starImg.src = 'img/star.svg';
    starImg.alt = 'Remove from Favorites';
    starImg.title = 'Remove from Favorites';
    star.appendChild(starImg);
    id.textContent = player.key;
    name.textContent = player.name;
    ping.textContent = isOnline ? 'Online' : 'Offline';

    tr.appendChild(no);
    tr.appendChild(star);
    tr.appendChild(id);
    tr.appendChild(name);
    tr.appendChild(socials);
    tr.appendChild(ping);

    starImg.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlayerFavorite(player.key, player.name, this);
      renderFavoritePlayers();
    });

    if (footerRow && footerRow.parentNode === favoritesTable) {
      favoritesTable.insertBefore(tr, footerRow);
    } else {
      favoritesTable.appendChild(tr);
    }
  });

  if (footerRow) {
    const td = footerRow.querySelector('td');
    if (td) {
      while (td.firstChild) td.removeChild(td.firstChild);
      const span = document.createElement('span');
      span.textContent = `Showing ${playerFavorites.length} favorite player${playerFavorites.length !== 1 ? 's' : ''}.`;
      td.appendChild(span);
    }
  }
};
