document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', async () => {
    const color = swatch.dataset.color;
    
    try {
      await navigator.clipboard.writeText(color);
      swatch.classList.add('copied');
      
      setTimeout(() => {
        swatch.classList.remove('copied');
      }, 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
});