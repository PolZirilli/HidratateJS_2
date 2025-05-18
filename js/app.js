let registrosAgua = [];
let registrosOrina = [];

// Para controlar qué fila está en modo edición (tipo, índice)
let registroEditando = { tipo: null, index: null };

function mostrarModal(mensaje) {
  alert(mensaje);
}

function actualizarTotales() {
  const totalAgua = registrosAgua.reduce((acc, reg) => acc + Number(reg.ml), 0);
  const totalOrina = registrosOrina.reduce((acc, reg) => acc + Number(reg.ml), 0);

  document.getElementById('totalAgua').textContent = totalAgua;
  document.getElementById('totalOrina').textContent = totalOrina;
}

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
}

function eliminarRegistro(tipo, index) {
  if (tipo === 'agua') registrosAgua.splice(index, 1);
  else registrosOrina.splice(index, 1);

  // Si estaba editando este registro, cancelar edición
  if (registroEditando.tipo === tipo && registroEditando.index === index) {
    registroEditando = { tipo: null, index: null };
  } else if (registroEditando.tipo === tipo && registroEditando.index > index) {
    // Ajustar índice si eliminamos antes del editado
    registroEditando.index--;
  }

  renderizarRegistros();
}

function toggleEditarRegistro(tipo, index) {
  // Si estamos editando otra fila diferente, confirmamos guardar o cancelar edición actual
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
  } else {
    // Activar modo edición
    registroEditando = { tipo, index };
    renderizarRegistros();
    // Poner foco en input luego de render
    setTimeout(() => {
      const inputId = tipo === 'agua' ? `inputAgua${index}` : `inputOrina${index}`;
      const inputElem = document.getElementById(inputId);
      if (inputElem) inputElem.focus();
    }, 0);
  }
}

// Inicializar render
renderizarRegistros();