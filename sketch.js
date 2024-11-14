// Declaração das variáveis globais
let raqueteJogador, raqueteComputador, bola, bordaSuperior, bordaInferior;
let fundoImg, bolaImg, barraJogadorImg, barraComputadorImg;
let somColisao, somDePonto;
let placarJogador = 0;
let placarComputador = 0;

// Função para carregar imagens e sons
function preload() {
  fundoImg = loadImage('fundo2.png');
  bolaImg = loadImage('bola.png');
  barraJogadorImg = loadImage('barra01.png');
  barraComputadorImg = loadImage('barra02.png');
  somColisao = loadSound('colisao_com_raquete.wav');
  somDePonto = loadSound('point_sound.wav');
}

// Configuração inicial
function setup() {
  createCanvas(600, 400);
  inicializarEntidades();
}

// Loop de atualização da tela
function draw() {
  desenharFundo();
  atualizarObjetos();
  verificarColisoes();
  exibirPlacar();
}

// Inicializa as entidades do jogo
function inicializarEntidades() {
  raqueteJogador = new Raquete(true);
  raqueteComputador = new Raquete(false);
  bola = new Bola();
  bordaSuperior = new Borda(0);
  bordaInferior = new Borda(height - 5);
}

// Desenha o fundo escalado
function desenharFundo() {
  const escala = Math.max(width / fundoImg.width, height / fundoImg.height);
  const imgWidth = fundoImg.width * escala;
  const imgHeight = fundoImg.height * escala;
  const imgX = (width - imgWidth) / 2;
  const imgY = (height - imgHeight) / 2;
  image(fundoImg, imgX, imgY, imgWidth, imgHeight);
}

// Atualiza e exibe as entidades do jogo
function atualizarObjetos() {
  raqueteJogador.exibir();
  raqueteJogador.atualizar();
  raqueteComputador.exibir();
  raqueteComputador.atualizar(bola);
  bola.exibir();
  bola.atualizar();
  bordaSuperior.exibir();
  bordaInferior.exibir();
}

// Exibe o placar na tela
function exibirPlacar() {
  // Fundo do placar com altura ajustada
  fill(0, 0, 0, 150);  // Fundo semitransparente
  noStroke();
  rect(0, 0, width, 40);  // A altura do placar é 40px
  
  // Texto do placar
  textSize(24);  // Tamanho de fonte menor
  fill(255);  // Cor do texto: branco
  textAlign(CENTER, CENTER);
  
  // Labels e pontuação
  text("Jogador", width / 4, 20);  // Label "Jogador" à esquerda
  text(placarJogador, width / 4, 50);  // Pontuação do jogador
  
  text("Computador", (3 * width) / 4, 20);  // Label "Computador" à direita
  text(placarComputador, (3 * width) / 4, 50);  // Pontuação do computador
}

// Narra o placar atual usando o Web Speech API em português do Brasil
function narrarPlacar() {
  const mensagem = `${placarJogador} a ${placarComputador}`;
  const narrador = new SpeechSynthesisUtterance(mensagem);
  narrador.lang = 'pt-BR';
  speechSynthesis.speak(narrador);
}

// Verifica colisões da bola com as raquetes e as bordas da tela
function verificarColisoes() {
  bola.verificarColisaoComRaquete(raqueteJogador);
  bola.verificarColisaoComRaquete(raqueteComputador);
  if (bola.estaForaDaTela()) {
    somDePonto.play();
    atualizarPlacar();
    bola.resetar();
  }
}

// Atualiza o placar e narra o novo placar
function atualizarPlacar() {
  if (bola.x < 0) {
    placarComputador++;
  } else if (bola.x > width) {
    placarJogador++;
  }
  narrarPlacar();
}

// Classe Raquete
class Raquete {
  constructor(ehJogador) {
    this.ehJogador = ehJogador;
    this.largura = 10;
    this.altura = 80;
    this.x = this.ehJogador ? 10 : width - 20;
    this.y = height / 2 - this.altura / 2;
    this.velocidadeY = 0;
  }

  exibir() {
    const imagem = this.ehJogador ? barraJogadorImg : barraComputadorImg;
    image(imagem, this.x, this.y, this.largura, this.altura);
  }

  atualizar() {
    this.ehJogador ? this.seguirMouse() : this.seguirBola();
    this.constrainPosicao();
  }

  seguirMouse() {
    this.y = mouseY - this.altura / 2;
  }

  seguirBola() {
    this.velocidadeY = this.y < bola.y ? 4 : (this.y > bola.y ? -4 : 0);
    this.y += this.velocidadeY;
  }

  constrainPosicao() {
    this.y = constrain(this.y, bordaSuperior.altura, height - this.altura - bordaInferior.altura);
  }
}

// Classe Bola
class Bola {
  constructor() {
    this.tamanhoOriginal = 15;
    this.tamanho = this.tamanhoOriginal;
    this.emColisao = false;
    this.anguloRotacao = 0;
    this.resetar();
  }

  resetar() {
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = random(2, 4) * (random() > 0.5 ? 1 : -1);
    this.velocidadeY = random(2, 4) * (random() > 0.5 ? 1 : -1);
  }

  exibir() {
    let velocidade = sqrt(this.velocidadeX ** 2 + this.velocidadeY ** 2);
    this.anguloRotacao += velocidade * 0.1 / 2;
    push();
    translate(this.x, this.y);
    rotate(this.anguloRotacao);
    image(bolaImg, -this.tamanho / 2, -this.tamanho / 2, this.tamanho, this.tamanho);
    pop();
  }

  atualizar() {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;
    this.colidirComBordas();
    if (!this.emColisao && this.tamanho < this.tamanhoOriginal) {
      this.tamanho += 0.5;
    }
  }

  colidirComBordas() {
    if (this.y - this.tamanho / 2 <= bordaSuperior.y + bordaSuperior.altura || 
        this.y + this.tamanho / 2 >= bordaInferior.y) {
      this.velocidadeY *= -1;
    }
  }

  verificarColisaoComRaquete(raquete) {
    const colisaoHorizontal = this.x - this.tamanho / 2 <= raquete.x + raquete.largura &&
                              this.x + this.tamanho / 2 >= raquete.x;
    const colisaoVertical = this.y + this.tamanho / 2 >= raquete.y &&
                            this.y - this.tamanho / 2 <= raquete.y + raquete.altura;

    if (colisaoHorizontal && colisaoVertical) {
      this.velocidadeX *= -1;
      this.ajustarAngulo(raquete);
      somColisao.play();
      this.animacaoColisao();
    }
  }

  ajustarAngulo(raquete) {
    let posicaoRelativa = (this.y - raquete.y) / raquete.altura;
    posicaoRelativa = constrain(posicaoRelativa, -0.5, 0.5);
    const angulo = posicaoRelativa * PI / 3 * 1.5;
    this.velocidadeY = this.velocidadeX * Math.tan(angulo);
    this.aumentarVelocidade();
  }

  animacaoColisao() {
    this.emColisao = true;
    this.tamanho = this.tamanhoOriginal * 0.5;
    setTimeout(() => {
      this.emColisao = false;
    }, 100);
  }

  estaForaDaTela() {
    return this.x < 0 || this.x > width;
  }

  aumentarVelocidade() {
    this.velocidadeX *= random(1.04, 1.2);
    this.velocidadeY *= random(1.04, 1.2);
  }
}

// Classe Borda
class Borda {
  constructor(y) {
    this.y = y;
    this.altura = 5;
  }

  exibir() {
    fill(255);
    noStroke();
    rect(0, this.y, width, this.altura);
  }
}

