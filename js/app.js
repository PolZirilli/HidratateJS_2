// app.js

// Variables globales
let registrosAgua = [];
let registrosOrina = [];

// Para controlar qué fila está en modo edición (tipo, índice)
let registroEditando = { tipo: null, index: null };

// Mostrar alerta modal
function mostrarModal(mensaje) {
  alert(mensaje);
}

// Actualiza totales en la UI
function actualizarTotales() {
  const totalAgua = registrosAgua.reduce((acc, reg) => acc + Number(reg.ml), 0);
  const totalOrina = registrosOrina.reduce((acc, reg) => acc + Number(reg.ml), 0);

  document.getElementById('totalAgua').textContent = totalAgua;
  document.getElementById('totalOrina').textContent = totalOrina;
}

// Renderiza tablas con registros, incluye inputs para edición
function renderizarRegistros() {
  const tablaAgua = document.getElementById('tablaAgua');
  const tablaOrina = document.getElementById('tablaOrina');

  tablaAgua.innerHTML = registrosAgua.map((reg, index) => {
    const esEditando = registroEditando.tipo === 'agua' && registroEditando.index === index;
    return `
      <tr>
        <td>${reg.fecha}</td>
        <td>${reg.hora}</td>
        <td>
          ${esEditando 
            ? `<input type="number" class="form-control form-control-sm" id="inputAgua${index}" value="${reg.ml}" min="1" />` 
            : reg.ml
          }
        </td>
        <td>
          <button class="btn btn-sm btn-link text-primary" onclick="toggleEditarRegistro('agua', ${index})" title="${esEditando ? 'Guardar' : 'Editar'}">
            <i class="fas fa-${esEditando ? 'check' : 'edit'}"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger" onclick="eliminarRegistro('agua', ${index})" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tablaOrina.innerHTML = registrosOrina.map((reg, index) => {
    const esEditando = registroEditando.tipo === 'orina' && registroEditando.index === index;
    return `
      <tr>
        <td>${reg.fecha}</td>
        <td>${reg.hora}</td>
        <td>
          ${esEditando 
            ? `<input type="number" class="form-control form-control-sm" id="inputOrina${index}" value="${reg.ml}" min="1" />` 
            : reg.ml
          }
        </td>
        <td>
          <button class="btn btn-sm btn-link text-primary" onclick="toggleEditarRegistro('orina', ${index})" title="${esEditando ? 'Guardar' : 'Editar'}">
            <i class="fas fa-${esEditando ? 'check' : 'edit'}"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger" onclick="eliminarRegistro('orina', ${index})" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  actualizarTotales();
}

// Guardar un registro nuevo
function guardarRegistro(tipo) {
  const mlInput = document.getElementById('ml');
  if (!mlInput) {
    console.error("No se encontró el input de ml");
    return;
  }

  const cantidad = mlInput.value.trim();
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    mostrarModal("Ingrese un valor numérico válido mayor que cero.");
    mlInput.focus();
    return;
  }

  const now = new Date();
  const registro = {
    fecha: now.toLocaleDateString(),
    hora: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ml: Number(cantidad)
  };

  if (tipo === 'agua') registrosAgua.push(registro);
  else if (tipo === 'orina') registrosOrina.push(registro);
  else {
    console.error("Tipo de registro desconocido:", tipo);
    return;
  }

  mlInput.value = '';
  registroEditando = { tipo: null, index: null };
  renderizarRegistros();
  mostrarModal("Registro guardado correctamente.");

  // Guardar en Firestore solo si está definida
  if (typeof guardarRegistrosEnFirestore === "function") {
    guardarRegistrosEnFirestore(registrosAgua, registrosOrina);
  } else {
    console.warn("guardarRegistrosEnFirestore no está definida.");
  }
}

// Eliminar registro
function eliminarRegistro(tipo, index) {
  if (tipo === 'agua') registrosAgua.splice(index, 1);
  else if (tipo === 'orina') registrosOrina.splice(index, 1);
  else {
    console.error("Tipo de registro desconocido para eliminar:", tipo);
    return;
  }

  // Ajustar estado de edición si afecta
  if (registroEditando.tipo === tipo && registroEditando.index === index) {
    registroEditando = { tipo: null, index: null };
  } else if (registroEditando.tipo === tipo && registroEditando.index > index) {
    registroEditando.index--;
  }

  renderizarRegistros();

  if (typeof guardarRegistrosEnFirestore === "function") {
    guardarRegistrosEnFirestore(registrosAgua, registrosOrina);
  } else {
    console.warn("guardarRegistrosEnFirestore no está definida.");
  }
}

// Alternar edición de registro
function toggleEditarRegistro(tipo, index) {
  // Evitar editar más de uno a la vez
  if (registroEditando.tipo !== null && (registroEditando.tipo !== tipo || registroEditando.index !== index)) {
    mostrarModal("Termine de editar el registro actual antes de editar otro.");
    return;
  }

  const esEditando = registroEditando.tipo === tipo && registroEditando.index === index;

  if (esEditando) {
    // Guardar cambios
    let inputId = tipo === 'agua' ? `inputAgua${index}` : `inputOrina${index}`;
    const inputElem = document.getElementById(inputId);
    if (!inputElem) {
      console.error("No se encontró el input para editar:", inputId);
      return;
    }
    const nuevoValor = inputElem.value.trim();

    if (!nuevoValor || isNaN(nuevoValor) || nuevoValor <= 0) {
      mostrarModal("Ingrese un valor numérico válido mayor que cero.");
      inputElem.focus();
      return;
    }

    if (tipo === 'agua') registrosAgua[index].ml = Number(nuevoValor);
    else registrosOrina[index].ml = Number(nuevoValor);

    registroEditando = { tipo: null, index: null };
    renderizarRegistros();

    if (typeof guardarRegistrosEnFirestore === "function") {
      guardarRegistrosEnFirestore(registrosAgua, registrosOrina);
    } else {
      console.warn("guardarRegistrosEnFirestore no está definida.");
    }

  } else {
    // Activar modo edición
    registroEditando = { tipo, index };
    renderizarRegistros();

    // Poner foco en input después de render
    setTimeout(() => {
      const inputId = tipo === 'agua' ? `inputAgua${index}` : `inputOrina${index}`;
      const inputElem = document.getElementById(inputId);
      if (inputElem) inputElem.focus();
    }, 0);
  }
}

// Inicializar y cargar datos
function inicializar() {
  if (typeof cargarRegistros === 'function') {
    cargarRegistros();
  } else {
    console.warn("Función cargarRegistros no está definida.");
  }
}

// Ejecutar la inicialización
window.addEventListener('load', inicializar);