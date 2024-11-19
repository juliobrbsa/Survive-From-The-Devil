// Definindo o canvas e contexto
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
playerImage.src = 'ludriu.png';  // Substitua pelo caminho da imagem

// Carregando a imagem do inimigo
const enemyImage = new Image();
enemyImage.src = 'nova.png';  // Substitua pelo caminho da imagem

// Definindo objetos coletáveis para as fases
const collectiblesPhase1 = [
    {x: 400, y: 300, width: 30, height: 30, color: 'gold', name: 'moeda', description: 'Moeda de ouro', value: 10},
    {x: 800, y: 200, width: 30, height: 30, color: 'silver', name: 'chave', description: 'Chave de prata', value: 5},
    {x: 600, y: 100, width: 40, height: 40, color: 'green', name: 'joia', description: 'Joia esmeralda', value: 20},
];

const collectiblesPhase2 = [
    {x: 300, y: 500, width: 25, height: 25, color: 'purple', name: 'pocao', description: 'Poção mágica', value: 15},
    {x: 900, y: 400, width: 35, height: 35, color: 'blue', name: 'escudo', description: 'Escudo protetor', value: 25},
    {x: 200, y: 700, width: 30, height: 30, color: 'red', name: 'sword', description: 'Espada afiada', value: 30},
    {x: 500, y: 600, width: 20, height: 20, color: 'orange', name: 'fruta', description: 'Fruta deliciosa', value: 12},
    {x: 700, y: 500, width: 30, height: 30, color: 'silver', name: 'chave', description: 'Chave de prata', value: 5},  // Chave adicionada aqui
];

const collectiblesPhase3 = [
    {x: 100, y: 600, width: 20, height: 20, color: 'cyan', name: 'pocao', description: 'Poção reforçada', value: 25},
    {x: 1100, y: 200, width: 30, height: 30, color: 'magenta', name: 'escudo', description: 'Escudo mágico', value: 40},
    {x: 700, y: 400, width: 40, height: 40, color: 'yellow', name: 'sword', description: 'Espada encantada', value: 50},
    {x: 400, y: 700, width: 25, height: 25, color: 'gray', name: 'fruta', description: 'Fruta dourada', value: 20},
    {x: 900, y: 300, width: 30, height: 30, color: 'silver', name: 'chave', description: 'Chave de prata', value: 5},  // Chave adicionada aqui
];


// Inicializa os objetos coletáveis com base na fase atual
let collectibles = [];

// Inicializa a fase
generatePhase();

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

    if (distance === 0) return;  // Evita divisão por zero

    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    enemy.x += normalizedDx * enemy.speed;
    enemy.y += normalizedDy * enemy.speed;
}

// Função para usar o escudo
function useShield() {
    // Remove o escudo do inventário
    player.inventory = player.inventory.filter(item => item.name !== 'escudo'); 
}

// Função para verificar a colisão entre o jogador e os inimigos
function checkCollision() {
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            if (player.inventory.some(item => item.name === 'espada')) {
                // Se a espada estiver presente, use-a e remova-a do inventário
                useSword();

                // Remove o inimigo que colidiu permanentemente
                enemies.splice(index, 1);

                // Spawn de um novo inimigo longe do jogador
                spawnNewEnemy();
            } else if (player.inventory.some(item => item.name === 'escudo')) {
                // Se o escudo estiver presente, use-o e remova-o do inventário
                useShield();

                // Remove o inimigo que colidiu
                enemies.splice(index, 1);

                // Spawn de um novo inimigo longe do jogador
                spawnNewEnemy();
            } else {
                // Se não houver escudo nem espada, o jogo é perdido
                gameLost = true;
                resetGame();  // Reinicia o jogo ao colidir com o inimigo
            }
        }
    });
}


// Função para verificar a colisão entre o jogador e os inimigos
function checkCollision() {
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            if (player.inventory.some(item => item.name === 'escudo')) {
                // Se o escudo estiver presente, use-o e remova-o do inventário
                useShield();

                // Remove o inimigo que colidiu
                enemies.splice(index, 1);

                // Spawn de um novo inimigo longe do jogador
                spawnNewEnemy();
            } else {
                // Se não houver escudo, o jogo é perdido
                gameLost = true;
                resetGame();  // Reinicia o jogo ao colidir com o inimigo
            }
        }
    });
}


