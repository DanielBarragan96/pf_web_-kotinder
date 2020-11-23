const fs = require('fs');
// const USERS_DB = require('../data/users.json');
const CLOUDANT_CREDS = require('../localdev-config.json');
const CloudantSDK = require('@cloudant/cloudant');
let username = CLOUDANT_CREDS.cloudant_username;
let password = CLOUDANT_CREDS.cloudant_password;
let url = CLOUDANT_CREDS.url;
const cloudant = new CloudantSDK({
    url: url
});
const USERS_DB_CLOUDANT = cloudant.db.use('users');
let CURRENT_ID = 0;

// let uids = USERS_DB.map((obj) => {
//     return obj.uid
// });
// CURRENT_ID = Math.max(...uids) + 1;

console.log(`Current id: ${CURRENT_ID}`);
// console.table(USERS_DB);
class UsersController {

    generateId() {
        let id = CURRENT_ID;
        CURRENT_ID++;
        fs
        return id;
    }
    insertUser(user, cbOk, cbError) {
        // user.uid = this.generateId();
        // USERS_DB.push(user);
        // return user;
        // user.password = bcrypt.hashSync(user.password,5);
        USERS_DB_CLOUDANT.insert(user).then((addedEntry) => {
            console.log(addedEntry);
            if (addedEntry.ok) {
                user.rev = addedEntry.rev;
                user.uid = addedEntry.id;
                cbOk(user);
            } else {
                cbOk();
            }
        }).catch(error => {
            cbError(error);
        });
    }
    async updateUser(user) {
        // let index = USERS_DB.findIndex(element => element.uid === user.uid);
        // if(index>-1){
        //     USERS_DB[index] = Object.assign(USERS_DB[index],user);
        //     return user;
        // }else{
        //     return undefined;
        // }
        let updatee = {
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            password: user.password,
            fecha: user.fecha,
            sexo: user.sexo,
            image: user.image,
            _id: user._id,
            _rev: user._rev
        }
        if (user.token) {
            updatee.token = user.token;
        }
        console.log(updatee);
        let addedEntry = await USERS_DB_CLOUDANT.insert(updatee);
        console.log(addedEntry);
        if (addedEntry.ok) {
            user._rev = addedEntry.rev;
            user._id = addedEntry.id;
            return user;
        } else {
            return false;
        }
    }
    async deleteUser(user) {
        // let index = USERS_DB.findIndex(element => element.uid === user.uid);
        // if(index>-1){
        //     USERS_DB.splice(index,1);
        //     return true;
        // }else{
        //     return false;
        // }
        console.log('deleting user');
        let body = await USERS_DB_CLOUDANT.destroy(user.uid, user.rev);
        console.log(body);
        if (body.ok) {
            return body;
        } else {
            return false;
        }
    }
    // getList(cbOk){
    //     // return USERS_DB;
    //     let users = new Array();
    //     USERS_DB_CLOUDANT.list({include_docs:true}).then(entries =>{
    //         console.log(entries);
    //         for(let entry of entries.rows){
    //             console.log(entry.doc);
    //             users.push(entry.doc);
    //         }
    //         console.table(users);
    //         cbOk(users);
    //     });
    // } 
    async getList() {
        // return USERS_DB;
        let users = new Array();
        let entries = await USERS_DB_CLOUDANT.list({
            include_docs: true
        });
        for (let entry of entries.rows) {
            users.push(entry.doc);
        }
        return users;
    }
    async getUserByCredentials(email, password, cbOk) {
        // let users = USERS_DB.filter((item,index,arr)=>{
        //     if( item.password.toLowerCase()=== password.toLowerCase() &&
        //         item.email.toLowerCase() === email.toLowerCase()){
        //         return true;
        //     }
        //     return false;
        // });
        // return users[0];
        const q = {
            selector: {
                password: {
                    "$eq": password
                },
                email: {
                    "$eq": email
                }
            }
        };
        let docs = await USERS_DB_CLOUDANT.find(q);
        // console.log(docs);
        // console.log(docs.docs.length);
        if (docs.docs.length > 0) {
            // cbOk(true);
            return docs.docs[0];
        } else {
            // cbOk(false);
            return;
        }
    }
    async getUniqueUser(name, lastname, email) {
        // let users = USERS_DB.filter((item,index,arr)=>{
        //     if(item.nombre.toLowerCase()=== name.toLowerCase() &&
        //         item.apellidos.toLowerCase()=== lastname.toLowerCase() &&
        //         item.email.toLowerCase() === email.toLowerCase()){
        //         return true;
        //     }
        //     return false;
        // });
        // return users[0];
        console.log(`$getting unique user ${name} ${lastname} ${email}`);
        const q = {
            selector: {
                nombre: {
                    "$eq": name
                },
                apellidos: {
                    "$eq": lastname
                },
                email: {
                    "$eq": email
                }
            }
        };
        let docs = await USERS_DB_CLOUDANT.find(q);
        console.log(docs);
        if (docs.docs.length > 0) {
            let user = {
                nombre: docs.docs[0].nombre,
                apellidos: docs.docs[0].apellidos,
                email: docs.docs[0].email,
                password: docs.docs[0].password,
                fecha: docs.docs[0].fecha,
                sexo: docs.docs[0].sexo,
                image: docs.docs[0].image,
                uid: docs.docs[0]._id,
                rev: docs.docs[0]._rev
            }
            return user;
        } else {
            return false;
        }
    }
    async getUser(id) {
        // let user = USERS_DB.find(ele=>ele.uid ===id);
        // return user;
        let docs = await USERS_DB_CLOUDANT.get(id);
        return docs;
    }
    async getUserByEmail(email) {
        // let user = USERS_DB.find(ele=>ele.email ===email);
        // return user;
        const q = {
            selector: {
                email: {
                    "$eq": email
                }
            }
        };
        let docs = await USERS_DB_CLOUDANT.find(q);
        // console.log(docs);
        if (docs.docs.length > 0) {
            let user = {
                nombre: docs.docs[0].nombre,
                apellidos: docs.docs[0].apellidos,
                email: docs.docs[0].email,
                password: docs.docs[0].password,
                fecha: docs.docs[0].fecha,
                sexo: docs.docs[0].sexo,
                image: docs.docs[0].image,
                uid: docs.docs[0]._id,
                rev: docs.docs[0]._rev,
                token: docs.docs[0].token
            }

            if (docs.docs[0].token) {
                user.token = docs.docs[0].token;
            }
            return user;
        } else {
            return;
        }
    }
}
module.exports = UsersController;