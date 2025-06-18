import { updateCharts } from './statistics.js';
import { renderFavoritePlayers } from './favorites.js';

export const initTabs = () => {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      if (tabName === 'statistics') {
        updateCharts();
      } else if (tabName === 'favorites') {
        renderFavoritePlayers();
      }
    });
  });
};
