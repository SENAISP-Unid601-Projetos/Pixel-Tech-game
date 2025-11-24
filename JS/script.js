document.addEventListener("DOMContentLoaded", () => {
    const player = document.getElementById("player");
    const gameContainer = document.getElementById("game-container");
    const taskOverlay = document.getElementById("task-overlay");
    const closeOverlayBtn = document.getElementById("close-overlay-btn");
    const checkSolutionBtn = document.getElementById("check-solution-btn");
    const progressBar = document.getElementById("progress-bar");
    const notification = document.getElementById("notification");
    const taskTitle = document.getElementById("task-title");
    const taskDescription = document.getElementById("task-description");
    const taskInteraction = document.getElementById("task-interaction");
    const interactiveObjects = document.querySelectorAll(".interactive-object");
    const completedTasksList = document.getElementById("completed-tasks-list");

    // === SONS ===
    let stepSound = document.getElementById("step-sound");
    let backgroundMusic = document.getElementById("background-music");
    let lastStepTime = 0;
    const STEP_INTERVAL = 300; // ms entre cada passo

    // === CONFIGURAÇÕES DE ÁUDIO ===
    let volume = 0.2; 
    
    // === CONTROLE DE VOLUME ===
const volumeControl = document.getElementById("volume-control");
const volumeSlider = document.getElementById("volume-slider");
const volumeToggle = document.getElementById("volume-toggle");
const volumeTooltip = document.getElementById("volume-tooltip");

function initializeVolumeControl() {
    if (!volumeControl) return;
    
    // Configurar volume inicial
    setVolume(volume / 100); // Converte para decimal
    
    // Evento do slider de volume
    volumeSlider.addEventListener("input", (e) => {
        const newVolume = parseInt(e.target.value) / 100;
        setVolume(newVolume);
        updateVolumeIcon();
        updateVolumeTooltip();
    });
    
    // Evento do botão de mudo
    volumeToggle.addEventListener("click", toggleMute);
    
    // Atualizar tooltip inicial
    updateVolumeTooltip();
    updateVolumeIcon();
}

function updateVolumeTooltip() {
    if (volumeTooltip) {
        volumeTooltip.textContent = `${Math.round(volume * 100)}%`;
    }
}
// === CONTROLE DE VISIBILIDADE DA BARRA DE VOLUME ===
let volumeActiveTimeout;

function showVolumeBar() {
    const volumeControl = document.getElementById("volume-control");
    if (volumeControl) {
        volumeControl.classList.add("volume-active");
        
        // Limpa timeout anterior
        if (volumeActiveTimeout) {
            clearTimeout(volumeActiveTimeout);
        }
        
        // Esconde após 3 segundos de inatividade
        volumeActiveTimeout = setTimeout(() => {
            volumeControl.classList.remove("volume-active");
        }, 3000);
    }
}

function hideVolumeBar() {
    const volumeControl = document.getElementById("volume-control");
    if (volumeControl && !volumeControl.matches(':hover')) {
        volumeControl.classList.remove("volume-active");
    }
}

// Modifique a função initializeVolumeControl:
function initializeVolumeControl() {
    if (!volumeControl) return;
    
    // Configurar volume inicial
    setVolume(volume / 100);
    
    // Evento do slider de volume - MOSTRA barra quando interage
    volumeSlider.addEventListener("input", (e) => {
        const newVolume = parseInt(e.target.value) / 100;
        setVolume(newVolume);
        updateVolumeIcon();
        updateVolumeTooltip();
        showVolumeBar(); // Mostra a barra quando mexe no slider
    });
    
    volumeSlider.addEventListener("mousedown", showVolumeBar);
    volumeSlider.addEventListener("touchstart", showVolumeBar);
    
    // Evento do botão de mudo - MOSTRA barra quando clica
    volumeToggle.addEventListener("click", function(e) {
        toggleMute();
        showVolumeBar(); // Mostra a barra quando clica no botão
    });
    
    // Eventos de teclado (Z, X, M) também mostram a barra
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        if (key === 'x' || key === 'z' || key === 'm') {
            showVolumeBar();
        }
    });
    
    // Esconde a barra quando mouse sai do controle
    volumeControl.addEventListener("mouseleave", () => {
        setTimeout(hideVolumeBar, 1000); // Pequeno delay antes de esconder
    });
    
    // Atualizar tooltip e ícone iniciais
    updateVolumeTooltip();
    updateVolumeIcon();
    
    // Esconde a barra inicialmente após um tempo
    setTimeout(hideVolumeBar, 2000);
}
function updateVolumeIcon() {
    if (!volumeToggle) return;
    
    // Remove todas as classes de estado
    volumeToggle.classList.remove("muted", "low", "medium", "high");
    
    if (volume === 0) {
        volumeToggle.classList.add("muted");
    } else if (volume <= 0.3) {
        volumeToggle.classList.add("low");
    } else if (volume <= 0.7) {
        volumeToggle.classList.add("medium");
    } else {
        volumeToggle.classList.add("high");
    }
}

function toggleMute() {
    if (volume === 0) {
        // Se estava mudo, restaurar volume anterior
        const lastVolume = volumeSlider.value / 100 || 0.2;
        setVolume(lastVolume);
        volumeSlider.value = lastVolume * 100;
    } else {
        // Se tinha volume, salvar e mutar
        volumeSlider.setAttribute("data-last-volume", volumeSlider.value);
        setVolume(0);
        volumeSlider.value = 0;
    }
    
    updateVolumeIcon();
    updateVolumeTooltip();
}

// Modifique a função setVolume existente para incluir o controle visual:
function setVolume(newVolume) {
    volume = Math.max(0, Math.min(1, newVolume));
    
    if (backgroundMusic) {
        backgroundMusic.volume = volume;
    }
    if (stepSound) {
        stepSound.volume = volume;
    }
    
    updateVolumeIcon();
    updateVolumeTooltip();
    
    // Salvar preferência no localStorage
    localStorage.setItem('gameVolume', volume);
}

// Função para carregar volume salvo
function loadSavedVolume() {
    const savedVolume = localStorage.getItem('gameVolume');
    if (savedVolume !== null) {
        const volumeValue = parseFloat(savedVolume);
        setVolume(volumeValue);
        volumeSlider.value = volumeValue * 100;
    }
}

    // === MINI MAPA ===
    const miniMap = document.getElementById("mini-map");
    const miniPlayer = document.getElementById("mini-player");
    const miniMapSize = 200;

    // === MUNDO E CÂMERA ===
    const worldWidth = 3000;
    const worldHeight = 2000;
    
    // Tamanho do jogador na tela (64x64)
    const playerWidth = 64;
    const playerHeight = 64;
    
    let cameraX = 0;
    let cameraY = 0;

    // === SPRITE DO JOGADOR ===
    // Dimensões corretas do sprite
    const spriteWidth = 128;
    const spriteHeight = 128;
    
    let frameX = 0;
    let frameY = 0;
    let maxFrames = 4;

    function updatePlayerSprite() {
        player.style.backgroundPosition = `-${frameX * spriteWidth}px -${frameY * spriteHeight}px`;
    }

    // === POSIÇÃO INICIAL DO JOGADOR ===
    let playerX = worldWidth / 2;
    let playerY = worldHeight / 2;
    const playerSpeed = 20;

    // === ANIMAÇÃO DO SPRITE ===
    function animateSprite() {
        frameX = (frameX + 1) % maxFrames;
        updatePlayerSprite();
    }

    let spriteInterval = null;
    let isMoving = false;

    function startSpriteAnimation() {
        if (!spriteInterval) {
            spriteInterval = setInterval(animateSprite, 150);
        }
    }

    function stopSpriteAnimation() {
        if (isMoving === false && spriteInterval) {
            clearInterval(spriteInterval);
            spriteInterval = null;
            frameX = 0;
            updatePlayerSprite();
        }
    }

    // === SONS DOS PASSOS ===
    function playStepSound() {
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play().catch(e => console.log("Erro ao reproduzir som:", e));
        }
    }

    // === CONTROLE DO SOM DE FUNDO ===
    function initializeBackgroundMusic() {
        if (backgroundMusic) {
            backgroundMusic.volume = volume;
            // Tenta reproduzir o som de fundo (pode precisar de interação do usuário)
            const playMusic = () => {
                backgroundMusic.play().catch(e => {
                    console.log("Reprodução automática bloqueada:", e);
                    // Remove o event listener após a primeira tentativa
                    document.removeEventListener('click', playMusic);
                    document.removeEventListener('keydown', playMusic);
                });
            };
            
            // Tenta reproduzir quando o usuário interagir com a página
            document.addEventListener('click', playMusic, { once: true });
            document.addEventListener('keydown', playMusic, { once: true });
            
            // Tenta reproduzir automaticamente após um tempo
            setTimeout(playMusic, 1000);
        }
    }

    // Função para ajustar o volume
    function setVolume(newVolume) {
        volume = Math.max(0, Math.min(1, newVolume)); // Garante que está entre 0 e 1
        if (backgroundMusic) {
            backgroundMusic.volume = volume;
        }
        if (stepSound) {
            stepSound.volume = volume;
        }
    }
    
  // === CONTROLES DE VOLUME COM TECLAS Z e X ===
document.addEventListener("keydown", (e) => {
    if (taskOverlay.style.display === "flex") return;
    
    const key = e.key.toLowerCase();
    
    if (key === 'x') {
        // Aumentar volume
        e.preventDefault();
        const currentVolume = volume;
        const newVolume = Math.min(1, currentVolume + 0.1);
        setVolume(newVolume);
        volumeSlider.value = newVolume * 100;
        showVolumeNotification(`Volume: ${Math.round(newVolume * 100)}%`);
        showVolumeBar(); // MOSTRA a barra quando usa tecla
    } else if (key === 'z') {
        // Diminuir volume
        e.preventDefault();
        const currentVolume = volume;
        const newVolume = Math.max(0, currentVolume - 0.1);
        setVolume(newVolume);
        volumeSlider.value = newVolume * 100;
        showVolumeNotification(`Volume: ${Math.round(newVolume * 100)}%`);
        showVolumeBar(); // MOSTRA a barra quando usa tecla
    } else if (key === 'm') {
        // Tecla M para mudo
        e.preventDefault();
        toggleMute();
        showVolumeNotification(volume === 0 ? "🔇 Mudo" : `🔊 Volume: ${Math.round(volume * 100)}%`);
        showVolumeBar(); // MOSTRA a barra quando usa tecla
    }
});

