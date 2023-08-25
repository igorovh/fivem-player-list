import { setServerInfo, setTitle } from './server.js';
import { getDiscordId, getSteamId } from './utils/user.js';
import { isSearching, serachPlayers } from './serach.js';

const refreshButton = document.querySelector('#refresh-button');

let currentPlayers;

export const getPlayers = () => currentPlayers;

export const fetchServer = (serverId) => {
	setTitle('Loading server data from FiveM API...');
	seconds = 30;
	refreshButton.onclick = () => fetchServer(serverId);
	const url = `https://servers-frontend.fivem.net/api/servers/single/${serverId}`;
	console.info(`Fetching server info`, serverId, url);
	fetch(url, {
		headers: {
			Accept: '*/*',
			'Content-Type': 'application/json',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
		},
	})
		.then((response) => response.json())
		.then((json) => {
			setServerInfo(serverId, json.Data);
			let playersFetch = false; //Todo
			let url = `https://servers-frontend.fivem.net/api/servers/single/${serverId}`;
			fetchPlayers(url, playersFetch);
			startFetcher(serverId);
		})
		.catch((error) => console.error(error));
};

const refreshTimer = document.querySelector('#refresh-timer');
let fetcher;
let seconds = 30;

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
	fetch(url, {
		headers: {
			Accept: '*/*',
			'Content-Type': 'application/json',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
		},
	})
		.then((response) => response.json())
		.then((json) => {
			let players = playersFetch ? json : json.Data.players;
			players = formatPlayers(players);
			currentPlayers = players;
			renderPlayers(players);
		})
		.catch((error) => console.error(error));
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

const table = document.querySelector('table');

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

		const no = document.createElement('td');
		// const star = document.createElement('td');
		const id = document.createElement('td');
		const name = document.createElement('td');
		const socials = document.createElement('td');
		const ping = document.createElement('td');

		no.className = 'table-no';
		// star.className = 'table-favorite';
		id.className = 'table-id';
		name.className = 'table-name';
		socials.className = 'table-socials';
		ping.className = 'table-ping';

		no.textContent = index++ + '.';
		// star.innerHTML = `<img src="img/empty-star.svg" alt="Add to Favorites" title="Add to Favorites">`;
		id.textContent = player.id;
		name.textContent = player.name;
		ping.textContent = `${player.ping}ms`;

		if (player.socials.steam) {
			const link = document.createElement('a');
			link.href = STEAM_LINK.replace('%id%', player.socials.steam);
			link.target = '_blank';
			link.innerHTML = '<img src="img/steam.svg" alt="Steam">';
			socials.appendChild(link);
		}
		if (player.socials.discord) {
			const link = document.createElement('a');
			link.href = DISCORD_LINK.replace('%id%', player.socials.discord);
			link.target = '_blank';
			link.innerHTML = '<img src="img/discord.svg" alt="Discord">';
			socials.appendChild(link);
		}

		tr.appendChild(no);
		// tr.appendChild(star);
		tr.appendChild(id);
		tr.appendChild(name);
		tr.appendChild(socials);
		tr.appendChild(ping);

		table.appendChild(tr);
	});
	// Footer
	table.innerHTML += `
        <tr class="table-footer" style="background: #171717">
            <td rowspan="5">
                <span>This page is not affiliated with FiveM or any other server.</span><br />
                <span>Created by <a href="https://github.com/igorovh" target="_blank">igorovh</a>.</span>
            </th>
        </tr>`;
	if (isSearching() && !search) serachPlayers();
};
