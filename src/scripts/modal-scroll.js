// Auto-scroll to top when modal opens
document.addEventListener('DOMContentLoaded', () => {
  // Function to scroll modal container to top
  const scrollToModalTop = (modalContainer) => {
    if (modalContainer) {
      modalContainer.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  };

  // Observer for modal containers
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if this is a modal container
          if (node.classList && node.classList.contains('modal-container')) {
            // Small delay to ensure modal is rendered
            setTimeout(() => scrollToModalTop(node), 50);
          }
          
          // Check for modal containers within added nodes
          const modalContainers = node.querySelectorAll && node.querySelectorAll('.modal-container');
          if (modalContainers) {
            modalContainers.forEach(container => {
              setTimeout(() => scrollToModalTop(container), 50);
            });
          }
        }
      });
    });
  });

  // Start observing the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also handle existing modals that might be added dynamically
  const checkForModals = () => {
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(modal => {
      if (modal.style.display !== 'none' && modal.offsetParent !== null) {
        scrollToModalTop(modal);
      }
    });
  };

  // Check periodically for new modals
  setInterval(checkForModals, 100);
});
