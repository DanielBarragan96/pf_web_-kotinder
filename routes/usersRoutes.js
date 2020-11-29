'use strict';
const {
    log
} = require('console');
const express = require('express');
const UsersController = require('../controllers/usersController');
const usersCtrl = new UsersController();
const router = express();

router.post('/', async (req, res) => {
    let b = req.body;
    if (b.nombre && b.apellidos && b.email && b.sexo && b.fecha) {
        let u = await usersCtrl.getUniqueUser(b.nombre, b.apellidos, b.email);
        console.log(u);
        if (u) {
            res.status(400).send('user already exists');
        } else {
            usersCtrl.insertUser(b, (newUser) => {
                res.status(201).send(newUser);
            })
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

router.get('/', async (req, res) => {
    let userCtrl = new UsersController();
    let users = await userCtrl.getList();
    if (req.query.name || req.query.lastname) {
        let nom = (req.query.name) ? req.query.name : '';
        let ap = (req.query.lastname) ? req.query.lastname : '';
        users = users.filter((ele, index, arr) => {
            let isMatch = true;
            if (nom) {
                isMatch &= ele.nombre.toUpperCase().includes(nom.toUpperCase())
            }
            if (ap) {
                isMatch &= ele.apellidos.toUpperCase().includes(ap.toUpperCase())
            }
            return isMatch;
        });
    }
    if (req.query.page) {
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 5;
        let page = parseInt(req.query.page) * limit - limit;
        users = users.slice(page, page + limit);
    } else {
        users = users.slice(0, 0 + 5);
    }
    if (req.query.date) {
        users = users.filter(ele => new Date(ele.fecha).getTime() === new Date(req.query.date).getTime());
    }

    users = users.map((val, index, arra) => {
        return {
            "nombre": val.nombre,
            "apellidos": val.apellidos,
            "email": val.email,
            "uid": val._id
        }
    });
    res.send(users);
});

router.get('/getby/token', async (req, res) => {
    let userCtrl = new UsersController();

    let token = req.get('x-auth-user');
    if (token) {
        let user = await userCtrl.getUserByToken(token);
        if (user && user !== undefined) {
            res.send(user);
        } else {
            res.set('Content-Type', 'application/json');
            res.status(404).send('user does not exist');
        }
    } else {
        res.status(400).send('missing params');
    }
});

router.get('/:email', async (req, res) => {
    let userCtrl = new UsersController();

    if (req.params.email) {
        let user = await userCtrl.getUserByEmail(req.params.email);
        // users = users.find(ele => ele.email === req.params.email);
        if (user && user !== undefined) {
            res.send(user);
        } else {
            res.set('Content-Type', 'application/json');
            res.status(404).send('user does not exist');
        }
    } else {
        res.status(400).send('missing params');
    }
});
router.put('/:email', async (req, res) => {
    let b = req.body;
    if (req.params.email && (b.nombre || b.apellidos || b.password || b.fecha)) {
        let u = await usersCtrl.getUserByEmail(b.email);
        if (u) {
            b._id = u.uid;
            b._rev = u.rev;
            Object.assign(u, b);
            console.log(b);
            let addedEntry = await usersCtrl.updateUser(u);
            res.status(200).send(addedEntry);
        } else {
            res.status(404).send('user does not exist');
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

router.delete('/:email', async (req, res) => {
    if (req.params.email) {
        let u = await usersCtrl.getUserByEmail(req.params.email);
        if (u) {
            let deleted = await usersCtrl.deleteUser(u);
            res.status(200).send({
                "deleted": deleted
            });
        } else {
            res.status(404).send('user does not exist');
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

module.exports = router;