// componentLoader.js
export const components = {
  header: '/components/header.html?v=20260821.6',
  footer: '/components/footer.html?v=20260821.6',
  fabContainer: '/components/fab-container.html'
};

export async function preloadComponents() {
  const loadedComponents = {};
  
  for (const [name, path] of Object.entries(components)) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      loadedComponents[name] = await response.text();
    } catch (error) {
      console.error(`Failed to load component ${name}:`, error);
    }
  }
  
  return loadedComponents;
}

// Cache components in memory
let componentCache = null;

export async function getComponent(name) {
  if (!componentCache) {
    componentCache = await preloadComponents();
  }
  return componentCache[name] || '';
}

// Initialize components on page load
document.addEventListener('DOMContentLoaded', async () => {
  const components = await preloadComponents();
  
  // Replace placeholders with components
  Object.entries(components).forEach(([name, content]) => {
    const placeholder = document.getElementById(`${name}-placeholder`);
    if (placeholder && !placeholder.hasAttribute('data-component-loaded')) {
      placeholder.innerHTML = content;
      placeholder.setAttribute('data-component-loaded', 'true');
    }
  });
});
