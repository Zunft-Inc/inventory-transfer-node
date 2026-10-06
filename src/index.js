const express = require('express');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, _next) => {
  console.error(`${req.method} ${req.path} failed:`, err.message);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'internal error' });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`inventory-transfer-service listening on port ${port}`);
});
