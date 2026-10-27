// Configurações e variáveis de ambiente do projeto
// Centralizar as configurações aqui evita "números mágicos" espalhados pelo código.

const path = require('path');

module.exports = {
  // Porta onde a API e o site vão rodar
  PORT: process.env.PORT || 3000,

  // Velocidade da comunicação Serial (deve ser a mesma configurada no Arduino!)
  BAUD: Number(process.env.BAUD) || 9600,

  // Porta serial forçada (opcional, ex: 'COM3' ou '/dev/ttyUSB0')
  SERIAL_PORT: process.env.SERIAL_PORT || null,

  // Modo de simulação para testar quando o Arduino não estiver conectado
  SIMULAR: process.env.SIMULAR === '1' || process.argv.includes('--simular'),

  // Caminho dos arquivos estáticos da tela (Front-End)
  // Subimos 3 níveis: config -> src -> BackEnd -> Tela/FrontEnd
  FRONTEND_PATH: path.join(__dirname, '..', '..', '..', 'FrontEnd'),

  // Lista de comandos aceitos pela nossa API
  COMANDOS_VALIDOS: [/^REVIVER$/, /^PARAR$/, /^SFX:[1-5]$/]
};

