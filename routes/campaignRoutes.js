const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/', campaignController.getAllCampaigns);
router.get('/new', (req, res) => res.render('newCampaign'));
router.post('/create', campaignController.createCampaign);

module.exports = router;
