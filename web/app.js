// Datos de los procesos por área (Basado en POE-CE-02 y Limpieza)
const areaData = {
    sucia: {
        title: "Área Sucia (Recepción y Lavado)",
        color: "var(--color-sucia)",
        content: `
            <div class="process-flow">
                <div class="process-step">
                    <h4><i class="fa-solid fa-truck-ramp-box"></i> 1. Recepción</h4>
                    <p>Ingreso de material contaminado y recolección desde servicios.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-hands-bubbles"></i> 2. Lavado y Descontaminación</h4>
                    <p>Eliminar suciedad visible y reducir carga biológica. Uso de detergente enzimático o lavadoras ultrasónicas.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-wind"></i> 3. Secado</h4>
                    <p>El material debe estar completamente seco antes de pasar al Área Gris.</p>
                </div>
                <div class="process-step alternative">
                    <h4><i class="fa-solid fa-triangle-exclamation"></i> Camino Alternativo: Derrame</h4>
                    <p>Si ocurre un derrame biológico, se debe aplicar protocolo de limpieza terminal inmediata usando EPP completo, mopa roja y amonio cuaternario / cloro.</p>
                </div>
            </div>
        `
    },
    gris: {
        title: "Área Gris (Acondicionamiento)",
        color: "var(--color-gris)",
        content: `
            <div class="process-flow">
                <div class="process-step">
                    <h4><i class="fa-solid fa-magnifying-glass"></i> 1. Inspección</h4>
                    <p>Revisión visual con lupa. Controlar restos orgánicos, óxido o roturas.</p>
                </div>
                <div class="process-step alternative">
                    <h4><i class="fa-solid fa-backward"></i> Camino Alternativo: Material Sucio o Húmedo</h4>
                    <p>Si el material tiene restos o humedad, se <strong>devuelve inmediatamente al Área Sucia</strong>.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-oil-can"></i> 2. Lubricación</h4>
                    <p>Aplicar lubricante hidrosoluble en articulaciones y cremalleras.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-toolbox"></i> 3. Armado de Cajas</h4>
                    <p>Reensamblar según listas estandarizadas, conteo de piezas y registro de faltantes.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-box"></i> 4. Empaquetado y Rotulado</h4>
                    <p>Uso de papel grado médico o SMS. Colocar indicadores internos/externos. Etiqueta con lote, vencimiento y operador.</p>
                </div>
                <div class="process-step alternative">
                    <h4><i class="fa-solid fa-biohazard"></i> Camino Alternativo: Derrame Biológico</h4>
                    <p>Detener el trabajo, aplicar EPP completo. Contener con mopa <strong>amarilla</strong> y cloro diluido. Notificar al Supervisor. No reanudar hasta recibir el clearance.</p>
                </div>
            </div>
        `
    },
    blanca: {
        title: "Área Blanca (Esterilización)",
        color: "var(--color-blanca)",
        content: `
            <div class="process-flow">
                <div class="process-step">
                    <h4><i class="fa-solid fa-arrow-down-up-across-line"></i> 1. Carga del Esterilizador</h4>
                    <p>No sobrecargar. Colocar contenedores pesados abajo.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-fire-burner"></i> 2. Ciclo de Esterilización</h4>
                    <p>Autoclave a Vapor (121° / 134°C). Monitoreo de controles físicos, químicos y biológicos.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-check-double"></i> 3. Liberación de Carga</h4>
                    <p>Firma del Supervisor confirmando que todos los parámetros y controles son correctos.</p>
                </div>
                <div class="process-step alternative">
                    <h4><i class="fa-solid fa-ban"></i> Camino Alternativo: Falla de Control</h4>
                    <p><strong>Falla química o biológica:</strong> Rechazar carga completa → Cuarentena → Reproceso desde <em>Inspección</em> en Área Gris.<br><strong>Falla de empaque</strong> (bolsa rota o húmeda): Solo el paquete afectado → Re-empacar desde <em>Empaque y Rotulado</em> en Área Gris.</p>
                </div>
                <div class="process-step alternative">
                    <h4><i class="fa-solid fa-biohazard"></i> Camino Alternativo: Derrame Biológico</h4>
                    <p>Evacuación del área, EPP completo. Mopa <strong>blanca</strong> + cloro. No reanudar el procesamiento hasta clearance del Supervisor.</p>
                </div>
                <div class="process-step">
                    <h4><i class="fa-solid fa-cubes-stacked"></i> 4. Almacenaje y Distribución (FEFO)</h4>
                    <p>First Expire - First Out. Salida mediante carros cerrados según pedido de servicios.</p>
                </div>
            </div>
        `
    }
};

