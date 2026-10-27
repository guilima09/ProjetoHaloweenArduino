// Middleware de log: intercepta todas as requisições que chegam na API
// e exibe informações úteis no terminal (método HTTP, rota e horário).

function logger(req, res, next) {
  const agora = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${agora}] [HTTP] ${req.method} ${req.url}`);
  
  // IMPORTANTE EM APIS: O que a função next() faz?
  // Sem ela, a requisição fica "presa" aqui e nunca chega na rota!
  next();
}

module.exports = logger;

