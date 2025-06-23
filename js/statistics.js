import { getPlayers } from './fetch.js';

let playerChart;
let pingChart;

export const initStatistics = () => {
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
      }
    });
  });
};

export const updateCharts = () => {
  const players = getPlayers();
  
  if (!players) return;
  
  updatePlayerDistributionChart(players);
  updatePingDistributionChart(players);
};

const updatePlayerDistributionChart = (players) => {
  const ctx = document.getElementById('player-chart');
  
  if (!ctx) return;
  
  const ranges = {};
  const rangeSize = 10;
  
  players.forEach(player => {
    const rangeIndex = Math.floor(player.id / rangeSize);
    const rangeStart = rangeIndex * rangeSize;
    const rangeEnd = rangeStart + rangeSize - 1;
    const rangeLabel = `${rangeStart}-${rangeEnd}`;
    
    if (!ranges[rangeLabel]) {
      ranges[rangeLabel] = 0;
    }
    
    ranges[rangeLabel]++;
  });
  
  const labels = Object.keys(ranges).sort((a, b) => {
    const aStart = parseInt(a.split('-')[0]);
    const bStart = parseInt(b.split('-')[0]);
    return aStart - bStart;
  });
  
  const data = labels.map(label => ranges[label]);
  
  if (playerChart) {
    playerChart.data.labels = labels;
    playerChart.data.datasets[0].data = data;
    playerChart.update();
  } else {
    playerChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Player Distribution by ID Range',
          data,
          backgroundColor: 'rgba(6, 189, 0, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
};

const updatePingDistributionChart = (players) => {
  const ctx = document.getElementById('ping-chart');
  
  if (!ctx) return;
  
  const ranges = {
    '0-50ms': 0,
    '51-100ms': 0,
    '101-200ms': 0,
    '201-300ms': 0,
    '300ms+': 0
  };
  
  players.forEach(player => {
    const ping = player.ping;
    
    if (ping <= 50) {
      ranges['0-50ms']++;
    } else if (ping <= 100) {
      ranges['51-100ms']++;
    } else if (ping <= 200) {
      ranges['101-200ms']++;
    } else if (ping <= 300) {
      ranges['201-300ms']++;
    } else {
      ranges['300ms+']++;
    }
  });
  
  const labels = Object.keys(ranges);
  const data = labels.map(label => ranges[label]);
  
  if (pingChart) {
    pingChart.data.labels = labels;
    pingChart.data.datasets[0].data = data;
    pingChart.update();
  } else {
    pingChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Player Ping Distribution',
          data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
};
