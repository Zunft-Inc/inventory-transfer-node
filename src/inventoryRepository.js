async function getStockLevels(db, sku) {
  const { rows } = await db.query(
    'SELECT location, quantity FROM inventory WHERE sku = $1 ORDER BY location',
    [sku],
  );
  const levels = {};
  for (const row of rows) {
    levels[row.location] = row.quantity;
  }
  return levels;
}

async function getQuantity(db, sku, location) {
  const { rows } = await db.query(
    'SELECT quantity FROM inventory WHERE sku = $1 AND location = $2',
    [sku, location],
  );
  return rows[0].quantity;
}

async function setQuantity(db, sku, location, quantity) {
  await db.query(
    'UPDATE inventory SET quantity = $1, updated_at = now() WHERE sku = $2 AND location = $3',
    [quantity, sku, location],
  );
}

async function moveStock(db, sku, fromLocation, toLocation, quantity) {
  const source = await getQuantity(db, sku, fromLocation);
  const target = await getQuantity(db, sku, toLocation);
  await setQuantity(db, sku, fromLocation, source - quantity);
  await setQuantity(db, sku, toLocation, target + quantity);
}

module.exports = { getStockLevels, getQuantity, setQuantity, moveStock };
