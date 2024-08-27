// Definindo o canvas e contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Definindo o personagem principal
const player = {
    x: 50,
    y: 50,
    width: 50,
    height: 50,
    color: 'blue',
    inventory: [],
};

// Definindo objetos coletáveis
const collectibles = [
    {x: 200, y: 200, width: 30, height: 30, color: 'gold', name: 'moeda', description: 'Moeda de ouro', value: 10},
    {x: 400, y: 100, width: 30, height: 30, color: 'silver', name: 'chave', description: 'Chave de prata', value: 5},
];

// Estrutura de dados árvore para gerar caminhos (simplificado)
const gameTree = {
    node: "start",
    branches: [
        { node: "nivel1", branches: [{ node: "nivel2", branches: [] }] },
        { node: "nivel3", branches: [{ node: "nivel4", branches: [] }] },
    ]
};

// Função de desenhar
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhando o personagem
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Desenhando os objetos coletáveis
    collectibles.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.width, item.height);
    });

    // Loop de animação
    requestAnimationFrame(draw);
}

// Função de coleta
function collectItem() {
    collectibles.forEach((item, index) => {
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            player.inventory.push(item);
            collectibles.splice(index, 1);
            console.log("Objeto coletado:", item);
        }
    });
}

// Movimentação do personagem
window.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowUp': player.y -= 10; break;
        case 'ArrowDown': player.y += 10; break;
        case 'ArrowLeft': player.x -= 10; break;
        case 'ArrowRight': player.x += 10; break;
    }
    collectItem();
});

// Iniciar o jogo
draw();
