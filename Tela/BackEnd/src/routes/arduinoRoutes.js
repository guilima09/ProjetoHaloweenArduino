// Router: Mapeia as URLs e Métodos HTTP para cada método do Controller.
// O arquivo de rotas NÃO deve conter regras de negócio, apenas direcionamento!

const { Router } = require('express');
const arduinoController = require('../controllers/arduinoController');

const router = Router();

// GET /api/status -> Consulta estado atual
router.get('/status', (req, res) => arduinoController.obterStatus(req, res));

// POST /api/comando -> Envia comando geral (ex: { "comando": "PARAR" })
router.post('/comando', (req, res) => arduinoController.enviarComando(req, res));

// POST /api/reviver -> Rota semântica específica para reviver
router.post('/reviver', (req, res) => arduinoController.reviver(req, res));

module.exports = router;

