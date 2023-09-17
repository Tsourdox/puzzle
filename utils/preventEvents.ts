export function preventDefaultEvents() {
  // Prevent context menu when right clicking
  document.oncontextmenu = () => false;
  // Prevent magnifying glass
  document
    .querySelector('canvas')
    ?.addEventListener('touchstart', (e) => e.preventDefault());
}
