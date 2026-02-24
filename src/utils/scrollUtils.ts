// Utilidad para scroll to top en el elemento correcto
export const scrollToTop = () => {
  // Intentar hacer scroll en el main content (que tiene overflow-y-auto)
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.scrollTo(0, 0);
  } else {
    // Fallback al window si no encuentra el main
    window.scrollTo(0, 0);
  }
};
