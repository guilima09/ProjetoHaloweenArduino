// Middleware de tratamento global de erros.
// Em Express, qualquer middleware com 4 parâmetros (err, req, res, next)
// é tratado como um capturador de erros.

function errorHandler(err, req, res, next) {
  console.error('[ERRO INTERNO]:', err.stack || err.message);

  // Status code 500 = Internal Server Error
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor'
  });
}

module.exports = errorHandler;

