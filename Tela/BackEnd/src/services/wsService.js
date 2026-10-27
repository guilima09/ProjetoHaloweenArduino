// Service: Responsável pela comunicação bidirecional em tempo real (WebSocket).
// Enquanto APIs REST tradicionais usam o modelo Requisição/Resposta (HTTP),
// o WebSocket mantém o canal aberto para enviar dados instantaneamente.

const { WebSocketServer } = require('ws');

class WsService {
  constructor() {
    this.wss = null;
  }

  iniciar(servidorHttp) {
    this.wss = new WebSocketServer({ server: servidorHttp });

    this.wss.on('connection', (ws) => {
      console.log('[WebSocket] Novo cliente conectado!');

      // DICA PEDAGÓGICA:
      // O que um novo cliente precisa receber logo no primeiro segundo em que conecta?
      // (Pense no estado atual do boneco e no status do Arduino)

      ws.on('message', (dado) => {
        // Tratar mensagens recebidas do cliente se necessário
      });
    });
  }

  // Envia uma mensagem para TODOS os navegadores conectados
  broadcast(objeto) {
    if (!this.wss) return;
    const mensagem = JSON.stringify(objeto);

    this.wss.clients.forEach((cliente) => {
      // 1 significa WebSocket.OPEN
      if (cliente.readyState === 1) {
        cliente.send(mensagem);
      }
    });
  }
}

module.exports = new WsService();

