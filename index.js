const STEAM_LINK = 'https://steamcommunity.com/profiles/%decId%';

let refreshTime = 31;
let refreshInterval;

window.onload = () => {
	const lastId = localStorage.getItem('lastId');
	if (!lastId) return;

	document.querySelector('#input-id').value = lastId;
	updateInfo(lastId);
};

const handleInput = () => {
	const value = document.querySelector('#input-id').value;
	if (!value) return;
};

const updateInfo = (serverId) => {
	console.info('Getting info from', serverId);
	localStorage.setItem('lastId', serverId);

	resetTable();
	fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`)
		.then((response) => response.json())
		.then((json) => {
			console.debug(`Got info from "${serverId}"`, json);

			document.querySelector('#hostname').textContent = `Players ${json.Data.clients}/${json.Data.sv_maxclients}`;

			const table = document.querySelector('table');
			json.Data.players.forEach((player) => {
				const tr = document.createElement('tr');

				const id = document.createElement('th');
				const name = document.createElement('th');
				const steam = document.createElement('th');
				const ping = document.createElement('th');

				id.textContent = player.id;
				name.textContent = player.name;
				steam.textContent = 'no';
				ping.textContent = player.ping;

				tr.appendChild(id);
				tr.appendChild(name);
				tr.appendChild(steam);
				tr.appendChild(ping);

				const filteredIdentifiers = player.identifiers.filter((identifier) => identifier.startsWith('steam:'));
				if (filteredIdentifiers.length > 0) {
					const steamId = hexToDecimal(filteredIdentifiers[0].substring(filteredIdentifiers[0].indexOf(':') + 1));

					const steamURL = STEAM_LINK.replace('%decId%', steamId);
					const steamLink = document.createElement('a');
					steamLink.href = steamURL;
					steamLink.textContent = 'yes';

					steam.textContent = '';
					steam.appendChild(steamLink);
				}

				table.appendChild(tr);

				updateRefresh(serverId);
			});
		})
		.catch((error) => console.error(error));
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
