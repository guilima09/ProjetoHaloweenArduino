// Service: Responsável por gerenciar o estado da aplicação.
// Manter o estado isolado aqui permite que tanto as rotas HTTP quanto o WebSocket
// leiam e atualizem os dados no mesmo lugar (única fonte de verdade).

class StateService {
  constructor() {
    this.vivo = true;
    this.distancia = 0;
    this.arduinoConectado = false;
    this.portaSerial = null;
  }

  getEstadoCompleto() {
    return {
      vivo: this.vivo,
      distancia: this.distancia,
      arduinoConectado: this.arduinoConectado,
      portaSerial: this.portaSerial
    };
  }

  setVivo(valor) {
    this.vivo = Boolean(valor);
  }

  setDistancia(cm) {
    this.distancia = Number(cm);
  }

  setConexao(conectado, porta = null) {
    this.arduinoConectado = conectado;
    this.portaSerial = porta;
  }
}

// Exportamos uma única instância (Singleton) para compartilhar a memória
module.exports = new StateService();

