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
  
  if (serverHistory.length === 0) {
    historyMenu.innerHTML = '<div class="no-favorites">No history yet</div>';
    return;
  }
  
  let html = '<div class="favorites-section"><h3>Recent Servers</h3><ul>';
  
  serverHistory.forEach(server => {
    const date = new Date(server.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    html += `
      <li>
        <button class="favorite-item" data-server-id="${server.id}" title="Last visited: ${formattedDate}">
          <img class="server-icon" src="${server.icon}" alt="">
          <span>${server.name}</span>
        </button>
      </li>
    `;
  });
  
  html += '</ul></div>';
  historyMenu.innerHTML = html;
  
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
