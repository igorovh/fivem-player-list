import { fetchServer, isValidServerId, extractServerId } from './fetch.js';
import { initializeSearch } from './search.js';
import { initTheme } from './theme.js';
import { initFavorites } from './favorites.js';
import { initHistory, addToHistory } from './history.js';
import { initStatistics, updateCharts } from './statistics.js';
import { showNotification } from './notifications.js';
import { STORAGE_KEYS } from './utils/constants.js';
import { initTabs } from './tabs.js';

// FiveCity vp4rxq
// Pixa vqkdxx

window.addEventListener('DOMContentLoaded', () => {
	// Old ID Fix
	if (localStorage.getItem(STORAGE_KEYS.LAST_ID)) {
		localStorage.setItem(STORAGE_KEYS.SERVER_ID, localStorage.getItem(STORAGE_KEYS.LAST_ID));
		localStorage.removeItem(STORAGE_KEYS.LAST_ID);
	}

	// Initialize features
	initializeSearch();
	initTheme();
	initFavorites();
	initHistory();
	initStatistics();
	initTabs();

	// Server Id Search
	const serverIdSearch = document.querySelector('#server-id');
	serverIdSearch.addEventListener('keyup', (event) => {
		if (event.key === 'Enter' || event.keyCode === 13) {
			const rawValue = serverIdSearch.value.trim();
			if (rawValue.length < 1) {
				showNotification('Please enter a server ID', 'warning');
				return;
			}
			const value = extractServerId(rawValue);
			if (!isValidServerId(value)) {
				showNotification('Please enter a valid server ID', 'error');
				return;
			}
			fetchServer(value);
			setId(value);
			console.info('Fetching by input.');
		}
	});
	
	document.querySelector('#server-id-button').onclick = () => {
		const rawValue = serverIdSearch.value.trim();
		if (rawValue.length < 1) {
			showNotification('Please enter a server ID', 'warning');
			return;
		}
		const value = extractServerId(rawValue);
		if (!isValidServerId(value)) {
			showNotification('Please enter a valid server ID', 'error');
			return;
		}
		fetchServer(value);
		setId(value);
		console.info('Fetching by input.');
	};

	const url = new URL(window.location.href);
	if (url.searchParams.has('serverId')) {
		const rawServerId = url.searchParams.get('serverId');
		const serverId = extractServerId(rawServerId);
		if (serverId && isValidServerId(serverId)) {
			fetchServer(serverId);
			setId(serverId);
			console.info('Fetching by URL.');
			return;
		} else {
			showNotification('Please enter a valid server ID', 'error');
		}
	}

	const storageServerId = localStorage.getItem(STORAGE_KEYS.SERVER_ID);
	if (storageServerId) {
		const serverId = extractServerId(storageServerId);
		if (isValidServerId(serverId)) {
			fetchServer(serverId);
			setId(serverId);
			console.info('Fetching by localStorage.');
		} else {
			localStorage.removeItem(STORAGE_KEYS.SERVER_ID);
			showNotification('Enter a server ID to get started', 'info', 8000);
		}
	} else {
		// First time user hint
		showNotification('Enter a server ID to get started', 'info', 8000);
	}
});

const setId = (serverId) => {
	const url = new URL(window.location.href);
	url.searchParams.set('serverId', serverId);
	window.history.replaceState(null, null, url);
	localStorage.setItem(STORAGE_KEYS.SERVER_ID, serverId);
	
	// Add to history when a server is selected
	const serverName = document.querySelector('#server-name').textContent;
	const serverIcon = document.querySelector('#server-icon').src;
	addToHistory(serverId, serverName, serverIcon);
};
