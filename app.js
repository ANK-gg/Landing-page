lucide.createIcons();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isMotionPaused = prefersReducedMotion;
let isAutoRotating = false;

const hudMessage = document.getElementById('hud-message');
const heroStatusText = document.getElementById('hero-status-text');
const telemetryToF = document.getElementById('telemetry-tof');
const telemetryBat = document.getElementById('telemetry-bat');

function updateMotionUI() {
    const motionBtn = document.getElementById('btn-motion-toggle');
    const motionLabel = document.getElementById('motion-label');
    const rotateBtn = document.getElementById('btn-autorotate');
    const rotateLabel = document.getElementById('rotate-label');

    if (isMotionPaused) {
        document.body.classList.add('motion-paused');
        isAutoRotating = false;
        if (motionBtn) motionBtn.setAttribute('aria-pressed', 'true');
        if (motionLabel) motionLabel.textContent = "Reanudar animaciones";
    } else {
        document.body.classList.remove('motion-paused');
        if (motionBtn) motionBtn.setAttribute('aria-pressed', 'false');
        if (motionLabel) motionLabel.textContent = "Pausar animaciones";
    }

    if (rotateBtn && rotateLabel) {
        rotateBtn.setAttribute('aria-pressed', String(isAutoRotating));
        rotateLabel.textContent = isAutoRotating ? "Giro 3D: Activo" : "Giro 3D: Pausado";
    }
}
updateMotionUI();

function toggleGlobalMotion() {
    isMotionPaused = !isMotionPaused;
    speak(isMotionPaused ? "Animaciones pausadas." : "Animaciones reanudadas.");
    updateMotionUI();
}

let audioVoiceEnabled = false; // Inicia desactivado por defecto
let lastSpokenInstruction = "Avance recto 30 metros hacia el cruce peatonal.";
let currentEnvMode = "Exterior (4.0 metros)";
let currentVoiceRate = 1.05;

function speak(text) {
    if (hudMessage) hudMessage.textContent = text;
    if (heroStatusText) heroStatusText.textContent = text;
    if (!audioVoiceEnabled) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = currentVoiceRate;
        window.speechSynthesis.speak(utterance);
    }
}

function toggleVoiceGuide() {
    audioVoiceEnabled = !audioVoiceEnabled;
    
    // Etiqueta del simulador 3D
    const simLbl = document.getElementById('voice-label');
    // Elementos del botón TalkBack en el Header
    const headerBtn = document.getElementById('btn-header-talkback');
    const headerLbl = document.getElementById('header-talkback-label');
    const headerIcon = document.getElementById('header-talkback-icon');

    if (audioVoiceEnabled) {
        if (simLbl) simLbl.textContent = "Voz: Activada";
        if (headerLbl) headerLbl.textContent = "TalkBack: Activo";
        if (headerBtn) {
            headerBtn.setAttribute('aria-pressed', 'true');
            headerBtn.classList.remove('bg-brand-canvas', 'text-brand-dark');
            headerBtn.classList.add('bg-brand-bluelight', 'text-brand-blue', 'border-brand-blue');
        }
        if (headerIcon) {
            headerIcon.setAttribute('data-lucide', 'volume-2');
            headerIcon.classList.remove('text-brand-subtle');
            headerIcon.classList.add('text-brand-blue');
        }
        lucide.createIcons();
        speak("TalkBack activado. Guía acústica por voz encendida.");
    } else {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (simLbl) simLbl.textContent = "Voz: Desactivada";
        if (headerLbl) headerLbl.textContent = "Activar TalkBack";
        if (headerBtn) {
            headerBtn.setAttribute('aria-pressed', 'false');
            headerBtn.classList.remove('bg-brand-bluelight', 'text-brand-blue', 'border-brand-blue');
            headerBtn.classList.add('bg-brand-canvas', 'text-brand-dark');
        }
        if (headerIcon) {
            headerIcon.setAttribute('data-lucide', 'volume-x');
            headerIcon.classList.remove('text-brand-blue');
            headerIcon.classList.add('text-brand-subtle');
        }
        lucide.createIcons();
        if (hudMessage) hudMessage.textContent = "TalkBack desactivado (Modo silencioso).";
        if (heroStatusText) heroStatusText.textContent = "TalkBack desactivado. Actívalo arriba si deseas guía por voz.";
    }
}

function scanToF() {
    const distance = (1.1 + Math.random() * 2.8).toFixed(1);
    if (telemetryToF) telemetryToF.textContent = distance + "m";
    if (accentBlueLight && !isMotionPaused) {
        accentBlueLight.intensity = 3.5;
        setTimeout(() => { accentBlueLight.intensity = 1.2; }, 300);
    }
    lastSpokenInstruction = `Sensor ToF: Obstáculo detectado a ${distance} metros.`;
    speak(lastSpokenInstruction);
}

function interactButton(type) {
    switch(type) {
        case 'power':
            speak("Dispositivo UPI encendido. Batería al 88 por ciento. Sensores activos.");
            break;
        case 'mic':
            speak("Micrófono activo. Indique su destino por voz.");
            break;
        case 'poi':
            speak("Ubicación actual confirmada: cruce peatonal a 15 metros.");
            break;
        case 'mode-env':
            currentEnvMode = currentEnvMode.includes("Exterior") ? "Interior (1.5 metros)" : "Exterior (4.0 metros)";
            if (telemetryToF) telemetryToF.textContent = currentEnvMode.includes("Exterior") ? "4.0m" : "1.5m";
            speak(`Botón M1: Rango del sensor ToF cambiado a modo ${currentEnvMode}.`);
            break;
        case 'voice-speed':
            currentVoiceRate = currentVoiceRate === 1.05 ? 1.35 : 1.05;
            speak(`Botón M2: Velocidad de voz ajustada a modo ${currentVoiceRate > 1.1 ? 'rápido' : 'normal'}.`);
            break;
        case 'repeat':
            speak(`Botón Repetir: ${lastSpokenInstruction}`);
            break;
        case 'cancel':
            speak("Botón Cancelar: Navegación actual detenida.");
            break;
        case 'dpad-up':
            lastSpokenInstruction = "Avance recto 40 metros hacia la siguiente esquina.";
            speak(lastSpokenInstruction);
            break;
        case 'dpad-down':
            speak("Faltan 180 metros para llegar a su destino.");
            break;
        case 'dpad-left':
            lastSpokenInstruction = "Gire a la izquierda en la intersección.";
            speak(lastSpokenInstruction);
            break;
        case 'dpad-right':
            lastSpokenInstruction = "Gire a la derecha hacia el paso peatonal.";
            speak(lastSpokenInstruction);
            break;
        case 'dpad-center':
            speak("Botón OK: Cobertura satelital GNSS 3D Fix óptima.");
            break;
        case 'vol-up':
            speak("Volumen aumentado.");
            break;
        case 'vol-down':
            speak("Volumen reducido.");
            break;
    }
}

let sosProgress = 0;
let sosInterval = null;

function startSosHold() {
    const bar = document.getElementById('sos-hold-bar');
    sosProgress = 0;
    clearInterval(sosInterval);
    sosInterval = setInterval(() => {
        sosProgress += 10;
        if (bar) bar.style.width = `${Math.min(sosProgress, 100)}%`;
        if (sosProgress >= 100) {
            clearInterval(sosInterval);
            triggerEmergencySOS();
        }
    }, 300);
}

function cancelSosHold() {
    clearInterval(sosInterval);
    const bar = document.getElementById('sos-hold-bar');
    if (sosProgress < 100 && bar) bar.style.width = '0%';
}

function triggerSosAccessibleClick() {
    if (sosProgress < 100) triggerEmergencySOS();
}

function triggerEmergencySOS() {
    const bar = document.getElementById('sos-hold-bar');
    if (bar) bar.style.width = '100%';
    if (telemetryBat) {
        telemetryBat.textContent = "SOS ACTIVO";
        telemetryBat.classList.add('text-red-400');
    }
    speak("Protocolo SOS de 3 segundos confirmado. Enviando coordenadas GPS por SMS a contactos de emergencia.");
    setTimeout(() => {
        if (bar) bar.style.width = '0%';
        if (telemetryBat) {
            telemetryBat.textContent = "88%";
            telemetryBat.classList.remove('text-red-400');
        }
    }, 4000);
}

