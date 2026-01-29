const express = require('express');
const modelController = require('../controllers/modelController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Define routes and link them to controller functions
router.post('/predict_eng', modelController.getModelPredictions);
router.get('/get_predictions/:id', modelController.getReturnModelPredictions);
module.exports = router;