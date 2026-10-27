// Controller: O "cérebro" das requisições HTTP da API.
// Responsabilidade:
// 1. Receber os dados da requisição (req.body, req.params, req.query).
// 2. Validar se os dados estão corretos.
// 3. Chamar os Serviços necessários (regras de negócio).
// 4. Responder ao cliente com o Status HTTP correto (res.status(...).json(...)).

const stateService = require('../services/stateService');
const serialService = require('../services/serialService');
const wsService = require('../services/wsService');
const env = require('../config/env');

class ArduinoController {
  /**
   * GET /api/status
   * Retorna o estado atual do Arduino e do boneco
   */
  obterStatus(req, res) {
    // Busca os dados centralizados no service
    const estado = stateService.getEstadoCompleto();

    // 200 OK: Requisição bem sucedida
    return res.status(200).json(estado);
  }

  /**
   * POST /api/comando
   * Envia um comando para o Arduino (ex: REVIVER, PARAR, SFX:1)
   */
  enviarComando(req, res) {
    const { comando } = req.body;

    // 1. Validação básica: o comando foi enviado?
    if (!comando) {
      // 400 Bad Request: O cliente enviou dados incompletos ou errados
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O campo "comando" é obrigatório no corpo (body) da requisição.'
      });
    }

    const cmdFormatado = String(comando).trim().toUpperCase();

    // 2. Validação de formato: o comando é permitido?
    const ehValido = env.COMANDOS_VALIDOS.some((regex) => regex.test(cmdFormatado));
    if (!ehValido) {
      return res.status(422).json({
        sucesso: false,
        mensagem: `Comando "${comando}" não é reconhecido.`
      });
    }

    // 3. Regra de negócio: se for REVIVER, o humano precisa estar morto!
    if (cmdFormatado === 'REVIVER' && stateService.vivo) {
      return res.status(409).json({ // 409 Conflict
        sucesso: false,
        mensagem: 'O humano ainda está vivo, não precisa ser revivido!'
      });
    }

    // 4. Execução: envia para o Arduino
    const sucesso = serialService.enviar(cmdFormatado);

    if (sucesso) {
      if (cmdFormatado === 'REVIVER') {
        stateService.setVivo(true);
        wsService.broadcast({ tipo: 'estado', vivo: true });
      }

      wsService.broadcast({ tipo: 'evento', texto: `Comando enviado via API: ${cmdFormatado}` });

      return res.status(200).json({
        sucesso: true,
        mensagem: `Comando ${cmdFormatado} executado com sucesso.`
      });
    } else {
      // 503 Service Unavailable: Arduino desconectado
      return res.status(503).json({
        sucesso: false,
        mensagem: 'Não foi possível enviar: Arduino desconectado.'
      });
    }
  }

  /**
   * POST /api/reviver
   * Rota de atalho para reviver o humano
   */
  reviver(req, res) {
    // DICA/DESAFIO:
    // Como você implementaria esse método reutilizando a lógica ou chamando o serviço?
    req.body.comando = 'REVIVER';
    return this.enviarComando(req, res);
  }
}

module.exports = new ArduinoController();

