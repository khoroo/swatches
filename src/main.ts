
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
          <div class="relative h-15 w-15 rounded-md cursor-pointer outline-2 outline-transparent outline-offset-2 hover:outline-heading-color transition-colors duration-150 swatch" style="background:${colour};">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-center text-gray-800 dark:text-gray-200 hex">${colour}</div>
          </div>
        `).join('');

        return `
          <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-5 swatch-group">
            <div class="text-xl dark:text-gray-100 mb-2 pb-1 border-b-2 border-gray-400 group-name">${group.name}</div>
            <div class="grid grid-cols-4 gap-4 swatch-container">${swatchesHTML}</div>
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
          swatch.classList.add('copied');
          swatch.addEventListener('animationend', () => {
            swatch.classList.remove('copied');
          }, { once: true });
        });
      });
    }
  } catch (err) {
    console.error('Failed to load swatches:', err);
    if (app) {
      app.textContent = 'Failed to load swatches.';
    }
  }
}

loadSwatches();