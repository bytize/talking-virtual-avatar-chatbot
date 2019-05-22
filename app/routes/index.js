const express = require('express');
const router  = express.Router();
const main = require('../controllers/main')();

router.get('/', main.index);
router.get('/animate', main.animate);
router.get('/video/:ls', main.video);

module.exports = router;