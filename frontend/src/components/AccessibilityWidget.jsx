import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { collectReadableItems, describeElement, isAvailable, sectionOf } from '../utils/accessibilityReader';
import './AccessibilityWidget.css';

const AccessibilityContext = createContext(null);
const STORAGE_KEY = 'customer-accessibility';
const defaults = { enabled: false, contrast: false, textSize: 100, highlight: true, rate: 1, language: 'es', voice: '', announcements: false };

function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...defaults,
      enabled: stored.enabled === true,
      contrast: stored.contrast === true,
      textSize: [100, 125, 150].includes(stored.textSize) ? stored.textSize : 100,
      highlight: stored.highlight !== false,
      rate: typeof stored.rate === 'number' && stored.rate >= 0.5 && stored.rate <= 2 ? stored.rate : 1,
      language: typeof stored.language === 'string' ? stored.language : 'es',
      voice: typeof stored.voice === 'string' ? stored.voice : '',
      announcements: stored.announcements === true
    };
  } catch (error) {
    console.error('No se pudieron cargar las preferencias de accesibilidad:', error);
    return defaults;
  }
}

export function AccessibilityProvider({ available, children }) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState(null);
  const triggerRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    if (!available) setOpen(false);
  }, [available]);
  useEffect(() => {
    setOpen(false);
    setContainer(null);
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!container) return undefined;
    const observer = new MutationObserver(() => {
      if (!container.isConnected) {
        setOpen(false);
        setContainer(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [container]);
  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  return (
    <AccessibilityContext.Provider value={{ available, open, setOpen, setContainer, triggerRef }}>
      {children}
      {available && <AccessibilityPanel open={open} close={close} container={container} />}
    </AccessibilityContext.Provider>
  );
}

export function AccessibilityTrigger({ className }) {
  const context = useContext(AccessibilityContext);
  if (!context?.available) return null;
  return (
    <button type="button" className={className} aria-label="Accesibilidad" data-accessibility-trigger
      aria-expanded={context.open} aria-controls="accessibility-panel"
      onClick={(event) => {
        context.triggerRef.current = event.currentTarget;
        context.setContainer(event.currentTarget.closest('[aria-modal="true"]'));
        context.setOpen((current) => !current);
      }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="4.5" r="2" />
        <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
      </svg>
    </button>
  );
}

function AccessibilityPanel({ open, close, container }) {
  const location = useLocation();
  const [preferences, setPreferences] = useState(loadPreferences);
  const [voices, setVoices] = useState([]);
  const [playback, setPlayback] = useState('stopped');
  const [currentText, setCurrentText] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [instructions, setInstructions] = useState(false);
  const panelRef = useRef(null);
  const cursorRef = useRef(null);
  const lastSelectionRef = useRef('');
  const selectionAnchorRef = useRef(null);
  const highlightedRef = useRef(null);
  const generationRef = useRef(0);
  const ownsSpeechRef = useRef(false);
  const playbackRef = useRef('stopped');
  const pendingAnnouncementRef = useRef(null);
  const preferencesRef = useRef(preferences);
  const supported = typeof window !== 'undefined' && Boolean(window.speechSynthesis)
    && typeof window.SpeechSynthesisUtterance === 'function';

  useEffect(() => { preferencesRef.current = preferences; }, [preferences]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('No se pudieron guardar las preferencias de accesibilidad:', error);
      setMessage('No se pudieron guardar tus preferencias en este dispositivo.');
    }
    const root = document.documentElement;
    root.classList.toggle('customer-accessibility', preferences.enabled);
    root.classList.toggle('customer-high-contrast', preferences.enabled && preferences.contrast);
    if (preferences.enabled) {
      root.style.setProperty('--customer-text-scale', `${preferences.textSize}%`);
      root.style.setProperty('--customer-text-factor', String(preferences.textSize / 100));
    } else {
      root.style.removeProperty('--customer-text-scale');
      root.style.removeProperty('--customer-text-factor');
    }
    return () => {
      root.classList.remove('customer-accessibility', 'customer-high-contrast');
      root.style.removeProperty('--customer-text-scale');
      root.style.removeProperty('--customer-text-factor');
    };
  }, [preferences]);

  useEffect(() => {
    if (!supported) return undefined;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, [supported]);

  const clearHighlight = useCallback(() => {
    highlightedRef.current?.classList.remove('accessibility-reading-highlight');
    highlightedRef.current = null;
  }, []);
  const stop = useCallback(() => {
    generationRef.current += 1;
    if (supported && ownsSpeechRef.current) {
      window.speechSynthesis.cancel();
      if (playbackRef.current === 'paused') window.speechSynthesis.resume();
    }
    ownsSpeechRef.current = false;
    pendingAnnouncementRef.current = null;
    playbackRef.current = 'stopped';
    setPlayback('stopped');
    clearHighlight();
  }, [clearHighlight, supported]);
  useEffect(() => () => {
    generationRef.current += 1;
    if (supported && ownsSpeechRef.current) {
      window.speechSynthesis.cancel();
      if (playbackRef.current === 'paused') window.speechSynthesis.resume();
    }
    ownsSpeechRef.current = false;
    pendingAnnouncementRef.current = null;
    clearHighlight();
  }, [clearHighlight, supported]);
  useEffect(() => {
    stop();
    cursorRef.current = null;
    lastSelectionRef.current = '';
    selectionAnchorRef.current = null;
    setCurrentText('');
  }, [location.pathname, location.search, stop]);
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!preferences.enabled) stop();
  }, [preferences.enabled, stop]);
  useEffect(() => {
    if (!preferences.highlight) clearHighlight();
  }, [preferences.highlight, clearHighlight]);

  const speak = useCallback(function say(text, onEnd) {
    if (!supported) {
      setMessage('La lectura por voz no está disponible en este navegador.');
      return;
    }
    generationRef.current += 1;
    const generation = generationRef.current;
    if (ownsSpeechRef.current) {
      pendingAnnouncementRef.current = null;
      window.speechSynthesis.cancel();
      if (playbackRef.current === 'paused') window.speechSynthesis.resume();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferencesRef.current.language;
    utterance.rate = preferencesRef.current.rate;
    const selected = voices.find((voice) => voice.voiceURI === preferencesRef.current.voice);
    if (selected) utterance.voice = selected;
    utterance.onend = () => {
      if (generation !== generationRef.current) return;
      ownsSpeechRef.current = false;
      const pending = pendingAnnouncementRef.current;
      if (pending) {
        pendingAnnouncementRef.current = null;
        say(pending.text, onEnd);
      } else if (onEnd) onEnd();
      else {
        playbackRef.current = 'stopped';
        setPlayback('stopped');
      }
    };
    utterance.onerror = (event) => {
      if (generation !== generationRef.current || event.error === 'canceled' || event.error === 'interrupted') return;
      ownsSpeechRef.current = false;
      pendingAnnouncementRef.current = null;
      playbackRef.current = 'stopped';
      setPlayback('stopped');
      setMessage(`No se pudo reproducir la voz: ${event.error || 'error del navegador'}.`);
    };
    playbackRef.current = 'playing';
    ownsSpeechRef.current = true;
    setPlayback('playing');
    setMessage('');
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error al reproducir la lectura:', error);
      ownsSpeechRef.current = false;
      playbackRef.current = 'stopped';
      setPlayback('stopped');
      setMessage('No se pudo reproducir la voz en este navegador.');
    }
  }, [supported, voices]);

  const readItem = useCallback(function read(element, continueReading = false) {
    if (!element || !isAvailable(element)) {
      stop();
      setMessage('No hay un elemento disponible para leer.');
      return;
    }
    cursorRef.current = element;
    lastSelectionRef.current = '';
    selectionAnchorRef.current = null;
    const text = describeElement(element);
    const section = sectionOf(element);
    const spoken = section && section !== element.textContent?.trim() ? `Sección ${section}. ${text}` : text;
    setCurrentText(spoken);
    clearHighlight();
    if (preferencesRef.current.highlight) {
      element.classList.add('accessibility-reading-highlight');
      highlightedRef.current = element;
    }
    speak(spoken, continueReading ? () => {
      const items = collectReadableItems();
      const index = items.indexOf(element);
      if (index >= 0 && items[index + 1]) read(items[index + 1], true);
      else {
        playbackRef.current = 'stopped';
        setPlayback('stopped');
        clearHighlight();
        if (index < 0) setMessage('El contenido cambió. Reiniciá la lectura para continuar.');
      }
    } : undefined);
  }, [clearHighlight, speak, stop]);

  const start = () => {
    const items = collectReadableItems();
    if (items.length) readItem(items[0], true);
    else setMessage('No se encontraron elementos disponibles para leer.');
  };
  const move = (direction) => {
    let items = collectReadableItems();
    if (filter === 'headings') items = items.filter((item) => /^H[1-6]$/.test(item.tagName));
    if (filter === 'sections') items = items.filter((item) => item.matches('section,nav'));
    if (filter === 'links') items = items.filter((item) => item.matches('a[href]'));
    if (filter === 'controls') items = items.filter((item) => item.matches('button,input,select,textarea,[role="button"],[role="tab"]'));
    const index = items.indexOf(cursorRef.current);
    const next = index < 0 ? (direction > 0 ? 0 : items.length - 1) : index + direction;
    if (items[next]) readItem(items[next]);
    else setMessage(direction > 0 ? 'Fin del recorrido.' : 'Inicio del recorrido.');
  };
  const readSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    const anchor = selection?.anchorNode?.parentElement;
    if (text && anchor && isAvailable(anchor) && !anchor.closest('input,textarea,[contenteditable="true"]')) {
      clearHighlight();
      cursorRef.current = null;
      lastSelectionRef.current = text;
      selectionAnchorRef.current = anchor;
      setCurrentText(text);
      speak(text);
    } else if (cursorRef.current) readItem(cursorRef.current);
    else setMessage('Seleccioná texto de la página o recorré un elemento primero.');
  };
  const goToCurrent = () => {
    const element = cursorRef.current;
    if (!element?.matches('a[href],button,input,select,textarea,[role="button"],[role="tab"]') || element.disabled || !isAvailable(element)) {
      setMessage('El elemento actual no es un control disponible.');
      return;
    }
    close(false);
    element.focus();
  };

  useEffect(() => {
    if (!preferences.enabled) return undefined;
    const observer = new MutationObserver(() => {
      const current = cursorRef.current || selectionAnchorRef.current;
      if (current && !isAvailable(current)) {
        stop();
        cursorRef.current = null;
        lastSelectionRef.current = '';
        selectionAnchorRef.current = null;
        setCurrentText('');
        setMessage('El contenido actual ya no está disponible. Elegí otro elemento.');
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-modal', 'aria-hidden', 'hidden', 'inert']
    });
    return () => observer.disconnect();
  }, [preferences.enabled, stop]);

  useEffect(() => {
    if (!preferences.enabled || !preferences.announcements || !supported) return undefined;
    let timer;
    let last = '';
    const announce = (text, priority = 0) => {
      if (!text || text === last) return;
      last = text;
      clearTimeout(timer);
      timer = setTimeout(() => { last = ''; }, 2000);
      if (playbackRef.current === 'stopped') speak(text);
      else if (!pendingAnnouncementRef.current || priority >= pendingAnnouncementRef.current.priority) {
        pendingAnnouncementRef.current = { text, priority };
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const element = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
        if (!element || element.closest('[data-accessibility-widget]')) continue;
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded' && isAvailable(mutation.target)) {
          announce(describeElement(mutation.target));
        }
        const changedRegion = element.closest('[role="alert"],[role="status"],[aria-live="polite"],[aria-live="assertive"]');
        if (changedRegion && isAvailable(changedRegion)) {
          announce(describeElement(changedRegion), changedRegion.getAttribute('role') === 'alert' || changedRegion.getAttribute('aria-live') === 'assertive' ? 1 : 0);
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          const target = node.matches?.('[role="alert"],[role="status"],[role="dialog"],[aria-live="polite"],[aria-live="assertive"]')
            ? node : node.querySelector?.('[role="alert"],[role="status"],[role="dialog"],[aria-live="polite"],[aria-live="assertive"]');
          if (target && isAvailable(target)) {
            const title = target.getAttribute('aria-label') || target.querySelector('h1,h2,h3')?.textContent;
            const text = target.getAttribute('role') === 'dialog' ? `Ventana abierta${title ? `: ${title}` : ''}` : describeElement(target);
            announce(text, target.getAttribute('role') === 'alert' || target.getAttribute('aria-live') === 'assertive' ? 1 : 0);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
    const onSubmit = (event) => {
      if (!event.target.closest('[data-accessibility-widget]')) announce('Formulario enviado. Esperá la respuesta.');
    };
    document.addEventListener('submit', onSubmit);
    return () => {
      observer.disconnect();
      document.removeEventListener('submit', onSubmit);
      clearTimeout(timer);
    };
  }, [preferences.enabled, preferences.announcements, speak, supported]);

  const update = (key, value) => setPreferences((current) => ({ ...current, [key]: value }));
  const languages = [...new Set(['es', ...voices.map((voice) => voice.lang).filter(Boolean)])];
  const filteredVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(preferences.language.toLowerCase()));
  return createPortal(
    <section id="accessibility-panel" data-accessibility-widget ref={panelRef} tabIndex="-1"
      aria-label="Panel de accesibilidad" className="accessibility-panel" hidden={!open}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <div className="accessibility-panel-header">
        <div><h2>Accesibilidad</h2><p>Herramientas para navegar</p></div>
        <button type="button" className="accessibility-close" onClick={() => close()} aria-label="Cerrar panel de accesibilidad">×</button>
      </div>
      <button type="button" className="accessibility-toggle" aria-pressed={preferences.enabled} onClick={() => update('enabled', !preferences.enabled)}>
        Modo de accesibilidad: {preferences.enabled ? 'activado' : 'desactivado'}
      </button>
      <p className="accessibility-note">La voz es opcional y puede superponerse con tu lector de pantalla.</p>
      <fieldset disabled={!preferences.enabled}>
        <legend>Lectura</legend>
        {!supported && <p role="status">Este navegador no dispone de lectura por voz.</p>}
        <div className="accessibility-grid">
          <button type="button" disabled={!supported} onClick={start}>Iniciar lectura</button>
          <button type="button" disabled={!supported || playback !== 'playing'} onClick={() => { window.speechSynthesis.pause(); playbackRef.current = 'paused'; setPlayback('paused'); }}>Pausar</button>
          <button type="button" disabled={!supported || playback !== 'paused'} onClick={() => { window.speechSynthesis.resume(); playbackRef.current = 'playing'; setPlayback('playing'); }}>Reanudar</button>
          <button type="button" disabled={!supported || playback === 'stopped'} onClick={stop}>Detener</button>
          <button type="button" disabled={!supported} onClick={start}>Reiniciar</button>
          <button type="button" disabled={!supported || (!cursorRef.current && !lastSelectionRef.current)} onClick={() => {
            if (lastSelectionRef.current) speak(lastSelectionRef.current);
            else readItem(cursorRef.current);
          }}>Repetir elemento</button>
          <button type="button" disabled={!supported} onClick={readSelection}>Leer selección</button>
        </div>
      </fieldset>
      <fieldset disabled={!preferences.enabled}>
        <legend>Navegación auditiva</legend>
        <label>Recorrer
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Todos los elementos</option><option value="headings">Encabezados</option><option value="sections">Secciones</option>
            <option value="links">Enlaces</option><option value="controls">Controles</option>
          </select>
        </label>
        <div className="accessibility-grid">
          <button type="button" disabled={!supported} onClick={() => move(-1)}>Anterior</button>
          <button type="button" disabled={!supported} onClick={() => move(1)}>Siguiente</button>
          <button type="button" onClick={goToCurrent} disabled={!cursorRef.current}>Ir al elemento</button>
        </div>
        <p>Elemento actual: {currentText || 'Ninguno'}</p>
      </fieldset>
      <fieldset disabled={!preferences.enabled}>
        <legend>Voz</legend>
        <label>Velocidad: {preferences.rate}×
          <input type="range" min="0.5" max="2" step="0.1" value={preferences.rate} onChange={(event) => update('rate', Number(event.target.value))} />
        </label>
        <label>Idioma
          <select value={preferences.language} onChange={(event) => setPreferences((current) => ({ ...current, language: event.target.value, voice: '' }))}>
            {languages.map((language) => <option key={language} value={language}>{language === 'es' ? 'Español' : language}</option>)}
          </select>
        </label>
        <label>Voz
          <select value={filteredVoices.some((voice) => voice.voiceURI === preferences.voice) ? preferences.voice : ''} onChange={(event) => update('voice', event.target.value)}>
            <option value="">Predeterminada del dispositivo</option>
            {filteredVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
          </select>
        </label>
        <button type="button" disabled={!supported} onClick={() => speak('Esta es una prueba de voz para la accesibilidad.')}>Probar voz</button>
        <label className="accessibility-check"><input type="checkbox" checked={preferences.announcements} onChange={(event) => update('announcements', event.target.checked)} /> Anunciar cambios con voz</label>
      </fieldset>
      <fieldset disabled={!preferences.enabled}>
        <legend>Apoyo visual</legend>
        <label className="accessibility-check"><input type="checkbox" checked={preferences.contrast} onChange={(event) => update('contrast', event.target.checked)} /> Alto contraste</label>
        <label>Tamaño de texto
          <select value={preferences.textSize} onChange={(event) => update('textSize', Number(event.target.value))}>
            <option value="100">Normal</option><option value="125">125 %</option><option value="150">150 %</option>
          </select>
        </label>
        <label className="accessibility-check"><input type="checkbox" checked={preferences.highlight} onChange={(event) => update('highlight', event.target.checked)} /> Resaltar elemento leído</label>
      </fieldset>
      <button type="button" className="accessibility-help" aria-expanded={instructions} onClick={() => setInstructions(!instructions)}>Instrucciones de uso</button>
      {instructions && <p>Usá Tab y Mayús + Tab para recorrer controles, Enter o Espacio para activarlos y Escape para cerrar el panel. La lectura no mueve el foco; usá “Ir al elemento” para interactuar. El idioma cambia la voz, no traduce el contenido.</p>}
      {message && <p className="accessibility-message" role="status">{message}</p>}
    </section>,
    container || document.body
  );
}
