import { getPlayers, renderPlayers } from './fetch.js';

let search;
let searching = false;

export const initializeSearch = () => {
	search = document.querySelector('#search');
	search.addEventListener('keyup', (event) => serachPlayers());
};

export const serachPlayers = () => {
	const value = search.value;
	let players = getPlayers();
	if (value.length < 1) {
		searching = false;
		return renderPlayers(players, true);
	}

	searching = true;
	players = players.filter(
		(player) => player.id.toString().startsWith(value) || player.name.toLowerCase().includes(value.toLowerCase())
	);
	renderPlayers(players, true);
};

export const isSearching = () => searching;
