const app = document.getElementById('app');

interface ColourGroup {
  name: string;
  colours: string[];
}

interface SwatchesData {
  colourGroups: ColourGroup[];
}

// View state management
type View = 'swatches' | 'picker';
let currentView: View = 'swatches';
let selectedColours: string[] = [];

// Initialize the application
function initApp() {
  if (!app) return;
  
  // Create the navigation bar
  renderNavBar();
  
  // Load the initial view
  renderCurrentView();
}

// Render the navigation bar at the top
function renderNavBar() {
  if (!app) return;
  
  const navHtml = `
    <div class="mb-6">
      <nav class="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-5">
        <button 
          id="swatches-tab" 
          class="flex-1 py-2 px-4 rounded-md font-medium ${currentView === 'swatches' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors"
        >
          Swatches
        </button>
        <button 
          id="picker-tab" 
          class="flex-1 py-2 px-4 rounded-md font-medium ${currentView === 'picker' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors"
        >
          Picker
        </button>
      </nav>
    </div>
  `;
  
  // Insert the navigation at the top of the app
  app.innerHTML = navHtml;
  
  // Add event listeners to navigation buttons
  document.getElementById('swatches-tab')?.addEventListener('click', () => switchView('swatches'));
  document.getElementById('picker-tab')?.addEventListener('click', () => switchView('picker'));
}

// Switch between views
function switchView(view: View) {
  currentView = view;
  renderNavBar(); // Re-render navbar to update active state
  renderCurrentView();
}

// Render the current active view
function renderCurrentView() {
  if (currentView === 'swatches') {
    loadSwatches();
  } else {
    renderPicker();
  }
}

