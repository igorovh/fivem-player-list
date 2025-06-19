import { STORAGE_KEYS } from './utils/constants.js';
import { fetchServer } from './fetch.js';

const MAX_HISTORY_ITEMS = 10;
let serverHistory = [];

export const initHistory = () => {
  loadHistory();
  
  const historyMenu = document.querySelector('#history-menu');
  const historyButton = document.querySelector('#history-button');
  
  if (historyButton && historyMenu) {
    historyButton.addEventListener('click', () => {
      historyMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#history-button') && !e.target.closest('#history-menu')) {
        historyMenu.classList.remove('show');
      }
    });
    
    renderHistoryMenu();
  }
};

export const addToHistory = (serverId, serverName, serverIcon) => {
  if (!serverId) return;
  
  serverHistory = serverHistory.filter(item => item.id !== serverId);
  
  serverHistory.unshift({
    id: serverId,
    name: serverName || `Server ${serverId}`,
    icon: serverIcon || 'https://fivem.net/favicon.png',
    timestamp: Date.now()
  });
  
  if (serverHistory.length > MAX_HISTORY_ITEMS) {
    serverHistory.length = MAX_HISTORY_ITEMS;
  }
  
  saveHistory();
  renderHistoryMenu();
};

const loadHistory = () => {
  const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (storedHistory) {
    try {
      serverHistory = JSON.parse(storedHistory);
    } catch (error) {
      console.error('Failed to parse server history from localStorage:', error);
      serverHistory = [];
    }
  }
};

const saveHistory = () => {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(serverHistory));
};

const renderHistoryMenu = () => {
  const historyMenu = document.querySelector('#history-menu');
  if (!historyMenu) return;

  while (historyMenu.firstChild) {
    historyMenu.removeChild(historyMenu.firstChild);
  }

  if (serverHistory.length === 0) {
    const noFavDiv = document.createElement('div');
    noFavDiv.className = 'no-favorites';
    noFavDiv.textContent = 'No history yet';
    historyMenu.appendChild(noFavDiv);
    return;
  }

  const section = document.createElement('div');
  section.className = 'favorites-section';
  const h3 = document.createElement('h3');
  h3.textContent = 'Recent Servers';
  section.appendChild(h3);
  const ul = document.createElement('ul');

  serverHistory.forEach(server => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'favorite-item';
    button.setAttribute('data-server-id', server.id);

    const date = new Date(server.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    button.title = `Last visited: ${formattedDate}`;

    const img = document.createElement('img');
    img.className = 'server-icon';
    img.src = server.icon;
    img.alt = '';

    const span = document.createElement('span');
    span.textContent = server.name;

    button.appendChild(img);
    button.appendChild(span);
    li.appendChild(button);
    ul.appendChild(li);
  });

  section.appendChild(ul);
  historyMenu.appendChild(section);

  historyMenu.querySelectorAll('.favorite-item').forEach(button => {
    button.addEventListener('click', () => {
      const serverId = button.getAttribute('data-server-id');
      if (serverId) {
        fetchServer(serverId);
        historyMenu.classList.remove('show');
      }
    });
  });
};

export const clearHistory = () => {
  serverHistory = [];
  saveHistory();
  renderHistoryMenu();
};
