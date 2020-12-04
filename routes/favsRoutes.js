'use strict';
const express = require('express');
const FavsController = require('../controllers/favsController');
const favsCtrl = new FavsController();
const router = express();
let favsController = new FavsController();

router.get('/', async (req, res) => {
    let favs = await favsController.getList();

    if (req.query.id_user) {
        favs = favs.filter(fav => (fav.id_user == req.query.id_user));
    }
    if (req.query.id_pet) {
        favs = favs.filter(fav => (fav.id_pet == req.query.id_pet));
    }
    if (req.query.page) {
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 5;
        let page = parseInt(req.query.page) * limit - limit;
        favs = favs.slice(page, page + limit);
    }

    res.send(favs);
});

router.post('/', async (req, res) => {
    let b = req.body;
    if (b.id_user && b.id_pet) {
        let f = await favsController.getUserFavs(b.id_user, b.id_pet);
        if (f.bookmark != 'nil') {
            res.status(400).send('fav already exists');
        } else {
            favsController.insertFav(b, (newFav) => {
                res.status(201).send(newFav);
            })
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

router.delete('/', async (req, res) => {
    let b = req.body;
    if (b.id_user && b.id_pet) {
        let f = await favsController.getUserFavs(b.id_user, b.id_pet);
        if (f) {
            let deleted = await favsController.deleteFav(f);
            res.status(200).send({
                "deleted": deleted
            });
        } else {
            res.status(404).send('fav does not exist');
        }
    } else {
        res.status(400).send('missing arguments');
    }
});

module.exports = router;