// Função para gerar um novo inimigo longe do jogador
function spawnNewEnemy() {
    let newEnemy;
    let spawnDistance;

    do {
        const x = Math.random() * (canvas.width - enemyImageWidth);
        const y = Math.random() * (canvas.height - enemyImageHeight);

        // Calcule a distância do novo inimigo ao jogador
        spawnDistance = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);

        // Cria um novo inimigo se ele estiver longe o suficiente do jogador
        newEnemy = { x: x, y: y, width: enemyImageWidth, height: enemyImageHeight, speed: 2 };
    } while (spawnDistance < 200); // Altere este valor para ajustar a distância mínima

    enemies.push(newEnemy); // Adiciona o novo inimigo à lista
}

// Função para coletar itens
function collectItem() {
    collectibles.forEach((item, index) => {
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            player.inventory.push(item);
            collectibles.splice(index, 1);
            updateInventory();

            // Verifica se a chave foi coletada
            if (item.name === 'chave') {
                nextPhase();
            }
        }
    });
}

// Função para desenhar o inimigo em tela cheia
function drawEnemyFullScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(enemyImage, 0, 0, canvas.width, canvas.height);
}

// Função para atualizar o inventário na tela
function updateInventory() {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';

    // Agrupar itens por tipo (nome)
    const groupedItems = player.inventory.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = [];
        }
        acc[item.name].push(item);
        return acc;
    }, {});

    // Exibir itens no inventário
    for (const [key, items] of Object.entries(groupedItems)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${key} (x${items.length})`;
        inventoryList.appendChild(listItem);
    }
}

// Função para gerar uma fase nova
function generatePhase() {
    // Gere uma nova fase com coletáveis e inimigos
    const collectibleTypes = [collectiblesPhase1, collectiblesPhase2, collectiblesPhase3];
    const currentCollectibles = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];

    // Inclua a chave em todos os tipos de coletáveis
    collectibles = [...currentCollectibles, {x: Math.random() * (canvas.width - 30), y: Math.random() * (canvas.height - 30), width: 30, height: 30, color: 'silver', name: 'chave', description: 'Chave de prata', value: 5}];

    // Atualiza a lista de inimigos para a nova fase
    enemies = [];
    spawnMarkers.length = 0; // Limpa os marcadores de spawn
    const numberOfEnemies = currentPhase + 1;  // Aumenta o número de inimigos com o tempo

    // Adiciona os marcadores de spawn para os inimigos
    for (let i = 0; i < numberOfEnemies; i++) {
        const x = Math.random() * (canvas.width - enemyImageWidth);
        const y = Math.random() * (canvas.height - enemyImageHeight);
        spawnMarkers.push({x: x, y: y}); // Adiciona o marcador de spawn
    }

    // Adiciona um atraso de 5 segundos para o aparecimento dos inimigos
    setTimeout(() => {
        spawnMarkers.forEach(marker => {
            enemies.push({
                x: marker.x,
                y: marker.y,
                width: enemyImageWidth,
                height: enemyImageHeight,
                speed: 2,  // Aumenta a velocidade dos inimigos com o tempo
            });
        });
        spawnMarkers.length = 0; // Limpa os marcadores de spawn após os inimigos aparecerem
    }, 3000);
}

// Função para gerar uma cor aleatória
function getRandomColor() {
    const colors = ['gold', 'silver', 'green', 'purple', 'blue', 'red', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Função para gerar um nome de item aleatório
function getRandomItemName() {
    const names = ['moeda', 'chave', 'joia', 'pocao', 'escudo', 'sword', 'fruta'];
    return names[Math.floor(Math.random() * names.length)];
}

// Função para avançar para a próxima fase
function nextPhase() {
    currentPhase++;
    generatePhase();  // Gera a nova fase
}

// Função para mostrar a imagem do inimigo em tela cheia
function drawEnemyFullScreen() {
    if (enemyImage.complete) {
        ctx.drawImage(enemyImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Função para reiniciar o jogo
function resetGame() {
    player.x = 50;
    player.y = 50;
    player.inventory = [];
    gameLost = false;  // Reseta o estado do jogo
    currentPhase = 0;  // Reinicia a fase para a fase inicial
    generatePhase();  // Gera a fase inicial
    updateInventory();
    alert("Você foi derrotado! O jogo será reiniciado.");
}

// Função para movimentar o jogador
function movePlayer() {
    if (keysPressed.w) player.y -= player.speed;
    if (keysPressed.s) player.y += player.speed;
    if (keysPressed.a) player.x -= player.speed;
    if (keysPressed.d) player.x += player.speed;

    // Verificar se o jogador saiu dos limites do canvas
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    collectItem();
}

// Eventos de pressionar e soltar teclas
window.addEventListener('keydown', function(e) {
    if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') {
        keysPressed[e.key] = true;
    }
});

window.addEventListener('keyup', function(e) {
    if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') {
        keysPressed[e.key] = false;
    }
});

// Iniciar o jogo
draw();
