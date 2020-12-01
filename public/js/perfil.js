const HTTTPMethods = {
  "put": "PUT",
  "post": "POST",
  "get": "GET",
  "delete": "DELETE"
}
const APIURL = window.location.protocol + '//' + window.location.host + '/api';
let TOKEN = getTokenValue('token');

let Guser;
let Gpets;

function getTokenValue(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function sendHTTPRequest(urlAPI, data, method, cbOK, cbError, authToken) {
  // 1. Crear XMLHttpRequest object
  let xhr = new XMLHttpRequest();
  // 2. Configurar:  PUT actualizar archivo
  xhr.open(method, urlAPI);
  // 3. indicar tipo de datos JSON
  xhr.setRequestHeader('content-type', 'application/json');
  if (authToken)
    xhr.setRequestHeader('x-auth-user', authToken);
  // 4. Enviar solicitud al servidor
  xhr.send(data);
  // 5. Una vez recibida la respuesta del servidor
  xhr.onload = function () {
    if (xhr.status != 200 && xhr.status != 201) { // analizar el estatus de la respuesta HTTP 
      // Ocurrió un error
      cbError(xhr.status + ': ' + xhr.statusText);
    } else {
      console.log(xhr.responseText); // Significa que fue exitoso
      cbOK({
        status: xhr.status,
        data: xhr.responseText
      });
    }
  };
}

function usertoHTML(user) {
  document.getElementById("user_image").src = user.image;
  document.getElementById("user_name").innerHTML = user.nombre + " " + user.apellidos;
  document.getElementById("user_email").innerHTML = `<i class="fa fa-envelope" aria-hidden="true"></i> ` + user.email;
  document.getElementById("user_date").innerHTML = `<i class="fas fa-birthday-cake" aria-hidden="true"></i> ` + user.fecha;
  let gender = (user.sexo == 'H') ? "Hombre" : "Mujer";
  document.getElementById("user_gender").innerHTML = `<i class="fas fa-venus-mars"></i> ` + gender;
}

async function addUserData() {
  let url = APIURL + `/users/getby/token`;
  await sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
    let user = JSON.parse(res.data);
    Guser = user;
    usertoHTML(user);
    loadPets();
    return user;
  }, (error) => {}, token);
}

function petToHtml(pet) {
  document.getElementById("petsRow").innerHTML +=
    `<td class="columna_mascotas">
    <!-- Carta -->
    <div class="card">
      <!-- Carrusel mascotas -->
      <div class="carrusel_padre">
        <div id="carouselId" class="carousel slide" data-ride="carousel">
          <ol class="carousel-indicators">
            <li
              data-target="#carouselId"
              data-slide-to="0"
              class="active"
            ></li>
          </ol>
          <div class="carousel-inner" role="listbox">
            <div class="carousel-item active">
              <img
                class="imagen_carta"
                src="${pet.image}"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <h4 class="card-title">${pet.nombre}</h4>
        <hr />
        <i class="fa fa-info-circle" aria-hidden="true"></i> ${pet.description}
        <hr />
        <i class="fa fa-venus-mars" aria-hidden="true"></i> ${pet.sexo}
        <hr />
        <i class="fa fa-birthday-cake" aria-hidden="true"></i> ${pet.fecha}
      </div>
    </div>
  </td>`;
}

function addPlusButtonHTML() {
  document.getElementById("petsRow").innerHTML +=
    `<td class="columna_añadir">
    <button
      id="btn_plus"
      type="button"
      class="btn btn-light btn-circle btn-xl"
      data-toggle="modal"
      data-target="#modelAddMascota"
    >
      <i class="fa fa-plus fa-3x"></i>
    </button>
  </td>`;
}

function loadPets() {
  let url = APIURL + `/pets/?owner_id=${Guser.uid}&page=1&limit=2`;
  sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
    let pets = JSON.parse(res.data);
    Gpets = pets;
    for (let pet of pets) {
      petToHtml(pet);
    }
    addPlusButtonHTML();
    return pets;
  }, (error) => {}, token);
}

document.addEventListener('DOMContentLoaded', async () => {
  //agrega tu codigo de asignación de eventos...
  await addUserData();

  $('#modelAddMascota').on('show.bs.modal', function (event) {
    // console.log(event.relatedTarget);
    //agrega tu codigo...
  });

  //al presionar el boton 
  $('#createUserBtn').on('click', function (event) {
    //
  });
});