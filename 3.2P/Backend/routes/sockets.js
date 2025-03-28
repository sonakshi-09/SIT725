const express = require('express');
const router = express.Router();
const Socket = require('../models/Socket');

// Get all sockets
router.get('/', async (req, res) => {
    const sockets = await Socket.find();
    res.json(sockets);
});

// Get specific socket by ID
router.get('/:id', async (req, res) => {
    const socket = await Socket.findById(req.params.id);
    res.json(socket);
});

module.exports = router;
