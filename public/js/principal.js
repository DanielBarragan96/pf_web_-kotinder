const HTTTPMethods = {
    "put": "PUT",
    "post": "POST",
    "get": "GET",
    "delete": "DELETE"
}
const APIURL = window.location.protocol + '//' + window.location.host + '/api';
let TOKEN = getTokenValue('token');

let Guser;
let GOtherpets;
let currIndex = 0;
let Gfavs;

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

function petToHtml(pet) {
    document.getElementById("current_pet").innerHTML = `
    <!-- Carrusel mascotas -->
    <div class="carrusel_padre">
      <div id="carouselId" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
          <li data-target="#carouselId" data-slide-to="0" class="active"></li>
        </ol>
        <div class="carousel-inner" role="listbox">
          <div class="carousel-item active">
            <img class="imagen_carta" src="${pet.image}" />
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
    `
}

function loadOtherPets() {
    let url = APIURL + `/pets?not_owner_id=${Guser.uid}`;
    sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
        let pets = JSON.parse(res.data);
        GOtherpets = pets;
        petToHtml(GOtherpets[currIndex]);
        loadFavs();
        return pets;
    }, (error) => {}, token);
}

async function loadFavs() {
    let url = APIURL + `/favs/?id_user=${Guser.uid}`;
    sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
        let favs = JSON.parse(res.data);
        Gfavs = favs;
        return favs;
    }, (error) => {}, token);

}

async function addUserData() {
    let url = APIURL + `/users/getby/token`;
    await sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
        let user = JSON.parse(res.data);
        Guser = user;
        loadOtherPets();
        return user;
    }, (error) => {}, token);
}

document.addEventListener('DOMContentLoaded', async () => {
    //agrega tu codigo de asignación de eventos...
    await addUserData();

    //al presionar el boton 
    $('#btn_dislike').on('click', function (event) {
        currIndex = (currIndex + 1 >= GOtherpets.length) ? 0 : ++currIndex;
        petToHtml(GOtherpets[currIndex]);
    });
});