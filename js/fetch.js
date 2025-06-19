import { setServerInfo, setTitle } from './server.js';
import { getDiscordId, getSteamId } from './utils/user.js';
import { isSearching, searchPlayers, checkPendingSearch } from './search.js';
import { API_BASE_URL, DEFAULT_HEADERS } from './utils/constants.js';
import { updateActivePlayers, isPlayerFavorite } from './favorites.js';
import { getPlayerKey } from './favorites.js'; // Ajouté pour générer la clé stable

const refreshButton = document.querySelector('#refresh-button');
const loader = document.querySelector('#loader');
const table = document.querySelector('table');
const refreshTimer = document.querySelector('#refresh-timer');

let currentPlayers;
let fetcher;
let seconds = 30;

export const getPlayers = () => currentPlayers;

export const fetchServer = (serverId) => {
	try {
		if (!isValidServerId(serverId)) {
			showNotification('Invalid server ID format', 'error');
			return;
		}

		setTitle('Loading server data from FiveM API...');
		seconds = 30;

		showLoader(true);

		refreshButton.onclick = () => fetchServer(serverId);
		const url = `${API_BASE_URL}/servers/single/${serverId}`;
		console.info(`Fetching server info`, serverId, url);

		fetch(url, { headers: DEFAULT_HEADERS })
			.then(handleResponse)
			.then((json) => {
				setServerInfo(serverId, json.Data);
				let playersFetch = false; //Todo
				let url = `${API_BASE_URL}/servers/single/${serverId}`;
				fetchPlayers(url, playersFetch);
				startFetcher(serverId);
				showNotification('Server data loaded successfully', 'success');
			})
			.catch((error) => {
				console.error(error);
				setTitle('Error loading server data');
				showNotification('Failed to load server data', 'error');
				showLoader(false);
			});
	} catch (error) {
		console.error('Error in fetchServer:', error);
		showNotification('An unexpected error occurred', 'error');
		showLoader(false);
	}
};

const startFetcher = (serverId) => {
	console.log(`Starting fetcher at ${seconds} seconds`);
	if (fetcher) clearInterval(fetcher);
	fetcher = setInterval(() => {
		refreshTimer.textContent = seconds + 's';
		if (seconds < 1) {
			clearInterval(fetcher);
			fetchServer(serverId);
		}
		seconds--;
	}, 1000);
};

const fetchPlayers = (url, playersFetch = false) => {
	console.info('Fetching players with method:', playersFetch ? 'players.json' : 'normal', url);
	fetch(url, { headers: DEFAULT_HEADERS })
		.then(handleResponse)
		.then((json) => {
			let players = playersFetch ? json : json.Data.players;
			players = formatPlayers(players);

			// Only update if players changed
			if (!arraysEqual(currentPlayers, players)) {
				currentPlayers = players;
				renderPlayers(players);
				updateActivePlayers(players);
				checkPendingSearch();
			}

			showLoader(false);
		})
		.catch((error) => {
			console.error(error);
			showNotification('Failed to load player data', 'error');
			showLoader(false);
		});
};

const handleResponse = (response) => {
	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	return response.json();
};

const formatPlayers = (players) => {
	const formattedPlayers = [];
	players.forEach((player) => {
		const socials = {};

		if (player.identifiers) {
			const steamIdentifier = getSteamId(player.identifiers);
			if (steamIdentifier) socials.steam = steamIdentifier;

			const discordIdentifier = getDiscordId(player.identifiers);
			if (discordIdentifier) socials.discord = discordIdentifier;
		}

		formattedPlayers.push({
			name: player.name,
			id: player.id,
			socials,
			ping: player.ping,
		});
	});
	return formattedPlayers.sort((a, b) => a.id - b.id);
};

const resetTable = () => {
	[...table.querySelectorAll('tr')].filter((tr) => tr.id !== 'table-header').forEach((tr) => tr.remove());
};

const STEAM_LINK = 'https://steamcommunity.com/profiles/%id%';
const DISCORD_LINK = 'https://discord.com/users/%id%';

export const renderPlayers = (players, search = false) => {
	resetTable();

	console.info('Rendering new players', players.length);
	let index = 1;
	players.forEach((player) => {
		const tr = document.createElement('tr');
		// Ajoute la clé stable comme attribut pour la gestion des favoris
		const playerKey = getPlayerKey(player);
		tr.setAttribute('data-player-key', playerKey);

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
		const isFavorite = isPlayerFavorite(playerKey);

		const starImg = document.createElement('img');
		starImg.src = isFavorite ? 'img/star.svg' : 'img/empty-star.svg';
		starImg.alt = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
		starImg.title = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
		star.appendChild(starImg);

		id.textContent = player.id;
		name.textContent = player.name;
		ping.textContent = `${player.ping}ms`;

		if (player.socials.steam) {
			const link = document.createElement('a');
			link.href = STEAM_LINK.replace('%id%', player.socials.steam);
			link.target = '_blank';
			const steamImg = document.createElement('img');
			steamImg.src = 'img/steam.svg';
			steamImg.alt = 'Steam';
			link.appendChild(steamImg);
			socials.appendChild(link);
		}
		if (player.socials.discord) {
			const link = document.createElement('a');
			link.href = DISCORD_LINK.replace('%id%', player.socials.discord);
			link.target = '_blank';
			const discordImg = document.createElement('img');
			discordImg.src = 'img/discord.svg';
			discordImg.alt = 'Discord';
			link.appendChild(discordImg);
			socials.appendChild(link);
		}

		tr.appendChild(no);
		tr.appendChild(star);
		tr.appendChild(id);
		tr.appendChild(name);
		tr.appendChild(socials);
		tr.appendChild(ping);

		table.appendChild(tr);
	});
	const footerTr = document.createElement('tr');
	footerTr.className = 'table-footer';
	footerTr.style.background = '#171717';

	const footerTd = document.createElement('td');
	footerTd.rowSpan = 5;

	const span1 = document.createElement('span');
	span1.textContent = 'This page is not affiliated with FiveM or any other server.';
	footerTd.appendChild(span1);
	footerTd.appendChild(document.createElement('br'));

	const span2 = document.createElement('span');
	span2.appendChild(document.createTextNode('Created by '));

	const link = document.createElement('a');
	link.href = 'https://github.com/igorovh';
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = 'igorovh';

	span2.appendChild(link);
	span2.appendChild(document.createTextNode('.'));

	footerTd.appendChild(span2);
	footerTr.appendChild(footerTd);
	table.appendChild(footerTr);

	if (isSearching() && !search) searchPlayers();
};

const isValidServerId = (serverId) => {
	return typeof serverId === 'string' && /^[a-zA-Z0-9]+$/.test(serverId);
};

const arraysEqual = (a, b) => {
	if (!a || !b) return false;
	if (a.length !== b.length) return false;

	// Simple comparison of player IDs and names
	const aIds = a.map((p) => `${p.id}-${p.name}-${p.ping}`).sort();
	const bIds = b.map((p) => `${p.id}-${p.name}-${p.ping}`).sort();

	return JSON.stringify(aIds) === JSON.stringify(bIds);
};

const showLoader = (isVisible) => {
	if (loader) {
		loader.style.display = isVisible ? 'flex' : 'none';
	}
};

// Notification system
const showNotification = (message, type) => {
	if (window.createNotification) {
		window.createNotification({
			message,
			type,
			duration: 3000,
		});
	}
};
