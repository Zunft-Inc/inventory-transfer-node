// Typical response time of the product catalogue service.
const CATALOGUE_LATENCY_MS = 10;

/**
 * Checks a transfer against the business rules.
 * Returns a message that explains why the transfer is not allowed,
 * or null if it may go ahead.
 */
async function checkTransferAllowed({ sku, fromLocation, toLocation, quantity }) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return 'quantity must be a whole number greater than zero';
  }
  if (fromLocation === toLocation) {
    return 'source and target location must be different';
  }
  if (!(await catalogueAllowsLocation(sku, toLocation))) {
    return `${sku} cannot be stored at ${toLocation}`;
  }
  return null;
}

// In production this calls the product catalogue service, which knows the
// storage requirements of every SKU (cooling, hazardous goods, size).
// The local client is a stub: it allows everything and answers with the
// catalogue's usual latency.
async function catalogueAllowsLocation(_sku, _location) {
  await new Promise((resolve) => setTimeout(resolve, CATALOGUE_LATENCY_MS));
  return true;
}

module.exports = { checkTransferAllowed };
