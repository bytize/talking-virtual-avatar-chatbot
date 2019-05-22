const express = require('express');
const router  = express.Router();
const api = require('../controllers/api')();

router.post('/chat-text', api.chatWithText);
router.post('/chat-audio', api.chatWithAudio);

router.get('/audio', api.getAudio);
router.post('/speech-marks', api.getSpeechMarks);
router.get('/bot-definition', api.getBotDefinition);

router.post('/login', api.login);
router.post('/logout', api.logout);


router.get('/getCars',api.getCars);
router.get('/getBrands',api.getBrands);
router.get('/getCarsByBrand/:id',api.getCarsByBrand);
router.get('/getCarsByBrandBodyType/:brandId/:bodyType',api.getCarsByBrandBodyType);
router.get('/getCarsByBodyType/:id',api.getCarsByBodyType)
router.get('/getCarById/:id',api.getCarById);
router.get('/getCarByName/:name',api.getCarByName);
router.get('/getBrandByName/:name',api.getBrandByName);
router.get('/getBodyTypes',api.getBodyTypes);
router.get('/getBodyTypeById/:id',api.getBodyTypeById);
router.get('/getBodyTypeByName/:name',api.getBodyTypeByName);

module.exports = router;