// Função para mostrar notificação de volume
function showVolumeNotification(message) {
    // Cria uma notificação temporária
    const volumeNotification = document.createElement("div");
    volumeNotification.className = "volume-notification";
    volumeNotification.textContent = message;
    volumeNotification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 10px 20px;
        border-radius: 10px;
        border: 2px solid #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 1.2rem;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(volumeNotification);
    
    // Animação de fade in/out
    setTimeout(() => {
        volumeNotification.style.opacity = "1";
    }, 10);
    
    setTimeout(() => {
        volumeNotification.style.opacity = "0";
        setTimeout(() => {
            if (volumeNotification.parentNode) {
                volumeNotification.parentNode.removeChild(volumeNotification);
            }
        }, 300);
    }, 1000);
}
    // Função para pausar/retomar a música
    function toggleBackgroundMusic() {
        if (backgroundMusic) {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log("Erro ao reproduzir música:", e));
            } else {
                backgroundMusic.pause();
            }
        }
    }

    // === SISTEMA DE DICAS ===
    function initializeHintSystem() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('hint-toggle')) {
                const hintContent = e.target.nextElementSibling;
                const isVisible = hintContent.classList.contains('show');
                
                if (isVisible) {
                    hintContent.classList.remove('show');
                    e.target.classList.remove('active');
                } else {
                    hintContent.classList.add('show');
                    e.target.classList.add('active');
                }
            }
        });
    }

    // === FUNÇÕES DO MINI MAPA ===
    const mapWorldToMiniMap = (worldX, worldY) => {
        const scaleFactor = miniMapSize / worldWidth;
        let mapX = worldX * scaleFactor;
        let mapY = worldY * scaleFactor;
        const heightOffset = (miniMapSize - worldHeight * scaleFactor) / 2;
        return { x: mapX, y: mapY + heightOffset };
    };

    // Array para controlar a ordem das tasks
    let taskOrder = ["task1", "task2", "task3", "task4", "task5", "task6", "task7", "task8", "task9", "task10"];
    let currentTaskIndex = 0;

    const createMiniMapIcons = () => {
        if (!miniMap) return;
        
        // Remove todos os ícones existentes
        const existingIcons = document.querySelectorAll(".mini-task-icon");
        existingIcons.forEach((icon) => icon.remove());

        // Cria ícones apenas para tasks disponíveis
        for (let i = 0; i <= currentTaskIndex; i++) {
            const taskId = taskOrder[i];
            const obj = document.querySelector(`.interactive-object[data-task="${taskId}"]`);
            
            if (obj) {
                const objWorldX = parseInt(obj.dataset.x, 10);
                const objWorldY = parseInt(obj.dataset.y, 10);
                const { x, y } = mapWorldToMiniMap(objWorldX, objWorldY);
                
                const icon = document.createElement("div");
                icon.className = "mini-task-icon";
                icon.id = `mini-task-${taskId}`;
                icon.style.left = `${x}px`;
                icon.style.top = `${y}px`;
                
                if (solvedTasks[taskId]) {
                    icon.classList.add("solved");
                }
                
                miniMap.appendChild(icon);
            }
        }
    };

    const updateMiniMapTaskStatus = (taskId) => {
        const miniTaskIcon = document.getElementById(`mini-task-${taskId}`);
        if (miniTaskIcon) {
            miniTaskIcon.classList.add("solved");
        }
    };

    const updateMiniPlayer = () => {
        if (!miniPlayer) return;
        const { x, y } = mapWorldToMiniMap(playerX, playerY);
        miniPlayer.style.left = `${x}px`;
        miniPlayer.style.top = `${y}px`;
        updateMiniPlayerDirection();
    };

    // === NOVA FUNÇÃO: Atualizar direção do sprite no mini mapa ===
    const updateMiniPlayerDirection = () => {
        if (!miniPlayer) return;
        
        // Atualiza a posição do background baseado na direção do personagem
        // frameY: 0=baixo, 1=esquerda, 2=direita, 3=cima
        const spriteX = 0; // Sem animação no mini mapa, usa frame estático
        const spriteY = frameY * 25; // 16px é a altura de cada frame no mini mapa
        
        miniPlayer.style.backgroundPosition = `-${spriteX}px -${spriteY}px`;
    };

    // === DADOS DAS TASKS ===
    let solvedTasks = {};
    let currentTask = null;

   const tasksData = {
 task1: {
    title: "Problema: Computador não liga",
    description: "O computador não está respondendo ao botão de energia. Conecte o cabo de força no momento certo!",
    interaction: `<div class="power-connection-game">
        <div class="game-instructions">
            <p>Clique no botão quando o conector estiver alinhado com a tomada!</p>
        </div>
        <div class="game-area">
            <!-- Silhueta do computador atrás da tomada -->
            <div class="computer-silhouette"></div>
            
            <!-- Computador -->
            <div class="computer-background">
                <div class="monitor">
                    <div class="screen"></div>
                </div>
                <div class="cpu">
                    <div class="power-button"></div>
                </div>
            </div>
            
            <!-- Tomada no canto inferior esquerdo do computador -->
            <div class="outlet-container">
                <div class="outlet" id="outlet">
                    <div class="outlet-face">
                        <div class="hole left-hole"></div>
                        <div class="hole right-hole"></div>
                        <div class="ground-hole"></div>
                    </div>
                    <div class="outlet-cover"></div>
                </div>
            </div>
            
            <!-- Conector vindo da esquerda -->
            <div class="plug-container">
                <div class="plug-container">
          <div class="power-cable">
        <div class="cable-wire"></div>
        <div class="plug" id="plug">
            <div class="plug-base"></div>
            <div class="plug-pins">
                <div class="pin left-pin"></div>
                <div class="pin right-pin"></div>
            </div>
            <div class="ground-pin"></div>
            <div class="plug-body">
                <div class="plug-details"></div>
                <div class="plug-brand">ACME</div>
            </div>
        </div>
    </div>
</div>
            </div>
            
            <div class="alignment-guide"></div>
        </div>
        
        <div class="game-controls">
            <button id="connect-btn" class="game-btn">
                <i class="fas fa-bolt"></i> Tentar Conectar
            </button>
            <div class="attempts-counter">
                Tentativas: <span id="attempts">0</span>/3
            </div>
        </div>
        
        <div class="connection-status" id="connection-status">
            <div class="status-light"></div>
            <span>Desconectado</span>
        </div>
        
        <div class="game-feedback" id="game-feedback"></div>
        
        <div class="hint">
            <button class="hint-toggle">
                <i class="fas fa-lightbulb"></i> Mostrar Dicas do Técnico
            </button>
            <div class="hint-content">
                <div class="hint-title">
                    <i class="fas fa-tools"></i> Guia Completo de Solução
                </div>
                
                <div class="hint-section">
                    <strong>🔧 Checklist de Energia</strong>
                    <div class="hint-list">
                        <li>Verifique se a tomada está funcionando</li>
                        <li>Teste o cabo de força em outro equipamento</li>
                        <li>Confirme se a fonte está ligada</li>
                        <li>Verifique estabilizador/no-break</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>📊 Estatísticas do Problema</strong>
                    <p>80% dos casos de "não liga" são relacionados à energia</p>
                    <p>15% são problemas de hardware interno</p>
                    <p>5% são configurações de BIOS/software</p>
                </div>
                
                <div class="hint-tip">
                    <strong>💡 Dica Profissional:</strong> Sempre comece pela fonte de energia externa antes de abrir o equipamento.
                </div>
            </div>
        </div>
    </div>`,
    init: function () {
        const outlet = document.getElementById("outlet");
        const plug = document.getElementById("plug");
        const connectBtn = document.getElementById("connect-btn");
        const attemptsDisplay = document.getElementById("attempts");
        const gameFeedback = document.getElementById("game-feedback");
        const connectionStatus = document.getElementById("connection-status");
        const statusLight = connectionStatus.querySelector('.status-light');
        const statusText = connectionStatus.querySelector('span');
        const powerButton = document.querySelector('.power-button');
        const screen = document.querySelector('.screen');
        
        let attempts = 0;
        let maxAttempts = 3;
        let isMoving = true;
        let animationId;
        let plugPosition = 0;
        let direction = 1;
        const speed = 2;
        const successZone = 40; // Zona de acerto aumentada para ficar mais fácil
        
        function animatePlug() {
            if (!isMoving) return;
            
            plugPosition += speed * direction;
            
            // Inverte a direção quando chega nos limites
            if (plugPosition > 60 || plugPosition < -60) {
                direction *= -1;
            }
            
            plug.style.transform = `translateY(${plugPosition}px)`;
            animationId = requestAnimationFrame(animatePlug);
        }
        
        function checkConnection() {
            const connectionQuality = Math.abs(plugPosition);
            return connectionQuality <= successZone;
        }
        
        function updateConnectionStatus(connected) {
            if (connected) {
                statusLight.classList.add("connected");
                statusText.textContent = "Conectado!";
                connectionStatus.classList.add("connected");
                
                // Atualiza o interruptor do computador
                powerButton.classList.add('power-on');
                screen.classList.add('power-on');
            } else {
                statusLight.classList.remove("connected");
                statusText.textContent = "Desconectado";
                connectionStatus.classList.remove("connected");
            }
        }
        
        function updateGame() {
            attempts++;
            attemptsDisplay.textContent = attempts;
            
            if (checkConnection()) {
                // Conexão bem-sucedida
                gameFeedback.textContent = "Parabéns! Cabo conectado com sucesso!";
                gameFeedback.className = "game-feedback success";
                connectBtn.disabled = true;
                connectBtn.innerHTML = '<i class="fas fa-check"></i> Conectado!';
                isMoving = false;
                cancelAnimationFrame(animationId);
                
                // Adiciona efeito visual de sucesso
                plug.classList.add("connected");
                outlet.classList.add("connected");
                updateConnectionStatus(true);
                
                this.connectionSuccessful = true;
            } else {
                // Conexão falhou
                gameFeedback.textContent = "Timing errado! Tente novamente.";
                gameFeedback.className = "game-feedback error";
                
                // Efeito de erro no plug
                plug.classList.add("error");
                setTimeout(() => plug.classList.remove("error"), 500);
                
                if (attempts >= maxAttempts) {
                    gameFeedback.textContent = "Tentativas esgotadas! Reinicie o jogo.";
                    connectBtn.disabled = true;
                    connectBtn.innerHTML = '<i class="fas fa-redo"></i> Tentativas esgotadas';
                    isMoving = false;
                    cancelAnimationFrame(animationId);
                }
            }
        }
        
        // Inicia a animação
        animatePlug();
        updateConnectionStatus(false);
        
        // Configura o evento do botão
        connectBtn.addEventListener("click", updateGame.bind(this));
        
        // Armazena o estado para validação
        this.connectionSuccessful = false;
    },
    validate: function () {
        return this.connectionSuccessful;
    },

},
    task2: {
        title: "Problema: Conexão de rede lenta",
        description: "A rede está operando com velocidade abaixo do esperado. Identifique as possíveis causas.",
        interaction: `<p>Selecione a provável causa do problema:</p>
            <div class="task-options">
                <div class="task-option" data-correct="false">Problema no monitor</div>
                <div class="task-option" data-correct="true">Roteador sobrecarregado</div>
                <div class="task-option" data-correct="false">Falta de papel na impressora</div>
                <div class="task-option" data-correct="true">Interferência de outros dispositivos</div>
            </div>
            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Análise de Rede
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-network-wired"></i> Diagnóstico de Rede
                    </div>
                    
                    <div class="hint-section">
                        <strong>🔍 Causas Comuns de Lentidão</strong>
                        <div class="hint-list">
                            <li>Roteador sobrecarregado com muitos dispositivos</li>
                            <li>Interferência de micro-ondas e telefones sem fio</li>
                            <li>Cabos de rede danificados ou de baixa qualidade</li>
                            <li>Servidor DNS lento ou com problemas</li>
                            <li>Limitação do provedor de internet</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>📊 Soluções Recomendadas</strong>
                        <div class="hint-list">
                            <li>Reinicie o roteador e modem</li>
                            <li>Use cabo Ethernet em vez de Wi-Fi para dispositivos críticos</li>
                            <li>Altere o canal do Wi-Fi no roteador</li>
                            <li>Atualize o firmware do roteador</li>
                            <li>Verifique a qualidade dos cabos de réseau</li>
                        </div>
                    </div>
                    
                    <div class="hint-tip">
                        <strong>💡 Dica Profissional:</strong> Use o comando 'ping' e 'traceroute' para diagnosticar onde está o gargalo na conexão.
                    </div>
                </div>
            </div>`,
        init: function () {
            const options = document.querySelectorAll(".task-option");
            options.forEach((option) => {
                option.addEventListener("click", () => {
                    if (option.dataset.correct === "true") {
                        option.classList.add("correct");
                    } else {
                        option.classList.add("incorrect");
                    }
                });
            });
        },
        validate: function () {
            const correctOptions = document.querySelectorAll('.task-option[data-correct="true"]');
            const selectedCorrect = document.querySelectorAll(".task-option.correct");
            return correctOptions.length === selectedCorrect.length;
        },
    },
    task3: {
        title: "Problema: Impressora não imprime",
        description: "A impressora está com luz piscando e não responde aos comandos. Realize o troubleshooting.",
        interaction: `<p>Quais ações você realizaria para resolver o problema?</p>
            <div class="task-options">
                <div class="task-option" data-correct="true">Verificar se há papel na bandeja</div>
                <div class="task-option" data-correct="false">Reiniciar o monitor</div>
                <div class="task-option" data-correct="true">Verificar se o cartucho de tinta está vazio</div>
                <div class="task-option" data-correct="true">Reiniciar a impressora</div>
            </div>
            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Guia de Troubleshooting
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-print"></i> Guia de Impressora
                    </div>
                    
                    <div class="hint-section">
                        <strong>🔄 Processo de Troubleshooting</strong>
                        <div class="hint-list">
                            <li>1. Verificação física: Papel, tinta, cabos, energia</li>
                            <li>2. Reinicialização: Desligue por 30 segundos e ligue novamente</li>
                            <li>3. Drivers: Verifique se os drivers estão atualizados</li>
                            <li>4. Fila de impressão: Limpe a fila de impressão no computador</li>
                            <li>5. Conexão: Teste conexão USB ou rede</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>⚠️ Sinais de Luz Piscando</strong>
                        <p><strong>Luz vermelha piscando:</strong> Sem papel, tinta baixa, papel encravado</p>
                        <p><strong>Luz laranja piscando:</strong> Problema de hardware ou manutenção necessária</p>
                        <p><strong>Luzes alternadas:</strong> Erro específico - consulte o manual</p>
                    </div>
                    
                    <div class="hint-warning">
                        <strong>🚨 Atenção:</strong> Nunca force o papel encravado. Siga as instruções do manual para remoção segura.
                    </div>
                </div>
            </div>`,
        init: function () {
            const options = document.querySelectorAll(".task-option");
            options.forEach((option) => {
                option.addEventListener("click", () => {
                    if (option.dataset.correct === "true") {
                        option.classList.add("correct");
                    } else {
                        option.classList.add("incorrect");
                    }
                });
            });
        },
        validate: function () {
            const correctOptions = document.querySelectorAll('.task-option[data-correct="true"]');
            const selectedCorrect = document.querySelectorAll(".task-option.correct");
            const incorrectSelected = document.querySelectorAll(".task-option.incorrect");
            
            return (
                correctOptions.length === selectedCorrect.length &&
                incorrectSelected.length === 0
            );
        },
    },
   task4: {
    title: "Configuração de Rede Wi-Fi",
    description: "Ajuste o ângulo da antena Wi-Fi para obter o sinal máximo!",
    interaction: `
        <div class="wifi-game">
            <div class="wifi-header">
                <i class="fas fa-wifi"></i> Ajuste o Sinal de Rede
            </div>

            <div class="wifi-meter-container">
                <div class="wifi-meter-bg">
                    <div class="wifi-signal" id="wifi-signal"></div>
                </div>
                <div class="wifi-level-text" id="wifi-level-text">Sinal: 0%</div>
            </div>

            <div class="antenna-area">
                <div class="antenna" id="antenna">
                    <div class="antenna-base"></div>
                    <div class="antenna-arm" id="antenna-arm"></div>
                </div>
            </div>

            <input type="range" id="antenna-slider" min="0" max="180" value="90" class="antenna-slider"/>

            <div class="wifi-status" id="wifi-status">
                Ajuste a antena para encontrar o melhor sinal.
            </div>

            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Dicas Técnicas
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-satellite"></i> Otimização de Sinal Wi-Fi
                    </div>
                    
                    <div class="hint-section">
                        <strong>📡 Posicionamento Ideal da Antena</strong>
                        <div class="hint-list">
                            <li>Antenas verticais para cobertura horizontal</li>
                            <li>Antenas horizontais para cobertura vertical</li>
                            <li>Evite obstruções como paredes e metais</li>
                            <li>Posicione no centro da área de cobertura</li>
                            <li>Altura ideal: 1,5 a 2 metros do chão</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>🔧 Fatores que Afetam o Sinal</strong>
                        <div class="hint-list">
                            <li>Interferência de outros dispositivos 2.4GHz</li>
                            <li>Espessura e material das paredes</li>
                            <li>Distância do roteador</li>
                            <li>Número de dispositivos conectados</li>
                            <li>Qualidade do hardware do roteador</li>
                        </div>
                    </div>
                    
                    <div class="hint-tip">
                        <strong>💡 Dica Avançada:</strong> Use o aplicativo WiFi Analyzer no smartphone para visualizar a intensidade do sinal em tempo real.
                    </div>
                </div>
            </div>
        </div>
    `,
    init: function () {
        const slider = document.getElementById("antenna-slider");
        const antennaArm = document.getElementById("antenna-arm");
        const signalBar = document.getElementById("wifi-signal");
        const signalText = document.getElementById("wifi-level-text");
        const status = document.getElementById("wifi-status");

        let angle = 90;
        let signal = 0;
        let targetAngle = Math.floor(Math.random() * 181); // ponto ótimo aleatório
        this.success = false;

        function updateDisplay() {
            antennaArm.style.transform = `rotate(${angle - 90}deg)`;
            signal = Math.max(0, 100 - Math.abs(targetAngle - angle));
            signalBar.style.width = `${signal}%`;
            signalText.textContent = `Sinal: ${Math.floor(signal)}%`;

            if (signal >= 95) {
                status.textContent = "📶 Sinal Perfeito!";
                status.className = "wifi-status success";
            } else if (signal >= 70) {
                status.textContent = "👍 Bom sinal, continue ajustando...";
                status.className = "wifi-status medium";
            } else {
                status.textContent = "📡 Sinal fraco, tente outro ângulo.";
                status.className = "wifi-status weak";
            }
        }

        slider.addEventListener("input", () => {
            angle = parseInt(slider.value);
            updateDisplay();
        });

        // Verificação automática de vitória
        const checkInterval = setInterval(() => {
            if (signal >= 98) {
                this.success = true;
                clearInterval(checkInterval);
                status.textContent = "✅ Sinal máximo alcançado!";
                status.className = "wifi-status success";
            }
        }, 300);

        updateDisplay();
    },
    validate: function () {
        return this.success === true;
    }
},

   task5: {
    title: "Atualização Pendente",
    description: "O sistema está aplicando uma atualização crítica. Clique exatamente quando a barra atingir 100% para concluir com sucesso!",
    interaction: `
        <div class="update-game">
            <div class="update-header">
                <i class="fas fa-sync-alt fa-spin"></i> Atualizando o Sistema...
            </div>
            <div class="update-bar-container">
                <div class="update-bar" id="update-bar"></div>
                <div class="update-bar-text" id="update-bar-text">0%</div>
            </div>
            <div class="update-controls">
                <button id="stop-update-btn" class="game-btn">
                    <i class="fas fa-hand-pointer"></i> Parar Atualização
                </button>
            </div>
            <div class="update-status" id="update-status">
                A atualização está em andamento...
            </div>
            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Dicas de Deploy
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-server"></i> Gerenciamento de Atualizações
                    </div>
                    
                    <div class="hint-section">
                        <strong>🚀 Melhores Práticas de Deploy</strong>
                        <div class="hint-list">
                            <li>Faça backup completo antes de qualquer atualização</li>
                            <li>Teste em ambiente de homologação primeiro</li>
                            <li>Agende atualizações para horários de baixo uso</li>
                            <li>Comunique os usuários com antecedência</li>
                            <li>Tenha um plano de rollback preparado</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>⏰ Timing Crítico</strong>
                        <p>O timing correto é essencial em:</p>
                        <div class="hint-list">
                            <li>Atualizações de banco de dados</li>
                            <li>Migrações de sistema</li>
                            <li>Deploy de aplicações críticas</li>
                            <li>Atualizações de segurança</li>
                        </div>
                    </div>
                    
                    <div class="hint-warning">
                        <strong>⚠️ Cuidado:</strong> Interromper uma atualização no momento errado pode corromper o sistema e cause downtime prolongado.
                    </div>
                </div>
            </div>
        </div>
    `,
    init: function () {
        const updateBar = document.getElementById("update-bar");
        const updateText = document.getElementById("update-bar-text");
        const stopBtn = document.getElementById("stop-update-btn");
        const status = document.getElementById("update-status");

        let progress = 0;
        let direction = 1;
        let interval;
        this.success = false;

        function updateBarDisplay() {
            updateBar.style.width = `${progress}%`;
            updateText.textContent = `${Math.floor(progress)}%`;
        }

        function startRandomMovement() {
            interval = setInterval(() => {
                // Movimento aleatório e dinâmico
                const randomChange = Math.random() * 8 + 2; // 2–10%
                progress += randomChange * direction;

                // Inverte direção ao atingir limites
                if (progress >= 100) {
                    progress = 100;
                    direction = -1;
                } else if (progress <= 0) {
                    progress = 0;
                    direction = 1;
                }

                updateBarDisplay();
            }, 50);
        }

        stopBtn.addEventListener("click", () => {
            clearInterval(interval);
            const difference = Math.abs(progress - 100);

            if (difference <= 2) {
                status.textContent = "✅ Atualização concluída com sucesso!";
                status.className = "update-status success";
                this.success = true;
            } else {
                status.textContent = `❌ Falhou! A barra estava em ${Math.floor(progress)}%.`;
                status.className = "update-status fail";
                this.success = false;
            }

            stopBtn.disabled = true;
            stopBtn.innerHTML = `<i class="fas fa-redo"></i> Reiniciar`;
            stopBtn.addEventListener("click", () => location.reload(), { once: true });
        });

        updateBarDisplay();
        startRandomMovement();
    },
    validate: function () {
        return this.success === true;
    }
},

task6: {
    title: "Problema: Backup Corrompido - Recuperação de Dados",
    description: "O servidor sofreu uma falha e os arquivos de backup foram fragmentados! Reconstrua os blocos de dados para restaurar o sistema.",
    interaction: `<div class="backup-recovery-game">
        <div class="game-instructions">
            <div class="server-status">
                <div class="status-indicator" id="server-status">
                    <div class="status-light"></div>
                    <span>SERVIDOR OFFLINE</span>
                </div>
                <div class="data-integrity">
                    <span>Integridade do Backup:</span>
                    <div class="integrity-bar">
                        <div class="integrity-fill" id="integrity-fill"></div>
                    </div>
                    <span id="integrity-percent">0%</span>
                </div>
            </div>
            <p>🔧 <strong>RECUPERAÇÃO DE DADOS EM ANDAMENTO</strong></p>
            <p>Organize os blocos de dados corrompidos para reconstruir os arquivos do sistema</p>
            <p><strong>Controles:</strong> A/D = Mover | W = Girar | S = Descer Rápido (Clique ou Segure)</p>
            <p><strong>Objetivo:</strong> Complete 6 linhas para restaurar o backup!</p>
        </div>
        
        <div class="game-area-container">
            <div class="server-terminal">
                <div class="terminal-header">
                    <div class="terminal-buttons">
                        <div class="terminal-btn close"></div>
                        <div class="terminal-btn minimize"></div>
                        <div class="terminal-btn maximize"></div>
                    </div>
                    <span class="terminal-title">Sistema de Recuperação - Backup_Corrompido.exe</span>
                </div>
                <div class="terminal-body">
                    <div class="log-line">> Inicializando módulo de recuperação...</div>
                    <div class="log-line">> Scanning backup fragments...</div>
                    <div class="log-line">> <span id="current-action">Aguardando inicialização</span></div>
                </div>
            </div>
            
            <div class="game-main">
                <div class="game-info-panel">
                    <div class="info-card">
                        <div class="info-icon">💾</div>
                        <div class="info-content">
                            <span class="info-label">Blocos Recuperados</span>
                            <span class="info-value" id="completed-lines">0/6</span>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-icon">⚡</div>
                        <div class="info-content">
                            <span class="info-label">Velocidade</span>
                            <span class="info-value" id="current-level">Normal</span>
                        </div>
                    </div>
                    
                    <div class="next-block-section">
                        <span class="section-title">PRÓXIMO FRAGMENTO</span>
                        <div id="next-block-preview" class="fragment-preview"></div>
                    </div>
                </div>
                
                <div class="game-board-container">
                    <div class="board-frame">
                        <div class="board-label">RECONSTRUÇÃO DE DADOS</div>
                        <div class="game-board" id="game-board">
                            <!-- O tabuleiro será gerado dinamicamente pelo JavaScript -->
                        </div>
                        <div class="board-overlay" id="board-overlay">
                            <div class="overlay-content">
                                <div class="overlay-icon">💾</div>
                                <div class="overlay-text">SISTEMA DE RECUPERAÇÃO</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="game-controls">
            <button id="start-game-btn" class="game-btn server-btn">
                <i class="fas fa-server"></i> INICIAR RECUPERAÇÃO
            </button>
            <button id="pause-game-btn" class="game-btn server-btn" disabled>
                <i class="fas fa-pause"></i> PAUSAR PROCESSO
            </button>
            <button id="reset-game-btn" class="game-btn server-btn">
                <i class="fas fa-redo"></i> REINICIAR SISTEMA
            </button>
        </div>
        
        <div class="game-status" id="game-status">
            <div class="status-content">
                <i class="fas fa-info-circle"></i>
                <span>Sistema de recuperação pronto para inicialização</span>
            </div>
        </div>
        
        <div class="hint">
            <button class="hint-toggle">
                <i class="fas fa-lightbulb"></i> Mostrar Contexto Técnico
            </button>
            <div class="hint-content">
                <div class="hint-title">
                    <i class="fas fa-database"></i> Recuperação de Backup
                </div>
                
                <div class="hint-section">
                    <strong>🔄 Processo de Restauração</strong>
                    <div class="hint-list">
                        <li>Dados corrompidos exigem reconstrução fragmentada</li>
                        <li>Verificação de checksums e integridade</li>
                        <li>Recuperação setor-a-setor quando necessário</li>
                        <li>Reconstrução de metadados e estruturas de arquivo</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>⚠️ Causas Comuns de Corrupção</strong>
                    <div class="hint-list">
                        <li>Falha de hardware (HDD/SSD)</li>
                        <li>Corrupção de mídia de backup</li>
                        <li>Interrupção durante o processo de backup</li>
                        <li>Vírus ou malware</li>
                        <li>Problemas de energia durante operações críticas</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>🛡️ Estratégias de Prevenção</strong>
                    <div class="hint-list">
                        <li>Checksums regulares dos backups</li>
                        <li>Backups validados periódicamente</li>
                        <li>Storage redundante (RAID)</li>
                        <li>Múltiplas cópias em locais diferentes</li>
                        <li>Testes regulares de restauração</li>
                    </div>
                </div>
                
                <div class="hint-success">
                    <strong>✅ Objetivo:</strong> Restaurar 100% da integridade dos dados para retomar operações normais com perda mínima.
                </div>
            </div>
        </div>
    </div>`,
    init: function () {
        // Configurações do jogo
        const BOARD_WIDTH = 10;
        const BOARD_HEIGHT = 20;
        const BLOCK_SIZE = 25;
        const LINES_NEEDED = 6; // Reduzido de 15 para 6
        
        // Elementos do DOM
        const gameBoard = document.getElementById("game-board");
        const nextBlockPreview = document.getElementById("next-block-preview");
        const completedLinesDisplay = document.getElementById("completed-lines");
        const currentLevelDisplay = document.getElementById("current-level");
        const startBtn = document.getElementById("start-game-btn");
        const pauseBtn = document.getElementById("pause-game-btn");
        const resetBtn = document.getElementById("reset-game-btn");
        const gameStatus = document.getElementById("game-status");
        const serverStatus = document.getElementById("server-status");
        const integrityFill = document.getElementById("integrity-fill");
        const integrityPercent = document.getElementById("integrity-percent");
        const currentAction = document.getElementById("current-action");
        const boardOverlay = document.getElementById("board-overlay");
        const terminalBody = document.querySelector('.terminal-body');
        
        // Estado do jogo
        let board = [];
        let currentBlock = null;
        let nextBlock = null;
        let gameInterval = null;
        let isPaused = false;
        let isGameOver = false;
        let completedLines = 0;
        let dropSpeed = 800; // Velocidade base
        let keysPressed = {};
        let fastDropInterval = null;
        
        // VARIÁVEL DE CONTROLE PARA VALIDAÇÃO - ADICIONADA
        let gameCompleted = false;
        
        // Blocos temáticos de TI/Backup
        const BLOCKS = [
            { 
                shape: [[1, 1, 1, 1]], 
                color: "#3498db", 
                name: "Database",
                type: "SQL"
            },
            { 
                shape: [[1, 1], [1, 1]], 
                color: "#9b59b6", 
                name: "Archive",
                type: "ZIP"
            },
            { 
                shape: [[0, 1, 0], [1, 1, 1]], 
                color: "#e74c3c", 
                name: "Log",
                type: "LOG"
            },
            { 
                shape: [[1, 1, 0], [0, 1, 1]], 
                color: "#2ecc71", 
                name: "Config",
                type: "CFG"
            },
            { 
                shape: [[0, 1, 1], [1, 1, 0]], 
                color: "#f39c12", 
                name: "Backup",
                type: "BAK"
            }
        ];
        
        // Funções de tema
        function updateServerStatus(online) {
            const statusLight = serverStatus.querySelector('.status-light');
            const statusText = serverStatus.querySelector('span');
            
            if (online) {
                statusLight.style.background = "#2ecc71";
                statusLight.style.boxShadow = "0 0 10px #2ecc71";
                statusText.textContent = "SERVIDOR ONLINE";
                serverStatus.classList.add('online');
            } else {
                statusLight.style.background = "#e74c3c";
                statusLight.style.boxShadow = "0 0 10px #e74c3c";
                statusText.textContent = "SERVIDOR OFFLINE";
                serverStatus.classList.remove('online');
            }
        }
        
        function updateIntegrityBar(percent) {
            integrityFill.style.width = `${percent}%`;
            integrityPercent.textContent = `${Math.round(percent)}%`;
            
            if (percent < 30) {
                integrityFill.style.background = "#e74c3c";
            } else if (percent < 70) {
                integrityFill.style.background = "#f39c12";
            } else {
                integrityFill.style.background = "#2ecc71";
            }
        }
        
        function addTerminalLog(message) {
            const logLine = document.createElement('div');
            logLine.className = 'log-line';
            logLine.innerHTML = `> ${message}`;
            terminalBody.appendChild(logLine);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        
        function updateCurrentAction(action) {
            currentAction.textContent = action;
        }
        
        // Inicializar o tabuleiro
        function initializeBoard() {
            board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
            renderBoard();
            boardOverlay.style.display = 'flex';
        }
        
        // Renderizar o tabuleiro
        function renderBoard() {
            gameBoard.innerHTML = '';
            gameBoard.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`;
            gameBoard.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, ${BLOCK_SIZE}px)`;
            gameBoard.style.width = `${BOARD_WIDTH * BLOCK_SIZE}px`;
            gameBoard.style.height = `${BOARD_HEIGHT * BLOCK_SIZE}px`;
            
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.style.width = `${BLOCK_SIZE}px`;
                    cell.style.height = `${BLOCK_SIZE}px`;
                    
                    if (board[y][x]) {
                        cell.style.background = board[y][x];
                        cell.classList.add('filled', 'data-block');
                        
                        // Adicionar efeito de "dados"
                        if (Math.random() > 0.7) {
                            cell.classList.add('data-glitch');
                        }
                    } else {
                        // Fundo do tabuleiro com padrão de circuito
                        if ((x + y) % 4 === 0) {
                            cell.classList.add('circuit-pattern');
                        }
                    }
                    
                    gameBoard.appendChild(cell);
                }
            }
            
            if (currentBlock) {
                renderCurrentBlock();
            }
        }
        
        // Renderizar o bloco atual
        function renderCurrentBlock() {
            document.querySelectorAll('.current-block').forEach(el => el.remove());
            
            const { shape, color, x, y } = currentBlock;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const blockX = x + col;
                        const blockY = y + row;
                        
                        if (blockY >= 0) {
                            const cell = document.createElement('div');
                            cell.className = 'cell current-block active-data';
                            cell.style.width = `${BLOCK_SIZE}px`;
                            cell.style.height = `${BLOCK_SIZE}px`;
                            cell.style.background = color;
                            cell.style.gridColumn = blockX + 1;
                            cell.style.gridRow = blockY + 1;
                            cell.style.position = 'absolute';
                            cell.setAttribute('data-type', currentBlock.name);
                            
                            gameBoard.appendChild(cell);
                        }
                    }
                }
            }
        }
        
        // Gerar um bloco aleatório
        function getRandomBlock() {
            const randomIndex = Math.floor(Math.random() * BLOCKS.length);
            return JSON.parse(JSON.stringify(BLOCKS[randomIndex])); // Deep copy
        }
        
        // Inicializar um novo bloco
        function createNewBlock() {
            if (!nextBlock) {
                nextBlock = getRandomBlock();
            }
            
            currentBlock = {
                ...nextBlock,
                x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextBlock.shape[0].length / 2),
                y: 0
            };
            
            nextBlock = getRandomBlock();
            renderNextBlockPreview();
            updateCurrentAction(`Processando fragmento: ${currentBlock.name}.${currentBlock.type}`);
            
            // Verificar colisão imediata (game over)
            if (checkCollision(currentBlock.shape, currentBlock.x, currentBlock.y)) {
                endGame(false);
                return false;
            }
            
            return true;
        }
        
        // Renderizar preview do próximo bloco
        function renderNextBlockPreview() {
            nextBlockPreview.innerHTML = '';
            nextBlockPreview.style.gridTemplateColumns = `repeat(4, 20px)`;
            nextBlockPreview.style.gridTemplateRows = `repeat(4, 20px)`;
            nextBlockPreview.style.width = '80px';
            nextBlockPreview.style.height = '80px';
            nextBlockPreview.style.display = 'grid';
            nextBlockPreview.style.gap = '2px';
            
            const { shape, color, name, type } = nextBlock;
            
            // Adicionar label
            const label = document.createElement('div');
            label.className = 'fragment-label';
            label.textContent = `${name}.${type}`;
            label.style.position = 'absolute';
            label.style.top = '-20px';
            label.style.left = '50%';
            label.style.transform = 'translateX(-50%)';
            label.style.background = '#3498db';
            label.style.color = 'white';
            label.style.padding = '2px 8px';
            label.style.borderRadius = '10px';
            label.style.fontSize = '10px';
            label.style.fontFamily = 'Courier New, monospace';
            nextBlockPreview.appendChild(label);
            
            // Criar células do preview
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell fragment-cell';
                    cell.style.width = '20px';
                    cell.style.height = '20px';
                    cell.style.background = 'rgba(255, 255, 255, 0.05)';
                    cell.style.borderRadius = '2px';
                    
                    if (row < shape.length && col < shape[row].length && shape[row][col]) {
                        cell.style.background = color;
                        cell.classList.add('filled');
                        cell.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                    }
                    
                    nextBlockPreview.appendChild(cell);
                }
            }
        }
        
        // Verificar colisão
        function checkCollision(shape, x, y) {
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const newX = x + col;
                        const newY = y + row;
                        
                        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                            return true;
                        }
                        
                        if (newY >= 0 && board[newY][newX]) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        
        // Mover bloco para baixo
        function moveDown() {
            if (isPaused || isGameOver) return true;
            
            if (!checkCollision(currentBlock.shape, currentBlock.x, currentBlock.y + 1)) {
                currentBlock.y++;
                renderBoard();
                return true;
            } else {
                fixBlock();
                clearLines();
                return createNewBlock();
            }
        }
        
        // Mover bloco para os lados
        function moveSideways(direction) {
            if (isPaused || isGameOver) return;
            
            const newX = currentBlock.x + direction;
            if (!checkCollision(currentBlock.shape, newX, currentBlock.y)) {
                currentBlock.x = newX;
                renderBoard();
            }
        }
        
        // Rotacionar bloco
        function rotateBlock() {
            if (isPaused || isGameOver) return;
            
            const newShape = [];
            for (let i = 0; i < currentBlock.shape[0].length; i++) {
                newShape.push([]);
                for (let j = currentBlock.shape.length - 1; j >= 0; j--) {
                    newShape[i].push(currentBlock.shape[j][i]);
                }
            }
            
            if (!checkCollision(newShape, currentBlock.x, currentBlock.y)) {
                currentBlock.shape = newShape;
                renderBoard();
            }
        }
        
        // Função para descida rápida
        function fastDrop() {
            if (isPaused || isGameOver || !currentBlock) return;
            
            // Move o bloco para baixo imediatamente
            if (!checkCollision(currentBlock.shape, currentBlock.x, currentBlock.y + 1)) {
                currentBlock.y++;
                renderBoard();
            } else {
                // Se não pode mover mais, fixa o bloco
                fixBlock();
                clearLines();
                createNewBlock();
            }
        }
        
        // Fixar bloco no tabuleiro
        function fixBlock() {
            const { shape, color, x, y, name } = currentBlock;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const boardY = y + row;
                        const boardX = x + col;
                        
                        if (boardY >= 0) {
                            board[boardY][boardX] = color;
                        }
                    }
                }
            }
        }
        
        // Limpar linhas completas
        function clearLines() {
            let linesCleared = 0;
            
            for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                if (board[y].every(cell => cell !== 0)) {
                    // Remove a linha completa
                    board.splice(y, 1);
                    board.unshift(Array(BOARD_WIDTH).fill(0));
                    linesCleared++;
                    y++; // Re-verifica a mesma posição
                }
            }
            
            if (linesCleared > 0) {
                completedLines += linesCleared;
                const progress = Math.min(100, (completedLines / LINES_NEEDED) * 100);
                
                completedLinesDisplay.textContent = `${completedLines}/${LINES_NEEDED}`;
                updateIntegrityBar(progress);
                
                addTerminalLog(`✅ ${linesCleared} linha(s) de dados recuperadas! Integridade: ${Math.round(progress)}%`);
                
                // Atualizar velocidade conforme progresso
                if (completedLines >= 3) {
                    dropSpeed = 500;
                    currentLevelDisplay.textContent = "Rápido";
                }
                if (completedLines >= 5) {
                    dropSpeed = 300;
                    currentLevelDisplay.textContent = "Muito Rápido";
                }
                
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, dropSpeed);
                }
                
                // Verificar vitória - CORREÇÃO AQUI
                if (completedLines >= LINES_NEEDED) {
                    endGame(true);
                }
                
                renderBoard();
            }
        }
        
        // Loop principal do jogo
        function gameLoop() {
            moveDown();
        }
        
        // Iniciar jogo
        function startGame() {
            if (gameInterval) return;
            
            initializeBoard();
            completedLines = 0;
            dropSpeed = 800;
            isGameOver = false;
            isPaused = false;
            keysPressed = {};
            gameCompleted = false; // Reset da variável de controle
            
            completedLinesDisplay.textContent = `0/${LINES_NEEDED}`;
            currentLevelDisplay.textContent = "Normal";
            updateIntegrityBar(0);
            updateServerStatus(true);
            
            terminalBody.innerHTML = '';
            addTerminalLog('Inicializando módulo de recuperação...');
            addTerminalLog('Scanning backup fragments...');
            addTerminalLog('Sistema de reconstrução ativo');
            
            nextBlock = getRandomBlock();
            if (!createNewBlock()) {
                return; // Game over imediato
            }
            
            boardOverlay.style.display = 'none';
            
            gameInterval = setInterval(gameLoop, dropSpeed);
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            
            gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Recuperação em andamento - Complete 6 linhas para restaurar o sistema</span>';
            gameStatus.className = "game-status active";
        }
        
        // Pausar/continuar jogo
        function togglePause() {
            if (isGameOver) return;
            
            isPaused = !isPaused;
            
            if (isPaused) {
                clearInterval(gameInterval);
                if (fastDropInterval) {
                    clearInterval(fastDropInterval);
                    fastDropInterval = null;
                }
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> RETOMAR PROCESSO';
                gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-pause"></i><span>Processo de recuperação pausado</span>';
                addTerminalLog('❌ Processo interrompido pelo usuário');
            } else {
                gameInterval = setInterval(gameLoop, dropSpeed);
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSAR PROCESSO';
                gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Recuperação em andamento</span>';
                addTerminalLog('↩️ Retomando processo de recuperação...');
            }
        }
        
        // Reiniciar jogo
        function resetGame() {
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            if (fastDropInterval) {
                clearInterval(fastDropInterval);
                fastDropInterval = null;
            }
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSAR PROCESSO';
            
            gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-info-circle"></i><span>Sistema de recuperação pronto para inicialização</span>';
            gameStatus.className = "game-status";
            
            updateServerStatus(false);
            updateIntegrityBar(0);
            
            initializeBoard();
            nextBlockPreview.innerHTML = '';
            completedLinesDisplay.textContent = `0/${LINES_NEEDED}`;
            currentLevelDisplay.textContent = 'Normal';
            keysPressed = {};
            gameCompleted = false; // Reset da variável de controle
            
            addTerminalLog('Sistema reinicializado');
        }
        
        // Finalizar jogo - CORREÇÃO AQUI
        function endGame(success) {
            isGameOver = true;
            
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            if (fastDropInterval) {
                clearInterval(fastDropInterval);
                fastDropInterval = null;
            }
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            keysPressed = {};
            
            if (success) {
                gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-check-circle"></i><span>✅ BACKUP RECUPERADO COM SUCESSO! Sistema restaurado!</span>';
                gameStatus.className = "game-status success";
                addTerminalLog('🎉 RECUPERAÇÃO BEM-SUCEDIDA! Todos os dados restaurados!');
                addTerminalLog('Sistema pronto para retomar operações normais');
                
                // CORREÇÃO CRÍTICA: Atualizar a variável de controle
                gameCompleted = true;
                
                // Adicionar botão de conclusão manual para garantir
                const manualCompleteBtn = document.createElement('button');
                manualCompleteBtn.className = 'game-btn server-btn';
                manualCompleteBtn.style.marginTop = '10px';
                manualCompleteBtn.innerHTML = '<i class="fas fa-check"></i> CONCLUIR TAREFA';
                manualCompleteBtn.onclick = function() {
                    gameCompleted = true;
                    manualCompleteBtn.disabled = true;
                    manualCompleteBtn.innerHTML = '<i class="fas fa-check"></i> TAREFA CONCLUÍDA!';
                };
                
                const gameControls = document.querySelector('.game-controls');
                if (!document.getElementById('manual-complete-btn')) {
                    manualCompleteBtn.id = 'manual-complete-btn';
                    gameControls.appendChild(manualCompleteBtn);
                }
                
            } else {
                gameStatus.querySelector('.status-content').innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>❌ FALHA NA RECUPERAÇÃO! Dados irrecuperáveis detectados</span>';
                gameStatus.className = "game-status error";
                addTerminalLog('💥 CRITICAL FAILURE! Dados corrompidos além da recuperação');
                addTerminalLog('Recomendado: Restaurar from backup alternativo');
                gameCompleted = false;
            }
        }
        
        // Controles de teclado
        function handleKeyPress(e) {
            if (isPaused || isGameOver || !currentBlock) return;
            
            const key = e.key.toLowerCase();
            
            switch(key) {
                case 'a': // Mover para esquerda
                    moveSideways(-1);
                    break;
                case 'd': // Mover para direita
                    moveSideways(1);
                    break;
                case 'w': // Girar
                    rotateBlock();
                    break;
                case 's': // Descida rápida - clicar ou segurar
                    fastDrop(); // Move imediatamente ao clicar
                    
                    // Se ainda não existe intervalo de descida rápida, cria um
                    if (!fastDropInterval) {
                        fastDropInterval = setInterval(() => {
                            if (keysPressed['s'] && !isPaused && !isGameOver) {
                                fastDrop(); // Continua descendo rápido enquanto S está pressionado
                            } else {
                                // Se S não está mais pressionado, limpa o intervalo
                                clearInterval(fastDropInterval);
                                fastDropInterval = null;
                            }
                        }, 100); // Muito rápido - 100ms
                    }
                    break;
            }
        }
        
        // Função para lidar com keydown (para segurar)
        function handleKeyDown(e) {
            const key = e.key.toLowerCase();
            keysPressed[key] = true;
        }
        
        // Função para lidar com keyup
        function handleKeyUp(e) {
            const key = e.key.toLowerCase();
            keysPressed[key] = false;
            
            if (key === 's' && fastDropInterval) {
                clearInterval(fastDropInterval);
                fastDropInterval = null;
            }
        }
        
        // Inicializar eventos
        startBtn.addEventListener('click', startGame.bind(this));
        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', resetGame);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('keypress', handleKeyPress);
        
        // Inicialização inicial
        initializeBoard();
        updateServerStatus(false);
        
        // CORREÇÃO: Armazenar referência para validação
        this.getGameCompleted = function() {
            return gameCompleted;
        };
    },
    validate: function () {
        // CORREÇÃO: Usar a função getter para acessar o estado atual
        return this.getGameCompleted ? this.getGameCompleted() : false;
    },



    },
    task7: {
        title: "Problema: Diagnóstico de Servidor Linux",
        description: "Use comandos de terminal para diagnosticar problemas de performance no servidor Ubuntu.",
        interaction: `<div class="terminal-game">
            <div class="terminal" id="terminal-output">
                <div class="terminal-line">Servidor: Ubuntu 20.04 LTS</div>
                <div class="terminal-line">Problema reportado: Alta utilização de CPU</div>
                <div class="terminal-line">Digite comandos para diagnosticar:</div>
                <div class="terminal-line terminal-output" id="cmd-output"></div>
                <div class="terminal-input">
                    <span class="terminal-prompt">$</span>
                    <input type="text" class="terminal-cmd" id="terminal-input" placeholder="Digite um comando...">
                </div>
            </div>
            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Guia de Comandos
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-terminal"></i> Comandos Linux Essenciais
                    </div>
                    
                    <div class="hint-section">
                        <strong>📊 Monitoramento de Sistema</strong>
                        <div class="hint-code">
                            top          # Monitora processos em tempo real<br>
                            htop         # Versão melhorada do top<br>
                            ps aux       # Lista todos os processos<br>
                            uptime       # Tempo online e carga do sistema
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>💾 Uso de Disco e Memória</strong>
                        <div class="hint-code">
                            df -h        # Uso de disco (legível)<br>
                            free -h      # Uso de memória RAM e swap<br>
                            iostat       # Estatísticas de I/O
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>🌐 Diagnóstico de Rede</strong>
                        <div class="hint-code">
                            netstat      # Conexões de réseau<br>
                            ping         # Teste de conectividade<br>
                            traceroute   # Rastreamento de rota
                        </div>
                    </div>
                    
                    <div class="hint-tip">
                        <strong>💡 Dica Profissional:</strong> Use 'grep' para filtrar resultados, ex: 'ps aux | grep python' para encontrar processos Python.
                    </div>
                </div>
            </div>
        </div>`,
        init: function () {
            const terminalInput = document.getElementById("terminal-input");
            const terminalOutput = document.getElementById("cmd-output");
            const commands = {
                "top": "Mostrando processos ativos...\nPID USER    PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n1234 user    20   0  123456  78901   5678 R  85.2   2.1   1:23.45 node\n5678 user    20   0   98765  43210   1234 S  12.1   1.2   0:12.34 python",
                "ps aux": "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nuser      1234 85.2  2.1 123456 78901 ?        R    10:30   1:23 node app.js\nuser      5678 12.1  1.2  98765 43210 ?        S    10:25   0:12 python script.py",
                "df -h": "Sist. Arq.      Tam. Usado Disp. Uso% Montado em\n/dev/sda1        20G   15G  4.5G  77% /\n/dev/sdb1       100G   45G   55G  45% /data",
                "free -h": "              total        used        free      shared  buff/cache   available\nMem:           7.7G        5.2G        1.1G        345M        1.4G        2.0G\nSwap:          2.0G        1.5G        512M",
                "uptime": "10:35:45 up 15 days,  2:30,  1 user,  load average: 2.15, 1.80, 1.50"
            };
            
            const requiredCommands = ["top", "ps aux", "df -h", "free -h"];
            let executedCommands = new Set();
            
            terminalInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    const cmd = terminalInput.value.trim();
                    terminalInput.value = "";
                    
                    if (cmd) {
                        terminalOutput.innerHTML += `<div class="terminal-line">$ ${cmd}</div>`;
                        
                        if (commands[cmd]) {
                            terminalOutput.innerHTML += `<div class="terminal-line terminal-output">${commands[cmd]}</div>`;
                            executedCommands.add(cmd);
                        } else if (cmd === "clear") {
                            terminalOutput.innerHTML = "";
                        } else {
                            terminalOutput.innerHTML += `<div class="terminal-line terminal-error">Comando não reconhecido: ${cmd}</div>`;
                        }
                        
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            });
            
            this.executedCommands = executedCommands;
            this.requiredCommands = requiredCommands;
        },
        validate: function () {
            return this.requiredCommands.every(cmd => this.executedCommands.has(cmd));
        },
    },
