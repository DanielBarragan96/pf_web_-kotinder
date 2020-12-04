const CLOUDANT_CREDS = require('../localdev-config.json');
const CloudantSDK = require('@cloudant/cloudant');
let username = CLOUDANT_CREDS.cloudant_username;
let password = CLOUDANT_CREDS.cloudant_password;
let url = CLOUDANT_CREDS.url;
const cloudant = new CloudantSDK({
    url: url
});
const PETS_DB_CLOUDANT = cloudant.db.use('pets');

class PetsController {

    insertPet(pet, cbOk, cbError) {
        PETS_DB_CLOUDANT.insert(pet).then((addedEntry) => {
            console.log(addedEntry);
            if (addedEntry.ok) {
                pet.rev = addedEntry.rev;
                pet.uid = addedEntry.id;
                cbOk(pet);
            } else {
                cbOk();
            }
        }).catch(error => {
            cbError(error);
        });
    }

    async updatePet(pet) {
        let updatep = {
            _id: pet._id,
            _rev: pet._rev,
            type: pet.type,
            nombre: pet.nombre,
            owner_id: pet.owner_id,
            fecha: pet.fecha,
            sexo: pet.sexo,
            image: pet.image
        }
        let addedEntry = await PETS_DB_CLOUDANT.insert(updatep);
        console.log(addedEntry);
        if (addedEntry.ok) {
            pet._rev = addedEntry.rev;
            pet._id = addedEntry.id;
            return pet;
        } else {
            return false;
        }
    }
    async deletePet(pet) {
        console.log('deleting pet');
        console.log(pet);
        let body = await PETS_DB_CLOUDANT.destroy(pet._id, pet._rev);
        console.log(body);
        if (body.ok) {
            return body;
        } else {
            return false;
        }
    }
    async getList() {
        let pets = new Array();
        let entries = await PETS_DB_CLOUDANT.list({
            include_docs: true
        });
        for (let entry of entries.rows) {
            pets.push(entry.doc);
        }
        return pets;
    }

    async getPet(id) {
        let docs = await PETS_DB_CLOUDANT.get(id);
        return docs;
    }

    async getOwnerPets(id) {
        const q = {
            selector: {
                owner_id: {
                    "$eq": id
                }
            }
        };
        let docs = await USERS_DB_CLOUDANT.find(q);
        return docs;
    }

    async getUniquePet(nombre, type, owner_id) {
        const q = {
            selector: {
                nombre: {
                    "$eq": nombre
                },
                type: {
                    "$eq": type
                },
                owner_id: {
                    "$eq": owner_id
                }
            }
        };
        let docs = await PETS_DB_CLOUDANT.find(q);
        return docs;
    }

}
module.exports = PetsController;