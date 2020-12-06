'use strict';
const express = require('express');
const PetsController = require('../controllers/petController');
const petsCtrl = new PetsController();
const router = express();

router.post('/', async (req, res) => {
    let b = req.body;
    if (b.type && b.nombre && b.type && b.owner_id && b.fecha) {
        let p = await petsCtrl.getUniquePet(b.nombre, b.type, b.owner_id);
        console.log(p.bookmark);
        if (p.bookmark != 'nil') {
            res.status(400).send('pet already exists');
        } else {
            petsCtrl.insertPet(b, (newPet) => {
                res.status(201).send(newPet);
            })
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

router.get('/', async (req, res) => {
    let petsCtrl = new PetsController();
    let pets = await petsCtrl.getList();
    // console.log(req.query);
    if (req.query.owner_id) {
        pets = pets.filter(pet => (pet.owner_id == req.query.owner_id));
    } else if (req.query.not_owner_id) {
        pets = pets.filter(pet => (pet.owner_id != req.query.not_owner_id));
    }
    if (req.query.name) {
        let nom = (req.query.name) ? req.query.name : '';
        pets = pets.filter((ele, index, arr) => {
            let isMatch = true;
            if (nom) {
                isMatch &= ele.nombre.toUpperCase().includes(nom.toUpperCase())
            }
            return isMatch;
        });
    }
    if (req.query.page) {
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 5;
        let page = parseInt(req.query.page) * limit - limit;
        pets = pets.slice(page, page + limit);
    } else {
        pets = pets.slice(0, 0 + 5);
    }
    if (req.query.date) {
        pets = pets.filter(ele => new Date(ele.fecha).getTime() === new Date(req.query.date).getTime());
    }

    pets = pets.map((val, index, arra) => {
        return {
            "nombre": val.nombre,
            "type": val.type,
            "owner_id": val.owner_id,
            "image": val.image,
            "sexo": val.sexo,
            "fecha": val.fecha,
            "uid": val._id,
            "description": val.description,
            "rev": val._rev
        }
    });
    res.send(pets);
});

router.put('/:id', async (req, res) => {
    let b = req.body;
    if (req.params.id && (b.nombre || b.image || b.fecha || b.description)) {
        let p = await petsCtrl.getPet(req.params.id);
        if (p) {
            b._id = p.uid;
            b._rev = p.rev;
            Object.assign(p, b);
            console.log(b);
            let addedEntry = await petsCtrl.updatePet(p);
            res.status(200).send(addedEntry);
        } else {
            res.status(404).send('pet does not exist');
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

router.delete('/:id', async (req, res) => {
    console.log(req.params);
    if (req.params.id) {
        let p = await petsCtrl.getPet(req.params.id);
        if (p) {
            let deleted = await petsCtrl.deletePet(p);
            res.status(200).send({
                "deleted": deleted
            });
        } else {
            res.status(404).send('pet does not exist');
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

module.exports = router;