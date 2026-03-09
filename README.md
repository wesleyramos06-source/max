<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fut Quiz 3D - Infinito</title>
    <style>
        :root {
            --primary: #00ff88;
            --secondary: #212121;
            --accent: #ffd700;
            --danger: #ff4d4d;
        }

        body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle, #1a1a1a, #000);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            perspective: 1000px;
        }

        /* Container 3D */
        #game-container {
            width: 400px;
            text-align: center;
            transform-style: preserve-3d;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card {
            background: rgba(40, 40, 40, 0.95);
            padding: 30px;
            border-radius: 20px;
            border: 2px solid var(--primary);
            box-shadow: 0 20px 50px rgba(0, 255, 136, 0.2);
            position: relative;
            backface-visibility: hidden;
        }

        /* Header e Stats */
        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 0.9em;
            color: var(--accent);
        }

        /* Barra de Tempo */
        .timer-container {
            width: 100%;
            height: 8px;
            background: #444;
            border-radius: 4px;
            margin-bottom: 20px;
            overflow: hidden;
        }

        #timer-bar {
            width: 100%;
            height: 100%;
            background: var(--primary);
            transition: width 0.1s linear;
        }

        /* Pergunta e Botões */
        h2 { font-size: 1.4em; min-height: 60px; margin-bottom: 20px; }

        .options {
            display: grid;
            gap: 10px;
        }

        button {
            background: #333;
            color: white;
            border: 1px solid #555;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }

        button:hover {
            background: var(--primary);
            color: black;
            font-weight: bold;
            transform: scale(1.03);
        }

        button:active { transform: scale(0.98); }

        /* Telas de Início/Fim */
        .overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
            z-index: 10;
        }

        .hidden { display: none !important; }

        .record-tag { color: var(--accent); font-size: 1.2em; margin-top: 10px; }
    </style>
