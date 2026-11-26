const ITEM_SELECTOR = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'button', 'a[href]',
  'input:not([type="hidden"])', 'select', 'textarea', 'table', 'th', 'td', 'output', 'nav', 'form', 'section',
  '.mv-card-price', '.mv-badge', '.pd-ready', '.pd-total',
  '[role="button"]', '[role="tab"]', '[role="alert"]', '[role="status"]'
].join(',');

const INTERACTIVE_SELECTOR = 'button,a[href],input,select,textarea,[role="button"],[role="tab"]';
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

export function isReadable(element) {
  if (!element?.isConnected || element.closest('[data-accessibility-widget], [data-accessibility-trigger], [hidden], [inert], [aria-hidden="true"]')) return false;
  for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') return false;
  }
  return true;
}

export function isAvailable(element, root = document) {
  if (!isReadable(element)) return false;
  const modal = Array.from(root.querySelectorAll('[aria-modal="true"], dialog[open]')).filter(isReadable).pop();
  return !modal || modal.contains(element);
}

function nameOf(element) {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const label = labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ');
    if (clean(label)) return clean(label);
  }
  const label = element.getAttribute('aria-label');
  if (label) return clean(label);
  if (element.tagName === 'TABLE') return clean(element.querySelector('caption')?.textContent);
  if (element.tagName === 'SECTION') return clean(element.querySelector('h1,h2,h3,h4,h5,h6')?.textContent);
  if (element.tagName === 'FORM' || element.tagName === 'NAV') return '';
  if (element.labels?.length) return clean(Array.from(element.labels, (item) => item.textContent).join(' '));
  if (element.matches('input[type="submit"],input[type="button"]')) return clean(element.value);
  return clean(element.textContent) || clean(element.getAttribute('title')) || clean(element.getAttribute('placeholder'));
}

export function collectReadableItems(root = document) {
  const modal = Array.from(root.querySelectorAll('[aria-modal="true"], dialog[open]')).filter(isReadable).pop();
  const scope = modal || root;
  return Array.from(scope.querySelectorAll(ITEM_SELECTOR)).filter((element) => {
    if (!isReadable(element)) return false;
    if (element.closest('button,a[href],label,[role="button"],[role="tab"]')
      && !element.matches(INTERACTIVE_SELECTOR)) return false;
    if (element.matches('li') && element.querySelector('p,button,a[href],input,select,textarea')) return false;
    if (element.matches('[role="alert"],[role="status"]') && element.querySelector('p,button,a[href]')) return false;
    return Boolean(describeElement(element));
  });
}

export function describeElement(element) {
  if (!element) return '';
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const name = nameOf(element);
  const states = [];
  if (element.disabled || element.getAttribute('aria-disabled') === 'true') states.push('no disponible');
  if (element.required || element.getAttribute('aria-required') === 'true') states.push('obligatorio');
  if (element.getAttribute('aria-invalid') === 'true') states.push('inválido');
  if (element.hasAttribute('aria-expanded')) states.push(element.getAttribute('aria-expanded') === 'true' ? 'expandido' : 'contraído');
  if (element.hasAttribute('aria-selected')) states.push(element.getAttribute('aria-selected') === 'true' ? 'seleccionado' : 'no seleccionado');
  if (element.hasAttribute('aria-pressed')) states.push(element.getAttribute('aria-pressed') === 'true' ? 'activado' : 'desactivado');
  if (element.getAttribute('aria-current') === 'page') states.push('página actual');
  let type = '';
  if (/^h[1-6]$/.test(tag)) type = `Encabezado nivel ${tag[1]}`;
  else if (tag === 'button' || role === 'button' || (tag === 'input' && ['button', 'submit'].includes(element.type))) type = 'Botón';
  else if (tag === 'a') type = 'Enlace';
  else if (role === 'tab') type = 'Pestaña';
  else if (tag === 'nav') type = 'Menú de navegación';
  else if (tag === 'form') type = 'Formulario';
  else if (tag === 'section') type = 'Sección';
  else if (tag === 'select') {
    type = 'Lista desplegable';
    const selected = element.selectedOptions?.[0];
    if (selected) states.push(`opción seleccionada: ${clean(selected.textContent)}`);
    const options = Array.from(element.options).filter((option) => !option.disabled && !option.hidden);
    if (options.length <= 12) states.push(`opciones: ${options.map((option) => clean(option.textContent)).join(', ')}`);
    else states.push(`${options.length} opciones disponibles`);
  } else if (tag === 'input' && ['checkbox', 'radio'].includes(element.type)) {
    type = element.type === 'checkbox' ? 'Casilla' : 'Opción';
    states.push(element.checked ? 'seleccionada' : 'no seleccionada');
  } else if (tag === 'input' || tag === 'textarea') {
    type = element.type === 'password' ? 'Campo de contraseña' : 'Campo';
  } else if (tag === 'output') {
    type = 'Resultado';
    states.push(clean(element.textContent));
  } else if (tag === 'table') type = 'Tabla';
  else if (tag === 'th') type = 'Encabezado de tabla';
  else if (tag === 'td') {
    type = 'Celda';
    const header = element.closest('table')?.querySelectorAll('thead th')[element.cellIndex];
    if (header?.textContent) states.push(`columna ${clean(header.textContent)}`);
  } else if (role === 'alert') type = 'Aviso importante';
  else if (role === 'status') type = 'Estado';
  if (tag === 'table' && !name) return 'Tabla';
  if (!name && !type) return '';
  const descriptionIds = element.getAttribute('aria-describedby');
  const description = descriptionIds
    ? clean(descriptionIds.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' '))
    : clean(element.getAttribute('data-accessibility-description'));
  return [type && name ? `${type}: ${name}` : type || name, ...states, description && description !== name ? description : '']
    .filter(Boolean).join('. ');
}

export function sectionOf(element) {
  const section = element?.closest('section, article, nav, main, [role="dialog"]');
  if (!section) return '';
  return clean(section.getAttribute('aria-label') || section.querySelector('h1,h2,h3,h4,h5,h6')?.textContent);
}
