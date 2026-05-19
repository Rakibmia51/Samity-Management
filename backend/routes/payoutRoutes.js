const express = require('express');
const { distributeMemberProfits, getDistributeMemberProfits } = require('../controllers/payoutController')

const router = express.Router();

router.post('/distribute', distributeMemberProfits);
router.get('/', getDistributeMemberProfits);

module.exports = router;