</head>
<body>

    <div id="game-container">
        <div id="start-screen" class="card">
            <h1 style="color: var(--primary);">FUT QUIZ 3D</h1>
            <p>Perguntas infinitas sobre futebol.</p>
            <p style="color: var(--danger);">Regra: 10 segundos ou reset total!</p>
            <div class="record-tag">Recorde Atual: <span id="high-score">0</span></div>
            <br>
            <button onclick="startGame()" style="width: 100%; background: var(--primary); color: black; font-weight: bold;">COMEÇAR JOGO</button>
        </div>

        <div id="quiz-screen" class="card hidden">
            <div class="stats">
                <span>Score: <span id="current-score">0</span></span>
                <span>Dificuldade: <span id="difficulty-lvl">Iniciante</span></span>
            </div>
            
            <div class="timer-container">
                <div id="timer-bar"></div>
            </div>

            <h2 id="question-text">Carregando pergunta...</h2>

            <div class="options" id="options-container">
                </div>
        </div>

        <div id="game-over-screen" class="card hidden">
            <h2 style="color: var(--danger);">FIM DE JOGO!</h2>
            <div id="final-stats">
                </div>
            <br>
            <button onclick="resetGame()" style="width: 100%;">TENTAR NOVAMENTE</button>
        </div>
    </div>

    <script>
        // Banco de dados de perguntas (Templates para gerar "infinitas")
        const questionDatabase = [
            { q: "Quem venceu a Copa do Mundo de 1958?", a: "Brasil", o: ["Alemanha", "Itália", "França"], diff: 1 },
            { q: "Qual clube tem mais títulos da Champions League?", a: "Real Madrid", o: ["Milan", "Bayern", "Liverpool"], diff: 1 },
            { q: "Quem é o maior artilheiro da história das Copas?", a: "Miroslav Klose", o: ["Ronaldo", "Pelé", "Messi"], diff: 2 },
            { q: "Em que ano Cristiano Ronaldo foi para o Real Madrid?", a: "2009", o: ["2007", "2008", "2010"], diff: 2 },
            { q: "Qual time é conhecido como 'Os Colchoneros'?", a: "Atlético de Madrid", o: ["Sevilla", "Valencia", "Benfica"], diff: 2 },
            { q: "Quem detém o recorde de transferência mais cara (222M€)?", a: "Neymar", o: ["Mbappé", "Coutinho", "Hazard"], diff: 1 },
            { q: "Qual jogador venceu a Bola de Ouro em 2007?", a: "Kaká", o: ["Ronaldinho", "Messi", "Cristiano Ronaldo"], diff: 3 },
            { q: "Qual seleção é a atual campeã da Eurocopa (2024)?", a: "Espanha", o: ["Inglaterra", "França", "Itália"], diff: 1 },
            { q: "Quantas Copas do Mundo a Alemanha possui?", a: "4", o: ["3", "5", "2"], diff: 2 },
            { q: "Em qual clube o Haaland jogava antes do Man. City?", a: "Borussia Dortmund", o: ["Salzburg", "Molde", "Leipzig"], diff: 1 },
            { q: "Quem era o técnico do 'Arsenal Invicto' em 2004?", a: "Arsène Wenger", o: ["Alex Ferguson", "José Mourinho", "Pep Guardiola"], diff: 3 }
        ];

        let score = 0;
        let timeLeft = 100;
        let timerInterval;
        let currentQuestion;
        let highScore = localStorage.getItem('futHighScore') || 0;

        document.getElementById('high-score').innerText = highScore;

        function startGame() {
            score = 0;
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.add('hidden');
            document.getElementById('quiz-screen').classList.remove('hidden');
            nextQuestion();
        }

        function nextQuestion() {
            // Efeito 3D de rotação ao mudar pergunta
            const container = document.getElementById('game-container');
            container.style.transform = "rotateY(360deg)";
            setTimeout(() => container.style.transform = "rotateY(0deg)", 600);

            // Filtra por dificuldade baseada no score (Score > 5 = Médio, Score > 10 = Difícil)
            let difficultyFilter = score < 5 ? 1 : (score < 10 ? 2 : 3);
            let pool = questionDatabase.filter(q => q.diff <= difficultyFilter);
            currentQuestion = pool[Math.floor(Math.random() * pool.length)];

            // UI
            document.getElementById('current-score').innerText = score;
            document.getElementById('difficulty-lvl').innerText = difficultyFilter === 1 ? "Fácil" : (difficultyFilter === 2 ? "Médio" : "Lendário");
            document.getElementById('question-text').innerText = currentQuestion.q;
            
            // Embaralhar opções
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            let allOptions = [...currentQuestion.o, currentQuestion.a].sort(() => Math.random() - 0.5);

            allOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => checkAnswer(opt);
                optionsContainer.appendChild(btn);
            });

            startTimer();
        }

        function startTimer() {
            clearInterval(timerInterval);
            timeLeft = 100;
            const bar = document.getElementById('timer-bar');
            
            timerInterval = setInterval(() => {
                timeLeft -= 1; // Reduz a cada 100ms (Total 10s)
                bar.style.width = timeLeft + "%";
                
                if (timeLeft <= 0) {
                    gameOver("O TEMPO ACABOU!");
                }
            }, 100);
        }

        function checkAnswer(selected) {
            if (selected === currentQuestion.a) {
                score++;
                nextQuestion();
            } else {
                gameOver("RESPOSTA ERRADA!");
            }
        }

        function gameOver(reason) {
            clearInterval(timerInterval);
            document.getElementById('quiz-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.remove('hidden');
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('futHighScore', highScore);
            }

            document.getElementById('final-stats').innerHTML = `
                <p>${reason}</p>
                <h3 style="margin:0">Score: ${score}</h3>
                <p>Recorde: ${highScore}</p>
                <small>Estatísticas: ${Math.floor(score * 1.5)} pts de experiência</small>
            `;
            document.getElementById('high-score').innerText = highScore;
        }

        function resetGame() {
            startGame();
        }
    </script>
</body>
</html>
