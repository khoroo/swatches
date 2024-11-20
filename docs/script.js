function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      const swatch = event.currentTarget;
      const original = swatch.style.transform;
      swatch.style.transform = 'scale(0.95)';
      setTimeout(() => {
        swatch.style.transform = original;
      }, 200);
    })
    .catch(err => console.error('Failed to copy:', err));
}
