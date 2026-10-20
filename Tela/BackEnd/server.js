// BackEnd: conecta o Arduino (porta serial) com a tela (WebSocket).
// Uso: npm install && npm start  ->  abrir http://localhost:3000
//
// Variáveis opcionais:
//   SERIAL_PORT=COM3   força a porta (senão tenta achar o Arduino sozinho)
//   BAUD=9600          velocidade serial (precisa ser igual no Arduino)
//   PORT=3000          porta do site
//   SIMULAR=1 ou --simular  roda sem Arduino (valores falsos, para testar a tela)

const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const PORTA_SITE = process.env.PORT || 3000;
const BAUD = Number(process.env.BAUD) || 9600;
const SIMULAR = process.env.SIMULAR === '1' || process.argv.includes('--simular');

// Comandos que a tela pode enviar ao Arduino (veja ../PROTOCOLO.md)
const COMANDOS_VALIDOS = [/^REVIVER$/, /^PARAR$/, /^SFX:[1-5]$/];

const app = express();
app.use(express.static(path.join(__dirname, '..', 'FrontEnd')));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let serial = null;
let vivo = true; // estado do humano; só vira false quando o Arduino avisa ESTADO:MORTO
let status = { serial: false, modo: SIMULAR ? 'simulacao' : 'serial', porta: null };

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach((c) => c.readyState === 1 && c.send(msg));
}

function setVivo(valor) {
  if (vivo === valor) return;
  vivo = valor;
  broadcast({ tipo: 'estado', vivo });
}

function setStatus(novo) {
  status = { ...status, ...novo };
  broadcast({ tipo: 'status', ...status });
}

// ---------- Serial ----------
async function acharPorta() {
  if (process.env.SERIAL_PORT) return process.env.SERIAL_PORT;
  const portas = await SerialPort.list();
  const arduino = portas.find((p) =>
    /arduino|wch|ch340|ftdi|usb serial|silicon labs/i.test(`${p.manufacturer || ''} ${p.friendlyName || ''}`)
  );
  return (arduino || portas[0] || {}).path || null;
}

async function conectar() {
  if (SIMULAR || serial) return;
  try {
    const caminho = await acharPorta();
    if (!caminho) throw new Error('nenhuma porta serial encontrada');

    const porta = new SerialPort({ path: caminho, baudRate: BAUD });
    const parser = porta.pipe(new ReadlineParser({ delimiter: '\n' }));

    porta.on('open', () => {
      serial = porta;
      console.log(`[serial] conectado em ${caminho}`);
      setStatus({ serial: true, porta: caminho });
    });
    parser.on('data', (linha) => tratarLinha(linha.trim()));
    porta.on('close', () => perdeuConexao('porta fechada'));
    porta.on('error', (e) => perdeuConexao(e.message));
  } catch (e) {
    perdeuConexao(e.message, true);
  }
}

function perdeuConexao(motivo, silencioso) {
  if (!silencioso) console.log(`[serial] desconectado: ${motivo}`);
  serial = null;
  setStatus({ serial: false, porta: null });
}

// Linhas vindas do Arduino: "DIST:<cm>", "ESTADO:MORTO|VIVO" ou "EVENTO:<texto>"
function tratarLinha(linha) {
  if (linha.startsWith('DIST:')) {
    const cm = parseFloat(linha.slice(5));
    if (!isNaN(cm)) broadcast({ tipo: 'distancia', cm });
  } else if (linha.startsWith('ESTADO:')) {
    const estado = linha.slice(7).trim().toUpperCase();
    if (estado === 'MORTO') setVivo(false);
    else if (estado === 'VIVO') setVivo(true);
  } else if (linha.startsWith('EVENTO:')) {
    broadcast({ tipo: 'evento', texto: linha.slice(7) });
  } else if (linha) {
    broadcast({ tipo: 'evento', texto: linha });
  }
}

function enviarAoArduino(cmd) {
  if (SIMULAR) {
    broadcast({ tipo: 'evento', texto: `(simulação) recebi ${cmd}` });
    return true;
  }
  if (!serial) return false;
  serial.write(cmd + '\n');
  return true;
}

// ---------- WebSocket ----------
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ tipo: 'status', ...status }));
  ws.send(JSON.stringify({ tipo: 'estado', vivo }));
  ws.on('message', (data) => {
    let cmd;
    try { cmd = String(JSON.parse(data).comando || '').toUpperCase(); } catch { return; }
    if (!COMANDOS_VALIDOS.some((r) => r.test(cmd))) return;
    if (cmd === 'REVIVER' && vivo) {
      broadcast({ tipo: 'evento', texto: 'O humano ainda está vivo, nada para reviver' });
      return;
    }
    const ok = enviarAoArduino(cmd);
    if (cmd === 'REVIVER' && ok) setVivo(true);
    broadcast({ tipo: 'evento', texto: ok ? `Comando enviado: ${cmd}` : 'Arduino desconectado!' });
  });
});

// ---------- Início ----------
server.listen(PORTA_SITE, () => {
  console.log(`Tela em http://localhost:${PORTA_SITE}`);
  if (SIMULAR) {
    console.log('[modo simulação] sem Arduino');
    status.serial = true; status.porta = 'SIMULAÇÃO';
    let d = 80;
    setInterval(() => {
      d = Math.max(5, Math.min(200, d + (Math.random() - 0.5) * 30));
      broadcast({ tipo: 'distancia', cm: Math.round(d) });
      if (vivo && d < 30) setVivo(false); // na simulação, chegar perto mata o humano
    }, 500);
  } else {
    conectar();
    setInterval(conectar, 3000); // tenta reconectar se cair / se ainda não plugou
  }
});