task8: {
    title: "Problema: CPU em Superaquecimento",
    description: "A CPU está atingindo temperaturas críticas! Clique rapidamente nos ventiladores para resfriar o processador.",
    interaction: `<div class="cooling-game">
        <div class="cpu-overheating">
            <div class="side-fan">
                <div class="fan-container" id="fan-container">
                    <div class="fan-blades" id="fan-blades">
                        <div class="fan-blade"></div>
                        <div class="fan-blade"></div>
                        <div class="fan-blade"></div>
                        <div class="fan-blade"></div>
                        <div class="fan-center"></div>
                    </div>
                </div>
                <div class="fan-base"></div>
                <div class="fan-speed-indicator" id="fan-speed">Velocidade: Normal</div>
            </div>
            
            <div class="cpu-image">
                <div class="temperature-display">
                    <span id="temperature">80°C</span>
                    <div class="thermometer">
                        <div class="thermometer-fill" id="thermometer-fill"></div>
                    </div>
                </div>
            </div>
            <div class="coolers-container" id="coolers-container"></div>
        </div>
        
        <div class="game-stats">
            <div class="stat">
                <span>Temperatura:</span>
                <span id="current-temp">80°C</span>
            </div>
            <div class="stat">
                <span>Tempo Restante:</span>
                <span id="time-remaining">10s</span>
            </div>
            <div class="stat">
                <span>Coolers Ativos:</span>
                <span id="active-coolers">0</span>
            </div>
        </div>
        
        <div class="game-controls">
            <button id="start-cooling-btn" class="game-btn">
                <i class="fas fa-play"></i> Iniciar Resfriamento
            </button>
        </div>
        
        <div class="game-status" id="cooling-status">
            Clique em "Iniciar Resfriamento" para começar!
        </div>
        
        <div class="hint">
            <button class="hint-toggle">
                <i class="fas fa-lightbulb"></i> Mostrar Guia de Resfriamento
            </button>
            <div class="hint-content">
                <div class="hint-title">
                    <i class="fas fa-thermometer-full"></i> Gerenciamento Térmico
                </div>
                
                <div class="hint-section">
                    <strong>🔥 Causas Comuns de Superaquecimento</strong>
                    <div class="hint-list">
                        <li>Ventiladores entupidos com poeira</li>
                        <li>Pasta térmica ressecada ou mal aplicada</li>
                        <li>Fluxo de ar inadequado no gabinete</li>
                        <li>Overclocking excessivo sem refrigeração adequada</li>
                        <li>Ambiente com temperatura elevada</li>
                        <li>Cooler inadequado para o processador</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>❄️ Soluções Efetivas</strong>
                    <div class="hint-list">
                        <li>Limpeza regular dos ventiladores e heatsinks</li>
                        <li>Troca da pasta térmica a cada 1-2 anos</li>
                        <li>Melhoria do fluxo de ar no gabinete</li>
                        <li>Adição de mais ventiladores ou water cooler</li>
                        <li>Redução do overclock ou undervolting</li>
                        <li>Ambiente com temperatura controlada</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>🌡️ Faixas de Temperatura Ideais</strong>
                    <div class="hint-list">
                        <li><strong>30-60°C:</strong> Normal (verde)</li>
                        <li><strong>60-80°C:</strong> Alerta (amarelo)</li>
                        <li><strong>80°C+:</strong> Crítico (vermelho)</li>
                        <li><strong>100°C+:</strong> Danos permanentes!</li>
                    </div>
                </div>
                
                <div class="hint-warning">
                    <strong>🚨 Atenção:</strong> Temperaturas acima de 80°C por períodos prolongados podem reduzir significativamente a vida útil do processador.
                </div>
            </div>
        </div>
    </div>`,
    init: function () {
        const startBtn = document.getElementById("start-cooling-btn");
        const coolersContainer = document.getElementById("coolers-container");
        const currentTempDisplay = document.getElementById("current-temp");
        const timeDisplay = document.getElementById("time-remaining");
        const activeCoolersDisplay = document.getElementById("active-coolers");
        const gameStatus = document.getElementById("cooling-status");
        const thermometerFill = document.getElementById("thermometer-fill");
        const temperatureDisplay = document.getElementById("temperature");
        const cpuImage = document.querySelector('.cpu-image');
        
        // Elementos da ventoinha
        const fanBlades = document.getElementById("fan-blades");
        const fanContainer = document.getElementById("fan-container");
        const fanSpeedIndicator = document.getElementById("fan-speed");

        // Estado do jogo
        let gameActive = false;
        let temperature = 80;
        let timeRemaining = 10;
        let activeCoolers = 0;
        let gameInterval;
        let coolerInterval;
        let successTime = 0;

        // ✅ Flag salva no próprio objeto da task
        this.gameSuccessful = true;

        function updateFanSpeed() {
            fanBlades.className = "fan-blades";
            fanContainer.className = "fan-container";
            
            if (temperature < 60) {
                fanBlades.classList.add("ultra-fast");
                fanContainer.classList.add("fast-wind");
                fanSpeedIndicator.textContent = "Velocidade: Máxima";
                fanSpeedIndicator.style.color = "#2ecc71";
            } else if (temperature < 70) {
                fanBlades.classList.add("fast");
                fanSpeedIndicator.textContent = "Velocidade: Alta";
                fanSpeedIndicator.style.color = "#3498db";
            } else if (temperature < 80) {
                fanBlades.classList.add("medium");
                fanSpeedIndicator.textContent = "Velocidade: Média";
                fanSpeedIndicator.style.color = "#f39c12";
            } else {
                fanBlades.classList.add("slow");
                fanSpeedIndicator.textContent = "Velocidade: Baixa";
                fanSpeedIndicator.style.color = "#e74c3c";
            }
        }

        function updateDisplays() {
            currentTempDisplay.textContent = `${temperature}°C`;
            timeDisplay.textContent = `${timeRemaining}s`;
            activeCoolersDisplay.textContent = activeCoolers;
            temperatureDisplay.textContent = `${temperature}°C`;

            const fillPercentage = Math.min(100, (temperature / 100) * 100);
            thermometerFill.style.height = `${fillPercentage}%`;

            if (temperature < 60) {
                thermometerFill.style.background = '#2ecc71';
                temperatureDisplay.style.color = '#2ecc71';
                cpuImage.classList.remove('critical', 'hot');
                cpuImage.classList.add('cool');
            } else if (temperature < 80) {
                thermometerFill.style.background = '#f39c12';
                temperatureDisplay.style.color = '#f39c12';
                cpuImage.classList.remove('critical', 'cool');
                cpuImage.classList.add('hot');
            } else {
                thermometerFill.style.background = '#e74c3c';
                temperatureDisplay.style.color = '#e74c3c';
                cpuImage.classList.remove('cool', 'hot');
                cpuImage.classList.add('critical');
            }
            updateFanSpeed();
        }

        function createCooler() {
            if (!gameActive) return;
            
            const cooler = document.createElement('div');
            cooler.className = 'cooler';
            cooler.innerHTML = '<i class="fas fa-fan"></i>';
            
            const x = Math.random() * 85 + 7.5;
            const y = Math.random() * 70 + 15;
            cooler.style.left = `${x}%`;
            cooler.style.top = `${y}%`;
            
            const lifespan = Math.random() * 1200 + 600;
            
            cooler.addEventListener('click', () => {
                if (!gameActive) return;
                
                cooler.classList.add('cooling');
                activeCoolers++;
                temperature = Math.max(30, temperature - 6);
                cooler.style.transform = 'scale(1.3)';
                cooler.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                updateDisplays();
                
                setTimeout(() => {
                    if (cooler.parentNode) {
                        cooler.parentNode.removeChild(cooler);
                        if (cooler.classList.contains('cooling')) {
                            activeCoolers--;
                            updateDisplays();
                        }
                    }
                }, 400);
            });
            
            coolersContainer.appendChild(cooler);
            
            setTimeout(() => {
                if (cooler.parentNode && !cooler.classList.contains('cooling')) {
                    cooler.parentNode.removeChild(cooler);
                    if (gameActive) {
                        temperature = Math.min(100, temperature + 3);
                        updateDisplays();
                    }
                }
            }, lifespan);
        }

        const endGame = (success) => {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(coolerInterval);

            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Tentar Novamente';

            fanBlades.className = "fan-blades stopped";
            fanContainer.className = "fan-container";
            fanSpeedIndicator.textContent = success ? "Sistema Estável" : "Sistema Desligado";
            fanSpeedIndicator.style.color = success ? "#2ecc71" : "#e74c3c";

            if (success) {
                gameStatus.textContent = "INCRÍVEL! Você domou a CPU superaquecida! 🔥❄️";
                gameStatus.className = "game-status success";
                cpuImage.classList.add('cool');
                // ✅ registra vitória no objeto da task
                window.currentTask.gameSuccessful = true;
            } else {
                gameStatus.textContent = "CPU QUEIMOU! 💀";
                gameStatus.className = "game-status error";
                cpuImage.classList.add('critical');
            }

            setTimeout(() => {
                coolersContainer.innerHTML = '';
            }, 1000);
        };

        function startGame() {
            if (gameActive) return;

            gameActive = true;
            temperature = 80;
            activeCoolers = 0;
            successTime = 0;
            this.gameSuccessful = false;

            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Resfriando...';
            gameStatus.textContent = "CLIQUE RÁPIDO! Os ventiladores desaparecem rápido!";
            gameStatus.className = "game-status active";

            coolersContainer.innerHTML = '';
            cpuImage.classList.remove('cool', 'hot', 'critical');
            updateDisplays();

            gameInterval = setInterval(() => {
                if (!gameActive) return;

                temperature = Math.min(100, temperature + 3);

                if (temperature < 60) {
                    successTime++;
                    gameStatus.textContent = `Bom! Mantenha por ${10 - Math.floor(successTime)}s!`;
                    gameStatus.className = "game-status success";
                } else {
                    successTime = Math.max(0, successTime - 0.5);
                    gameStatus.textContent = "RÁPIDO! Clique nos ventiladores!";
                    gameStatus.className = "game-status error";
                }

                if (successTime >= 10) {
                    endGame(true);
                    return;
                }

                if (temperature >= 100) {
                    endGame(false);
                    return;
                }

                updateDisplays();
            }, 1000);

            coolerInterval = setInterval(() => {
                if (gameActive) createCooler();
            }, 700);
        }

        startBtn.addEventListener('click', startGame);
        updateDisplays();
        updateFanSpeed();
    },
    validate: function () {
        return this.gameSuccessful === true;
    },



    },
    task9: {
        title: "Problema: Criptografia de Dados Sensíveis",
        description: "Implemente um sistema seguro de criptografia para proteger informações confidenciais.",
        interaction: `<div class="encryption-game">
            <p>Texto para criptografar:</p>
            <div class="encryption-input">
                <input type="text" id="encryption-input" placeholder="Digite o texto..." value="DadosConfidenciais123">
                <button id="encrypt-btn">Criptografar</button>
            </div>
            <div class="encryption-output" id="encryption-output"></div>
            <p>Selecione o algoritmo de criptografia:</p>
            <div class="encryption-options">
                <button data-algo="aes">AES-256</button>
                <button data-algo="rsa">RSA-2048</button>
                <button data-algo="blowfish">Blowfish</button>
            </div>
            <div class="hint">
                <button class="hint-toggle">
                    <i class="fas fa-lightbulb"></i> Mostrar Guia de Criptografia
                </button>
                <div class="hint-content">
                    <div class="hint-title">
                        <i class="fas fa-lock"></i> Segurança e Criptografia
                    </div>
                    
                    <div class="hint-section">
                        <strong>🔐 AES-256 (Advanced Encryption Standard)</strong>
                        <div class="hint-list">
                            <li>Padrão mundial adotado pelo governo dos EUA</li>
                            <li>Criptografia simétrica - muito rápida e eficiente</li>
                            <li>Chave de 256 bits - praticamente inquebrável</li>
                            <li>Ideal para criptografia de dados em repouso</li>
                            <li>Usado em: VPNs, armazenamento seguro, bancos</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>🔑 RSA-2048 (Rivest-Shamir-Adleman)</strong>
                        <div class="hint-list">
                            <li>Criptografia assimétrica - par de chaves</li>
                            <li>Mais lento que AES, mas essencial para segurança</li>
                            <li>Usado para troca de chaves e certificados digitais</li>
                            <li>Base do SSL/TLS e comunicações seguras</li>
                            <li>Ideal para: HTTPS, SSH, assinaturas digitais</li>
                        </div>
                    </div>
                    
                    <div class="hint-section">
                        <strong>🐠 Blowfish</strong>
                        <div class="hint-list">
                            <li>Algoritmo mais antigo, predecessor do AES</li>
                            <li>Ainda seguro, mas não recomendado para novos sistemas</li>
                            <li>Substituído por AES em maioria das aplicações</li>
                            <li>Usado em alguns sistemas legados</li>
                        </div>
                    </div>
                    
                    <div class="hint-success">
                        <strong>✅ Melhor Prática:</strong> Use AES-256 para dados em repouso e RSA para troca de chaves. Combine ambos para máxima segurança.
                    </div>
                </div>
            </div>
        </div>`,
        init: function () {
            const encryptBtn = document.getElementById("encrypt-btn");
            const encryptionInput = document.getElementById("encryption-input");
            const encryptionOutput = document.getElementById("encryption-output");
            const encryptionOptions = document.querySelectorAll(".encryption-options button");
            
            let selectedAlgorithm = null;
            
            encryptBtn.addEventListener("click", () => {
                const text = encryptionInput.value;
                if (text && selectedAlgorithm) {
                    let encrypted = "";
                    if (selectedAlgorithm === "aes") {
                        encrypted = "U2FsdGVkX1+2k5Z6Z5Qh6N6U9R5T8W1cK7M2vP3xX4yA=";
                    } else if (selectedAlgorithm === "rsa") {
                        encrypted = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...";
                    } else if (selectedAlgorithm === "blowfish") {
                        encrypted = "K7M2vP3xX4yAU2FsdGVkX1+2k5Z6Z5Qh6N6U9R5T8W1c=";
                    }
                    
                    encryptionOutput.textContent = encrypted;
                } else if (!selectedAlgorithm) {
                    encryptionOutput.textContent = "Selecione um algoritmo de criptografia primeiro!";
                    encryptionOutput.className = "encryption-output terminal-error";
                }
            });
            
            encryptionOptions.forEach(option => {
                option.addEventListener("click", function() {
                    encryptionOptions.forEach(opt => opt.classList.remove("active"));
                    this.classList.add("active");
                    selectedAlgorithm = this.getAttribute("data-algo");
                });
            });
            
            this.getSelectedAlgorithm = function() {
                return selectedAlgorithm;
            };
        },
        validate: function () {
            return this.getSelectedAlgorithm() === "aes";
        },
    },
    task10: {
        title: "Problema: Troubleshoot Avançado de Rede",
        description: "Diagnostique e resolva problemas complexos de conectividade em rede corporativa.",
        interaction: `<div class="network-diagram">
            <div class="network-device" id="internet">Internet</div>
            <div class="network-line" id="line1"></div>
            <div class="network-device" id="firewall">Firewall</div>
            <div class="network-line" id="line2"></div>
            <div class="network-device" id="switch">Switch</div>
            <div class="network-line" id="line3"></div>
            <div class="network-device" id="server">Servidor</div>
            <div class="network-line" id="line4"></div>
            <div class="network-device" id="workstation">Estação de Trabalho</div>
        </div>
        <p>Clique nos dispositivos para verificar conectividade:</p>
        <div class="terminal" id="network-output">
            <div class="terminal-line">Use os comandos para diagnosticar a rede</div>
            <div class="terminal-line terminal-output" id="network-cmd-output"></div>
        </div>
        <div class="performance-controls">
            <button id="ping-btn">Ping Gateway</button>
            <button id="traceroute-btn">Traceroute</button>
            <button id="dns-btn">Testar DNS</button>
            <button id="fix-btn">Corrigir Problema</button>
        </div>
        <div class="hint">
            <button class="hint-toggle">
                <i class="fas fa-lightbulb"></i> Mostrar Guia de Troubleshoot
            </button>
            <div class="hint-content">
                <div class="hint-title">
                    <i class="fas fa-network-wired"></i> Troubleshoot de Rede Corporativa
                </div>
                
                <div class="hint-section">
                    <strong>🔧 Metodologia OSI - Camada por Camada</strong>
                    <div class="hint-list">
                        <li><strong>Camada 1 (Física):</strong> Cabos, conectores, LEDs</li>
                        <li><strong>Camada 2 (Enlace):</strong> MAC address, switches</li>
                        <li><strong>Camada 3 (Rede):</strong> IP, roteamento, sub-redes</li>
                        <li><strong>Camada 4 (Transporte):</strong> Portas, TCP/UDP</li>
                        <li><strong>Camada 7 (Aplicação):</strong> DNS, HTTP, serviços</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>🩺 Diagnóstico por Sintomas</strong>
                    <div class="hint-list">
                        <li><strong>Ping timeout:</strong> Problema físico ou firewall</li>
                        <li><strong>Traceroute para no gateway:</strong> Firewall bloqueando ICMP</li>
                        <li><strong>DNS não resolve:</strong> Servidor DNS offline</li>
                        <li><strong>Lentidão geral:</strong> Congestionamento ou QoS</li>
                        <li><strong>Conectividade intermitente:</strong> Cabo ou porta com defeito</li>
                    </div>
                </div>
                
                <div class="hint-section">
                    <strong>🔧 Ferramentas Essenciais</strong>
                    <div class="hint-code">
                        ping          # Teste básico de conectividade<br>
                        traceroute    # Rastreamento de rota<br>
                        nslookup      # Diagnóstico de DNS<br>
                        netstat       # Conexões e portas<br>
                        wireshark     # Análise de pacotes (avançado)
                    </div>
                </div>
                
                <div class="hint-warning">
                    <strong>📝 Documentação:</strong> Sempre documente a topologia da rede e tenha um plano de rollback antes de fazer mudanças críticas.
                </div>
            </div>
        </div>
    </div>`,
        init: function () {
            const pingBtn = document.getElementById("ping-btn");
            const tracerouteBtn = document.getElementById("traceroute-btn");
            const dnsBtn = document.getElementById("dns-btn");
            const fixBtn = document.getElementById("fix-btn");
            const networkOutput = document.getElementById("network-cmd-output");
            const networkLines = document.querySelectorAll(".network-line");
            const firewall = document.getElementById("firewall");
            
            let problemFixed = false;
            
            pingBtn.addEventListener("click", () => {
                networkOutput.innerHTML = "Pinging 192.168.1.1...<br>Request timed out.<br>Request timed out.<br>Request timed out.<br>Request timed out.";
            });
            
            tracerouteBtn.addEventListener("click", () => {
                networkOutput.innerHTML = "1 192.168.1.1 (192.168.1.1 (192.168.1.1) 1.234 ms<br>2 * * *<br>3 * * *<br>Falha após o gateway.";
                });
                
                dnsBtn.addEventListener("click", () => {
                    networkOutput.innerHTML = ";; connection timed out; no servers could be reached";
                });
                
                fixBtn.addEventListener("click", () => {
                    // "Corrige" o problema (firewall bloqueando tráfego)
                    firewall.classList.add("connected");
                    networkLines.forEach(line => line.classList.add("connected"));
                    networkOutput.innerHTML = "Problema identificado: Firewall bloqueando tráfego.<br>Regra de firewall ajustada.<br>Conectividade restaurada!";
                    problemFixed = true;
                });
                
                // Armazena o estado para validação
                this.isProblemFixed = function() {
                    return problemFixed;
                };
            },
            validate: function () {
                return this.isProblemFixed();
            },
        }
    };

    const totalTasks = Object.keys(tasksData).length;

    const updateProgressBar = () => {
        const solvedCount = Object.keys(solvedTasks).length;
        const progress = (solvedCount / totalTasks) * 100;
        progressBar.style.width = `${progress}%`;
    };

    const showNotification = (message, isError = false) => {
        notification.textContent = message;
        notification.className = isError ? "notification error" : "notification";
        notification.classList.add("show");
        
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    };

    const addCompletedTask = (taskName) => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fas fa-check-circle"></i> ${taskName}`;
        completedTasksList.appendChild(li);
    };

    // === ATUALIZA MUNDO ===
    const updateWorldPosition = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        cameraX = playerX - viewportWidth / 2;
        cameraY = playerY - viewportHeight / 2;

        cameraX = Math.max(0, Math.min(cameraX, worldWidth - viewportWidth));
        cameraY = Math.max(0, Math.min(cameraY, worldHeight - viewportHeight));

        const playerScreenX = playerX - cameraX;
        const playerScreenY = playerY - cameraY;

        player.style.transform = `translate(${playerScreenX}px, ${playerScreenY}px)`;

        interactiveObjects.forEach((obj) => {
            const objWorldX = parseInt(obj.dataset.x, 10);
            const objWorldY = parseInt(obj.dataset.y, 10);
            obj.style.transform = `translate(${objWorldX - cameraX}px, ${objWorldY - cameraY}px)`;
        });

        const matrixBackground = document.querySelector(".matrix-background");
        if (matrixBackground) {
            matrixBackground.style.backgroundPosition = `-${cameraX * 0.5}px -${cameraY * 0.5}px`;
        }

        // Atualiza mini mapa
        updateMiniPlayer();
        updateTaskVisibility();
    };

    // === MOSTRAR TASKS SOMENTE QUANDO PERTO ===
    const updateTaskVisibility = () => {
        const revealDistance = 200;
        
        interactiveObjects.forEach((obj) => {
            const taskId = obj.dataset.task;
            if (!taskId || obj.classList.contains("solved")) return;
            
            const objWorldX = parseInt(obj.dataset.x, 10);
            const objWorldY = parseInt(obj.dataset.y, 10);
            
            const distanceX = Math.abs(playerX - objWorldX);
            const distanceY = Math.abs(playerY - objWorldY);
            
            if (distanceX < revealDistance && distanceY < revealDistance) {
                obj.classList.add("visible");
            } else {
                obj.classList.remove("visible");
            }
        });
    };

    // === COLISÃO COM TASKS ===
    const checkCollision = () => {
        const playerCollisionRange = 100;

        // Verifica apenas a task atual (baseada no índice)
        if (currentTaskIndex >= taskOrder.length) return;

        const currentTaskId = taskOrder[currentTaskIndex];
        const obj = document.querySelector(`.interactive-object[data-task="${currentTaskId}"]`);
        
        if (!obj || obj.classList.contains("solved")) return;

        const objWorldX = parseInt(obj.dataset.x, 10);
        const objWorldY = parseInt(obj.dataset.y, 10);

        const distanceX = Math.abs(playerX - objWorldX);
        const distanceY = Math.abs(playerY - objWorldY);

        if (distanceX < playerCollisionRange && distanceY < playerCollisionRange) {
            currentTask = currentTaskId;
            openTaskOverlay(currentTask);
        }
    };

    function openTaskOverlay(taskId) {
        const task = tasksData[taskId];
        taskTitle.textContent = task.title;
        taskDescription.textContent = task.description;
        taskInteraction.innerHTML = task.interaction;
        
        if (task.init) {
            task.init();
        }
        
        taskOverlay.style.display = "flex";
        
        // Move o mini mapa para trás quando a task estiver aberta
        if (miniMap) {
            miniMap.style.zIndex = "5";
        }
    }

    // === CONTROLES DO JOGADOR (SEM COLISÃO COM LABIRINTO) ===
    document.addEventListener("keydown", (e) => {
        if (taskOverlay.style.display === "flex") return;
        
        isMoving = true;
        startSpriteAnimation();
        
        const currentTime = Date.now();
        let moved = false;
        let newX = playerX;
        let newY = playerY;
        
        switch (e.key) {
            case "ArrowUp":
                newY -= playerSpeed;
                frameY = 3; // Linha 3 = cima
                moved = true;
                break;
            case "ArrowDown":
                newY += playerSpeed;
                frameY = 0; // Linha 0 = baixo
                moved = true;
                break;
            case "ArrowLeft":
                newX -= playerSpeed;
                frameY = 1; // Linha 1 = esquerda
                moved = true;
                break;
            case "ArrowRight":
                newX += playerSpeed;
                frameY = 2; // Linha 2 = direita
                moved = true;
                break;
        }

        // Movimento sem verificação de colisão com labirinto
        if (moved) {
            playerX = newX;
            playerY = newY;
            
            if (currentTime - lastStepTime > STEP_INTERVAL) {
                playStepSound();
                lastStepTime = currentTime;
            }
        }

        playerX = Math.max(0, Math.min(playerX, worldWidth - playerWidth));
        playerY = Math.max(0, Math.min(playerY, worldHeight - playerHeight));
        
        updateWorldPosition();
        checkCollision();
        updateMiniPlayerDirection();
    });

    document.addEventListener("keyup", () => {
        isMoving = false;
        stopSpriteAnimation();
    });

    closeOverlayBtn.addEventListener("click", () => {
        taskOverlay.style.display = "none";
        
        // Restaura o z-index do mini mapa quando a task for fechada
        if (miniMap) {
            miniMap.style.zIndex = "1000";
        }
    });

    checkSolutionBtn.addEventListener("click", () => {
        if (!currentTask) return;
        
        const task = tasksData[currentTask];
        if (task.validate()) {
            showNotification("Parabéns! Você resolveu este problema!");
            taskOverlay.style.display = "none";
            
            // Restaura o z-index do mini mapa quando a task for fechada
            if (miniMap) {
                miniMap.style.zIndex = "1000";
            }
            
            solvedTasks[currentTask] = true;
            updateProgressBar();
            updateMiniMapTaskStatus(currentTask);
            
            const obj = document.querySelector(`.interactive-object[data-task="${currentTask}"]`);
            obj.classList.add("solved");
            
            addCompletedTask(task.title.replace("Problema: ", ""));
            
            // Ativa próxima task se houver
            if (currentTaskIndex < taskOrder.length - 1) {
                currentTaskIndex++;
                createMiniMapIcons();
            }
            
            if (Object.keys(solvedTasks).length === totalTasks) {
    showNotification("Parabéns! Você completou todos os desafios!");
    
    // Mostrar cena pós-créditos após um breve delay
    setTimeout(() => {
        showPostCreditsScene();
    }, 2000);
}
        } else {
            showNotification("A solução ainda não está correta. Tente novamente!", true);
        }
    });

    window.addEventListener("resize", updateWorldPosition);

    // Matrix background
    const matrix = document.querySelector(".matrix-background");
    if (matrix) {
        const charHeight = 5;
        const charWidth = 25;
        const cols = Math.floor(window.innerWidth / charWidth);
        const rows = Math.floor(window.innerHeight / charHeight) * 2;
        
        for (let c = 0; c < cols; c++) {
            const column = document.createElement("div");
            column.className = "matrix-column";
            column.style.left = `${c * charWidth}px`;
            column.style.animationDuration = `${30 + Math.random() * 35}s`;
            column.style.animationDelay = `${Math.random() * 50}s`;
            
            let text = "";
            for (let r = 0; r < rows; r++) {
                text += Math.random() > 0.5 ? "1\n" : "0\n";
            }
            column.textContent = text;
            matrix.appendChild(column);
        }
    }

    // === INICIALIZAÇÃO ===
    initializeHintSystem();
    initializeBackgroundMusic(); // Inicializa a música de fundo
    // Inicializar controle de volume
