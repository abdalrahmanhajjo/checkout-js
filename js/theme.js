// Dark/light theme toggle. The initial theme is set by a small inline script in
// the page <head> (to avoid a flash); this file wires up the toggle button and
// persists the user's choice in localStorage.
const themeToggle = document.querySelector('#theme-toggle');

// Reflects the current theme on the toggle's aria-pressed state for screen readers.
function syncThemeButton() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// Flips between light and dark, applies it to <html>, and remembers the choice.
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  syncThemeButton();
}

themeToggle.addEventListener('click', toggleTheme);
syncThemeButton();
