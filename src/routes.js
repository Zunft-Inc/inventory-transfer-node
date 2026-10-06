const express = require('express');
const { pool, poolStats } = require('./db');
const inventory = require('./inventoryRepository');
const { checkTransferAllowed } = require('./transferRules');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'UP', pool: poolStats() });
});

router.get('/inventory/:sku', async (req, res) => {
  const { sku } = req.params;
  const levels = await inventory.getStockLevels(pool, sku);

  if (Object.keys(levels).length === 0) {
    return res.status(404).json({ error: `unknown SKU ${sku}` });
  }
  res.json({
    sku,
    locations: Object.entries(levels).map(([location, quantity]) => ({ location, quantity })),
    total: Object.values(levels).reduce((sum, quantity) => sum + quantity, 0),
  });
});

router.post('/transfer', async (req, res) => {
  const { sku, fromLocation, toLocation, quantity } = req.body ?? {};
  const client = await pool.connect();

  const levels = await inventory.getStockLevels(client, sku);
  if (Object.keys(levels).length === 0) {
    return res.status(404).json({ error: `unknown SKU ${sku}` });
  }
  for (const location of [fromLocation, toLocation]) {
    if (!(location in levels)) {
      return res.status(404).json({ error: `${sku} is not stocked at ${location}` });
    }
  }

  const problem = await checkTransferAllowed({ sku, fromLocation, toLocation, quantity });
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  const available = levels[fromLocation];
  if (available < quantity) {
    return res.status(400).json({
      error: `insufficient stock at ${fromLocation}: available ${available}, requested ${quantity}`,
    });
  }

  await inventory.moveStock(client, sku, fromLocation, toLocation, quantity);
  client.release();

  res.json({ status: 'COMPLETED', sku, fromLocation, toLocation, quantity });
});

module.exports = router;
