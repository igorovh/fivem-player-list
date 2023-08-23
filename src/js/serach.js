import { getPlayers, renderPlayers } from './fetch.js';

let search;

export const initializeSearch = () => {
	search = document.querySelector('#search');
	search.addEventListener('keyup', (event) => serachPlayers());
};

export const serachPlayers = () => {
	const value = search.value;
	let players = getPlayers();
	if (value.length < 1) return renderPlayers(players);

	players = players.filter(
		(player) => player.id.toString().startsWith(value) || player.name.toLowerCase().startsWith(value.toLowerCase())
	);
	renderPlayers(players);
};
