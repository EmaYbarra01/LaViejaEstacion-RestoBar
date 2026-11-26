import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { describeElement, isAvailable } from './accessibilityReader.js';

const originalWindow = globalThis.window;
before(() => {
  globalThis.window = { getComputedStyle: (element) => element.style || { display: 'block', visibility: 'visible', opacity: '1' } };
});
after(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function element(tagName, attributes = {}) {
  return {
    tagName: tagName.toUpperCase(),
    isConnected: true,
    parentElement: null,
    nodeType: 1,
    textContent: '',
    getAttribute: (name) => attributes[name] ?? null,
    hasAttribute: (name) => Object.hasOwn(attributes, name),
    closest: () => null,
    matches: () => false
  };
}

test('describes selected options and disabled fields without reading their values', () => {
  const select = {
    ...element('select'),
    labels: [{ textContent: 'Comensales' }],
    required: true,
    selectedOptions: [{ textContent: '2 personas' }],
    options: [{ textContent: '1 persona' }, { textContent: '2 personas' }]
  };
  assert.match(describeElement(select), /Comensales.*obligatorio.*2 personas.*1 persona/);

  const input = {
    ...element('input'),
    labels: [{ textContent: 'Contraseña' }],
    type: 'password',
    value: 'no debe pronunciarse',
    disabled: true
  };
  assert.equal(describeElement(input), 'Campo de contraseña: Contraseña. no disponible');
});

test('rejects elements behind an active modal and hidden ancestors', () => {
  const modal = element('div');
  const inside = element('button');
  const outside = element('button');
  modal.contains = (node) => node === inside;
  const root = { querySelectorAll: () => [modal] };
  assert.equal(isAvailable(inside, root), true);
  assert.equal(isAvailable(outside, root), false);

  inside.parentElement = { ...element('div'), style: { display: 'none', visibility: 'visible', opacity: '1' } };
  assert.equal(isAvailable(inside, root), false);
});