// ---------- SWATCHES VIEW LOGIC ----------
async function loadSwatches() {
  if (!app) return;
  
  // Create a container for the swatches view
  const swatchesViewContainer = document.createElement('div');
  swatchesViewContainer.id = 'swatches-view';
  
  try {
    const response = await fetch('swatches.json');
    const data: SwatchesData = await response.json();

    const swatchGroupsHTML = data.colourGroups.map(group => {
      const swatchesHTML = group.colours.map(colour => `
        <div class="flex flex-col items-center cursor-pointer swatch">
          <div class="h-14 w-14 rounded-md shadow-sm hover:shadow-md outline-2 outline-transparent outline-offset-2 hover:outline-blue-500 transition-all duration-200" style="background:${colour};"></div>
          <div class="mt-1 text-xs font-mono text-center text-gray-800 dark:text-gray-200 hex">${colour}</div>
        </div>
      `).join('');

      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-5 swatch-group">
          <div class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 group-name">${group.name}</div>
          <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 swatch-container">${swatchesHTML}</div>
        </div>
      `;
    }).join('');

    swatchesViewContainer.innerHTML = swatchGroupsHTML;
    
    // Replace everything after the navbar with the swatches view
    const navBar = document.querySelector('nav')?.parentElement;
    if (navBar) {
      app.innerHTML = '';
      app.appendChild(navBar);
      app.appendChild(swatchesViewContainer);
    }

    // Add click event listeners after the elements are added to the DOM
    const swatches = document.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', async () => {
        const colour = swatch.querySelector('.hex')?.textContent || '';
        await navigator.clipboard.writeText(colour);
        
        // Add copied feedback
        swatch.classList.add('scale-105');
        setTimeout(() => swatch.classList.remove('scale-105'), 200);
        
        // Show toast notification
        showToast(`${colour} copied to clipboard!`);
      });
    });
  } catch (err) {
    console.error('Failed to load swatches:', err);
    swatchesViewContainer.innerHTML = `
      <div class="p-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        Failed to load swatches. Please check your network connection.
      </div>
    `;
    
    const navBar = document.querySelector('nav')?.parentElement;
    if (navBar) {
      app.innerHTML = '';
      app.appendChild(navBar);
      app.appendChild(swatchesViewContainer);
    }
  }
}

// ---------- PICKER VIEW LOGIC ----------
function renderPicker() {
  if (!app) return;
  
  // Create the picker UI
  const pickerViewHTML = `
    <div id="picker-view" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div class="drop-zone border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer mb-6 relative hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <input type="file" id="imageInput" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
        <p class="text-gray-600 dark:text-gray-300">Click to upload, drag & drop, or paste (Ctrl+V)</p>
      </div>
      
      <canvas id="canvas" class="w-full h-auto hidden cursor-crosshair rounded-lg mb-6 bg-transparent"></canvas>
      
      <div class="flex items-center gap-4 mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div id="colourPreview" class="w-16 h-16 rounded-md shadow"></div>
        <div class="font-mono text-sm">
          <div id="colourValue" class="text-gray-800 dark:text-gray-200"></div>
          <div id="position" class="text-gray-600 dark:text-gray-400"></div>
        </div>
      </div>
      
      <div id="colourGrid" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mb-6"></div>
      
      <div id="exportCode" class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-200 cursor-pointer whitespace-pre-wrap break-all">[]</div>
    </div>
  `;
  
  // Replace everything after the navbar with the picker view
  const navBar = document.querySelector('nav')?.parentElement;
  if (navBar) {
    app.innerHTML = '';
    app.appendChild(navBar);
    app.insertAdjacentHTML('beforeend', pickerViewHTML);
    
    // Set up picker functionality after rendering
    initPicker();
  }
}

function initPicker() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const dropZone = document.querySelector('.drop-zone') as HTMLDivElement;
  const colourPreview = document.getElementById('colourPreview') as HTMLDivElement;
  const colourValue = document.getElementById('colourValue') as HTMLDivElement;
  const position = document.getElementById('position') as HTMLDivElement;
  const colourGrid = document.getElementById('colourGrid') as HTMLDivElement;
  const exportCode = document.getElementById('exportCode') as HTMLDivElement;
  const imageInput = document.getElementById('imageInput') as HTMLInputElement;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
  }

  function loadImage(file: File): void {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      dropZone.classList.add('hidden');
      canvas.classList.remove('hidden');
      updateUI();
    };
  }

  function updateUI(): void {
    colourGrid.innerHTML = selectedColours.map((hex, i) => `
      <div class="flex flex-col items-center">
        <div class="w-14 h-14 rounded-md shadow-sm hover:shadow-md cursor-pointer mb-2" 
             style="background-color: ${hex}"
             data-index="${i}">
        </div>
        <span class="font-mono text-xs text-gray-800 dark:text-gray-200">${hex}</span>
      </div>
    `).join('');
    exportCode.textContent = JSON.stringify(selectedColours);
    
    // Add event listeners to color blocks for removal
    const colorBlocks = colourGrid.querySelectorAll('div[data-index]');
    colorBlocks.forEach(block => {
      block.addEventListener('click', () => {
        const index = parseInt(block.getAttribute('data-index') || '0', 10);
        removeColour(index);
      });
    });
  }

  function addColour(hex: string): void {
    if (!selectedColours.includes(hex)) {
      selectedColours.push(hex);
      updateUI();
    }
  }

  function removeColour(index: number): void {
    selectedColours.splice(index, 1);
    updateUI();
  }

  function handlePaste(e: ClipboardEvent): void {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        const file = items[i].getAsFile();
        if (file) loadImage(file);
        break;
      }
    }
  }

  // Set up event listeners
  exportCode.addEventListener('click', function() {
    navigator.clipboard.writeText(this.textContent || '[]');
    showToast('Copied to clipboard!');
  });

  imageInput.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) loadImage(file);
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('bg-gray-100', 'dark:bg-gray-700');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('bg-gray-100', 'dark:bg-gray-700');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('bg-gray-100', 'dark:bg-gray-700');
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) loadImage(file);
  });

  canvas.addEventListener('mousemove', e => {
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
      
      colourPreview.style.backgroundColor = hex;
      colourValue.textContent = `HEX: ${hex}`;
      position.textContent = `Position: ${x}, ${y}`;
    }
  });

  canvas.addEventListener('click', e => {
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
      addColour(hex);
    }
  });

  // Add paste event listener to document
  document.addEventListener('paste', handlePaste);
  
  // Return a cleanup function that can be called if needed
  return () => {
    document.removeEventListener('paste', handlePaste);
  };
}

// ---------- UTILITY FUNCTIONS ----------
function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Initialize the application
initApp();