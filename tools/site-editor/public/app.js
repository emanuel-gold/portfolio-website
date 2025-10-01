const editorContainer = document.querySelector('[data-editor]');
const editorForm = document.querySelector('[data-editor-form]');
const saveButton = document.querySelector('[data-save]');
const resetButton = document.querySelector('[data-reset]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const toastContainer = document.querySelector('[data-toast-container]');

const THEME_STORAGE_KEY = 'site-editor-theme';
const systemThemeMatcher = window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

let state = {
  data: null,
  original: null,
  dirty: false,
};

init();

function init() {
  initializeTheme();
  editorForm.addEventListener('submit', handleSubmit);
  resetButton.addEventListener('click', handleReset);
  loadSiteData();
}

async function loadSiteData() {
  setStatus('⚠️ Loading site data…');
  toggleControls(true);
  try {
    const response = await fetch('/api/site');
    if (!response.ok) {
      throw new Error(`❌ Request failed with status ${response.status}`);
    }
    const payload = await response.json();
    state = {
      data: deepClone(payload),
      original: deepClone(payload),
      dirty: false,
    };
    renderEditor();
  } catch (error) {
    console.error(error);
    setStatus('❌ Unable to load data. Ensure the server can read src/_data/site.js.', 'error');
  } finally {
    toggleControls(false);
  }
}

function renderEditor() {
  if (!state.data) {
    editorContainer.textContent = 'No data to display.';
    return;
  }

  editorContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderObject(state.data, []));
  editorContainer.appendChild(fragment);
  setDirty(false);
}

function renderObject(value, path, options = {}) {
  const { label } = options;
  if (label) {
    const wrapper = document.createElement('section');
    wrapper.className = 'object-field';
    const details = document.createElement('details');
    details.open = path.length <= 1;
    const summary = document.createElement('summary');
    const summaryLabel = document.createElement('h3');
    summaryLabel.textContent = label;
    summary.appendChild(summaryLabel);
    const chevronIcon = createChevronIcon();
    chevronIcon.classList.add('object-field__chevron');
    summary.appendChild(chevronIcon);
    details.appendChild(summary);
    const body = document.createElement('div');
    body.className = 'object-field__body';
    for (const [key, child] of Object.entries(value)) {
      body.appendChild(renderValue(child, path.concat(key), { label: formatLabel(key) }));
    }
    details.appendChild(body);
    wrapper.appendChild(details);
    return wrapper;
  }

  const container = document.createElement('div');
  container.className = 'field__body';
  for (const [key, child] of Object.entries(value)) {
    container.appendChild(renderValue(child, path.concat(key), { label: formatLabel(key) }));
  }
  return container;
}

function createChevronIcon() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 0 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z'
  );
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  return svg;
}

function renderArray(value, path, options = {}) {
  const { label } = options;
  const section = document.createElement('section');
  section.className = 'array-field';

  const header = document.createElement('div');
  header.className = 'array-field__header';
  const title = document.createElement('h3');
  title.textContent = label ?? 'Items';
  header.appendChild(title);
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Add item';
  addButton.addEventListener('click', () => {
    const sample = value[0];
    const nextValue = createEmptyValue(sample);
    const target = getValueAtPath(state.data, path);
    target.push(nextValue);
    setDirty(true);
    renderEditor();
  });
  header.appendChild(addButton);
  section.appendChild(header);

  const list = document.createElement('div');
  list.className = 'array-field__list';
  if (!value.length) {
    const hint = document.createElement('p');
    hint.className = 'empty-hint';
    hint.textContent = 'No items yet. Use “Add item” to create one.';
    list.appendChild(hint);
  } else {
    value.forEach((item, index) => {
      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'array-item';

      const itemHeader = document.createElement('div');
      itemHeader.className = 'array-item__header';
      const heading = document.createElement('h4');
      heading.textContent = `${label ?? 'Item'} ${index + 1}`;
      itemHeader.appendChild(heading);
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const target = getValueAtPath(state.data, path);
        target.splice(index, 1);
        setDirty(true);
        renderEditor();
      });
      itemHeader.appendChild(removeButton);
      itemWrapper.appendChild(itemHeader);

      const content = renderValue(item, path.concat(index), { label: null });
      itemWrapper.appendChild(content);
      list.appendChild(itemWrapper);
    });
  }

  section.appendChild(list);
  return section;
}

function renderPrimitive(value, path, options = {}) {
  const { label, hideLabel } = options;
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  if (typeof value === 'boolean') {
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'field';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value;
    checkbox.addEventListener('change', () => {
      setValueAtPath(state.data, path, checkbox.checked);
      setDirty(true);
    });
    const text = document.createElement('span');
    text.textContent = label ?? 'Enabled';
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(text);
    wrapper.appendChild(checkboxLabel);
    return wrapper;
  }

  if (label && !hideLabel) {
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  const useTextarea = typeof value === 'string' && (value.length > 80 || value.includes('\n'));
  if (useTextarea) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.addEventListener('input', () => {
      setValueAtPath(state.data, path, textarea.value);
      setDirty(true);
    });
    wrapper.appendChild(textarea);
  } else {
    const input = document.createElement('input');
    if (typeof value === 'number') {
      input.type = 'number';
      input.step = 'any';
      input.value = Number.isFinite(value) ? String(value) : '';
      input.addEventListener('input', () => {
        const next = input.value.trim();
        setValueAtPath(state.data, path, next === '' ? null : Number(next));
        setDirty(true);
      });
    } else {
      input.type = 'text';
      input.value = value ?? '';
      input.addEventListener('input', () => {
        setValueAtPath(state.data, path, input.value);
        setDirty(true);
      });
    }
    wrapper.appendChild(input);
  }

  return wrapper;
}

function initializeTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'light' || storedTheme === 'dark') {
    applyTheme(storedTheme, { persist: false });
  } else {
    applyTheme(getSystemTheme(), { persist: false });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }

  if (systemThemeMatcher) {
    const handleSystemChange = (event) => {
      if (getStoredTheme()) {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light', { persist: false });
    };

    if (typeof systemThemeMatcher.addEventListener === 'function') {
      systemThemeMatcher.addEventListener('change', handleSystemChange);
    } else if (typeof systemThemeMatcher.addListener === 'function') {
      systemThemeMatcher.addListener(handleSystemChange);
    }
  }
}

function handleThemeToggle() {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function applyTheme(theme, { persist = true } = {}) {
  if (theme !== 'light' && theme !== 'dark') {
    return;
  }

  document.documentElement.dataset.theme = theme;

  if (persist) {
    setStoredTheme(theme);
  }

  updateThemeToggle(theme);
}

function updateThemeToggle(theme) {
  if (!themeToggle) {
    return;
  }

  const isDark = theme === 'dark';
  const label = isDark ? '' : '';
  themeToggle.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
  themeToggle.textContent = label;
}

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {}
}

function getSystemTheme() {
  if (systemThemeMatcher) {
    return systemThemeMatcher.matches ? 'dark' : 'light';
  }
  return 'light';
}

function renderValue(value, path, options = {}) {
  if (Array.isArray(value)) {
    return renderArray(value, path, options);
  }

  if (value !== null && typeof value === 'object') {
    return renderObject(value, path, options);
  }

  return renderPrimitive(value, path, options);
}

function handleSubmit(event) {
  event.preventDefault();
  if (!state.dirty) return;
  persistSiteData();
}

async function persistSiteData() {
  try {
    setStatus('⚠️ Saving…');
    toggleControls(true);
    const response = await fetch('/api/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.data, null, 2),
    });
    if (!response.ok) {
      throw new Error(`❌ Save failed with status ${response.status}`);
    }
    state.original = deepClone(state.data);
    setDirty(false);
    setStatus('✅ Saved! Eleventy will pick up the change on the next rebuild.', 'success');
  } catch (error) {
    console.error(error);
    setStatus('❌ Failed to save. Check the terminal for details.', 'error');
  } finally {
    toggleControls(false);
  }
}

function handleReset() {
  if (!state.dirty) return;
  state.data = deepClone(state.original);
  renderEditor();
}

function setValueAtPath(target, path, value) {
  if (!path.length) {
    throw new Error('Path must contain at least one key');
  }
  const parent = path.slice(0, -1).reduce((acc, key) => acc[key], target);
  parent[path[path.length - 1]] = value;
}

function getValueAtPath(target, path) {
  return path.reduce((acc, key) => acc[key], target);
}

function createEmptyValue(sample) {
  if (Array.isArray(sample)) {
    return [];
  }
  if (sample !== null && typeof sample === 'object') {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, createEmptyValue(value)]));
  }
  if (typeof sample === 'number') {
    return 0;
  }
  if (typeof sample === 'boolean') {
    return false;
  }
  return '';
}

function setDirty(next) {
  state.dirty = next;
  saveButton.disabled = !next;
  resetButton.disabled = !next;
}

function toggleControls(disabled) {
  saveButton.disabled = disabled || !state.dirty;
  resetButton.disabled = disabled || !state.dirty;
}

function setStatus(message, tone = 'neutral') {
  if (!message) return;
  createToast(message, tone);
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());
}

function createToast(message, tone) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tone}`;
  toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');

  const text = document.createElement('div');
  text.className = 'toast__message';
  text.textContent = message;
  toast.appendChild(text);

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.className = 'toast__close';
  dismissButton.setAttribute('aria-label', 'Dismiss notification');
  dismissButton.innerHTML = '&times;';
  toast.appendChild(dismissButton);

  let dismissTimer = window.setTimeout(() => {
    hideToast();
  }, 5000);

  function hideToast() {
    if (!toast.isConnected) return;
    window.clearTimeout(dismissTimer);
    dismissTimer = null;
    toast.classList.remove('is-visible');
    const fallbackRemoval = window.setTimeout(() => {
      if (toast.isConnected) {
        toast.remove();
      }
    }, 220);
    toast.addEventListener(
      'transitionend',
      () => {
        window.clearTimeout(fallbackRemoval);
        toast.remove();
      },
      { once: true }
    );
  }

  dismissButton.addEventListener('click', () => {
    window.clearTimeout(dismissTimer);
    hideToast();
  });

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });
}

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}
