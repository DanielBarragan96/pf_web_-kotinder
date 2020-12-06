const HTTTPMethods = {
    "put": "PUT",
    "post": "POST",
    "get": "GET",
    "delete": "DELETE"
}
const APIURL = window.location.protocol + '//' + window.location.host + '/api';
let TOKEN = getTokenValue('token');

let Guser;
let Gfavs;
let Gpets = [];

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

function favToHtml(pet, active) {
    console.log(pet);
    document.getElementById('fav_carousel').innerHTML += `
        <div class="carousel-item ${(active)? 'active' : ''}">
            <div class="card">
                <img
                    class="imagen_carta"
                    src="${pet.image}"
                />
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
        </div>
    `;
}

async function loadFavs() {
    let url = APIURL + `/favs/?id_user=${Guser.uid}`;
    sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
        let favs = JSON.parse(res.data);
        Gfavs = favs;
        for (let fav of favs) {
            url = APIURL + `/pets/?id_pet=${fav.id_pet}`
            sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
                let pet = JSON.parse(res.data);
                Gpets.push(pet[0]);
                favToHtml(pet[0], Gpets.length < 2);
                return favs;
            }, (error) => {}, token);
        }
        return favs;
    }, (error) => {}, token);

}

async function addUserData() {
    let url = APIURL + `/users/getby/token`;
    sendHTTPRequest(url, "", HTTTPMethods.get, (res) => {
        let user = JSON.parse(res.data);
        Guser = user;
        loadFavs();
        return user;
    }, (error) => {}, token);
}

document.addEventListener('DOMContentLoaded', async () => {
    await addUserData();
});

var activities = document.getElementById('selectFavPets');
activities.addEventListener("change", function () {
    let type = activities.value;
    if (type != '0') {
        document.getElementById('fav_carousel').innerHTML = '';
        let counter = 0;
        for (let pet of Gpets) {
            if (pet.type == type)
                favToHtml(pet, (counter++ < 1));
        }
    } else {
        document.getElementById('fav_carousel').innerHTML = '';
        let counter = 0;
        for (let pet of Gpets) {
            favToHtml(pet, (counter++ < 1));
        }
    }
});