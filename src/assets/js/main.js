const docEl = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeIcons = {
  dark: themeToggle?.querySelector('[data-theme-icon="dark"]'),
  light: themeToggle?.querySelector('[data-theme-icon="light"]'),
};

function getCurrentTheme() {
  return docEl.classList.contains('dark') ? 'dark' : 'light';
}

function setTheme(nextTheme) {
  docEl.classList.toggle('dark', nextTheme === 'dark');
  localStorage.setItem('theme', nextTheme);
  if (themeIcons.dark && themeIcons.light) {
    themeIcons.dark.classList.toggle('hidden', nextTheme !== 'dark');
    themeIcons.light.classList.toggle('hidden', nextTheme !== 'light');
  }
}

if (themeToggle) {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    setTheme(getCurrentTheme());
  }
  themeToggle.addEventListener('click', () => {
    const current = getCurrentTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
} else {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    docEl.classList.toggle('dark', storedTheme === 'dark');
  }
}

const mobileToggle = document.querySelector('[data-mobile-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');
const mobileLinks = document.querySelectorAll('[data-mobile-link]');
const menuIcons = {
  open: mobileToggle?.querySelector('[data-menu-icon="open"]'),
  closed: mobileToggle?.querySelector('[data-menu-icon="closed"]'),
};

let isMenuOpen = false;

function setMenuState(open) {
  if (!mobileToggle || !mobilePanel) return;
  isMenuOpen = open;
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobilePanel.hidden = !open;
  mobilePanel.classList.toggle('pointer-events-none', !open);
  mobilePanel.classList.toggle('opacity-0', !open);
  mobilePanel.classList.toggle('opacity-100', open);
  if (menuIcons.open && menuIcons.closed) {
    menuIcons.open.classList.toggle('hidden', !open);
    menuIcons.closed.classList.toggle('hidden', open);
  }
}

if (mobileToggle && mobilePanel) {
  mobilePanel.classList.add('opacity-0');
  mobileToggle.addEventListener('click', () => {
    setMenuState(!isMenuOpen);
  });

  document.addEventListener('pointerdown', (event) => {
    if (!isMenuOpen) return;
    if (mobilePanel.contains(event.target) || mobileToggle.contains(event.target)) return;
    setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });
}

const projectGrid = document.querySelector('[data-project-grid]');
const badgeButtons = Array.from(document.querySelectorAll('[data-tag-list] [data-badge]'));
const searchInput = document.querySelector('[data-search-input]');
const projectCards = Array.from(projectGrid?.querySelectorAll('[data-project]') ?? document.querySelectorAll('[data-project]'));
const emptyState = document.querySelector('[data-empty-state]');
const shouldRestrictToFeatured = projectGrid ? projectGrid.dataset.showFeaturedOnly !== 'false' : true;

const filterState = {
  tag: 'All',
  query: '',
};

function applyFilters() {
  const query = filterState.query.trim().toLowerCase();
  const showFeaturedOnly = shouldRestrictToFeatured && filterState.tag === 'All' && !query;
  let visibleCount = 0;
  projectCards.forEach((card) => {
    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
    const matchesTag = filterState.tag === 'All' || tags.includes(filterState.tag);
    const text = card.textContent.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesFeatured = !showFeaturedOnly || card.dataset.featured === 'true';
    const isVisible = matchesTag && matchesQuery && matchesFeatured;
    card.classList.toggle('hidden', !isVisible);
    if (isVisible) {
      visibleCount += 1;
    }
  });
  if (emptyState) {
    emptyState.classList.toggle('hidden', visibleCount !== 0);
  }
}

if (badgeButtons.length) {
  badgeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterState.tag = button.dataset.badge;
      
      const STRIP_ON_ACTIVE = [
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
      ];
      
      badgeButtons.forEach((btn) => {
        const isActive = btn.dataset.badge === filterState.tag;
        btn.classList.toggle('border-transparent', isActive);
        btn.classList.toggle('bg-gray-900', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('dark:bg-white', isActive);
        btn.classList.toggle('dark:text-gray-900', isActive);
        
        STRIP_ON_ACTIVE.forEach(cls => {
          btn.classList.toggle(cls, !isActive);
        });
      });
      applyFilters();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    filterState.query = searchInput.value;
    applyFilters();
  });
}

applyFilters();

const scrollLinks = document.querySelectorAll('[data-scroll]');
scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const yearTargets = document.querySelectorAll('[data-current-year]');
if (yearTargets.length) {
  const year = new Date().getFullYear();
  yearTargets.forEach((node) => {
    node.textContent = String(year);
  });
}

const hotspotContainers = Array.from(document.querySelectorAll('[data-hotspot]'));

function setHotspotState(container, open) {
  const trigger = container.querySelector('[data-hotspot-toggle]');
  const popover = container.querySelector('[data-hotspot-popover]');
  if (!trigger || !popover) return;
  container.classList.toggle('is-active', open);
  trigger.setAttribute('aria-expanded', String(open));
  if (open) {
    popover.hidden = false;
    popover.removeAttribute('aria-hidden');
  } else {
    popover.hidden = true;
    popover.setAttribute('aria-hidden', 'true');
  }
}

function closeAllHotspots(except = null) {
  hotspotContainers.forEach((container) => {
    if (container === except) return;
    setHotspotState(container, false);
  });
}

if (hotspotContainers.length) {
  hotspotContainers.forEach((container) => {
    const trigger = container.querySelector('[data-hotspot-toggle]');
    if (!trigger) return;

    setHotspotState(container, false);

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isActive = container.classList.contains('is-active');
      if (isActive) {
        setHotspotState(container, false);
      } else {
        closeAllHotspots(container);
        setHotspotState(container, true);
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (hotspotContainers.some((container) => container.contains(target))) {
      return;
    }
    closeAllHotspots();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllHotspots();
    }
  });
}