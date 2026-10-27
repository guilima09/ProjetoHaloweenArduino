// Agrupador central de rotas.
// Conforme sua API crescer (ex: rotas de sensores, usuários, histórico),
// você junta todas as sub-rotas aqui.

const { Router } = require('express');
const arduinoRoutes = require('./arduinoRoutes');

const router = Router();

// Todas as rotas de arduinoRoutes ficarão sob /api
router.use('/', arduinoRoutes);

module.exports = router;

