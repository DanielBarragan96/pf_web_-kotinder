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
let curr_page = 1;
let limit = 2;
let totalPages = 2;

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

function addProfileCard(user) {
  document.getElementById('petsRow').innerHTML += `
  <td class="columna_perfil">
          <div class="carta_perfil">
            <img class="imagen_perfil" id="user_image" alt="" src="${user.image}" />
            <div class="carta-perfil-body">
              <h4 class="card-title" id="user_name">${user.nombre}</h4>
              <hr />
              <p id="user_email">
                <i class="fa fa-envelope" aria-hidden="true"></i>
                ${user.email}
              </p>
              <p id="user_date">
                <i class="fas fa-birthday-cake" aria-hidden="true"></i>
                ${user.fecha}
              </p>
              <p id="user_gender">
                <i class="fas fa-venus-mars"></i>
                ${(user.sexo == "H") ? "Hombre" : "Mujer"}
              </p>
            </div>
          </div>
        </td>
  `;
}

async function addUserData() {
  let url = APIURL + `/users/getby/token`;
  await sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
    let user = JSON.parse(res.data);
    Guser = user;
    addProfileCard(user);
    loadPets();
    return user;
  }, (error) => {}, token);
}

function petToHtml(pet, index) {
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
        <hr />
        <button type="button" class="btn btn-danger float-right" data-toggle="modal" data-target="#deleteFormModal" data-index="${index}">Delete</button>
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

function updatePage(newPage) {
  if (newPage != curr_page) {
    curr_page = newPage;
    document.getElementById("petsRow").innerHTML = '';
    document.getElementById("page_buttons").innerHTML = '';
    addProfileCard(Guser);
    loadPets();
  }
}

const getPagesBtns = () => {
  let first_page = curr_page;
  if (first_page > 1) {
    if ((first_page + 1) <= totalPages) {
      return `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page - 1})">Previous</a></li>` +
        `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page - 1})">${first_page - 1}</a></li>` +
        `<li class="page-item active"><a class="page-link" href="javascript:updatePage(${first_page})">${first_page}</a></li>` +
        `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">${first_page + 1}</a></li>` +
        `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">Next</a></li>`;
    } else {
      return `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page - 1})">Previous</a></li>` +
        `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page - 1})">${first_page - 1}</a></li>` +
        `<li class="page-item active"><a class="page-link" href="javascript:updatePage(${first_page})">${first_page}</a></li>` +
        `<li class="page-item disabled"><a class="page-link">Next</a></li>`;
    }
  } else if (totalPages >= 3) {
    return `<li class="page-item disabled"><a class="page-link">Previous</a></li>` +
      `<li class="page-item active"><a class="page-link" href="javascript:updatePage(${first_page})">${first_page}</a></li>` +
      `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">${first_page + 1}</a></li>` +
      `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 2})">${first_page + 2}</a></li>` +
      `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">Next</a></li>`;
  } else {
    return `<li class="page-item disabled"><a class="page-link">Previous</a></li>` +
      `<li class="page-item active"><a class="page-link" href="javascript:updatePage(${first_page})">${first_page}</a></li>` +
      `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">${first_page + 1}</a></li>` +
      `<li class="page-item"><a class="page-link" href="javascript:updatePage(${first_page + 1})">Next</a></li>`;
  }
}

function addPageButton() {
  document.getElementById('page_buttons').innerHTML = getPagesBtns();
}

function loadPets() {
  let url = APIURL + `/pets?owner_id=${Guser.uid}&page=${curr_page}&limit=${limit}`;
  sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
    let pets = JSON.parse(res.data);
    Gpets = pets;
    for (let index = 0; index < pets.length; index++) {
      petToHtml(pets[index], index);
    }
    addPlusButtonHTML();
    addPageButton();
    return pets;
  }, (error) => {}, token);
}

function addNewPet(pet) {
  let url = APIURL + '/pets/';
  sendHTTPRequest(url, pet, HTTTPMethods.post, (datos) => {
    alert("Mascota registrado.");
    location.reload();
  }, (error) => {
    console.log(error);
    alert(`No se pudo registrar, favor de revisar los campos. ${error}`);
  }, TOKEN);
}

document.addEventListener('DOMContentLoaded', async () => {
  //agrega tu codigo de asignación de eventos...
  await addUserData();

  $('#modelAddMascota').on('show.bs.modal', function (event) {
    // console.log(event.relatedTarget);
    //agrega tu codigo...
  });

  $('#modelAddMascota').on('keyup', function (event) {
    let addNombreValid = document.getElementById("addPetNombre").checkValidity();
    let addDecriptionValid = document.getElementById("addPetDescription").checkValidity();
    let addImageValid = document.getElementById("addPetImage").checkValidity();
    document.getElementById("addButton").disabled = !(
      addNombreValid && addDecriptionValid && addImageValid
    );
  });

  //al presionar el boton 
  $('#addButton').on('click', function (event) {
    let newPet = JSON.stringify({
      type: document.getElementById('petType').value,
      nombre: document.getElementById('addPetNombre').value,
      owner_id: Guser.uid,
      fecha: document.getElementById('addPetBirthday').value,
      sexo: document.getElementById('addPetSexo').value,
      image: document.getElementById('addPetImage').value,
      description: document.getElementById('addPetDescription').value
    });
    console.log(newPet);
    addNewPet(newPet);
  });

  $('#deleteFormModal').on('show.bs.modal', function (event) {
    // console.log(event.relatedTarget);
    //agrega el códgio necesario...
    let index = event.relatedTarget.getAttribute('data-index');
    $('#deleteUserBtn').attr("data-index", index);
  });

  $('#deleteUserBtn').on('click', function (event) {
    var index = $('#deleteUserBtn').data('index');
    let url = APIURL + "/pets/" + Gpets[index].uid;
    sendHTTPRequest(url, '', HTTTPMethods.delete, (res) => {
      // console.log(res);
      location.reload();
    }, (error) => {
      console.log(error);
    }, TOKEN)
  });
});