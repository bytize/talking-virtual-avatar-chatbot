const express = require('express');
const router  = express.Router();
const main = require('../controllers/main')();
const api = require('../controllers/api')();

router.get('/', main.index);

router.post('/api/chat-text', api.chatWithText);

router.get('/api/audio', api.getAudio);
router.post('/api/speech-marks', api.getSpeechMarks);

router.post('/api/login', api.login);
router.post('/api/logout', api.logout);

module.exports = router;