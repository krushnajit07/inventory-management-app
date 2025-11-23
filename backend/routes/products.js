const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productsController');


router.get('/', ctrl.getAll);
router.get('/search', ctrl.getSearch);


router.post('/import', upload.single('csvFile'), ctrl.importCSV);
router.get('/export', ctrl.exportCSV);

router.get('/:id/history', ctrl.history);

router.get('/:id', ctrl.getById);
router.post('/', upload.single('image'), ctrl.create);
router.put('/:id', upload.single('image'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
