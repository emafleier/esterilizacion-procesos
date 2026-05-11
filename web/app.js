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

// Navegación del Sidebar
const navItems = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const detailsPanel = document.getElementById('area-details');
const detailTitle = document.getElementById('detail-title');
const detailContent = document.getElementById('detail-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remover clase active de todos los items
        navItems.forEach(nav => nav.classList.remove('active'));
        // Ocultar todas las vistas
        views.forEach(view => view.classList.add('hidden'));
        views.forEach(view => view.classList.remove('active'));
        
        // Activar item clickeado
        item.classList.add('active');
        
        // Mostrar vista correspondiente
        const targetView = item.getAttribute('data-view');
        document.getElementById('view-' + targetView).classList.remove('hidden');
        document.getElementById('view-' + targetView).classList.add('active');

        // Si cambiamos de vista, cerramos el panel de detalles
        closeArea();
    });
});

// Lógica para abrir detalles de Áreas
function openArea(areaKey) {
    const data = areaData[areaKey];
    if(data) {
        detailTitle.innerHTML = data.title;
        detailTitle.style.color = data.color;
        detailContent.innerHTML = data.content;
        
        detailsPanel.classList.remove('hidden');
        // Scroll suave hacia los detalles
        setTimeout(() => {
            detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
}

// Lógica para cerrar detalles de Áreas
function closeArea() {
    detailsPanel.classList.add('hidden');
}