// --- Estado ---
let editMode = false;
let currentArea = null;
let permanentContent = {};

const GITHUB_REPO = 'emafleier/esterilizacion-procesos';
const CONTENT_FILE = 'web/content.json';

// --- Inicialización ---
async function init() {
    await loadPermanentContent();
    initContent();
}

async function loadPermanentContent() {
    try {
        const res = await fetch('./content.json?t=' + Date.now());
        if (res.ok) {
            const text = await res.text();
            permanentContent = text.trim() ? JSON.parse(text) : {};
        }
    } catch(e) { /* content.json vacío o inexistente: usar defaults */ }
}

// --- Navegación del Sidebar ---
const navItems = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const detailsPanel = document.getElementById('area-details');
const detailTitle = document.getElementById('detail-title');
const detailContent = document.getElementById('detail-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => { view.classList.add('hidden'); view.classList.remove('active'); });
        item.classList.add('active');
        const targetView = item.getAttribute('data-view');
        document.getElementById('view-' + targetView).classList.remove('hidden');
        document.getElementById('view-' + targetView).classList.add('active');
        closeArea();
    });
});

// --- Detalles de Áreas ---
function openArea(areaKey) {
    if (editMode) return;
    const data = areaData[areaKey];
    if (data) {
        currentArea = areaKey;
        detailTitle.innerHTML = data.title;
        detailTitle.style.color = data.color;

        const panelDraft     = localStorage.getItem(`ceye-panel-${areaKey}`);
        const panelPermanent = permanentContent[`panel-${areaKey}`] || null;
        detailContent.innerHTML = panelDraft || panelPermanent || data.content;

        if (editMode) enablePanelEditing(areaKey);

        detailsPanel.classList.remove('hidden');
        setTimeout(() => {
            detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
}

function closeArea() {
    detailsPanel.classList.add('hidden');
    currentArea = null;
}

// --- Modo Edición ---
function initContent() {
    let counter = 0;

    function assignEid(el) {
        if (!el.getAttribute('data-eid')) el.setAttribute('data-eid', `e${counter++}`);
    }

    document.querySelectorAll(
        'header h1, header > p, ' +
        '.area-card h3, .area-card > p, .area-card .badge, ' +
        '.flow-node h3, .flow-node .node-area, .flow-phase-content > span, ' +
        '.node-task-list li, .node-alternative, ' +
        '.role-card h2, .task-list li, ' +
        '.gray-item h4, .gray-item p, .gray-proposal'
    ).forEach(assignEid);

    document.querySelectorAll('.flow-node .detail-item').forEach(el => {
        if (!el.querySelector('.node-task-list')) assignEid(el);
    });

    // Aplicar contenido permanente primero, luego borradores locales
    Object.entries(permanentContent).forEach(([eid, html]) => {
        if (eid.startsWith('panel-')) return;
        const el = document.querySelector(`[data-eid="${eid}"]`);
        if (el) el.innerHTML = html;
    });

    const draft = JSON.parse(localStorage.getItem('ceye-static') || '{}');
    Object.entries(draft).forEach(([eid, html]) => {
        const el = document.querySelector(`[data-eid="${eid}"]`);
        if (el) el.innerHTML = html;
    });
}

function toggleEditMode() {
    editMode = !editMode;
    const btn     = document.getElementById('btn-edit-toggle');
    const hint    = document.getElementById('edit-hint');
    const saveBtn = document.getElementById('btn-save-github');

    document.querySelectorAll('[data-eid]').forEach(el => {
        el.contentEditable = editMode ? 'true' : 'false';
        if (editMode) el.addEventListener('input', handleStaticEdit);
        else          el.removeEventListener('input', handleStaticEdit);
    });

    document.body.classList.toggle('edit-mode', editMode);

    if (editMode) {
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Vista Normal';
        btn.classList.add('editing');
        if (hint)    hint.style.display    = 'block';
        if (saveBtn) saveBtn.style.display = 'flex';
        if (currentArea) enablePanelEditing(currentArea);
    } else {
        btn.innerHTML = '<i class="fa-solid fa-pencil"></i> Editar Contenido';
        btn.classList.remove('editing');
        if (hint)    hint.style.display    = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function handleStaticEdit(e) {
    const eid  = e.currentTarget.getAttribute('data-eid');
    const saved = JSON.parse(localStorage.getItem('ceye-static') || '{}');
    saved[eid] = e.currentTarget.innerHTML;
    localStorage.setItem('ceye-static', JSON.stringify(saved));
}

function enablePanelEditing(areaKey) {
    detailContent.querySelectorAll('h4, p').forEach(el => {
        el.contentEditable = 'true';
        el.addEventListener('input', () => {
            localStorage.setItem(`ceye-panel-${areaKey}`, detailContent.innerHTML);
        });
    });
}

function resetContent() {
    if (confirm('¿Resetear todos los cambios al contenido original?')) {
        localStorage.removeItem('ceye-static');
        ['sucia', 'gris', 'blanca'].forEach(k => localStorage.removeItem(`ceye-panel-${k}`));
        location.reload();
    }
}

// --- Guardar en GitHub ---
async function saveToGitHub() {
    let token = localStorage.getItem('ceye-gh-token');
    if (!token) {
        token = prompt(
            'Ingresá tu GitHub Token (con permiso "contents: write").\n\n' +
            'Crealo en: github.com → Settings → Developer settings → Tokens (classic)'
        );
        if (!token) return;
        token = token.trim();
        localStorage.setItem('ceye-gh-token', token);
    }

    const saveBtn = document.getElementById('btn-save-github');
    const original = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    saveBtn.disabled = true;

    // Recolectar todo el contenido actual
    const content = {};
    document.querySelectorAll('[data-eid]').forEach(el => {
        content[el.getAttribute('data-eid')] = el.innerHTML;
    });
    ['sucia', 'gris', 'blanca'].forEach(k => {
        const panel = localStorage.getItem(`ceye-panel-${k}`);
        if (panel) content[`panel-${k}`] = panel;
    });

    const newContent = JSON.stringify(content, null, 2);
    const encoded    = btoa(unescape(encodeURIComponent(newContent)));

    try {
        // Obtener SHA actual del archivo
        let sha = null;
        const getRes = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONTENT_FILE}`,
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' } }
        );
        if (getRes.ok) sha = (await getRes.json()).sha;

        const body = { message: 'content: actualizar textos desde editor web', content: encoded };
        if (sha) body.sha = sha;

        const putRes = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONTENT_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (putRes.ok) {
            localStorage.removeItem('ceye-static');
            ['sucia', 'gris', 'blanca'].forEach(k => localStorage.removeItem(`ceye-panel-${k}`));
            showToast('✓ Guardado en GitHub — el sitio se actualizará en ~1 min', 'success');
        } else {
            const err = await putRes.json();
            if (putRes.status === 401 || putRes.status === 403) {
                localStorage.removeItem('ceye-gh-token');
                showToast('Token inválido. Hacé clic en "Guardar" de nuevo para ingresar uno nuevo.', 'error');
            } else {
                showToast('Error al guardar: ' + (err.message || putRes.status), 'error');
            }
        }
    } catch(e) {
        showToast('Error de conexión: ' + e.message, 'error');
    }

    saveBtn.innerHTML = original;
    saveBtn.disabled  = false;
}

function showToast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `save-toast ${type}`;
    el.innerHTML  = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 10);
    setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 400); }, 4000);
}

// Inicializar
init();
