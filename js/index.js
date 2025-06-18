import { fetchServer } from './fetch.js';
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
			const value = serverIdSearch.value.trim();
			if (value.length < 1) {
				showNotification('Please enter a server ID', 'warning');
				return;
			}
			fetchServer(value);
			setId(value);
			console.info('Fetching by input.');
		}
	});
	
	document.querySelector('#server-id-button').onclick = () => {
		const value = serverIdSearch.value.trim();
		if (value.length < 1) {
			showNotification('Please enter a server ID', 'warning');
			return;
		}
		fetchServer(value);
		setId(value);
		console.info('Fetching by input.');
	};

	const url = new URL(window.location.href);
	if (url.searchParams.has('serverId')) {
		const serverId = url.searchParams.get('serverId');
		if (serverId && /^[a-zA-Z0-9]+$/.test(serverId)) {
			fetchServer(serverId);
			setId(serverId);
			console.info('Fetching by URL.');
			return;
		} else {
			showNotification('Invalid server ID in URL', 'error');
		}
	}

	const storageServerId = localStorage.getItem(STORAGE_KEYS.SERVER_ID);
	if (storageServerId) {
		fetchServer(storageServerId);
		setId(storageServerId);
		console.info('Fetching by localStorage.');
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
