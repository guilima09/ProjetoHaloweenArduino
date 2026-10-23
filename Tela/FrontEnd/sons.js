// Sons da tela.
// Coloque os arquivos de áudio na pasta FrontEnd/sons/ com os nomes abaixo.
// Se um arquivo não existir, aquele som simplesmente não toca.
//
// Quer usar outro nome ou formato (.wav, .ogg)? Troque só o texto à direita.

const ARQUIVOS = {
  oof:      'oof.mp3',       // quando o humano morre
  reviver:  'reviver.mp3',   // botão Reviver
  parar:    'parar.mp3',     // botão Parar
  risada:   'risada.mp3',    // botão Risada
  sussurro: 'sussurro.mp3',  // botão Sussurro
  grito:    'grito.mp3',     // botão Grito
  sino:     'sino.mp3',      // botão Sino
  trovao:   'trovao.mp3',    // botão Trovão
};

const Sons = (() => {
  const PASTA = 'sons/';
  const cache = {};
  let tocando = null; // áudio que está tocando agora
  let estado = 'inicial'; // 'inicial' | 'ligado' | 'desligado'

  return {
    estado: () => estado,

    // o navegador só deixa tocar áudio depois de um clique do usuário
    ativar() {
      estado = 'ligado';
    },

    // chamado nos botões: o primeiro clique já liga os sons
    ativarSePrimeiraVez() {
      if (estado === 'inicial') this.ativar();
    },

    alternar() {
      if (estado === 'ligado') estado = 'desligado';
      else this.ativar();
    },

    tocar(nome) {
      if (estado !== 'ligado' || !ARQUIVOS[nome]) return;
      if (!cache[nome]) cache[nome] = new Audio(PASTA + ARQUIVOS[nome]);
      const audio = cache[nome];

      // corta o som anterior antes de tocar o novo
      if (tocando) tocando.pause();

      tocando = audio;
      audio.currentTime = 0;
      audio.play().catch(() => {
        console.warn('Som não tocou (arquivo faltando?): ' + PASTA + ARQUIVOS[nome]);
      });
    },
  };
})();