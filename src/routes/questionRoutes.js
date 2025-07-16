const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionController');

router.post('/', controller.createQuestion);
router.get('/by-type/:testTypeId', controller.getQuestionsByTestType);
router.put('/:id', controller.updateQuestion);
router.delete('/:id', controller.deleteQuestion);

module.exports = router;
