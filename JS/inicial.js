const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sprite personagem
const sprite = new Image();
sprite.src = "./IMG/Spritesheet_alex.png";

// Imagem por cima de tudo
const overlay = new Image();
overlay.src = "IMG/tlini2.png";

// Classe Spritesheet
function Spritesheet(context, imagem, linhas, colunas) {
  this.context = context;
  this.imagem = imagem;
  this.numLinhas = linhas;
  this.numColunas = colunas;
  this.linha = 0;
  this.coluna = 0;
  this.intervalo = 150;
  this.ultimoTempo = 0;
}

Spritesheet.prototype = {
  proximoQuadro: function () {
    let agora = Date.now();
    if (agora - this.ultimoTempo < this.intervalo) return;

    if (this.coluna < this.numColunas - 1) {
      this.coluna++;
    } else {
      this.coluna = 1;
    }
    this.ultimoTempo = agora;
  },

  desenhar: function (x, y, largura, altura) {
    let frameLargura = this.imagem.width / this.numColunas;
    let frameAltura = this.imagem.height / this.numLinhas;

    this.context.drawImage(
      this.imagem,
      frameLargura * this.coluna,
      frameAltura * this.linha,
      frameLargura,
      frameAltura,
      x,
      y,
      largura,
      altura
    );
  },
};

// ... código anterior ...

// ...
// Personagem
class Personagem {
  constructor(context, imagem) {
    this.context = context;
    this.x = 50;
    this.y = canvas.height - 350;
    // ATUALIZAR: Largura e altura do personagem na tela
    this.largura = 306;
    this.altura = 350;
    this.velocidade = 8;
    // 4 linhas e 4 colunas estão corretas
    this.sheet = new Spritesheet(context, imagem, 4, 4);
    this.andando = false;
    this.ultimaDirecao = 1;
    this.direcao = 1; // Começa virado para baixo (linha 0)
  }

  atualizar(keys) {
    this.andando = false;

    if (keys["ArrowRight"]) {
      this.x += this.velocidade;
      this.sheet.linha = 2; // Direita na linha 2 (Corrigido)
      this.andando = true;
      this.ultimaDirecao = 1;
      this.direcao = 2;
    } else if (keys["ArrowLeft"]) {
      this.x -= this.velocidade;
      this.sheet.linha = 1; // Esquerda na linha 1 (Corrigido)
      this.andando = true;
      this.ultimaDirecao = 1;
      this.direcao = 1;
    }
     else {
      this.sheet.coluna = 0; // Frame parado
    }

    if (this.andando) this.sheet.proximoQuadro();
  }

  desenhar() {
    this.sheet.desenhar(this.x, this.y, this.largura, this.altura);
  }
}

let keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

let personagem;
let jogoRodando = true; // controla se o jogo está ativo
sprite.onload = function () {
  personagem = new Personagem(ctx, sprite);
  animate();
};

function mostrarMenu() {
  jogoRodando = false;

  const menu = document.createElement("div");
  menu.id = "menu";
  menu.style.position = "absolute";
  menu.style.top = "0";
  menu.style.left = "0";
  menu.style.width = "100%";
  menu.style.height = "100%";
  menu.style.display = "flex";
  menu.style.justifyContent = "center";
  menu.style.alignItems = "center";
  menu.style.zIndex = "10";
  menu.style.opacity = "0";
  menu.style.transition = "opacity 1.5s";

  const fundo = new Image();
  fundo.src = "IMG/tela.png";
  fundo.onload = () => {
    menu.style.backgroundImage = `url(${fundo.src})`;
    menu.style.backgroundSize = "cover";
    menu.style.backgroundPosition = "center";
    requestAnimationFrame(() => {
      menu.style.opacity = "1";
    });
  };

  const botao = document.createElement("button");
  botao.innerText = "Iniciar";
  botao.style.fontFamily = "'Press Start 2P', monospace";
  botao.style.fontSize = "1.5rem";
  botao.style.padding = "10px 10px";
  botao.style.marginTop = "-65px";
  botao.style.cursor = "pointer";
  botao.style.zIndex = "20";
  botao.style.background = "#0e8bf9ff";
  botao.style.color = "#fff";
  botao.style.border = "3px solid #fff";
  botao.style.textTransform = "uppercase";
  botao.style.letterSpacing = "2px";

  // MODIFICAÇÃO AQUI: Agora exibe o vídeo primeiro
  botao.onclick = () => {
    exibirVideoEContinuar();
  };

  menu.appendChild(botao);
  document.body.appendChild(menu);
}

// NOVA FUNÇÃO: Exibir vídeo e depois redirecionar
function exibirVideoEContinuar() {
  // Remove o menu
  const menu = document.getElementById("menu");
  if (menu) menu.remove();
  
  // Cria container para o YouTube
  const videoContainer = document.createElement("div");
  videoContainer.id = "videoContainer";
  videoContainer.style.position = "fixed";
  videoContainer.style.top = "0";
  videoContainer.style.left = "0";
  videoContainer.style.width = "100%";
  videoContainer.style.height = "100%";
  videoContainer.style.backgroundColor = "black";
  videoContainer.style.zIndex = "100";
  
  // CORREÇÃO PARA YOUTUBE: Use iframe em vez de video tag
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube.com/embed/OvcbqSSGuuU?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; encrypted-media";
  iframe.allowFullscreen = true;
  
  // Botão de pular
  const skipButton = document.createElement("button");
  skipButton.innerText = "Pular";
  skipButton.style.position = "absolute";
  skipButton.style.bottom = "20px";
  skipButton.style.right = "20px";
  skipButton.style.zIndex = "101";
  skipButton.style.padding = "10px 20px";
  skipButton.style.background = "rgba(0,0,0,0.7)";
  skipButton.style.color = "white";
  skipButton.style.border = "2px solid white";
  skipButton.style.cursor = "pointer";
  skipButton.onclick = function() {
    window.location.href = "index2.html";
  };
  
  // Detecta quando o vídeo termina (aproximadamente)
  const checkVideoEnd = setInterval(() => {
    // Esta é uma aproximação - com YouTube é mais complexo
    // Você pode ajustar o tempo conforme a duração do seu vídeo
    setTimeout(() => {
      clearInterval(checkVideoEnd);
      window.location.href = "index2.html";
    }, 60000); // 60 segundos - ajuste conforme a duração do vídeo
  }, 1000);
  
  videoContainer.appendChild(iframe);
  videoContainer.appendChild(skipButton);
  document.body.appendChild(videoContainer);
}
function animate() {
  if (!jogoRodando) return; // pausa animação

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  personagem.atualizar(keys);
  personagem.desenhar();

  // overlay sempre por cima
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

  // verifica se chegou na posição x >= 800
  if (personagem.x >= 800) {
    mostrarMenu();
    return;
  }

  requestAnimationFrame(animate);
}
