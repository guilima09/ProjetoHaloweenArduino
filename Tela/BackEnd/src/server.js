// Ponto de entrada (Entrypoint) do servidor.
// Aqui unimos o servidor HTTP (Express), o WebSocket e a conexão Serial.

const http = require('http');
const app = require('./app');
const env = require('./config/env');
const wsService = require('./services/wsService');
const serialService = require('./services/serialService');
const stateService = require('./services/stateService');

const server = http.createServer(app);

// 1. Inicializa o serviço de WebSocket integrado ao servidor HTTP
wsService.iniciar(server);

// 2. O que fazer quando uma linha chega do Arduino via Serial?
serialService.definirCallback((linha) => {
  // DESAFIO PEDAGÓGICO:
  // Veja o protocolo de mensagens:
  // - Se começar com "DIST:<cm>", o que devemos atualizar no stateService e avisar no wsService?
  // - Se começar com "ESTADO:MORTO" ou "ESTADO:VIVO", o que muda?
  // - Se começar com "EVENTO:<texto>", o que fazemos?

  if (linha.startsWith('DIST:')) {
    const cm = parseFloat(linha.slice(5));
    if (!isNaN(cm)) {
      stateService.setDistancia(cm);
      wsService.broadcast({ tipo: 'distancia', cm });
    }
  } else if (linha.startsWith('ESTADO:')) {
    const estado = linha.slice(7).trim().toUpperCase();
    const vivo = estado === 'VIVO';
    stateService.setVivo(vivo);
    wsService.broadcast({ tipo: 'estado', vivo });
  } else if (linha.startsWith('EVENTO:')) {
    wsService.broadcast({ tipo: 'evento', texto: linha.slice(7) });
  }
});

// 3. Inicia a conexão serial
serialService.iniciar();

// 4. Coloca o servidor para escutar na porta definida
server.listen(env.PORT, () => {
  console.log(`===============================================`);
  console.log(`🎃 Servidor e API rodando em http://localhost:${env.PORT}`);
  console.log(`📡 Endpoints REST disponíveis sob /api/...`);
  console.log(`===============================================`);
});

