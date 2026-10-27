// Service: Responsável pela conexão com a porta Serial (Arduino).
// O Controller ou as Rotas não precisam saber COMO a porta serial funciona;
// elas apenas chamam métodos deste serviço (abstração de responsabilidade).

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const env = require('../config/env');
const stateService = require('./stateService');

class SerialService {
  constructor() {
    this.porta = null;
    this.parser = null;
    this.onMensagemCallback = null;
  }

  // Registra uma função que será chamada toda vez que o Arduino mandar uma linha
  definirCallback(cb) {
    this.onMensagemCallback = cb;
  }

  async procurarArduino() {
    if (env.SERIAL_PORT) return env.SERIAL_PORT;
    const portas = await SerialPort.list();
    const achado = portas.find((p) =>
      /arduino|wch|ch340|ftdi|usb serial|silicon labs/i.test(`${p.manufacturer || ''} ${p.friendlyName || ''}`)
    );
    return (achado || portas[0] || {}).path || null;
  }

  async iniciar() {
    if (env.SIMULAR) {
      console.log('[SerialService] Modo simulação ativo (sem porta física).');
      stateService.setConexao(true, 'SIMULADOR');
      return;
    }

    try {
      const caminho = await this.procurarArduino();
      if (!caminho) {
        stateService.setConexao(false, null);
        return;
      }

      this.porta = new SerialPort({ path: caminho, baudRate: env.BAUD });
      this.parser = this.porta.pipe(new ReadlineParser({ delimiter: '\n' }));

      this.porta.on('open', () => {
        console.log(`[SerialService] Conectado na porta ${caminho}`);
        stateService.setConexao(true, caminho);
      });

      this.parser.on('data', (linha) => {
        const texto = linha.trim();
        if (this.onMensagemCallback) this.onMensagemCallback(texto);
      });

      this.porta.on('close', () => stateService.setConexao(false, null));
      this.porta.on('error', () => stateService.setConexao(false, null));
    } catch (err) {
      stateService.setConexao(false, null);
    }
  }

  enviar(comando) {
    // DESAFIO PARA VOCÊ:
    // 1. O que acontece se tentarmos enviar com a porta desconectada?
    // 2. Lembre-se que o Arduino espera uma quebra de linha ('\n') ao final do comando!
    if (!this.porta || !this.porta.isOpen) {
      return false;
    }

    this.porta.write(comando + '\n');
    return true;
  }
}

module.exports = new SerialService();

