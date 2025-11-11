const hotspotContainers = Array.from(document.querySelectorAll('[data-hotspot]'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lengthProbe = document.createElement('div');
lengthProbe.style.position = 'absolute';
lengthProbe.style.visibility = 'hidden';
lengthProbe.style.pointerEvents = 'none';
lengthProbe.style.left = '-9999px';
lengthProbe.style.top = '-9999px';

function resolveLength(element, value, dimension = 'height') {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const numeric = parseFloat(trimmed);
  if (trimmed.endsWith('px')) {
    return numeric;
  }
  if (trimmed.endsWith('rem')) {
    const rootSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    return numeric * rootSize;
  }
  if (trimmed.endsWith('em')) {
    const referenceSize = parseFloat(window.getComputedStyle(element).fontSize) || 16;
    return numeric * referenceSize;
  }
  if (trimmed.endsWith('vw')) {
    return (numeric / 100) * window.innerWidth;
  }
  if (trimmed.endsWith('vh')) {
    return (numeric / 100) * window.innerHeight;
  }
  if (!Number.isNaN(numeric) && /^-?\d*(\.\d+)?$/.test(trimmed)) {
    return numeric;
  }

  const probe = lengthProbe;
  probe.style.width = '';
  probe.style.height = '';
  if (dimension === 'width') {
    probe.style.width = trimmed;
    probe.style.height = '1px';
  } else {
    probe.style.height = trimmed;
    probe.style.width = '1px';
  }
  const doc = element?.ownerDocument || document;
  const context = doc.body || document.body;
  context.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  if (probe.parentNode) {
    probe.parentNode.removeChild(probe);
  }
  return dimension === 'width' ? rect.width : rect.height;
}


function setHotspotState(container, open) {
  const trigger = container.querySelector('[data-hotspot-toggle]');
  const panel = container.querySelector('[data-hotspot-panel]');
  const bubble = container.querySelector('[data-hotspot-bubble]');
  if (!trigger || !panel || !bubble) return;

  if (open) {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');

    const bubbleStyles = window.getComputedStyle(bubble);
    const placement = container.dataset.placement || 'top';
    const paddingValue = bubbleStyles.getPropertyValue('--hotspot-open-padding');
    const triggerValue = bubbleStyles.getPropertyValue('--hotspot-trigger-size');
    const maxHeightValue = bubbleStyles.getPropertyValue('--hotspot-open-max-height');
    const openWidthValue = bubbleStyles.getPropertyValue('--hotspot-open-width');
    const paddingPx = resolveLength(bubble, paddingValue, 'height') ?? 0;
    const triggerPx = resolveLength(bubble, triggerValue, 'height') ?? 0;
    const maxHeightPx = resolveLength(bubble, maxHeightValue, 'height') ?? Number.POSITIVE_INFINITY;
    const openWidthPx = resolveLength(bubble, openWidthValue, 'width') ?? triggerPx;
    const rootSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    const viewportLimit = Math.max(window.innerWidth - rootSize * 3, triggerPx);
    const targetWidth = Math.max(triggerPx, Math.min(openWidthPx, viewportLimit));
    const contentInner = panel.querySelector('.hotspot-image__content-inner');
    const contentBody = panel.querySelector('.hotspot-image__content-body');
    const measuredContent =
      Math.max(contentInner?.scrollHeight ?? 0, contentBody?.scrollHeight ?? 0, panel.scrollHeight);
    const contentHeight = measuredContent + paddingPx * 2;
    const targetHeight = Math.max(triggerPx, Math.min(contentHeight, maxHeightPx));
    bubble.style.setProperty('--hotspot-resolved-width', `${targetWidth}px`);

    const diffWidth = Math.max(targetWidth - triggerPx, 0);
    const diffHeight = Math.max(targetHeight - triggerPx, 0);
    let shiftX = 0;
    let shiftY = 0;

    switch (placement) {
      case 'left':
        shiftX = -diffWidth / 2;
        break;
      case 'right':
        shiftX = diffWidth / 2;
        break;
      case 'bottom':
        shiftY = diffHeight / 2;
        break;
      case 'top':
      default:
        shiftY = -diffHeight / 2;
        break;
    }

    container.style.setProperty('--hotspot-open-shift-x', `${shiftX}px`);
    container.style.setProperty('--hotspot-open-shift-y', `${shiftY}px`);

    bubble.getBoundingClientRect();
    container.classList.add('is-active');
  } else {
    const wasActive = container.classList.contains('is-active');
    container.classList.remove('is-active');
    panel.setAttribute('aria-hidden', 'true');
    const scrollTarget = panel.querySelector('.hotspot-image__content-body') ?? panel.querySelector('.hotspot-image__content-inner');
    if (scrollTarget) {
      scrollTarget.scrollTo({ top: 0, behavior: 'auto' });
    }

    const clearMeasurements = () => {
      bubble.style.removeProperty('--hotspot-resolved-width');
      container.style.removeProperty('--hotspot-open-shift-x');
      container.style.removeProperty('--hotspot-open-shift-y');
    };

    if (prefersReducedMotion || !wasActive) {
      panel.hidden = true;
      clearMeasurements();
    } else {
      const handleTransitionEnd = (event) => {
        if (event.target !== bubble) return;
        if (!container.classList.contains('is-active')) {
          panel.hidden = true;
          clearMeasurements();
        }
      };
      bubble.addEventListener('transitionend', handleTransitionEnd, { once: true });
    }
  }

  trigger.setAttribute('aria-expanded', String(open));
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
    const dismiss = container.querySelector('[data-hotspot-close]');
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

    if (dismiss) {
      dismiss.addEventListener('click', () => {
        setHotspotState(container, false);
      });
    }
  });

  document.addEventListener('pointerdown', (event) => {
    const targetHotspot = event.target instanceof Element ? event.target.closest('[data-hotspot]') : null;
    if (targetHotspot) return;
    closeAllHotspots();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllHotspots();
    }
  });
}
