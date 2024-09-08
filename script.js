//Definindo o canvas e contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

// Atualizar o tamanho do canvas e do minimapa quando a janela é redimensionada
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Tamanho do mini-mapa como uma proporção da largura e altura da tela
    const miniMapWidth = window.innerWidth / 6;  // 1/4 da largura da tela
    const miniMapHeight = window.innerHeight / 6; // 1/4 da altura da tela
    miniMapSize = { width: miniMapWidth, height: miniMapHeight };

    // Atualizar a escala do mini-mapa
    miniMapScale = Math.min(miniMapWidth / canvas.width, miniMapHeight / canvas.height); 
});

window.dispatchEvent(new Event('resize')); // Disparar o evento de redimensionamento inicialmente para configurar os tamanhos


// Definindo o tamanho das imagens
const playerImageWidth = 70;  // Largura da imagem do personagem
const playerImageHeight = 70; // Altura da imagem do personagem
const enemyImageWidth = 70;   // Largura da imagem do inimigo
const enemyImageHeight = 70;  // Altura da imagem do inimigo

// Definindo o estado da fase
let currentPhase = 0;

// Definindo o personagem principal
const player = {
    x: 100,
    y: 275,
    width: playerImageWidth,
    height: playerImageHeight,
    speed: 4,  // Velocidade de movimento
    inventory: [],
};

// Definindo os inimigos
let enemies = [];
const spawnMarkers = []; // Marcadores de spawn para os inimigos

// Carregando a imagem do personagem
const playerImage = new Image();
playerImage.src = 'ludriu.jpg';  // Substitua pelo caminho da imagem

// Carregando a imagem do inimigo
const enemyImage = new Image();
enemyImage.src = 'nova.jpg';  // Substitua pelo caminho da imagem

// Inicializa os objetos coletáveis com base na fase atual
let collectibles = [];

// Estrutura de dados árvore para gerar caminhos (simplificado)
const gameTree = {
    node: "start",
    branches: [
        { node: "nivel1", branches: [{ node: "nivel2", branches: [] }] },
        { node: "nivel3", branches: [{ node: "nivel4", branches: [] }] },
    ]
};

// Variáveis para controle de movimento
const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Variável para controle de jogo perdido
let gameLost = false;

// Definindo as dimensões do mapa e dos itens, e a distância mínima entre os itens
const mapWidth = 800; // Largura do mapa (ajuste conforme seu mapa)
const mapHeight = 600; // Altura do mapa (ajuste conforme seu mapa)
const itemWidth = 30; // Largura do item (ajuste conforme seu item)
const itemHeight = 30; // Altura do item (ajuste conforme seu item)
const minDistance = 50; // Distância mínima entre os itens

const items = [];

// Função para gerar uma posição aleatória para os itens
function generateRandomPosition() {
    const x = Math.random() * (mapWidth - itemWidth);
    const y = Math.random() * (mapHeight - itemHeight);
    return { x, y };
}

// Função para spawnar itens aleatoriamente no mapa, respeitando a distância mínima entre eles
function spawnItems(numItems) {
    while (items.length < numItems) {
        let position = generateRandomPosition();
        let tooClose = items.some(item => 
            Math.abs(item.x - position.x) < minDistance && 
            Math.abs(item.y - position.y) < minDistance);

        if (!tooClose) {
            items.push(position);
            // Lógica para adicionar o item no mapa
            addItemToMap(position.x, position.y);
        }
    }
}

// Função para adicionar um item ao mapa (implementação personalizada para renderização)
function addItemToMap(x, y) {
    // Aqui você insere a lógica para realmente adicionar o item ao mapa, por exemplo:
    // ctx.drawImage(itemImage, x, y);
    ctx.fillStyle = 'gold';  // Cor para os itens (pode ser alterada conforme o item)
    ctx.fillRect(x, y, itemWidth, itemHeight);
}

