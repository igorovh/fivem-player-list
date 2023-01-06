const STEAM_LINK = 'https://steamcommunity.com/profiles/%decId%';

let refreshTime = 31;
let refreshInterval;
let starsIds = [];

let lastId;
let lastPlayers = [];

window.onload = () => {
	const stars = localStorage.getItem('stars');
	if (stars) {
		starsIds.push(...stars.split(';'));
		console.info(`Loaded ${starsIds.length}`);
	}

	const lastId = localStorage.getItem('lastId');
	if (!lastId) return;

	document.querySelector('#input-id').value = lastId;
	updateInfo(lastId);
};

const handleInput = () => {
	const value = document.querySelector('#input-id').value;
	if (!value) return;

	updateInfo(value);
};

const updateInfo = (serverId) => {
	console.info('Getting info from', serverId);
	localStorage.setItem('lastId', serverId);
	lastId = serverId;

	fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`)
		.then((response) => response.json())
		.then((json) => {
			console.debug(`Got info from "${serverId}"`, json);

			document.querySelector('#hostname').textContent = `Players ${json.Data.clients}/${json.Data.sv_maxclients}`;

			lastPlayers = json.Data.players;
			displayPlayers(lastPlayers, true);
		})
		.catch((error) => console.error(error));
};

const displayPlayers = (players, refresh) => {
	const table = document.querySelector('table');

	players.forEach((player) => setSteamId(player));
	players.sort((x, y) => {
		return Number(starsIds.includes(y.steamId)) - Number(starsIds.includes(x.steamId));
	});

	resetTable();
	players.forEach((player) => {
		const tr = document.createElement('tr');

		// Star Start
		const top = document.createElement('th');
		const topText = document.createElement('span');
		topText.textContent = '-';
		topText.title = `This player doesn't have connected Steam account, so it won't work.`;
		if (player.steamId) {
			topText.className = 'star';
			topText.addEventListener('click', () => {
				const arrayId = starsIds.indexOf(player.steamId);
				if (arrayId !== -1) starsIds.splice(arrayId, 1);
				else starsIds.push(player.steamId);

				localStorage.setItem('stars', starsIds.join(';'));
				displayPlayers(lastPlayers, false);
			});
			if (starsIds.includes(player.steamId)) {
				topText.textContent = '⭐';
				topText.title = `Click here to don't show this player on top of the table.`;
			} else {
				topText.textContent = '☆';
				topText.title = `Click here to show this player on top of the table.`;
			}
		}

		top.appendChild(topText);

		// Star End

		const id = document.createElement('th');
		const name = document.createElement('th');
		const steam = document.createElement('th');
		const ping = document.createElement('th');

		id.textContent = player.id;
		name.textContent = player.name;
		steam.textContent = 'no';
		ping.textContent = `${player.ping}ms`;

		if (player.steamId) {
			const steamURL = STEAM_LINK.replace('%decId%', player.steamId);
			const steamLink = document.createElement('a');
			steamLink.href = steamURL;
			steamLink.textContent = 'yes';

			steam.textContent = '';
			steam.appendChild(steamLink);
		}

		tr.appendChild(top);
		tr.appendChild(id);
		tr.appendChild(name);
		tr.appendChild(steam);
		tr.appendChild(ping);

		table.appendChild(tr);
	});
	if (refresh) updateRefresh(lastId);
};

const setSteamId = (player) => {
	const filteredIdentifiers = player.identifiers.filter((identifier) => identifier.startsWith('steam:'));
	if (filteredIdentifiers.length > 0) {
		player.steamId = hexToDecimal(filteredIdentifiers[0].substring(filteredIdentifiers[0].indexOf(':') + 1));
	} else player.steamId = false;
};

const resetTable = () => {
	[...document.querySelector('table').querySelectorAll('tr')]
		.filter((tr) => tr.id !== 'table-top')
		.forEach((tr) => tr.remove());
};

const hexToDecimal = (s) => {
	var i,
		j,
		digits = [0],
		carry;
	for (i = 0; i < s.length; i += 1) {
		carry = parseInt(s.charAt(i), 16);
		for (j = 0; j < digits.length; j += 1) {
			digits[j] = digits[j] * 16 + carry;
			carry = (digits[j] / 10) | 0;
			digits[j] %= 10;
		}
		while (carry > 0) {
			digits.push(carry % 10);
			carry = (carry / 10) | 0;
		}
	}
	return digits.reverse().join('');
};

const updateRefresh = (serverId) => {
	if (refreshInterval) clearInterval(refreshInterval);
	refreshInterval = setInterval(() => {
		if (--refreshTime < 1) {
			refreshTime = 31;
			updateInfo(serverId);
		}
		document.querySelector('#refresh-time').textContent = `Refreshing data in ${refreshTime}s...`;
	}, 1000);
};
