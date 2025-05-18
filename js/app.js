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
          <button class="btn btn-sm btn-link text-primary" onclick="toggleEditarRegistro('agua', ${index})">
            <i class="fas fa-${esEditando ? 'check' : 'edit'}"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger" onclick="eliminarRegistro('agua', ${index})">
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
          <button class="btn btn-sm btn-link text-primary" onclick="toggleEditarRegistro('orina', ${index})">
            <i class="fas fa-${esEditando ? 'check' : 'edit'}"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger" onclick="eliminarRegistro('orina', ${index})">
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
  const cantidad = mlInput.value.trim();
  if (!cantidad || cantidad <= 0) return;

  const now = new Date();
  const registro = {
    fecha: now.toLocaleDateString(),
    hora: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ml: cantidad
  };

  if (tipo === 'agua') registrosAgua.push(registro);
  else registrosOrina.push(registro);

  mlInput.value = '';
  registroEditando = { tipo: null, index: null }; // Reset edición
  renderizarRegistros();
  mostrarModal("Registro guardado correctamente.");

  // Guardar en Firestore
  guardarRegistrosEnFirestore(registrosAgua, registrosOrina);
}

// Eliminar registro
function eliminarRegistro(tipo, index) {
  if (tipo === 'agua') registrosAgua.splice(index, 1);
  else registrosOrina.splice(index, 1);

  // Ajustar estado de edición si afecta
  if (registroEditando.tipo === tipo && registroEditando.index === index) {
    registroEditando = { tipo: null, index: null };
  } else if (registroEditando.tipo === tipo && registroEditando.index > index) {
    registroEditando.index--;
  }

  renderizarRegistros();

  // Guardar en Firestore
  guardarRegistrosEnFirestore(registrosAgua, registrosOrina);
}

// Alternar edición de registro
function toggleEditarRegistro(tipo, index) {
  // Evitar editar más de uno a la vez
  if (registroEditando.tipo !== null && (registroEditando.tipo !== tipo || registroEditando.index !== index)) {
    alert("Termine de editar el registro actual antes de editar otro.");
    return;
  }

  const esEditando = registroEditando.tipo === tipo && registroEditando.index === index;

  if (esEditando) {
    // Guardar cambios
    let inputId = tipo === 'agua' ? `inputAgua${index}` : `inputOrina${index}`;
    const inputElem = document.getElementById(inputId);
    const nuevoValor = inputElem.value.trim();

    if (!nuevoValor || nuevoValor <= 0) {
      alert("Ingrese un valor válido mayor que cero.");
      inputElem.focus();
      return;
    }

    if (tipo === 'agua') {
      registrosAgua[index].ml = nuevoValor;
    } else {
      registrosOrina[index].ml = nuevoValor;
    }

    registroEditando = { tipo: null, index: null };
    renderizarRegistros();

    // Guardar en Firestore
    guardarRegistrosEnFirestore(registrosAgua, registrosOrina);

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

// ------------------ Integración con Firebase ------------------

// Las funciones guardarRegistrosEnFirestore y cargarRegistros
// se importan desde firebase.js y se usan aquí

// Carga inicial al iniciar sesión
function inicializar() {
  if (typeof cargarRegistros === 'function') {
    cargarRegistros();
  }
}

// Ejecutar la inicialización
inicializar();