import { THEMES, STORAGE_KEYS } from './utils/constants.js';

export const initTheme = () => {
  const toggleButton = document.querySelector('#theme-toggle');
  if (!toggleButton) return;
  
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? THEMES.DARK : THEMES.LIGHT);
  
  applyTheme(initialTheme);
  updateToggleButton(initialTheme);
  
  toggleButton.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-theme') 
      ? THEMES.LIGHT 
      : THEMES.DARK;
    
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    
    applyTheme(newTheme);
    updateToggleButton(newTheme);
    
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  });
};

const applyTheme = (theme) => {
  if (theme === THEMES.LIGHT) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
};

const updateToggleButton = (theme) => {
  const toggleButton = document.querySelector('#theme-toggle');
  if (!toggleButton) return;

  // Remove all children
  while (toggleButton.firstChild) {
    toggleButton.removeChild(toggleButton.firstChild);
  }

  const iconPath = theme === THEMES.LIGHT 
    ? 'img/moon.svg'
    : 'img/sun.svg';
    
  const altText = theme === THEMES.LIGHT
    ? 'Switch to dark mode'
    : 'Switch to light mode';

  const img = document.createElement('img');
  img.src = iconPath;
  img.alt = altText;
  img.title = altText;

  toggleButton.appendChild(img);
};