// Função de desenhar
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameLost) {
        // Exibe a imagem do inimigo em tela cheia
        drawEnemyFullScreen();
    } else {
        // Desenhando o personagem com a imagem
        if (playerImage.complete) {  // Verifica se a imagem está carregada
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = 'blue';  // Caso a imagem ainda não tenha carregado
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Desenhando os inimigos com a imagem
        enemies.forEach(enemy => {
            if (enemyImage.complete) {  // Verifica se a imagem está carregada
                ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.fillStyle = 'red';  // Caso a imagem ainda não tenha carregado
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });

        // Desenhando os objetos coletáveis
        collectibles.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.width, item.height);
        });

        // Desenhando os itens gerados aleatoriamente
        items.forEach(item => {
            ctx.fillStyle = 'gold';
            ctx.fillRect(item.x, item.y, itemWidth, itemHeight);
        });

        // Desenhando os marcadores de spawn dos inimigos
        drawSpawnMarkers();

        // Desenhando o mini-mapa
        drawMiniMap();

        // Movimentando os inimigos
        enemies.forEach(enemy => moveEnemy(enemy));

        // Movimentando o personagem
        movePlayer();

        // Verificando colisão do inimigo com o jogador
        checkCollision();
    }

    // Loop de animação
    requestAnimationFrame(draw);
}

// Função para inicializar e desenhar os itens na fase
function generatePhase() {
    // Gere uma nova fase com coletáveis e inimigos
    spawnItems(5);  // Exemplo: gerar 5 itens aleatórios na fase

    // Restante da lógica de geração de fase, inimigos, etc.
    // ...
}

// Chamando a função para inicializar a primeira fase
generatePhase();

// Função para desenhar os marcadores de spawn dos inimigos
function drawSpawnMarkers() {
    ctx.fillStyle = 'pink';  // Cor para os marcadores de spawn
    spawnMarkers.forEach(marker => {
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Função para desenhar o mini-mapa
function drawMiniMap() {
    ctx.save();
    ctx.globalAlpha = 0.7;

    // Definir as coordenadas de origem para o minimapa no canto superior esquerdo
    const xOffset = 10; // 10 pixels de margem a partir da borda esquerda
    const yOffset = 10; // 10 pixels de margem a partir da borda superior

    // Desenhar o fundo do minimapa
    ctx.fillStyle = 'white';
    ctx.fillRect(xOffset, yOffset, miniMapSize.width, miniMapSize.height);

    // Desenhar objetos coletáveis no minimapa
    collectibles.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(
            xOffset + item.x * miniMapScale,
            yOffset + item.y * miniMapScale,
            item.width * miniMapScale,
            item.height * miniMapScale
        );
    });

    // Desenhar o personagem no minimapa
    ctx.fillStyle = 'blue';
    ctx.fillRect(
        xOffset + player.x * miniMapScale,
        yOffset + player.y * miniMapScale,
        player.width * miniMapScale,
        player.height * miniMapScale
    );

    // Desenhar inimigos no minimapa
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.fillRect(
            xOffset + enemy.x * miniMapScale,
            yOffset + enemy.y * miniMapScale,
            enemy.width * miniMapScale,
            enemy.height * miniMapScale
        );
    });

    ctx.restore();
}

// Função para movimentar um inimigo em direção ao jogador
function moveEnemy(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Evita divisão por zero

    // Normaliza a direção
    const directionX = dx / distance;
    const directionY = dy / distance;

    enemy.x += directionX * enemy.speed;
    enemy.y += directionY * enemy.speed;
}

// Função para verificar a colisão do jogador com os inimigos
function checkCollision() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            gameLost = true;  // O jogo é perdido se o jogador colidir com um inimigo
        }
    });
}

// Função para desenhar o inimigo em tela cheia quando o jogador perde
function drawEnemyFullScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(enemyImage, 0, 0, canvas.width, canvas.height);
}

// Função para movimentar o jogador
function movePlayer() {
    if (keysPressed.w && player.y > 0) player.y -= player.speed;
    if (keysPressed.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keysPressed.a && player.x > 0) player.x -= player.speed;
    if (keysPressed.d && player.x < canvas.width - player.width) player.x += player.speed;
}

// Adiciona ouvintes de eventos para movimentação do jogador
window.addEventListener('keydown', (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = false;
    }
});

// Inicia o loop de desenho
draw();
