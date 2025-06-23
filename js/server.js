import { fixColors } from './utils/color.js';

const favicon = document.querySelector('#favicon');
const serverIcon = document.querySelector('#server-icon');
const serverName = document.querySelector('#server-name');
const serverIdInput = document.querySelector('#server-id');
const serverPlayers = document.querySelector('#server-players');

export const setServerInfo = (serverId, data) => {
	serverIdInput.value = serverId;
	const title = fixColors(data.hostname);
	const icon = `https://servers-live.fivem.net/servers/icon/${serverId}/${data.iconVersion}.png`;
	document.title = title;
	favicon.href = icon;
	setTitle(title);
	serverIcon.src = icon;
	serverPlayers.textContent = `${data.clients}/${data.svMaxclients ?? data.sv_maxclients ?? 0}`;
};

export const setTitle = (title) => {
	serverName.textContent = title;
	serverName.title = title;
};
