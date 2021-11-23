//Variables
const form = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');


//Listeners
eventListeners();
function eventListeners(){
  document.addEventListener('DOMContentLoaded', sweetAlert);
  form.addEventListener('submit', agregarGasto);
}

//clases
class Presupuesto {
  constructor(presupuesto){
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto){
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  calcularRestante(){
    const gastado = this.gastos.reduce( (total, gasto ) => total + gasto.cantidad, 0);
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id){
    this.gastos = this.gastos.filter( gasto => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI {
  insertarPresupuesto(cantidad){
    //Extraer valores
    const { presupuesto, restante } = cantidad;

    //Agregarlos al HTML
    document.querySelector('#total').textContent = presupuesto;
    document.querySelector('#restante').textContent = restante;
  }

  imprimirAlerta(mensaje, tipo){
    //Crear div
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert');

    if(tipo === 'error'){
      divMensaje.classList.add('alert-danger');
    }else{
      divMensaje.classList.add('alert-success');
    }

    //Mensaje
    divMensaje.textContent = mensaje;

    //Insertar en el html
    document.querySelector('.primario').insertBefore(divMensaje, form);

    setTimeout(() => {
      divMensaje.remove();
    }, 3500);
  }

  mostrarGastos(gastos){
    this.limpiarHtml(); //Elimina el HTML previo

    gastos.forEach( gasto => {
      const { cantidad, nombreGasto, id } = gasto;

      //Crear LI
      const nuevoGasto = document.createElement('li');
      nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
      //nuevoGasto.setAttribute('data-id', id);
      nuevoGasto.dataset.id = id; //nueva forma de agegar un data-nombreData

      //Crear el HTML del gasto
      nuevoGasto.innerHTML = `${nombreGasto} <span class="badge badge-primary badge-pill"> $${cantidad} </span>`

      //Crear boton eliminar
      const btnBorrar = document.createElement('button');
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
      btnBorrar.innerHTML = 'Borrar &times';
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      }
      nuevoGasto.appendChild(btnBorrar);

      //Agregar al HTML
      gastoListado.appendChild(nuevoGasto);
    });
  }

  limpiarHtml(){
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante){
    document.querySelector('#restante').textContent = restante;
  }

  comprobarPresupuesto( presupuestoObj ){
    const { presupuesto, restante } = presupuestoObj;

    const restanteDiv = document.querySelector('.restante');

    //comprobar si se gasto el 50%, 75% o supera el 100% del presupuesto
    if( (presupuesto / 4) > restante ){
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-ending');
    }else if( (presupuesto / 2) > restante){
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    }else{
      restanteDiv.classList.remove('alert-ending', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    //Si el presupuesto es 0 o menor
    if(restante <= 0){
      //Notificar presupuesto agotado
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      Toast.fire({
        icon: 'error',
        title: `El presupuesto se ha agotado!`
      })

      form.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

let presupuestoUsuario;
//Instanciar
const ui = new UI();

//Funciones
function sweetAlert(){
  (async () => {

    const { value: presupuestoUser } = await Swal.fire({
      title: 'Ingresa tu presupuesto',
      input: 'text',
      inputPlaceholder: 'Por ej: 2500'
    })

    if (presupuestoUser !== '' && presupuestoUser > 0 && !isNaN(Number(presupuestoUser)) && presupuestoUser !== null) {
      // Swal.fire(`Ingresaste: ${presupuestoUser}`) funcionando
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      Toast.fire({
        icon: 'success',
        title: `<span class="notificacion">Añadiste:</span> <span class="monto"> $${presupuestoUser} </span>`
      })
    } else{
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'error',
          title: `<span id="notificacion-error">Debes ingresar un valor numérico mayor a cero. Vuelve a intentarlo!</span>`
        });

        setTimeout(() => {
          window.location.reload();
        }, 4500);
      }

      presupuestoUsuario = new Presupuesto(presupuestoUser);
      console.log(presupuestoUsuario);
      ui.insertarPresupuesto(presupuestoUsuario);

    })()
}

function agregarGasto(e){
  e.preventDefault();

  //Leer datos form
  const nombreGasto = document.querySelector('#gasto').value;
  const cantidad = Number(document.querySelector('#cantidad').value);

  if(nombreGasto === '' || cantidad === ''){
    ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    return;
  }else if(cantidad <= 0 || isNaN(cantidad)){
    ui.imprimirAlerta('Cantidad no válida', 'error');
    return;
  }

  //generar objeto con el gasto
  const gasto = {nombreGasto, cantidad, id: Date.now()}

  //Añade nuevo gasto
  presupuestoUsuario.nuevoGasto(gasto);

  //Mostrar alerta
  ui.imprimirAlerta('Se agregó gasto correctamente');

  //Imprimir los gastos
  const { gastos, restante } = presupuestoUsuario;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuestoUsuario);

  //Resetear form
  form.reset();
  form.childNodes[1].childNodes[3].focus();
}

function eliminarGasto(id){
  //Elimina gastos del objeto
  presupuestoUsuario.eliminarGasto(id);

  //Elimina los gastos del HTML
  const { gastos, restante } = presupuestoUsuario;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuestoUsuario);
}