/* Validación con estados de Error y Éxito */
function handleContactSubmit(event) {
    event.preventDefault();
    const fields = [
        { id: 'contact-name', err: 'error-name', valid: val => val.trim().length > 2 },
        { id: 'contact-email', err: 'error-email', valid: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
        { id: 'contact-type', err: 'error-type', valid: val => val.trim() !== '' },
        { id: 'contact-message', err: 'error-message', valid: val => val.trim().length > 5 }
    ];

    let hasError = false;
    fields.forEach(f => {
        const input = document.getElementById(f.id);
        const errText = document.getElementById(f.err);
        if (!f.valid(input.value)) {
            hasError = true;
            input.classList.remove('border-brand-border');
            input.classList.add('border-brand-sos', 'bg-brand-soslight');
            errText.classList.remove('hidden');
        } else {
            input.classList.remove('border-brand-sos', 'bg-brand-soslight');
            input.classList.add('border-brand-border');
            errText.classList.add('hidden');
        }
    });

    const status = document.getElementById('contact-status');
    if (hasError) {
        status.className = "p-4 rounded-xl text-notas font-bold bg-brand-soslight text-brand-sos border border-brand-sos block";
        status.textContent = "Error en el formulario: revisa los campos marcados en rojo antes de enviar.";
        speak("Hay campos obligatorios pendientes en el formulario.");
        return;
    }

    status.className = "p-4 rounded-xl text-notas font-bold bg-brand-successlight text-brand-success border border-brand-success block";
    status.textContent = "¡Mensaje enviado con éxito! El equipo del proyecto UPI se pondrá en contacto pronto.";
    speak("Formulario enviado con éxito.");
    event.target.reset();
}

/* ==================================================================================== */
/* LÓGICA DEL CENTRO DE SOPORTE Y ASISTENCIA AL USUARIO (6 COMPONENTES)                 */
/* ==================================================================================== */

function switchSupportTab(tabKey) {
    const allTabs = ['kb', 'videos', 'faqs', 'foro', 'reclamaciones', 'tickets'];
    const tabNamesVoice = {
        kb: "Base de conocimientos y manuales de usuario.",
        videos: "Videotutoriales accesibles con audiodescripción.",
        faqs: "Preguntas frecuentes sobre UPI.",
        foro: "Foro comunitario de usuarios.",
        reclamaciones: "Libro de reclamaciones oficial.",
        tickets: "Sistema de tickets técnicos y seguimiento."
    };

    allTabs.forEach(k => {
        const btn = document.getElementById(`tab-${k}`);
        const panel = document.getElementById(`panel-${k}`);
        if (k === tabKey) {
            btn.setAttribute('aria-selected', 'true');
            btn.classList.remove('bg-transparent', 'text-brand-dark', 'font-semibold');
            btn.classList.add('bg-brand-blue', 'text-white', 'font-bold');
            panel.classList.remove('hidden');
        } else {
            btn.setAttribute('aria-selected', 'false');
            btn.classList.remove('bg-brand-blue', 'text-white', 'font-bold');
            btn.classList.add('bg-transparent', 'text-brand-dark', 'font-semibold');
            panel.classList.add('hidden');
        }
    });

    if (tabNamesVoice[tabKey]) {
        speak(`Pestaña seleccionada: ${tabNamesVoice[tabKey]}`);
    }
}

function openReclamacionesDirect() {
    switchSupportTab('reclamaciones');
    const sec = document.getElementById('soporte');
    if (sec) sec.scrollIntoView({ behavior: isMotionPaused ? 'auto' : 'smooth' });
}

/* --- 1. BASE DE CONOCIMIENTOS --- */
const kbArticlesData = [
    {
        id: 'kb-1',
        category: 'Primeros Pasos',
        time: '3 min',
        title: 'Reconocimiento táctil de botones y encendido inicial',
        summary: 'Identifica al tacto la botonera en relieve del chasis UPI y realiza tu primera verificación de batería.',
        steps: [
            '1. Sujeta el dispositivo UPI con el cordón inferior hacia tu muñeca y la cúpula de tres lentes mirando hacia adelante.',
            '2. Presiona el botón superior izquierdo (Encendido) para escuchar el porcentaje de batería y estado de los sensores.',
            '3. Ubica en el centro el botón circular más prominente (Micrófono) para dictar cualquier dirección por voz.',
            '4. Explora la cruz direccional central (D-Pad) y el botón rojo inferior en alto relieve correspondiente a la alerta SOS.'
        ]
    },
    {
        id: 'kb-2',
        category: 'Sensores ToF',
        time: '4 min',
        title: 'Configuración de rango láser ToF (Botón M1: Exterior vs Interior)',
        summary: 'Aprende cuándo utilizar el alcance de 4.0 metros en calle abierta y 1.5 metros en espacios cerrados.',
        steps: [
            '1. En veredas, parques o avenidas, activa el modo Exterior (4.0 m) pulsando el botón físico M1 situado a la izquierda.',
            '2. El haz infrarrojo VCSEL de 940 nm detectará ramas, toldos, carteles o espejos de camiones a la altura del torso y cabeza.',
            '3. Al ingresar a oficinas, pasillos o transporte público, presiona nuevamente M1 para conmutar al modo Interior (1.5 m) y evitar alertas por paredes cercanas.',
            '4. La vibración aumentará su frecuencia de forma proporcional a medida que te acerques al obstáculo.'
        ]
    },
    {
        id: 'kb-3',
        category: 'GPS y Rutas',
        time: '3 min',
        title: 'Navegación por voz paso a paso y uso de botones REP y ESC',
        summary: 'Cómo dictar un destino, consultar distancia restante y repetir la última instrucción en entornos ruidosos.',
        steps: [
            '1. Mantén pulsado el botón central del Micrófono y di claramente el destino o cruce peatonal.',
            '2. Presiona el botón OK en el centro de la cruz direccional para confirmar la ruta sugerida por el receptor GNSS.',
            '3. Si el ruido del tráfico impide oír una indicación, presiona el botón inferior izquierdo REP para repetir la última frase.',
            '4. Para ajustar la velocidad de locución entre normal y rápida, utiliza el botón derecho M2.'
        ]
    },
    {
        id: 'kb-4',
        category: 'Protocolo SOS',
        time: '2 min',
        title: 'Funcionamiento del botón SOS de 3 segundos y alertas SMS por eSIM',
        summary: 'Protocolo de seguridad contra falsas alarmas y envío automático de coordenadas GPS a familiares.',
        steps: [
            '1. En caso de desorientación o emergencia médica, ubica el botón inferior circular de mayor relieve (SOS).',
            '2. Mantenlo presionado de forma continua durante 3 segundos. Escucharás tres tonos preventivos.',
            '3. Al completarse los 3 segundos, el módem 4G LTE-M envía automáticamente un SMS con tus coordenadas GNSS exactas a tus contactos registrados.',
            '4. Si lo presionaste por error, suéltalo antes de los 3 segundos o pulsa ESC para cancelar la alerta.'
        ]
    },
    {
        id: 'kb-5',
        category: 'Mantenimiento e IP65',
        time: '2 min',
        title: 'Limpieza óptica de la cúpula ToF, carga USB-C y protección IP65',
        summary: 'Cuidados recomendados para mantener la precisión del láser infrarrojo y las 18 horas de autonomía.',
        steps: [
            '1. Limpia semanalmente la ventana superior de los tres sensores ToF con un paño de microfibra seco para evitar lecturas erróneas por polvo.',
            '2. El sellado IP65 protege el UPI frente a lluvia moderada y salpicaduras; no sumerjas el dispositivo en agua.',
            '3. Utiliza el puerto inferior USB-C con un cargador estándar de 5V. Una carga completa toma 90 minutos y brinda hasta 18 horas de uso.'
        ]
    },
    {
        id: 'kb-6',
        category: 'Primeros Pasos',
        time: '4 min',
        title: 'Uso coordinado: Bastón Blanco en mano dominante y UPI en mano de apoyo',
        summary: 'Técnica recomendada por especialistas en orientación y movilidad para cobertura total suelo-cabeza.',
        steps: [
            '1. Conserva siempre tu bastón blanco en tu mano habitual para detectar desniveles, escalones, baches y texturas podotáctiles.',
            '2. Porta el UPI en la mano opuesta a la altura del pecho o sujeto con su correa ergonómica apuntando hacia tu línea de marcha.',
            '3. De esta forma, el bastón protege tus pasos a nivel del suelo mientras el UPI resguarda tu rostro y torso frente a obstáculos colgados.'
        ]
    }
];

let currentKbCategory = 'all';
let selectedArticle = kbArticlesData[0];

function renderKnowledgeBase() {
    const query = (document.getElementById('kb-search-input')?.value || '').toLowerCase().trim();
    const grid = document.getElementById('kb-articles-grid');
    if (!grid) return;

    const filtered = kbArticlesData.filter(art => {
        const matchCat = currentKbCategory === 'all' || art.category === currentKbCategory;
        const matchText = art.title.toLowerCase().includes(query) ||
                          art.summary.toLowerCase().includes(query) ||
                          art.steps.join(' ').toLowerCase().includes(query);
        return matchCat && matchText;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="sm:col-span-2 p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <p class="text-cuerpo font-bold text-brand-dark">No se encontraron artículos con ese término.</p>
                <p class="text-notas text-brand-subtle mt-1">Prueba buscando palabras como "ToF", "SOS", "batería" o "M1".</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(art => {
        const isSelected = selectedArticle && selectedArticle.id === art.id;
        return `
            <article class="p-6 rounded-2xl ${isSelected ? 'bg-brand-bluelight border-2 border-brand-blue' : 'bg-brand-surface border border-brand-border'} flex flex-col justify-between transition">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-notas font-bold text-brand-blue">${art.category}</span>
                        <span class="text-notas font-mono text-brand-subtle">${art.time}</span>
                    </div>
                    <h3 class="text-h2 font-bold text-brand-dark">${art.title}</h3>
                    <p class="text-notas text-brand-subtle mt-2">${art.summary}</p>
                </div>
                <button type="button" onclick="selectKbArticle('${art.id}')" class="mt-4 min-h-[48px] px-4 py-2 rounded-xl ${isSelected ? 'bg-brand-blue text-white font-bold' : 'bg-brand-canvas hover:bg-slate-200 text-brand-dark border border-brand-border font-semibold'} text-notas transition flex items-center justify-between">
                    <span>${isSelected ? 'Artículo abierto en el lector' : 'Leer guía paso a paso'}</span>
                    <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
                </button>
            </article>
        `;
    }).join('');

    lucide.createIcons();
}

function setKbCategory(cat, evt) {
    currentKbCategory = cat;
    document.querySelectorAll('.kb-cat-btn').forEach(btn => {
        btn.classList.remove('bg-brand-blue', 'text-white', 'font-bold');
        btn.classList.add('bg-brand-canvas', 'text-brand-dark', 'font-semibold');
    });
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.remove('bg-brand-canvas', 'text-brand-dark', 'font-semibold');
        evt.currentTarget.classList.add('bg-brand-blue', 'text-white', 'font-bold');
    }
    renderKnowledgeBase();
}

function filterKnowledgeBase() {
    renderKnowledgeBase();
}

function selectKbArticle(artId) {
    const found = kbArticlesData.find(a => a.id === artId);
    if (!found) return;
    selectedArticle = found;

    document.getElementById('reader-category').textContent = found.category;
    document.getElementById('reader-time').textContent = `Lectura: ${found.time}`;
    document.getElementById('reader-title').textContent = found.title;
    document.getElementById('reader-summary').textContent = found.summary;
    document.getElementById('reader-steps').innerHTML = found.steps.map(s => `<p class="pb-2 border-b border-brand-border last:border-none last:pb-0">${s}</p>`).join('');

    renderKnowledgeBase();
    speak(`Guía seleccionada: ${found.title}. Presiona el botón Escuchar artículo por voz para oír todos los pasos.`);
}

function speakCurrentArticle() {
    if (!selectedArticle) return;
    const fullText = `${selectedArticle.title}. ${selectedArticle.summary}. Pasos a seguir: ${selectedArticle.steps.join(' ')}`;
    speak(fullText);
}

function copyCurrentArticle() {
    if (!selectedArticle) return;
    const textToCopy = `${selectedArticle.title}\n${selectedArticle.summary}\n\n${selectedArticle.steps.join('\n')}`;
    const tempArea = document.createElement('textarea');
    tempArea.value = textToCopy;
    document.body.appendChild(tempArea);
    tempArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempArea);

    const lbl = document.getElementById('copy-kb-label');
    if (lbl) {
        lbl.textContent = "¡Copiado!";
        setTimeout(() => { lbl.textContent = "Copiar guía"; }, 2500);
    }
    speak("Contenido de la guía copiado al portapapeles.");
}

/* --- 2. VIDEOTUTORIALES ACCESIBLES --- */
const videoTutorialsData = [
    {
        id: 'vid-1',
        module: 'Módulo 1 de 4',
        duration: '02:45',
        icon: 'hand',
        title: '1. Ergonomía Háptica y Botones M1 / M2',
        desc: 'Cómo sujetar el chasis UPI e identificar al tacto los botones de rango láser (M1) y velocidad de voz (M2).',
        ccScript: [
            '[CC 00:02] (Audiodescripción) Primer plano de una mano sujetando el chasis ergonómico del UPI.',
            '[CC 00:08] El pulgar se desliza hacia el botón izquierdo M1, que posee un relieve circular distintivo.',
            '[CC 00:14] Al pulsar M1, el altavoz frontal anuncia: "Modo Exterior 4 metros activado".',
            '[CC 00:20] Ahora el pulgar presiona el botón derecho M2 para acelerar la síntesis de voz.'
        ],
        transcript: 'En este primer videotutorial exploramos la ergonomía del Ubicador Personal Intuitivo. El chasis cuenta con biseles laterales texturizados que orientan la mano hacia adelante. El botón M1 permite alternar entre modo exterior (4 metros) e interior (1.5 metros), mientras que el botón M2 ajusta la velocidad de locución.'
    },
    {
        id: 'vid-2',
        module: 'Módulo 2 de 4',
        duration: '03:15',
        icon: 'radar',
        title: '2. Uso Complementario con Bastón Blanco y Láser ToF',
        desc: 'Demostración en vereda real detectando ramas de árboles y toldos elevados a 4 metros de distancia.',
        ccScript: [
            '[CC 00:02] (Audiodescripción) Un usuario camina por una vereda usando su bastón blanco en la mano derecha y el UPI en la izquierda.',
            '[CC 00:09] A 3.2 metros aparece la rama baja de un árbol que el bastón blanco no alcanza a tocar.',
            '[CC 00:15] La cúpula ToF de 940 nm detecta la rama y activa una vibración gradual junto al aviso por voz.',
            '[CC 00:22] El usuario esquiva con seguridad el obstáculo aéreo manteniendo su marcha fluida.'
        ],
        transcript: 'El UPI no reemplaza al bastón blanco, sino que lo complementa. Mientras el bastón explora desniveles y bordillos a nivel del suelo, la matriz triple Time-of-Flight proyecta un cono infrarrojo seguro para la vista que protege el tórax y la cabeza frente a obstáculos aéreos.'
    },
    {
        id: 'vid-3',
        module: 'Módulo 3 de 4',
        duration: '02:10',
        icon: 'shield-alert',
        title: '3. Activación de Emergencia SOS de 3 Segundos',
        desc: 'Cómo funciona el filtro anti-falsas alarmas y el envío de coordenadas GNSS mediante la eSIM 4G integrada.',
        ccScript: [
            '[CC 00:02] (Audiodescripción) Detalle del botón rojo inferior SOS con borde en alto relieve.',
            '[CC 00:08] El usuario mantiene presionado el botón SOS durante 3 segundos continuos.',
            '[CC 00:14] La barra de confirmación llega al 100% y el UPI anuncia: "Enviando coordenadas GPS por SMS".',
            '[CC 00:20] En el teléfono del familiar aparece el mensaje con el enlace exacto de ubicación satelital.'
        ],
        transcript: 'Para prevenir activaciones accidentales al guardar el dispositivo en el bolsillo, el botón SOS requiere una pulsación sostenida de 3 segundos. Una vez confirmada, la eSIM 4G autónoma transmite las coordenadas GNSS 3D Fix a los contactos de confianza sin depender de un smartphone.'
    },
    {
        id: 'vid-4',
        module: 'Módulo 4 de 4',
        duration: '02:30',
        icon: 'compass',
        title: '4. Comandos de Voz y Navegación Peatonal GNSS',
        desc: 'Dictado de destinos con el micrófono central y consulta de cruces peatonales mediante la cruz D-Pad.',
        ccScript: [
            '[CC 00:02] (Audiodescripción) El usuario presiona el botón azul central del micrófono.',
            '[CC 00:08] Dicta por voz: "Ir al paradero accesible de Avenida Arequipa".',
            '[CC 00:14] El usuario presiona OK en el centro de la cruz direccional para iniciar la guía paso a paso.',
            '[CC 00:20] Con la flecha inferior del D-Pad consulta cuántos metros faltan para llegar.'
        ],
        transcript: 'El micrófono central permite dictar destinos sin necesidad de pantallas visuales. Con la cruz direccional D-Pad puedes avanzar entre tramos de la ruta, consultar la distancia restante con la flecha abajo o confirmar tu posición actual con el botón OK.'
    }
];

let currentVideo = videoTutorialsData[0];
let isVideoPlaying = false;
let videoTimer = null;
let videoStepIndex = 0;
let videoADEnabled = true;
let videoCCEnabled = true;

function renderVideoPlaylist() {
    const container = document.getElementById('video-playlist-container');
    if (!container) return;

    container.innerHTML = videoTutorialsData.map(v => {
        const active = currentVideo.id === v.id;
        return `
            <div class="p-4 rounded-2xl ${active ? 'bg-brand-bluelight border-2 border-brand-blue' : 'bg-brand-surface border border-brand-border'} flex flex-col justify-between gap-3 transition">
                <div class="flex items-start justify-between gap-2">
                    <span class="text-notas font-bold text-brand-blue">${v.module}</span>
                    <span class="text-notas font-mono text-brand-subtle">${v.duration} • AD + CC</span>
                </div>
                <div>
                    <h4 class="text-cuerpo font-bold text-brand-dark">${v.title}</h4>
                    <p class="text-notas text-brand-subtle mt-1">${v.desc}</p>
                </div>
                <button type="button" onclick="selectTutorialVideo('${v.id}')" class="min-h-[48px] px-4 py-2 rounded-xl ${active ? 'bg-brand-blue text-white font-bold' : 'bg-brand-canvas hover:bg-slate-200 text-brand-dark border border-brand-border font-semibold'} text-notas transition flex items-center justify-center gap-2">
                    <i data-lucide="play-circle" class="w-5 h-5" aria-hidden="true"></i>
                    <span>${active ? 'Cargado en el reproductor' : 'Cargar este videotutorial'}</span>
                </button>
            </div>
        `;
    }).join('');

    document.getElementById('video-badge-module').textContent = currentVideo.module;
    document.getElementById('video-stage-title').textContent = currentVideo.title;
    document.getElementById('video-stage-desc').textContent = currentVideo.desc;
    document.getElementById('video-time-total').textContent = currentVideo.duration;
    document.getElementById('video-transcript-text').textContent = currentVideo.transcript;

    lucide.createIcons();
}

function selectTutorialVideo(vidId) {
    stopTutorialVideo();
    const found = videoTutorialsData.find(v => v.id === vidId);
    if (!found) return;
    currentVideo = found;
    renderVideoPlaylist();
    speak(`Videotutorial cargado: ${found.title}. Presiona Reproducir con AD para escuchar la audiodescripción.`);
}

function togglePlayTutorial() {
    const playLbl = document.getElementById('label-video-play');
    const progressBar = document.getElementById('video-progress-bar');
    const ccBox = document.getElementById('video-cc-box');
    const timeCurrent = document.getElementById('video-time-current');

    if (isVideoPlaying) {
        isVideoPlaying = false;
        clearInterval(videoTimer);
        if (playLbl) playLbl.textContent = "Reanudar con AD";
        speak("Videotutorial en pausa.");
        return;
    }

    isVideoPlaying = true;
    if (playLbl) playLbl.textContent = "Pausar video";
    videoStepIndex = 0;

    const runStep = () => {
        if (!isVideoPlaying) return;
        if (videoStepIndex >= currentVideo.ccScript.length) {
            stopTutorialVideo();
            if (ccBox && videoCCEnabled) ccBox.textContent = "[CC] Fin del videotutorial. Puedes revisar la transcripción inferior.";
            speak("Fin del videotutorial.");
            return;
        }

        const line = currentVideo.ccScript[videoStepIndex];
        if (ccBox) {
            ccBox.textContent = videoCCEnabled ? line : "[Subtítulos CC desactivados por el usuario]";
        }
        if (progressBar) {
            const pct = ((videoStepIndex + 1) / currentVideo.ccScript.length) * 100;
            progressBar.style.width = `${pct}%`;
        }
        if (timeCurrent) {
            timeCurrent.textContent = `00:${String((videoStepIndex + 1) * 6).padStart(2, '0')}`;
        }
        if (videoADEnabled) {
            speak(line.replace(/\[CC.*?\]/g, ''));
        }
        videoStepIndex++;
    };

    runStep();
    videoTimer = setInterval(runStep, 5500);
}

function stopTutorialVideo() {
    isVideoPlaying = false;
    clearInterval(videoTimer);
    videoStepIndex = 0;
    const playLbl = document.getElementById('label-video-play');
    const progressBar = document.getElementById('video-progress-bar');
    const timeCurrent = document.getElementById('video-time-current');
    if (playLbl) playLbl.textContent = "Reproducir con AD";
    if (progressBar) progressBar.style.width = "0%";
    if (timeCurrent) timeCurrent.textContent = "00:00";
}

function toggleVideoAD() {
    videoADEnabled = !videoADEnabled;
    const badge = document.getElementById('badge-ad-state');
    const btn = document.getElementById('btn-toggle-ad');
    if (badge) badge.textContent = videoADEnabled ? "AD: ACTIVO" : "AD: INACTIVO";
    if (btn) btn.setAttribute('aria-pressed', String(videoADEnabled));
    speak(videoADEnabled ? "Pista de audiodescripción activada." : "Pista de audiodescripción desactivada.");
}

function toggleVideoCC() {
    videoCCEnabled = !videoCCEnabled;
    const badge = document.getElementById('badge-cc-state');
    const btn = document.getElementById('btn-toggle-cc');
    const ccBox = document.getElementById('video-cc-box');
    if (badge) badge.textContent = videoCCEnabled ? "CC: ACTIVO" : "CC: OCULTO";
    if (btn) btn.setAttribute('aria-pressed', String(videoCCEnabled));
    if (ccBox) ccBox.textContent = videoCCEnabled ? "[CC] Subtítulos cerrados activados." : "[Subtítulos CC ocultos]";
    speak(videoCCEnabled ? "Subtítulos cerrados activados." : "Subtítulos cerrados ocultos.");
}

/* --- 3. PREGUNTAS FRECUENTES (FAQs) --- */
const faqsData = [
    {
        id: 'faq-precio',
        category: 'Precio y Adquisición',
        q: '¿Cuál es el precio del dispositivo UPI y por qué cuesta menos de 70 dólares?',
        a: 'El dispositivo UPI tiene un precio social objetivo de menos de 70 dólares estadounidenses (aproximadamente $65 USD o S/ 245 soles peruanos). Se logró este costo accesible utilizando componentes electrónicos modulares de alta eficiencia y manufactura local, resultando hasta un 80% más económico que dispositivos asistivos importados que superan los $600 a $1,500 USD.'
    },
    {
        id: 'faq-compra',
        category: 'Precio y Adquisición',
        q: '¿Dónde se puede comprar el UPI y realizan envíos a provincias en el Perú?',
        a: 'Puedes reservar tu unidad o solicitar lotes institucionales directamente en la sección de Contacto de esta plataforma. Realizamos entregas en Lima, Ica, Chincha y envíos asegurados a nivel nacional en todo el Perú, contando además con tarifas preferenciales para usuarios inscritos en CONADIS y convenios con OMAPED.'
    },
    {
        id: 'faq-1',
        category: 'Seguridad y Sensores',
        q: '¿El dispositivo UPI reemplaza al bastón blanco tradicional?',
        a: 'No. El UPI está diseñado estrictamente como un complemento sensorial del bastón blanco. Mientras el bastón detecta desniveles, baches y texturas en el suelo mediante contacto directo, el UPI escanea obstáculos aéreos (ramas, toldos, carteles o espejos de vehículos) entre 0.2 m y 4.0 m para proteger el torso y la cabeza.'
    },
    {
        id: 'faq-2',
        category: 'Seguridad y Sensores',
        q: '¿El láser infrarrojo Time-of-Flight (940 nm) es seguro para los ojos de los peatones?',
        a: 'Sí. La matriz triple VCSEL de 940 nm cumple con la certificación internacional de seguridad ocular Clase 1 (IEC 60825-1), lo que garantiza que el haz infrarrojo es completamente inocuo para la retina humana y de mascotas en cualquier condición de uso continuo.'
    },
    {
        id: 'faq-3',
        category: 'Conectividad y SOS',
        q: '¿Necesito conectar el UPI a un teléfono inteligente para usar el GPS o el botón SOS?',
        a: 'No. El UPI incorpora su propio receptor satelital multiconstelación (GPS, GLONASS y Galileo) y un módem celular 4G LTE-M / NB-IoT con tarjeta eSIM integrada. Puede guiarte por voz y enviar alertas SMS de emergencia de manera 100% autónoma.'
    },
    {
        id: 'faq-4',
        category: 'Conectividad y SOS',
        q: '¿Cómo se evitan las falsas alarmas al llevar el UPI en el bolsillo o mochila?',
        a: 'El botón físico SOS requiere una pulsación continua de 3 segundos para ejecutarse. Durante ese lapso emite una advertencia acústica y vibrotáctil progresiva que permite soltar el botón o pulsar la tecla ESC si fue presionado accidentalmente.'
    },
    {
        id: 'faq-5',
        category: 'Batería y Hardware',
        q: '¿Cuánto dura la batería y cómo sé cuándo debo recargar el dispositivo?',
        a: 'La batería Li-Po de 2,400 mAh ofrece hasta 18 horas de uso continuo. Al pulsar el botón superior izquierdo de encendido, el sintetizador de voz anuncia el porcentaje exacto de carga. Además, emite avisos preventivos cuando la batería desciende al 20% y al 10%.'
    },
    {
        id: 'faq-6',
        category: 'Batería y Hardware',
        q: '¿Puedo utilizar el UPI bajo la lluvia o en ambientes con polvo?',
        a: 'Sí. El chasis cuenta con sellado de grado de protección IP65, lo que lo hace resistente al ingreso de polvo y a la lluvia o salpicaduras de agua durante los desplazamientos urbanos.'
    },
    {
        id: 'faq-7',
        category: 'Garantía y Servicio',
        q: '¿Cuánto tiempo toma aprender a usar todos los botones físicos del UPI?',
        a: 'Gracias a la disposición ergonómica con relieves diferenciados y confirmación hablada en cada tecla, las pruebas de usabilidad proyectan un tiempo promedio de aprendizaje táctil de 35 minutos para dominar todas las funciones.'
    },
    {
        id: 'faq-8',
        category: 'Garantía y Servicio',
        q: '¿Qué cubre la garantía y cómo solicito una calibración del sensor ToF?',
        a: 'El dispositivo cuenta con 12 meses de garantía integral sobre la matriz óptica ToF, la batería y la botonera háptica. Puedes generar un ticket técnico en la pestaña 6 de este Centro de Soporte para recibir asistencia o calibración gratuita.'
    }
];

function renderFaqs() {
    const query = (document.getElementById('faq-search-input')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('faq-category-select')?.value || 'all';
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    const filtered = faqsData.filter(f => {
        const matchCat = cat === 'all' || f.category === cat;
        const matchText = f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query);
        return matchCat && matchText;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <p class="text-cuerpo font-bold text-brand-dark">No se encontraron preguntas frecuentes para tu búsqueda.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((item, idx) => {
        const isOpen = idx === 0;
        return `
            <div class="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
                <button type="button" onclick="toggleFaqItem('${item.id}')" id="btn-${item.id}" aria-expanded="${isOpen}" aria-controls="content-${item.id}" class="w-full min-h-[56px] p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-100 transition">
                    <div>
                        <span class="text-notas font-bold text-brand-blue block mb-1">${item.category}</span>
                        <span class="text-h2 font-bold text-brand-dark">${item.q}</span>
                    </div>
                    <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}" class="w-6 h-6 text-brand-subtle shrink-0" aria-hidden="true"></i>
                </button>
                <div id="content-${item.id}" class="${isOpen ? 'block' : 'hidden'} px-6 pb-6 pt-2 border-t border-brand-border bg-brand-canvas space-y-4">
                    <p class="text-cuerpo text-brand-subtle">${item.a}</p>
                    <button type="button" onclick="speak('${item.q.replace(/'/g, '')}. Respuesta: ${item.a.replace(/'/g, '')}')" class="min-h-[48px] px-4 py-2 rounded-xl bg-brand-surface hover:bg-slate-200 text-brand-dark border border-brand-border text-notas font-bold transition flex items-center gap-2">
                        <i data-lucide="volume-2" class="w-4 h-4 text-brand-blue" aria-hidden="true"></i>
                        <span>Escuchar respuesta por voz</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function toggleFaqItem(faqId) {
    const btn = document.getElementById(`btn-${faqId}`);
    const content = document.getElementById(`content-${faqId}`);
    if (!btn || !content) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    content.classList.toggle('hidden');
}

/* --- 4. FORO DE USUARIOS Y COMUNIDAD --- */
const forumThreadsData = [
    {
        id: 'th-1',
        author: 'Martín Salazar (Usuario UPI • Miraflores)',
        date: 'Hace 2 días',
        tag: 'Experiencia de Uso',
        title: 'Excelente detección de toldos comerciales en calles estrechas',
        body: 'Llevo dos semanas probando el prototipo en modo Exterior (M1 a 4 metros) junto con mi bastón blanco. Ayer me advirtió con vibración anticipada sobre una estructura metálica de andamio a la altura de la frente.',
        replies: [
            { author: 'Ing. Sofía Vega (Equipo UPI)', text: '¡Gracias por compartirlo, Martín! Justamente ese ángulo de 45° de la cúpula ToF fue calibrado para andamios y ramas.' }
        ]
    },
    {
        id: 'th-2',
        author: 'Elena Rojas (Instructora O&M)',
        date: 'Hace 5 días',
        tag: 'Consulta Técnica',
        title: 'Recomendación para interiores de estaciones de tren y centros comerciales',
        body: 'Para mis alumnos en entrenamiento de movilidad, recomendamos conmutar al modo M1 Interior (1.5 metros) apenas cruzan los torniquetes de la estación para tener alertas más focalizadas.',
        replies: [
            { author: 'Jorge Paz (Familiar)', text: 'Muy buen dato, a mi papá le ayudó mucho cambiar a 1.5m dentro del supermercado.' }
        ]
    },
    {
        id: 'th-3',
        author: 'Asociación Visión Autónoma Perú',
        date: 'Hace 1 semana',
        tag: 'Rutas Accesibles',
        title: 'Prueba del botón REP en intersecciones con alto ruido vehicular',
        body: 'Destacamos la utilidad del botón físico REP (abajo a la izquierda). Cuando pasa un autobús ruidoso en Av. Javier Prado, basta un toque rápido para volver a escuchar la instrucción de giro.',
        replies: []
    }
];

function renderForumThreads() {
    const container = document.getElementById('forum-threads-container');
    const badge = document.getElementById('forum-count-badge');
    if (!container) return;
    if (badge) badge.textContent = `${forumThreadsData.length} temas activos`;

    container.innerHTML = forumThreadsData.map(th => `
        <article class="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="px-3 py-1 rounded-xl bg-brand-bluelight text-brand-blue text-notas font-bold">${th.tag}</span>
                <span class="text-notas font-medium text-brand-subtle">${th.author} • ${th.date}</span>
            </div>
            <div>
                <h4 class="text-h2 font-bold text-brand-dark">${th.title}</h4>
                <p class="text-cuerpo text-brand-subtle mt-2">${th.body}</p>
            </div>

            <div class="space-y-2 pl-4 border-l-2 border-brand-border">
                ${th.replies.map(r => `
                    <div class="p-3 rounded-xl bg-brand-canvas border border-brand-border text-notas">
                        <span class="font-bold text-brand-dark">${r.author}:</span>
                        <span class="text-brand-subtle"> ${r.text}</span>
                    </div>
                `).join('')}
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2">
                <button type="button" onclick="speak('${th.title.replace(/'/g, '')}. Publicado por ${th.author.replace(/'/g, '')}. ${th.body.replace(/'/g, '')}')" class="min-h-[48px] px-4 py-2 rounded-xl bg-brand-canvas hover:bg-slate-200 text-brand-dark border border-brand-border text-notas font-bold transition flex items-center gap-2">
                    <i data-lucide="volume-2" class="w-4 h-4 text-brand-blue" aria-hidden="true"></i>
                    <span>Escuchar hilo</span>
                </button>
                <button type="button" onclick="addQuickReply('${th.id}')" class="min-h-[48px] px-4 py-2 rounded-xl bg-brand-canvas hover:bg-slate-200 text-brand-dark border border-brand-border text-notas font-semibold transition flex items-center gap-2">
                    <i data-lucide="corner-down-right" class="w-4 h-4 text-brand-subtle" aria-hidden="true"></i>
                    <span>Añadir comentario de apoyo (${th.replies.length})</span>
                </button>
            </div>
        </article>
    `).join('');

    lucide.createIcons();
}

function addQuickReply(threadId) {
    const th = forumThreadsData.find(t => t.id === threadId);
    if (!th) return;
    th.replies.push({
        author: 'Usuario de la Comunidad UPI',
        text: '¡Excelente aporte! Coincido con la utilidad de esta configuración en el recorrido diario.'
    });
    renderForumThreads();
    speak("Tu comentario de apoyo ha sido agregado al hilo del foro.");
}

function handleNewForumPost(event) {
    event.preventDefault();
    const author = document.getElementById('forum-author').value.trim();
    const category = document.getElementById('forum-category').value;
    const title = document.getElementById('forum-title').value.trim();
    const body = document.getElementById('forum-body').value.trim();
    const status = document.getElementById('forum-form-status');

    if (!author || !title || !body) {
        status.className = "p-4 rounded-xl text-notas font-bold bg-brand-soslight text-brand-sos border border-brand-sos block";
        status.textContent = "Por favor completa tu nombre, el título y el mensaje para publicar en el foro.";
        speak("Completa todos los campos del foro antes de publicar.");
        return;
    }

    forumThreadsData.unshift({
        id: 'th-' + Date.now(),
        author: author,
        date: 'Publicado ahora',
        tag: category,
        title: title,
        body: body,
        replies: []
    });

    renderForumThreads();
    status.className = "p-4 rounded-xl text-notas font-bold bg-brand-successlight text-brand-success border border-brand-success block";
    status.textContent = "¡Tu publicación ha sido añadida al Foro de Usuarios UPI!";
    speak(`Tu tema titulado ${title} ha sido publicado con éxito en el foro.`);
    event.target.reset();
}

/* --- 5. LIBRO DE RECLAMACIONES Y 6. SISTEMA DE TICKETS --- */
const supportCasesDatabase = {
    'TK-2026-104': {
        type: 'Ticket Técnico',
        user: 'Roberto Gómez',
        subject: 'Calibración preventiva de Matriz Láser ToF 940nm',
        date: '09/11/2026',
        state: 'En Revisión por Laboratorio Óptico (Etapa 2 de 3)',
        detail: 'El equipo de ingeniería asistiva verificó los parámetros de telemetría y enviará la actualización de calibración hoy.'
    },
    'LR-2026-8901': {
        type: 'Hoja de Reclamación (INDECOPI)',
        user: 'María Elena Torres',
        subject: 'Reclamo sobre activación de plan eSIM 4G',
        date: '08/11/2026',
        state: 'Atendido y Resuelto dentro del plazo legal',
        detail: 'Se restableció el perfil eSIM multi-operador y se bonificaron 3 meses adicionales de teleasistencia SOS.'
    }
};

function handleReclamacionSubmit(event) {
    event.preventDefault();
    const nombre = document.getElementById('rec-nombre').value.trim();
    const docTipo = document.getElementById('rec-doc-tipo').value;
    const docNum = document.getElementById('rec-doc-num').value.trim();
    const tel = document.getElementById('rec-telefono').value.trim();
    const email = document.getElementById('rec-email').value.trim();
    const dom = document.getElementById('rec-domicilio').value.trim();
    const bien = document.getElementById('rec-bien-tipo').value;
    const detalle = document.getElementById('rec-detalle').value.trim();
    const pedido = document.getElementById('rec-pedido').value.trim();
    const tipoInc = document.querySelector('input[name="rec-tipo-incidencia"]:checked')?.value || 'Reclamo';

    const receipt = document.getElementById('reclamacion-receipt');

    if (!nombre || !docNum || !tel || !email || !dom || !detalle || !pedido) {
        receipt.className = "p-6 rounded-2xl bg-brand-soslight border-2 border-brand-sos text-brand-sos block";
        receipt.innerHTML = `<p class="font-bold">Error en el registro: Todos los campos marcados con asterisco (*) son obligatorios conforme al reglamento del Libro de Reclamaciones.</p>`;
        speak("Faltan campos obligatorios en la Hoja de Reclamación.");
        return;
    }

    const code = 'LR-2026-' + Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toLocaleDateString('es-PE');

    supportCasesDatabase[code] = {
        type: `Hoja de Reclamación (${tipoInc})`,
        user: nombre,
        subject: `${tipoInc} — ${bien}`,
        date: today,
        state: 'Registrado Oficialmente (Plazo máx. 15 días hábiles)',
        detail: `Pedido del consumidor: ${pedido}`
    };

    const trackerInput = document.getElementById('tracker-code-input');
    if (trackerInput) trackerInput.value = code;

    receipt.className = "p-6 rounded-2xl bg-brand-successlight border-2 border-brand-success text-brand-dark space-y-3 block";
    receipt.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-brand-success/30 pb-3">
            <span class="text-h2 font-extrabold text-brand-success">Constancia Oficial de Hoja de Reclamación: ${code}</span>
            <span class="font-mono text-notas font-bold">Fecha: ${today}</span>
        </div>
        <p class="text-cuerpo"><strong>Consumidor:</strong> ${nombre} (${docTipo} ${docNum}) • <strong>Correo:</strong> ${email}</p>
        <p class="text-cuerpo"><strong>Tipo:</strong> ${tipoInc} sobre ${bien}</p>
        <p class="text-notas text-brand-subtle">Puedes consultar el avance de este código <strong>${code}</strong> en la pestaña "6. Tickets y Estado". Se ha enviado una copia a tu correo electrónico.</p>
    `;

    speak(`Hoja de reclamación registrada con éxito. Tu código único de seguimiento es ${code}.`);
    event.target.reset();
}

function handleTicketSubmit(event) {
    event.preventDefault();
    const user = document.getElementById('tk-user').value.trim();
    const email = document.getElementById('tk-email').value.trim();
    const comp = document.getElementById('tk-component').value;
    const prio = document.getElementById('tk-priority').value;
    const desc = document.getElementById('tk-desc').value.trim();
    const box = document.getElementById('tk-status-box');

    if (!user || !email || !desc) {
        box.className = "p-4 rounded-xl text-notas font-bold bg-brand-soslight text-brand-sos border border-brand-sos block";
        box.textContent = "Por favor completa tu nombre, contacto y la descripción técnica.";
        speak("Completa los datos del ticket técnico antes de enviar.");
        return;
    }

    const code = 'TK-2026-' + Math.floor(200 + Math.random() * 799);
    const today = new Date().toLocaleDateString('es-PE');

    supportCasesDatabase[code] = {
        type: `Ticket Técnico (${prio})`,
        user: user,
        subject: `Soporte en ${comp}`,
        date: today,
        state: 'Asignado a Especialista de Hardware UPI',
        detail: desc
    };

    const trackerInput = document.getElementById('tracker-code-input');
    if (trackerInput) trackerInput.value = code;
    checkTicketStatus();

    box.className = "p-4 rounded-xl text-notas font-bold bg-brand-successlight text-brand-success border border-brand-success block";
    box.textContent = `¡Ticket generado con éxito! Código asignado: ${code}. Ya puedes ver su estado en el panel izquierdo.`;
    speak(`Ticket de soporte técnico generado con el código ${code}.`);
    event.target.reset();
}

function checkTicketStatus() {
    const input = document.getElementById('tracker-code-input');
    const box = document.getElementById('tracker-result-box');
    if (!input || !box) return;

    const code = input.value.trim().toUpperCase();
    const found = supportCasesDatabase[code];

    if (!found) {
        box.innerHTML = `
            <p class="text-notas font-bold text-brand-sos">No se encontró ningún caso con el código "${code}".</p>
            <p class="text-notas text-brand-subtle">Prueba con los códigos de ejemplo <strong>TK-2026-104</strong> o <strong>LR-2026-8901</strong>, o registra uno nuevo.</p>
        `;
        speak(`No se encontró el código ${code}.`);
        return;
    }

    box.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="font-mono text-notas font-bold text-brand-blue">${code}</span>
            <span class="text-notas font-mono text-brand-subtle">${found.date}</span>
        </div>
        <p class="text-cuerpo font-bold text-brand-dark">${found.subject}</p>
        <p class="text-notas text-brand-subtle"><strong>Titular:</strong> ${found.user} (${found.type})</p>
        <div class="p-3 rounded-xl bg-brand-successlight border border-brand-success text-brand-success text-notas font-bold">
            Estado actual: ${found.state}
        </div>
        <p class="text-notas text-brand-subtle">${found.detail}</p>
    `;
    speak(`Estado del código ${code}: ${found.state}.`);
}

function runHardwareDiagnostic() {
    const out = document.getElementById('diag-status-output');
    if (!out) return;
    out.classList.remove('hidden');
    out.textContent = "[1/3] Verificando matriz láser VCSEL 940nm (50 Hz)...";
    speak("Iniciando autodiagnóstico remoto del dispositivo UPI.");

    setTimeout(() => {
        out.textContent = "[2/3] Comprobando enlace satelital GNSS 3D Fix y perfil eSIM 4G...";
    }, 1400);

    setTimeout(() => {
        out.textContent = "✓ DIAGNÓSTICO ÓPTIMO: Sensores ToF calibrados (0.2m - 4.0m), Batería 88%, Botón SOS operativo.";
        speak("Diagnóstico finalizado: todos los sensores ToF, batería y enlace satelital operan correctamente.");
    }, 2800);
}

/* ==================================================================================== */
/* MOTOR DE INTELIGENCIA ARTIFICIAL PRECARGADA (UPI-IA)                                 */
/* ==================================================================================== */
const upiPreloadedKnowledgeGraph = [
    {
        id: 'intent-precio',
        tag: 'Precio Social Accesible (< $70 USD)',
        keywords: ['precio', 'cuesta', 'costo', 'valor', 'dolares', 'soles', 'barato', 'economico', 'cuanto vale', '70', '65', 'presupuesto', 'pagar', 'mensualidad', 'tarifa'],
        answer: 'El **UPI está diseñado para costar menos de 70 dólares estadounidenses** (aproximadamente **$65 USD** o **S/ 245 soles peruanos** en pago único). Es hasta un **80% más económico** que otros dispositivos importados que superan los $600 USD. Además, ofrecemos descuentos especiales para asociaciones y personas inscritas en CONADIS / OMAPED.'
    },
    {
        id: 'intent-comprar',
        tag: 'Compra, Reservas y Envíos en Perú',
        keywords: ['comprar', 'adquirir', 'donde compro', 'venta', 'tienda', 'envio', 'delivery', 'peru', 'lima', 'ica', 'chincha', 'provincia', 'reservar', 'pedido', 'distribuidor'],
        answer: 'Puedes **reservar o adquirir tu UPI por menos de $70 USD** directamente desde el formulario de la sección **Contacto** de esta web. Realizamos entregas presenciales en Lima, Chincha e Ica, y envíos asegurados a todas las provincias del Perú con manual en audio e inducción gratuita.'
    },
    {
        id: 'intent-baston',
        tag: 'Complemento del Bastón Blanco',
        keywords: ['baston', 'reemplaza', 'sustituye', 'blanco', 'piso', 'suelo', 'huecos', 'escaleras', 'gradas', 'vereda'],
        answer: 'Importante: **El UPI no reemplaza a tu bastón blanco, sino que lo complementa.** Tu bastón detecta huecos, escalones y texturas en el suelo, mientras que el UPI llevándolo en la otra mano protege tu **cabeza, rostro y pecho** detectando ramas, toldos, carteles y retrovisores aéreos hasta a 4 metros.'
    },
    {
        id: 'intent-bateria',
        tag: 'Batería de 18h y Carga USB-C',
        keywords: ['bateria', 'dura', 'duracion', 'carga', 'cargar', 'cargador', 'enchufe', 'autonomia', 'horas', 'usb', 'apaga', 'corriente'],
        answer: 'La batería interna recargable de **2,400 mAh brinda hasta 18 horas de uso continuo** (todo el día fuera de casa). Se carga al 100% en unos **90 minutos mediante cable USB Tipo C** universal (el mismo de cualquier teléfono moderno) y te avisa por voz cuánta carga le queda al tocar el botón superior izquierdo.'
    },
    {
        id: 'intent-celular',
        tag: 'Funcionamiento 100% Autónomo (Sin Celular)',
        keywords: ['celular', 'telefono', 'smartphone', 'internet', 'wifi', 'bluetooth', 'datos', 'app', 'aplicacion', 'chip', 'esim', 'autonomo'],
        answer: '**No necesitas tener un smartphone ni conectar el UPI por Bluetooth.** El dispositivo es **100% autónomo**: integra su propio chip satelital GNSS (GPS) y conectividad celular 4G con eSIM incorporada para guiarte por voz y enviar alertas SOS sin depender de ningún teléfono.'
    },
    {
        id: 'intent-lluvia',
        tag: 'Resistencia al Agua IP65 y Durabilidad',
        keywords: ['agua', 'lluvia', 'moja', 'mojar', 'resistente', 'polvo', 'humedad', 'ip65', 'caida', 'golpe', 'rompe', 'material'],
        answer: 'Sí, puedes usarlo tranquilamente en la calle bajo llovizna o lluvia. Cuenta con **certificación IP65 contra agua y polvo**, carcasa ergonómica de alta resistencia a impactos y un **cordón de seguridad para la muñeca** que evita caídas accidentales.'
    },
    {
        id: 'intent-peso',
        tag: 'Peso Ultraligero y Tamaño de Bolsillo',
        keywords: ['pesa', 'peso', 'gramos', 'tamano', 'dimensiones', 'grande', 'pequeno', 'bolsillo', 'mano', 'medidas', 'pesado', 'ligero'],
        answer: 'Es sumamente ligero y cómodo: **pesa apenas 135 gramos** (menos que un celular promedio) y mide **118 mm de alto × 54 mm de ancho × 22 mm de grosor**. Cabe perfectamente en la palma de la mano o en cualquier bolsillo.'
    },
    {
        id: 'intent-sos',
        tag: 'Emergencias y Botón SOS (3 Segundos)',
        keywords: ['sos', 'emergencia', 'peligro', 'perder', 'pierdo', 'extrano', 'ayuda', 'auxilio', '3 segundos', 'falsa alarma', 'familia', 'sms', 'ubicacion'],
        answer: 'Si te desorientas o sufres una emergencia, mantén presionado el **botón rojo inferior SOS durante 3 segundos continuos** (este filtro evita falsas alarmas en el bolsillo). El UPI enviará automáticamente un **SMS con tus coordenadas GPS exactas** a tus familiares o contactos de confianza.'
    },
    {
        id: 'intent-sensores',
        tag: 'Sensores Láser ToF 940 nm y Seguridad Ocular',
        keywords: ['sensor', 'tof', 'laser', 'infrarrojo', 'ramas', 'letreros', 'toldos', 'distancia', 'metros', 'alcance', 'ojos', 'vista', 'dana'],
        answer: 'Utiliza una **triple matriz óptica Time-of-Flight (ToF) de 940 nm** que escanea 50 veces por segundo. Detecta obstáculos desde **0.2 m hasta 4.0 metros** con un ángulo de 45° y cuenta con certificación **Clase 1 (100% seguro para los ojos de peatones y mascotas)**.'
    },
    {
        id: 'intent-botones',
        tag: 'Botones Físicos y Aprendizaje en 35 min',
        keywords: ['botones', 'm1', 'm2', 'rep', 'esc', 'dpad', 'cruz', 'usar', 'dificil', 'aprender', 'facil', 'adulto mayor', 'tacto', 'relieve'],
        answer: 'Todos sus botones tienen **relieves táctiles distintos** y hablan al tocarlos: **M1** cambia el alcance entre Exterior (4m) e Interior (1.5m); **M2** ajusta la velocidad de voz; **REP** repite la última instrucción; **ESC** cancela la ruta; y la **cruz central** guía paso a paso. Se aprende a dominar en unos **35 minutos**.'
    },
    {
        id: 'intent-garantia',
        tag: 'Garantía de 12 Meses y Soporte Técnico',
        keywords: ['garantia', 'reparacion', 'malogra', 'falla', 'repuestos', 'servicio tecnico', 'calibracion', 'soporte', 'ticket'],
        answer: 'El UPI incluye **12 meses de garantía integral en Perú**, calibración gratuita de sensores ToF y repuestos modulares económicos. Puedes abrir un ticket técnico o ejecutar el autodiagnóstico remoto en la **pestaña 6 de este Centro de Soporte**.'
    },
    {
        id: 'intent-reclamo',
        tag: 'Libro de Reclamaciones Oficial (INDECOPI)',
        keywords: ['reclamo', 'queja', 'reclamaciones', 'indecopi', 'libro', 'denuncia', 'inconformidad'],
        answer: 'Cumplimos con la Ley N.° 29571 (INDECOPI). Te estoy abriendo la **pestaña 5: Libro de Reclamaciones Oficial** para que registres tu Reclamo o Queja y obtengas tu código de seguimiento inmediato.',
        action: () => openReclamacionesDirect()
    },
    {
        id: 'intent-colores',
        tag: 'Acabados y Colores Disponibles',
        keywords: ['color', 'colores', 'acabado', 'negro', 'blanco', 'grafito', 'titanio', 'diseno'],
        answer: 'El chasis del UPI está disponible en tres acabados ergonómicos de alto contraste táctil y visual: **Negro Titanio, Grafito Mate y Blanco Plata**. Puedes verlos en tiempo real en nuestro **Simulador 3D**.'
    },
    {
        id: 'intent-saludo',
        tag: 'Bienvenida de UPI-IA',
        keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'quien eres', 'que eres', 'ayudame', 'informacion', 'que hace'],
        answer: '¡Hola! Soy **UPI-IA**, el asistente virtual con datos precargados del **Ubicador Personal Intuitivo**. Nuestro dispositivo asistivo cuesta **menos de 70 dólares (~$65 USD / S/ 245 PEN)**, tiene 18h de batería, láser ToF de 4 metros y botón SOS. ¿Qué te gustaría saber hoy?'
    }
];

function normalizeTextForAI(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!.,;:]/g, " ")
        .trim();
}

function evaluatePreloadedAI(userQuery) {
    const norm = normalizeTextForAI(userQuery);
    let bestMatch = null;
    let highestScore = 0;

    upiPreloadedKnowledgeGraph.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            const normKw = normalizeTextForAI(kw);
            if (norm.includes(normKw)) {
                score += normKw.split(' ').length * 3;
            }
        });
        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    });

    if (bestMatch && highestScore > 0) {
        return bestMatch;
    }

    return {
        id: 'intent-general',
        tag: 'Resumen General Precargado UPI',
        answer: 'Sobre tu consulta: **UPI (Ubicador Personal Intuitivo)** es un dispositivo portátil de navegación asistiva cuyo precio social es de **menos de 70 dólares (aprox. $65 USD o S/ 245 PEN)**. Detecta obstáculos aéreos hasta a **4.0 metros** con láser ToF, complementa al bastón blanco, ofrece **18 horas de batería**, protección contra lluvia **IP65** y **botón SOS con GPS autónomo**. ¿Deseas detalles sobre su compra, sensores o botones?'
    };
}

function toggleSupportChat(forceState) {
    const panel = document.getElementById('upi-assistant-panel');
    const btn = document.getElementById('btn-floating-chat');
    if (!panel || !btn) return;

    const isHidden = panel.classList.contains('hidden');
    const shouldOpen = typeof forceState === 'boolean' ? forceState : isHidden;

    if (shouldOpen) {
        panel.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
            const input = document.getElementById('chat-user-input');
            if (input) input.focus();
        }, 100);
    } else {
        panel.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
    }
}

function clearChatHistory() {
    const box = document.getElementById('chat-messages-box');
    if (!box) return;
    box.innerHTML = `
        <div class="p-4 rounded-xl bg-brand-canvas border border-brand-border text-brand-dark space-y-2 shadow-sm">
            <span class="font-bold text-brand-blue block">UPI-IA (Historial reiniciado)</span>
            <p>Conversación limpia. Pregúntame sobre el <strong>precio menor a 70 dólares</strong>, envíos, autonomía de batería, resistencia al agua o uso con el bastón blanco.</p>
        </div>
    `;
    speak("Historial del asistente UPI-IA reiniciado.");
}

function sendQuickChat(questionText) {
    toggleSupportChat(true);
    processAssistantQuery(questionText);
}

function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('chat-user-input');
    if (!input || !input.value.trim()) return;
    const q = input.value.trim();
    input.value = '';
    processAssistantQuery(q);
}

function formatMarkdownBold(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function processAssistantQuery(query) {
    const box = document.getElementById('chat-messages-box');
    const typing = document.getElementById('ai-typing-indicator');
    if (!box) return;

    box.innerHTML += `
        <div class="p-3 rounded-xl bg-brand-blue text-white ml-8 shadow-sm">
            <span class="text-[11px] font-mono uppercase opacity-80 block">Tú</span>
            <p class="font-medium">${query}</p>
        </div>
    `;
    box.scrollTop = box.scrollHeight;

    if (typing) typing.classList.remove('hidden');

    const delay = isMotionPaused ? 50 : 380;
    setTimeout(() => {
        if (typing) typing.classList.add('hidden');
        const matched = evaluatePreloadedAI(query);
        if (matched.action) matched.action();

        const cleanSpeech = matched.answer.replace(/\*\*/g, '');
        const formattedHtml = formatMarkdownBold(matched.answer);

        box.innerHTML += `
            <div class="p-4 rounded-xl bg-brand-canvas border border-brand-border text-brand-dark mr-4 space-y-2 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-1 border-b border-brand-border pb-1.5">
                    <span class="font-bold text-brand-blue">UPI-IA</span>
                    <span class="px-2 py-0.5 rounded-md bg-brand-bluelight text-brand-blue font-mono text-[11px] font-bold">${matched.tag}</span>
                </div>
                <p class="leading-relaxed">${formattedHtml}</p>
                <button type="button" onclick="speak('${cleanSpeech.replace(/'/g, "")}')" class="mt-1 min-h-[36px] px-3 py-1 rounded-lg bg-brand-surface hover:bg-slate-200 border border-brand-border text-notas font-semibold text-brand-dark flex items-center gap-1.5 transition">
                    <i data-lucide="volume-2" class="w-4 h-4 text-brand-blue" aria-hidden="true"></i>
                    <span>Escuchar respuesta</span>
                </button>
            </div>
        `;
        lucide.createIcons();
        box.scrollTop = box.scrollHeight;
        speak(cleanSpeech);
    }, delay);
}

function startChatVoiceDictation() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = document.getElementById('btn-voice-dictation');
    if (!SpeechRec) {
        speak("Tu navegador no admite dictado por voz directo. Por favor utiliza los botones rápidos o escribe tu pregunta.");
        return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'es-PE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (btn) btn.classList.add('bg-brand-soslight', 'border-brand-sos');
    speak("Escuchando tu consulta. Habla ahora.");

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (btn) btn.classList.remove('bg-brand-soslight', 'border-brand-sos');
        processAssistantQuery(transcript);
    };
    recognition.onerror = () => {
        if (btn) btn.classList.remove('bg-brand-soslight', 'border-brand-sos');
    };
    recognition.onend = () => {
        if (btn) btn.classList.remove('bg-brand-soslight', 'border-brand-sos');
    };
    recognition.start();
}

/* ==================================================================================== */
/* MOTOR THREE.JS 3D                                                                    */
/* ==================================================================================== */
let scene, camera, renderer, deviceGroup;
let currentBodyColor = 0x1a1d22;
let bodyMeshMaterial, accentBlueLight;
const canvas = document.getElementById('sim-canvas');

function toggleAutoRotate() {
    if (isMotionPaused) isMotionPaused = false;
    isAutoRotating = !isAutoRotating;
    updateMotionUI();
    speak(isAutoRotating ? "Rotación 3D activada." : "Rotación 3D pausada.");
}

function initThree() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    // Iluminación de estudio
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    fillLight.position.set(-6, -3, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x94a3b8, 0.9);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // Helper para crear rectángulos redondeados extruidos (Carcasa y Botón SOS)
    function crearRectanguloRedondeado(w, h, r, depth, bevel = 0.08) {
        const shape = new THREE.Shape();
        const x = -w / 2, y = -h / 2;
        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: depth,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 4
        });
        geo.center();
        return geo;
    }

    // 1. CARCASA PRINCIPAL (Estilo smartphone redondeado)
    bodyMeshMaterial = new THREE.MeshStandardMaterial({
        color: 0x23262d,
        metalness: 0.25,
        roughness: 0.45
    });
    const carcasaGeo = crearRectanguloRedondeado(3.1, 6.1, 0.42, 0.55, 0.08);
    const carcasaMesh = new THREE.Mesh(carcasaGeo, bodyMeshMaterial);
    deviceGroup.add(carcasaMesh);

    // Marco / bisel sutil frontal
    const biselMat = new THREE.MeshStandardMaterial({ color: 0x353944, metalness: 0.4, roughness: 0.4 });
    const biselGeo = crearRectanguloRedondeado(3.14, 6.14, 0.43, 0.48, 0.04);
    const biselMesh = new THREE.Mesh(biselGeo, biselMat);
    deviceGroup.add(biselMesh);

    const zFrente = 0.36; // Superficie frontal de la carcasa

    // 2. CABEZAL SUPERIOR: Rejilla de altavoz + LED verde de estado
    const altavozGeo = crearRectanguloRedondeado(0.75, 0.09, 0.04, 0.04, 0.01);
    const altavozMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.8 });
    const altavoz = new THREE.Mesh(altavozGeo, altavozMat);
    altavoz.position.set(-0.1, 2.55, zFrente);
    deviceGroup.add(altavoz);

    const ledGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0.55, 2.55, zFrente + 0.01);
    deviceGroup.add(led);

    // 3. BOTONES LATERALES DE VOLUMEN (+ / -) EN EL BORDE DERECHO
    const btnGrisMat = new THREE.MeshStandardMaterial({ color: 0x464950, metalness: 0.2, roughness: 0.45 });
    const volGeo = new THREE.BoxGeometry(0.14, 0.48, 0.22);
    
    const volMas = new THREE.Mesh(volGeo, btnGrisMat);
    volMas.position.set(1.64, 1.55, 0);
    deviceGroup.add(volMas);

    const volMenos = new THREE.Mesh(volGeo, btnGrisMat);
    volMenos.position.set(1.64, 0.90, 0);
    deviceGroup.add(volMenos);

    // Materiales para relieve blanco / Braille
    const relieveMat = new THREE.MeshStandardMaterial({ color: 0xeceef2, roughness: 0.3 });
    const puntoGeo = new THREE.SphereGeometry(0.032, 10, 10);

    // Helper para agregar botón circular con puntos Braille en relieve
    function agregarBotonCircular(x, y, radio, cantPuntos) {
        const btnGeo = new THREE.CylinderGeometry(radio, radio * 1.04, 0.16, 36);
        const btn = new THREE.Mesh(btnGeo, btnGrisMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(x, y, zFrente + 0.05);
        deviceGroup.add(btn);

        // Aro sutil superior
        const aroGeo = new THREE.RingGeometry(radio * 0.28, radio * 0.38, 24);
        const aro = new THREE.Mesh(aroGeo, relieveMat);
        aro.position.set(x, y + radio * 0.14, zFrente + 0.135);
        deviceGroup.add(aro);

        // Puntos Braille en la parte inferior del botón
        const espaciado = 0.09;
        const inicioX = x - ((cantPuntos - 1) * espaciado) / 2;
        for (let i = 0; i < cantPuntos; i++) {
            const p = new THREE.Mesh(puntoGeo, relieveMat);
            p.position.set(inicioX + i * espaciado, y - radio * 0.38, zFrente + 0.135);
            deviceGroup.add(p);
        }
    }

    // 4. PANEL FRONTAL DE BOTONES CIRCULARES (Misma distribución que tu simulador)
    // Fila 1: Encendido (izq) y Bus (der)
    agregarBotonCircular(-0.80, 1.65, 0.42, 2);
    agregarBotonCircular(0.80, 1.65, 0.42, 4);

    // Fila 2: Micrófono Central Grande
    agregarBotonCircular(0, 0.58, 0.56, 4);

    // Fila 3: Ubicación (izq) y Reloj/Batería (der)
    agregarBotonCircular(-0.80, -0.50, 0.42, 3);
    agregarBotonCircular(0.80, -0.50, 0.42, 4);

    // Fila 4: Cancelar Ruta (X)
    agregarBotonCircular(0, -1.42, 0.42, 3);

    // 5. FILA 5: BOTÓN ROJO RECTANGULAR SOS CON RELIEVE
    const sosMat = new THREE.MeshStandardMaterial({ color: 0xb8322a, metalness: 0.2, roughness: 0.38 });
    const sosGeo = crearRectanguloRedondeado(1.80, 0.68, 0.16, 0.16, 0.03);
    const sosMesh = new THREE.Mesh(sosGeo, sosMat);
    sosMesh.position.set(0, -2.35, zFrente + 0.05);
    deviceGroup.add(sosMesh);

    // Puntos Braille del botón SOS (2 filas x 3 puntos)
    for (let fila = 0; fila < 2; fila++) {
        for (let col = 0; col < 3; col++) {
            const p = new THREE.Mesh(puntoGeo, relieveMat);
            p.position.set((col - 1) * 0.14, -2.44 + fila * 0.12, zFrente + 0.16);
            deviceGroup.add(p);
        }
    }

    // Posición y ángulo inicial atractivo
    deviceGroup.position.set(0, 0, 0);
    deviceGroup.rotation.set(0.12, -0.35, 0);

    window.addEventListener('resize', onWindowResize);
    setupMouseInteraction();
}

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function setupMouseInteraction() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        isAutoRotating = false;
        updateMotionUI();
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        deviceGroup.rotation.y += deltaX * 0.008;
        deviceGroup.rotation.x += deltaY * 0.008;
        deviceGroup.rotation.x = Math.max(-0.8, Math.min(0.8, deviceGroup.rotation.x));
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
}

function setCameraView(view, evt) {
    isAutoRotating = false;
    updateMotionUI();
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('bg-brand-blue', 'text-white');
        btn.classList.add('bg-slate-900', 'text-slate-200');
        btn.setAttribute('aria-selected', 'false');
    });
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.remove('bg-slate-900', 'text-slate-200');
        evt.currentTarget.classList.add('bg-brand-blue', 'text-white');
        evt.currentTarget.setAttribute('aria-selected', 'true');
    }
    const views = {
        frontal: [0, 0, 0, "Vista frontal activada."],
        lateral: [0, Math.PI / 2, 0, "Vista lateral activada."],
        trasera: [0, Math.PI, 0, "Vista posterior activada."],
        sensores: [0.65, 0, 0, "Vista superior de sensores ToF."]
    };
    if (views[view]) {
        deviceGroup.rotation.set(views[view][0], views[view][1], views[view][2]);
        speak(views[view][3]);
    }
}

function changeDeviceColor(hexStr, colorName, evt) {
    currentBodyColor = parseInt(hexStr.replace('#', '0x'));
    if (bodyMeshMaterial) bodyMeshMaterial.color.setHex(currentBodyColor);
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('border-sky-400');
        btn.classList.add('border-transparent');
    });
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.remove('border-transparent');
        evt.currentTarget.classList.add('border-sky-400');
    }
    speak(`Carcasa cambiada a ${colorName}.`);
}

function onWindowResize() {
    if (!renderer || !camera) return;
    const container = canvas.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (deviceGroup && isAutoRotating && !isMotionPaused) {
        deviceGroup.rotation.y += 0.007;
    }
    renderer.render(scene, camera);
}

window.onload = function () {
    // Activar vista previa 3D en el Hero
    if (document.getElementById('sim-canvas')) {
        isAutoRotating = !isMotionPaused; // Gira suavemente si las animaciones están activas
        initThree();
        animate();
    }

    // Inicializar los módulos del Centro de Soporte
    selectKbArticle('kb-1');
    renderVideoPlaylist();
    renderFaqs();
    renderForumThreads();
    checkTicketStatus();
};

/* ==================================================================================== */
/* SIMULADOR INTERACTIVO AVANZADO UPI (ENCAPSULADO)                                     */
/* ==================================================================================== */
(() => {
    const carcasa = document.getElementById('dispositivo');
    if (!carcasa) return;

    const estado = {
        encendido: false,
        volumen: 0.8,
        escuchando: false,
        procesando: false,
        rutaActiva: false,
        pasosRutaActual: [],
        indicePasoActual: 0,
        indiceBus: 0,
        indiceUbicacion: 0,
        timeoutProcesando: null,
        intervaloSonidoCarga: null,
        ultimoClicReloj: 0,
        timeoutClicReloj: null
    };

    const simulacionesMic = [
        {
            destino: "Parque Hispanoamérica",
            pasos: [
                "Ruta calculada hacia el Parque Hispanoamérica. Avanza ciento veinte metros de frente por esta vereda.",
                "Atención: has llegado a la esquina con la calle Eléspuru. Gira a la derecha y camina cincuenta metros.",
                "Precaución, desnivel en la vereda a diez metros. Continúa de frente.",
                "Has llegado a tu destino. El Parque Hispanoamérica se encuentra a tu lado izquierdo."
            ]
        },
        {
            destino: "Óvalo La Fontana",
            pasos: [
                "Ruta calculada hacia el Óvalo La Fontana. Camina doscientos metros hacia el norte.",
                "Has llegado al cruce peatonal. Espera el semáforo sonoro para cruzar la avenida.",
                "Semáforo en verde. Cruza con precaución. Al llegar a la otra vereda, gira a la izquierda.",
                "Has llegado a tu destino. El Óvalo La Fontana está frente a ti."
            ]
        },
        {
            destino: "Farmacia Inkafarma",
            pasos: [
                "Ruta calculada hacia Inkafarma. Mantente en la vereda derecha y avanza noventa metros en línea recta.",
                "Atención: entrada de vehículos de la universidad a veinte metros. Precaución al cruzar.",
                "Has llegado. El ingreso de Inkafarma está a tu izquierda, cuenta con una rampa de acceso."
            ]
        },
        {
            destino: "Paradero Corredor Rojo",
            pasos: [
                "Ruta calculada hacia el paradero oficial. Avanza ciento cincuenta metros hacia el cruce con La Fontana.",
                "Llegaste a la esquina. Gira a la izquierda y camina veinte metros más.",
                "Has llegado al paradero. Cuidado con el borde de la acera."
            ]
        }
    ];

    const simulacionesBus = [
        "Paradero oficial más cercano: Paradero Universidad San Ignacio, en la Avenida La Molina a cuarenta metros hacia tu derecha. Pasan las rutas del Corredor Rojo doscientos uno y doscientos nueve.",
        "Segundo paradero cercano: Paradero La Fontana, ubicado a ciento ochenta metros en el cruce con la Avenida La Fontana. Rutas disponibles hacia Javier Prado y Ate.",
        "Aviso de transporte: el paradero más próximo está a cuarenta metros sobre la misma vereda de la Avenida La Molina. No necesitas cruzar la pista para abordarlo."
    ];

    const simulacionesUbicacion = [
        "Te encuentras en la Avenida La Molina, cuadra cinco, frente al campus de la Universidad San Ignacio de Loyola. Vereda amplia con guía podotáctil cercana.",
        "Ubicación actual: Avenida La Molina, distrito de La Molina, a pocos metros de la puerta principal de la Universidad San Ignacio de Loyola, mirando hacia la avenida."
    ];

    const ledEstado = document.getElementById('ledEstado');
    const badgeConexion = document.getElementById('badgeConexion');
    const logSalida = document.getElementById('logSalida');
    const selectEscenarioMic = document.getElementById('selectEscenarioMic');
    const btnPasoRuta = document.getElementById('btnPasoRuta');
    const checkSinSenal = document.getElementById('checkSinSenal');
    const textoVolumen = document.getElementById('textoVolumen');

    const btnPower = document.getElementById('btnPower');
    const btnBus = document.getElementById('btnBus');
    const btnMic = document.getElementById('btnMic');
    const btnUbicacion = document.getElementById('btnUbicacion');
    const btnReloj = document.getElementById('btnReloj');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnSOS = document.getElementById('btnSOS');
    const btnVolMas = document.getElementById('btnVolMas');
    const btnVolMenos = document.getElementById('btnVolMenos');
    const btnLimpiarLog = document.getElementById('btnLimpiarLog');

    let audioCtx = null;

    function iniciarAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function reproducirTono(frecuencia, duracion, tipo = 'sine', gananciaExtra = 0.25, retraso = 0) {
        iniciarAudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = tipo;
        osc.frequency.setValueAtTime(frecuencia, audioCtx.currentTime + retraso);
        const volFinal = Math.max(0.02, estado.volumen * gananciaExtra);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + retraso);
        gain.gain.exponentialRampToValueAtTime(volFinal, audioCtx.currentTime + retraso + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + retraso + duracion);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + retraso);
        osc.stop(audioCtx.currentTime + retraso + duracion + 0.02);
    }

    function efectoHapticoEncendido(encendiendo) {
        carcasa.classList.remove('vibrando');
        void carcasa.offsetWidth;
        carcasa.classList.add('vibrando');
        if (encendiendo) {
            reproducirTono(110, 0.14, 'triangle', 0.45, 0);
            reproducirTono(145, 0.18, 'triangle', 0.50, 0.16);
        } else {
            reproducirTono(130, 0.12, 'triangle', 0.40, 0);
            reproducirTono(85, 0.22, 'triangle', 0.40, 0.14);
        }
    }

    function sonidoClicSuave() { reproducirTono(420, 0.05, 'sine', 0.15); }
    function sonidoAbrirMic() { reproducirTono(520, 0.09, 'sine', 0.22, 0); reproducirTono(740, 0.12, 'sine', 0.25, 0.09); }
    function sonidoCerrarMic() { reproducirTono(680, 0.09, 'sine', 0.22, 0); reproducirTono(460, 0.12, 'sine', 0.22, 0.09); }
    function sonidoCancelar() { reproducirTono(330, 0.12, 'triangle', 0.25, 0); reproducirTono(260, 0.16, 'triangle', 0.25, 0.12); }
    function sonidoAlertaSOS() {
        reproducirTono(880, 0.16, 'sawtooth', 0.28, 0);
        reproducirTono(660, 0.16, 'sawtooth', 0.28, 0.18);
        reproducirTono(880, 0.22, 'sawtooth', 0.30, 0.36);
    }

    function iniciarSonidoCarga() {
        detenerSonidoCarga();
        let paso = 0;
        const notas = [390, 440, 490];
        estado.intervaloSonidoCarga = setInterval(() => {
            reproducirTono(notas[paso % notas.length], 0.08, 'sine', 0.14);
            paso++;
        }, 340);
    }

    function detenerSonidoCarga() {
        if (estado.intervaloSonidoCarga) {
            clearInterval(estado.intervaloSonidoCarga);
            estado.intervaloSonidoCarga = null;
        }
    }

    function registrarLog(mensaje, tipo = 'voz') {
        const etiquetas = {
            voz: '<span class="log-tag tag-voz">Voz</span>',
            haptico: '<span class="log-tag tag-haptico">Háptico / Estado</span>',
            alerta: '<span class="log-tag tag-alerta">Alerta</span>'
        };
        const p = document.createElement('p');
        p.className = 'log-linea';
        p.innerHTML = `${etiquetas[tipo] || ''}${mensaje}`;
        logSalida.appendChild(p);
        logSalida.scrollTop = logSalida.scrollHeight;
    }

    function hablar(texto, tipoLog = 'voz') {
        registrarLog(texto, tipoLog);
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const locucion = new SpeechSynthesisUtterance(texto);
        locucion.lang = 'es-PE';
        locucion.volume = estado.volumen;
        locucion.rate = 1.03;
        const voces = window.speechSynthesis.getVoices();
        const vozEs = voces.find(v => v.lang.includes('es-PE') || v.lang.includes('es-MX') || v.lang.includes('es-ES') || v.lang.startsWith('es'));
        if (vozEs) locucion.voice = vozEs;
        window.speechSynthesis.speak(locucion);
    }

    function actualizarBadgeConexion() {
        if (!estado.encendido) {
            badgeConexion.textContent = '● Apagado';
            badgeConexion.className = 'badge-estado';
            return;
        }
        if (checkSinSenal.checked) {
            badgeConexion.textContent = '● Sin señal / Sin datos';
            badgeConexion.className = 'badge-estado offline';
        } else {
            badgeConexion.textContent = '● Encendido • GPS Activo';
            badgeConexion.className = 'badge-estado online';
        }
    }

    function verificarEncendido() {
        if (!estado.encendido) {
            registrarLog('El dispositivo está apagado. Enciéndelo primero.', 'haptico');
            return false;
        }
        return true;
    }

    let timerSOS = null, intervaloCuentaSOS = null, segundosMantenidosSOS = 0, sosDisparado = false;

    function limpiarTemporizadoresSOS() {
        if (timerSOS) { clearTimeout(timerSOS); timerSOS = null; }
        if (intervaloCuentaSOS) { clearInterval(intervaloCuentaSOS); intervaloCuentaSOS = null; }
        btnSOS.classList.remove('manteniendo');
    }

    function cancelarProcesosPendientes() {
        if (estado.timeoutProcesando) { clearTimeout(estado.timeoutProcesando); estado.timeoutProcesando = null; }
        detenerSonidoCarga();
        limpiarTemporizadoresSOS();
        estado.escuchando = false;
        estado.procesando = false;
        btnMic.classList.remove('activo-mic');
        if (estado.encendido) ledEstado.className = 'led-estado encendido';
    }

    btnPower.addEventListener('click', () => {
        estado.encendido = !estado.encendido;
        cancelarProcesosPendientes();
        estado.rutaActiva = false;
        btnPasoRuta.disabled = true;
        if (estado.encendido) {
            efectoHapticoEncendido(true);
            ledEstado.className = 'led-estado encendido';
            actualizarBadgeConexion();
            const estadoRed = checkSinSenal.checked ? 'Dispositivo encendido. Advertencia: sin señal de datos.' : 'Dispositivo encendido. Señal GPS activa en Avenida La Molina.';
            hablar(estadoRed, 'haptico');
        } else {
            efectoHapticoEncendido(false);
            ledEstado.className = 'led-estado';
            actualizarBadgeConexion();
            hablar('Apagando dispositivo.', 'haptico');
        }
    });

    btnBus.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        cancelarProcesosPendientes();
        sonidoClicSuave();
        if (checkSinSenal.checked) {
            hablar('No hay conexión de datos para consultar los paraderos cercanos en este momento.', 'alerta');
            return;
        }
        const mensajeBus = simulacionesBus[estado.indiceBus];
        estado.indiceBus = (estado.indiceBus + 1) % simulacionesBus.length;
        hablar(mensajeBus, 'voz');
    });

    btnMic.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        if (estado.procesando) cancelarProcesosPendientes();
        if (!estado.escuchando) {
            window.speechSynthesis.cancel();
            estado.escuchando = true;
            btnMic.classList.add('activo-mic');
            ledEstado.className = 'led-estado escuchando';
            sonidoAbrirMic();
            registrarLog('Micrófono abierto: escuchando destino del usuario...', 'haptico');
            return;
        }
        estado.escuchando = false;
        estado.procesando = true;
        btnMic.classList.remove('activo-mic');
        ledEstado.className = 'led-estado procesando';
        sonidoCerrarMic();
        registrarLog('Procesando solicitud de ruta...', 'haptico');
        iniciarSonidoCarga();

        estado.timeoutProcesando = setTimeout(() => {
            detenerSonidoCarga();
            estado.procesando = false;
            ledEstado.className = 'led-estado encendido';
            if (checkSinSenal.checked) {
                hablar('Sin señal de datos ni conexión GPS. No se pudo calcular la ruta, intenta nuevamente más tarde.', 'alerta');
                return;
            }
            const idx = parseInt(selectEscenarioMic.value, 10);
            const escenario = simulacionesMic[idx];
            estado.rutaActiva = true;
            estado.pasosRutaActual = escenario.pasos;
            estado.indicePasoActual = 0;
            btnPasoRuta.disabled = false;
            hablar(estado.pasosRutaActual[0], 'voz');
            selectEscenarioMic.value = ((idx + 1) % simulacionesMic.length).toString();
        }, 2200);
    });

    btnUbicacion.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        cancelarProcesosPendientes();
        sonidoClicSuave();
        if (checkSinSenal.checked) {
            hablar('Señal GPS no disponible. Última ubicación registrada: frente a la Universidad San Ignacio de Loyola.', 'alerta');
            return;
        }
        const mensajeUbi = simulacionesUbicacion[estado.indiceUbicacion];
        estado.indiceUbicacion = (estado.indiceUbicacion + 1) % simulacionesUbicacion.length;
        hablar(mensajeUbi, 'voz');
    });

    btnReloj.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        cancelarProcesosPendientes();
        const ahora = Date.now();
        const diferencia = ahora - estado.ultimoClicReloj;
        estado.ultimoClicReloj = ahora;
        if (diferencia < 420) {
            clearTimeout(estado.timeoutClicReloj);
            sonidoClicSuave();
            setTimeout(() => sonidoClicSuave(), 90);
            hablar('Batería al ochenta y cuatro por ciento. Carga óptima, tiempo estimado de duración: nueve horas y media.', 'voz');
            return;
        }
        estado.timeoutClicReloj = setTimeout(() => {
            sonidoClicSuave();
            const fecha = new Date();
            const horas = fecha.getHours();
            const minutos = fecha.getMinutes();
            const periodo = horas >= 12 ? 'de la tarde' : 'de la mañana';
            const hora12 = horas % 12 || 12;
            const textoMinutos = minutos === 0 ? 'en punto' : `con ${minutos} minutos`;
            hablar(`Son las ${hora12} ${textoMinutos} ${periodo}.`, 'voz');
        }, 430);
    });

    btnCancelar.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        if (estado.escuchando || estado.procesando) {
            cancelarProcesosPendientes();
            sonidoCancelar();
            hablar('Solicitud de voz cancelada.', 'voz');
            return;
        }
        if (estado.rutaActiva) {
            estado.rutaActiva = false;
            btnPasoRuta.disabled = true;
            sonidoCancelar();
            hablar('Ruta cancelada. Navegación detenida.', 'voz');
        } else {
            sonidoClicSuave();
            hablar('No hay ninguna ruta activa en este momento.', 'voz');
        }
    });

    function iniciarPulsacionSOS(e) {
        if (e.type === 'touchstart') e.preventDefault();
        if (!verificarEncendido() || timerSOS) return;
        cancelarProcesosPendientes();
        sosDisparado = false;
        segundosMantenidosSOS = 1;
        btnSOS.classList.add('manteniendo');
        ledEstado.className = 'led-estado alerta';
        reproducirTono(440, 0.12, 'triangle', 0.25);
        registrarLog('Manteniendo SOS (1/5 s)... Suelta antes para cancelar.', 'haptico');
        intervaloCuentaSOS = setInterval(() => {
            segundosMantenidosSOS++;
            if (segundosMantenidosSOS <= 5) {
                reproducirTono(440 + (segundosMantenidosSOS * 75), 0.12, 'triangle', 0.28);
                registrarLog(`Manteniendo SOS (${segundosMantenidosSOS}/5 s)...`, 'haptico');
            }
        }, 1000);
        timerSOS = setTimeout(() => {
            sosDisparado = true;
            limpiarTemporizadoresSOS();
            sonidoAlertaSOS();
            hablar('Alerta SOS activada tras cinco segundos. Enviando tu ubicación en Avenida La Molina frente a la Universidad San Ignacio de Loyola a tus contactos de emergencia.', 'alerta');
            setTimeout(() => { if (estado.encendido) ledEstado.className = 'led-estado encendido'; }, 5000);
        }, 5000);
    }

    function cancelarPulsacionSOS() {
        if (!timerSOS && !intervaloCuentaSOS) return;
        limpiarTemporizadoresSOS();
        if (!sosDisparado && estado.encendido) {
            ledEstado.className = 'led-estado encendido';
            sonidoCancelar();
            registrarLog('Botón SOS soltado antes de 5 segundos. Alerta cancelada (prevención de pulsación accidental).', 'haptico');
        }
    }

    btnSOS.addEventListener('mousedown', iniciarPulsacionSOS);
    btnSOS.addEventListener('mouseup', cancelarPulsacionSOS);
    btnSOS.addEventListener('mouseleave', cancelarPulsacionSOS);
    btnSOS.addEventListener('touchstart', iniciarPulsacionSOS, { passive: false });
    btnSOS.addEventListener('touchend', cancelarPulsacionSOS);
    btnSOS.addEventListener('touchcancel', cancelarPulsacionSOS);

    btnVolMas.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        estado.volumen = Math.min(1.0, Math.round((estado.volumen + 0.1) * 10) / 10);
        textoVolumen.textContent = `${Math.round(estado.volumen * 100)}%`;
        reproducirTono(600, 0.06, 'sine', 0.25);
        if (estado.volumen === 1.0) hablar('Volumen al máximo.', 'haptico');
    });

    btnVolMenos.addEventListener('click', () => {
        if (!verificarEncendido()) return;
        estado.volumen = Math.max(0.1, Math.round((estado.volumen - 0.1) * 10) / 10);
        textoVolumen.textContent = `${Math.round(estado.volumen * 100)}%`;
        reproducirTono(380, 0.06, 'sine', 0.25);
        if (estado.volumen === 0.1) hablar('Volumen al mínimo.', 'haptico');
    });

    btnPasoRuta.addEventListener('click', () => {
        if (!estado.rutaActiva) return;
        estado.indicePasoActual++;
        if (estado.indicePasoActual < estado.pasosRutaActual.length) {
            reproducirTono(600, 0.1, 'sine', 0.2, 0);
            reproducirTono(750, 0.15, 'sine', 0.25, 0.15);
            hablar(estado.pasosRutaActual[estado.indicePasoActual], 'voz');
            if (estado.indicePasoActual === estado.pasosRutaActual.length - 1) {
                estado.rutaActiva = false;
                btnPasoRuta.disabled = true;
                setTimeout(() => {
                    reproducirTono(500, 0.1, 'triangle', 0.2, 0);
                    reproducirTono(650, 0.1, 'triangle', 0.2, 0.15);
                    reproducirTono(800, 0.2, 'triangle', 0.2, 0.3);
                    registrarLog('Destino alcanzado. Ruta finalizada.', 'haptico');
                }, 5000);
            }
        }
    });

    checkSinSenal.addEventListener('change', () => {
        actualizarBadgeConexion();
        registrarLog(checkSinSenal.checked ? 'Modo prueba activado: Sin señal / Sin datos.' : 'Modo prueba desactivado: Señal GPS y datos restaurados.', 'haptico');
    });

    btnLimpiarLog.addEventListener('click', () => { logSalida.innerHTML = ''; });
})();