initializeVolumeControl();
loadSavedVolume();
    updatePlayerSprite();
    updateWorldPosition();
    createMiniMapIcons();
    updateMiniPlayerDirection();


    // Função para mostrar cena pós-créditos
// Função para mostrar cena pós-créditos - Estilo Cinema
function showPostCreditsScene() {
    const postCredits = document.getElementById("post-credits");
    const skipButton = document.getElementById("skip-button");
    
    if (!postCredits) return;
    
    // Mostrar a cena
    postCredits.style.display = "flex";
    
    // Textos da sequência dramática
    const textSequence = [
        { id: "typing-text-1", text: "Parabéns... você sobreviveu aos desafios...", delay: 100 },
        { id: "typing-text-2", text: "Mas este mundo virtual ainda te prende...", delay: 150 },
        { id: "typing-text-3", text: "Há uma última barreira entre você e a liberdade...", delay: 120 }
    ];
    
    let currentTextIndex = 0;
    let typingInterval;
    
    function typeText(textElement, text, speed, callback) {
        let index = 0;
        textElement.textContent = "";
        textElement.style.display = "block";
        
        typingInterval = setInterval(() => {
            if (index < text.length) {
                // Efeito sonoro de digitação (opcional)
                // if (index % 3 === 0) playTypeSound();
                
                textElement.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typingInterval);
                setTimeout(callback, 1000); // Pausa após terminar de digitar
            }
        }, speed);
    }
    
    function showNextText() {
        if (currentTextIndex < textSequence.length) {
            const currentText = textSequence[currentTextIndex];
            const textElement = document.getElementById(currentText.id);
            
            typeText(textElement, currentText.text, currentText.delay, () => {
                currentTextIndex++;
                setTimeout(showNextText, 500); // Pausa entre textos
            });
        } else {
            // Mostrar mensagem final dramática
            setTimeout(showFinalMessage, 1000);
        }
    }
    
    function showFinalMessage() {
        const finalMessage = document.getElementById("final-message");
        finalMessage.style.display = "block";
        
        // Efeito de surgimento
        finalMessage.style.opacity = "0";
        finalMessage.style.transform = "scale(0.8)";
        
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.05;
            finalMessage.style.opacity = opacity;
            finalMessage.style.transform = `scale(${0.8 + opacity * 0.2})`;
            
            if (opacity >= 1) {
                clearInterval(fadeIn);
                // Iniciar redirecionamento automático após mensagem final
                setTimeout(startRedirectCountdown, 3000);
            }
        }, 50);
    }
    
    function startRedirectCountdown() {
        // Criar contador na tela
        const countdownElement = document.createElement("div");
        countdownElement.className = "typing-text";
        countdownElement.id = "countdown-text";
        countdownElement.style.fontSize = "1.5em";
        countdownElement.style.color = "#ff4444";
        document.querySelector(".credits-container").appendChild(countdownElement);
        
        let seconds = 5;
        
        const countdownInterval = setInterval(() => {
            countdownElement.textContent = `Redirecionando em ${seconds}...`;
            seconds--;
            
            if (seconds < 0) {
                clearInterval(countdownInterval);
                redirectToMaze();
            }
        }, 1000);
    }
    
    // Configurar o botão de pular
    skipButton.addEventListener("click", () => {
        clearInterval(typingInterval);
        redirectToMaze();
    });
    
    // Iniciar sequência de texto
    setTimeout(() => {
        showNextText();
    }, 1000);
}

// Função para redirecionar para o labirinto
function redirectToMaze() {
    // Parar qualquer som que esteja tocando
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    if (stepSound) {
        stepSound.pause();
    }
    
    // Redirecionar para o labirinto
    window.location.href = "mapaOk.html";
}


});