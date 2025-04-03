document.addEventListener('DOMContentLoaded', function() {
  // Initialize all Materialize components
  initializeMaterialize();

  // Set up error handling for map loading
  setupMapErrorHandling();
});

/**
 * Initialize all Materialize components
 */
function initializeMaterialize() {
  // Initialize sidenav
  const sidenavs = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenavs);
  
  // Initialize dropdowns
  const dropdowns = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(dropdowns);
  
  // Initialize modals
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
  
  // Initialize selects
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);
  
  // Initialize datepickers
  const datepickers = document.querySelectorAll('.datepicker');
  M.Datepicker.init(datepickers, {
    format: 'yyyy-mm-dd',
    defaultDate: new Date(),
    setDefaultDate: true,
    minDate: new Date()
  });
  
  // Initialize timepickers
  const timepickers = document.querySelectorAll('.timepicker');
  M.Timepicker.init(timepickers);
  
  // Initialize tooltips
  const tooltips = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(tooltips);
}

/**
 * Set up error handling for map loading
 */
function setupMapErrorHandling() {
  window.handleMapError = function() {
    const mapContainers = document.querySelectorAll('.map-container');
    
    mapContainers.forEach(container => {
      container.innerHTML = `
        <div class="center-align">
          <p>Unable to load map. Please ensure you have an internet connection.</p>
          <button class="btn waves-effect waves-light teal reload-map">
            <i class="material-icons left">refresh</i>
            Retry
          </button>
        </div>
      `;
      
      const reloadButtons = container.querySelectorAll('.reload-map');
      reloadButtons.forEach(button => {
        button.addEventListener('click', function() {
          window.location.reload();
        });
      });
    });
  };
} 