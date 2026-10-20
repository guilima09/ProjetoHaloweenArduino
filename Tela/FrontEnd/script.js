const DIST_MAX = 200; // cm; acima disso a barra fica vazia
const DIST_PERTO = 30; // cm; abaixo disso o painel avisa que tem alguém perto

const elStatus = document.getElementById('status');
const elCm = document.getElementById('cm');
const elBarra = document.getElementById('barraFill');
const elLog = document.getElementById('log');
const elSensor = document.getElementById('sensor');
const elAviso = document.getElementById('aviso');
const elEstado = document.getElementById('estado');
const btnReviver = document.getElementById('btnReviver');

let vivo = true;

let ws;

function conectar() {
  ws = new WebSocket('ws://' + location.host);

  ws.onopen = () => registrar('Conectado ao servidor');

  ws.onclose = () => {
    mostrarStatus('Servidor fora do ar, tentando reconectar...', 'erro');
    setTimeout(conectar, 2000);
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.tipo === 'status') {
      if (msg.serial) mostrarStatus('Arduino conectado em ' + msg.porta, 'ok');
      else mostrarStatus('Arduino desconectado', 'erro');
    } else if (msg.tipo === 'distancia') {
      elCm.textContent = Math.round(msg.cm);
      // quanto mais perto, mais cheia a barra
      const pct = 100 - (msg.cm / DIST_MAX) * 100;
      elBarra.style.width = Math.min(100, Math.max(0, pct)) + '%';

      const perto = msg.cm < DIST_PERTO;
      elSensor.classList.toggle('perto', perto);
      elAviso.textContent = perto ? 'Tem alguém bem perto do boneco...' : '';
    } else if (msg.tipo === 'estado') {
      if (msg.vivo !== vivo) registrar(msg.vivo ? 'O humano voltou à vida' : 'O humano morreu');
      mostrarEstado(msg.vivo);
    } else if (msg.tipo === 'evento') {
      registrar(msg.texto);
    }
  };
}

function mostrarStatus(texto, classe) {
  elStatus.textContent = texto;
  elStatus.className = 'status ' + (classe || '');
}

// o botão de reviver só funciona com o humano morto
function mostrarEstado(estaVivo) {
  vivo = estaVivo;
  btnReviver.disabled = estaVivo;
  elEstado.textContent = 'Humano: ' + (estaVivo ? 'vivo' : 'morto');
  elEstado.className = 'estado' + (estaVivo ? '' : ' morto');
}

function enviar(comando) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ comando: comando }));
  }
}

function registrar(texto) {
  const li = document.createElement('li');
  const hora = document.createElement('time');
  hora.textContent = new Date().toLocaleTimeString('pt-BR');
  li.append(hora, texto);
  elLog.prepend(li);
  while (elLog.children.length > 50) elLog.lastChild.remove();
}

document.querySelectorAll('button[data-cmd]').forEach((botao) => {
  botao.addEventListener('click', () => enviar(botao.dataset.cmd));
});

conectar();