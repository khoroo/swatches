const app = document.getElementById('app');

interface ColourGroup {
  name: string;
  colours: string[];
}

interface SwatchesData {
  colourGroups: ColourGroup[];
}

async function loadSwatches() {
  try {
    const response = await fetch('swatches.json');
    const data: SwatchesData = await response.json();

    if (app) {
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

      app.innerHTML = swatchGroupsHTML;

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
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out';
          toast.textContent = `${colour} copied to clipboard!`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2000);
        });
      });
    }
  } catch (err) {
    console.error('Failed to load swatches:', err);
    if (app) {
      app.innerHTML = `
        <div class="p-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          Failed to load swatches. Please check your network connection.
        </div>
      `;
    }
  }
}

loadSwatches();