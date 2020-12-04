const CLOUDANT_CREDS = require('../localdev-config.json');
const CloudantSDK = require('@cloudant/cloudant');
let username = CLOUDANT_CREDS.cloudant_username;
let password = CLOUDANT_CREDS.cloudant_password;
let url = CLOUDANT_CREDS.url;
const cloudant = new CloudantSDK({
    url: url
});
const FAVS_DB_CLOUDANT = cloudant.db.use('favs');

class FavsController {

    insertFav(fav, cbOk, cbError) {
        FAVS_DB_CLOUDANT.insert(fav).then((addedEntry) => {
            console.log(addedEntry);
            if (addedEntry.ok) {
                fav.rev = addedEntry.rev;
                fav.uid = addedEntry.id;
                cbOk(fav);
            } else {
                cbOk();
            }
        }).catch(error => {
            cbError(error);
        });
    }

    async getList() {
        let favs = new Array();
        let entries = await FAVS_DB_CLOUDANT.list({
            include_docs: true
        });
        for (let entry of entries.rows) {
            favs.push(entry.doc);
        }
        return favs;
    }

    async getUserFavs(id_user, id_pet) {
        const q = {
            selector: {
                id_user: {
                    "$eq": id_user
                },
                id_pet: {
                    "$eq": id_pet
                }
            }
        };
        let docs = await FAVS_DB_CLOUDANT.find(q);
        return docs;
    }

    async deleteFav(fav) {
        console.log('deleting pet');
        let body = await FAVS_DB_CLOUDANT.destroy(fav._id, fav._rev);
        console.log(body);
        if (body.ok) {
            return body;
        } else {
            return false;
        }
    }

}
module.exports = FavsController;