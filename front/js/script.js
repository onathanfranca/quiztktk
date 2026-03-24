// Banco de Perguntas (Configurável)
const questions = [
  {
    id: 1,
    type: 'choice',
    question: "Quantas vezes por dia você abre o TikTok? 👀",
    options: [
      { text: "Só de vez em quando (1-5x)", score: 2 },
      { text: "Toda hora que tenho um tempinho (6-15x)", score: 4 },
      { text: "Eu VIVO lá! Nem conto mais (20x+)", score: 5 },
      { text: "Abro pra ver uma coisa e fico 2h (Clássico)", score: 5 }
    ]
  },
  {
    id: 2,
    type: 'stars', // Escala 1-5
    question: "De 1 a 5, o quanto o 'For You' te conhece melhor que seus amigos? 🤖",
    maxStars: 5
  },
  {
    id: 3,
    type: 'choice',
    question: "O que você mais assiste? 📺",
    options: [
      { text: "Dancinhas e Trends Virais 💃", score: 3 },
      { text: "Humor e Memes 😂", score: 3 },
      { text: "Dicas, Tutoriais e 'Aprenda no TikTok' 🧠", score: 4 },
      { text: "Unboxing, Reviews e comprinhas 🛍️", score: 5 }
    ]
  },
  {
    id: 4,
    type: 'boolean', // Sim/Não
    question: "Você já comprou algo só porque viu no TikTok? (TikTok made me buy it!) 💸",
    options: [
      { text: "Sim, sou culpado(a)! 🙋‍♀️", score: 5 },
      { text: "Ainda não, mas quase... 🤔", score: 3 },
      { text: "Não, sou forte 💪", score: 1 }
    ]
  },
  {
    id: 5,
    type: 'stars',
    question: "Qual nota você dá para as Lives de Compras (aquelas promoções relâmpago)? ⚡",
    maxStars: 5
  },
  {
    id: 6,
    type: 'choice',
    question: "Qual sua relação com anúncios no App? 📢",
    options: [
      { text: "Pulo todos instantaneamente ⏭️", score: 1 },
      { text: "Assisto se for criativo/engraçado 🎨", score: 3 },
      { text: "Às vezes clico pra ver o produto 👀", score: 4 },
      { text: "Adoro descobrir marcas novas 😍", score: 5 }
    ]
  },
  {
    id: 7,
    type: 'text',
    question: "Se você pudesse mudar UMA coisa no TikTok hoje, o que seria? ✍️",
    placeholder: "Ex: Menos anúncios, vídeos mais longos..."
  },
  {
    id: 8,
    type: 'choice',
    question: "Você pretender comprar na TikTok Shop nos próximos 30 dias? 🛒",
    options: [
      { text: "Com certeza! Tô de olho numas coisas", score: 5 },
      { text: "Talvez, se tiver cupom bom", score: 4 },
      { text: "Provavelmente não", score: 2 },
      { text: "Não uso pra compras", score: 1 }
    ]
  }
];

// Estado da Aplicação
let currentQuestionIndex = 0;
let totalScore = 0;
let userAnswers = [];

// Elementos DOM
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const rewardsScreen = document.getElementById('rewards-screen');

const btnStart = document.getElementById('btn-start');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const inputContainer = document.getElementById('input-container');
const textAnswerInput = document.getElementById('text-answer');
const btnNextText = document.getElementById('btn-next-text');
const currentQSpan = document.getElementById('current-q');
const progressBar = document.getElementById('progress');

// Custom Alert Elements
const alertOverlay = document.getElementById('custom-alert-overlay');
const alertTitle = document.getElementById('alert-title');
const alertMessage = document.getElementById('alert-message');
const btnCloseAlert = document.getElementById('btn-close-alert');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  btnStart.addEventListener('click', startQuiz);
  
  // Configurar botões de compartilhamento (se existirem)
  const instaBtn = document.querySelector('.instagram');
  const whatsBtn = document.querySelector('.whatsapp');
  
  if (instaBtn) instaBtn.addEventListener('click', () => mockShare('Instagram'));
  if (whatsBtn) whatsBtn.addEventListener('click', () => mockShare('WhatsApp'));
  
  // Botão de ir para recompensas
  document.getElementById('btn-claim').addEventListener('click', showRewards);
  
  // Fechar alerta
  btnCloseAlert.addEventListener('click', () => {
    alertOverlay.classList.add('hidden');
  });
  
  // Botões de resgate de cupom
  document.querySelectorAll('.btn-claim-reward').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const originalText = e.target.innerText;
      const targetLink = e.target.getAttribute('data-link');
      
      e.target.innerText = "VERIFICANDO...";
      e.target.style.background = "#FE2C55"; // Mantém vermelho enquanto verifica
      
      setTimeout(() => {
        e.target.innerText = "REDIRECIONANDO... 🛍️";
        e.target.style.background = "#00ff64";
        e.target.style.color = "#000";
        
        // Redireciona na mesma guia
        if (targetLink) {
          window.location.href = targetLink;
        } else {
          // Fallback se não tiver link
          showCustomAlert("Erro", "Produto indisponível no momento.");
        }
        
      }, 1000);
    });
  });
});

function showCustomAlert(title, message, icon = "🎉") {
  alertTitle.innerText = title;
  alertMessage.innerText = message;
  document.querySelector('.alert-icon').innerText = icon;
  alertOverlay.classList.remove('hidden');
}

function startQuiz() {
  startScreen.classList.add('hidden');
  startScreen.classList.remove('active');
  quizScreen.classList.remove('hidden');
  quizScreen.classList.add('active');
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestionIndex];
  
  // Atualizar UI
  questionText.innerText = q.question;
  currentQSpan.innerText = currentQuestionIndex + 1;
  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Limpar containers
  optionsContainer.innerHTML = '';
  inputContainer.classList.add('hidden');
  optionsContainer.classList.remove('hidden');

  // Renderizar com base no tipo
  if (q.type === 'choice' || q.type === 'boolean') {
    renderChoiceOptions(q);
  } else if (q.type === 'stars') {
    renderStarRating(q);
  } else if (q.type === 'text') {
    renderTextInput(q);
  }
}

function renderChoiceOptions(q) {
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span>${opt.text}</span>`;
    
    // Adicionar letra A, B, C, D visualmente
    const letters = ['A', 'B', 'C', 'D'];
    if(q.type !== 'boolean') {
       btn.innerHTML = `<span style="opacity:0.6; margin-right:10px; font-weight:700">${letters[idx] || ''}.</span> <span>${opt.text}</span>`;
    }

    btn.onclick = () => handleAnswer(opt.score || 0);
    optionsContainer.appendChild(btn);
  });
}

function renderStarRating(q) {
  const container = document.createElement('div');
  container.className = 'stars-container';
  
  for (let i = 1; i <= q.maxStars; i++) {
    const star = document.createElement('button');
    star.className = 'star-btn';
    star.innerHTML = '★'; // Estrela vazia ou cheia controlada por CSS class
    
    star.onclick = () => {
      // Visual feedback e delay curto antes de avançar
      updateStars(container, i);
      setTimeout(() => handleAnswer(i), 400); // Pontuação = número de estrelas
    };
    
    // Hover effect
    star.onmouseover = () => updateStars(container, i);
    
    container.appendChild(star);
  }
  
  optionsContainer.appendChild(container);
}

function updateStars(container, value) {
  const stars = container.querySelectorAll('.star-btn');
  stars.forEach((s, idx) => {
    if (idx < value) s.classList.add('active');
    else s.classList.remove('active');
  });
}

function renderTextInput(q) {
  optionsContainer.classList.add('hidden');
  inputContainer.classList.remove('hidden');
  textAnswerInput.value = '';
  textAnswerInput.focus();
  
  btnNextText.onclick = () => {
    if (textAnswerInput.value.trim().length > 0) {
      handleAnswer(5); // Resposta aberta ganha pontuação máxima por engajamento
    } else {
      showCustomAlert("Ops!", "Por favor, escreva algo para continuar!", "✍️");
    }
  };
}

// Mensagens de incentivo
const positiveFeedback = [
  "Boa! 🔥", "Arrasou! 💅", "Isso aí! 🚀", 
  "Tudooo! ✨", "Sabe muito! 🧠", "Nível Pro! 🏆", 
  "Incrível! 💖", "Mandou bem! 👍"
];

function showFeedback() {
  const popup = document.getElementById('feedback-popup');
  const msg = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
  
  popup.innerText = msg;
  popup.classList.remove('show');
  
  // Hack para reiniciar animação CSS
  void popup.offsetWidth; 
  
  popup.classList.add('show');
}

function handleAnswer(score) {
  showFeedback(); // Mostrar feedback visual imediato
  totalScore += score;
  
  // Pequeno delay para usuário ver o feedback antes de mudar
  setTimeout(() => {
    nextQuestion();
  }, 800);
}

function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    // Efeito de transição
    quizScreen.style.opacity = '0';
    setTimeout(() => {
      loadQuestion();
      quizScreen.style.opacity = '1';
    }, 300);
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  resultScreen.classList.add('active');
  
  // Animar pontuação
  const scoreDisplay = document.getElementById('final-score');
  let currentDisplayScore = 0;
  const timer = setInterval(() => {
    currentDisplayScore++;
    scoreDisplay.innerText = currentDisplayScore;
    if (currentDisplayScore >= totalScore) clearInterval(timer);
  }, 30);
  
  // Gerar Feedback
  const feedbackTitle = document.getElementById('result-feedback');
  const feedbackDesc = document.getElementById('result-desc');
  
  if (totalScore >= 30) {
    feedbackTitle.innerText = "Você é #TeamTikTok nível PRO! 🔥";
    feedbackDesc.innerText = "Você domina as trends, conhece tudo do app e aproveita ao máximo. Um verdadeiro Creator em potencial!";
  } else if (totalScore >= 15) {
    feedbackTitle.innerText = "Usuário Curioso e Conectado! 👀";
    feedbackDesc.innerText = "Você curte o app, se diverte, mas ainda não foi totalmente abduzido pelo algoritmo. Equilíbrio é tudo!";
  } else {
    feedbackTitle.innerText = "Turista no TikTok! ✈️";
    feedbackDesc.innerText = "Você passa por lá de vez em quando, mas prefere a vida offline ou outras redes. Tá tudo bem ser low profile!";
  }
}

function showRewards() {
  resultScreen.classList.add('hidden');
  rewardsScreen.classList.remove('hidden');
  rewardsScreen.classList.add('active');
  startSocialProofNotifications();
  startCountdown();
}

// Timer de Oferta Relâmpago
function startCountdown() {
  const timerElement = document.querySelector('.flash-timer');
  let time = 299; // 4 minutos e 59 segundos

  const timerInterval = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    // Formata com zero à esquerda
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    timerElement.innerText = `⚡ FIM DA OFERTA: ${displayMinutes}:${displaySeconds}`;
    
    if (time > 0) {
      time--;
    } else {
      clearInterval(timerInterval);
      timerElement.innerText = "⚡ OFERTA ENCERRADA!";
      timerElement.style.background = "#333";
    }
  }, 1000);
}

// Sistema de Notificações de Venda (Social Proof)
const fakeNames = ["João S.", "Maria C.", "Pedro H.", "Ana L.", "Lucas M.", "Beatriz F.", "Rafael K.", "Juliana P."];
const fakeProducts = [
  { name: "iPhone 15 Pro Max 256GB", img: "assets/iphone15.jpg" },
  { name: "JBL Boombox 3 Wifi", img: "assets/jbl_boombox.jpg" },
  { name: "Apple Watch S9 GPS", img: "assets/apple_watch.webp" },
  { name: "Galaxy A56 5G", img: "assets/samsung_a56_new.jpg" },
  { name: "Parafusadeira Sunto", img: "assets/parafusadeira.webp" },
  { name: "Dior Sauvage", img: "assets/dior_sauvage.webp" },
  { name: "TV Samsung AI 55\"", img: "assets/samsung_tv.webp" },
  { name: "PS5 Pro 2TB", img: "assets/ps5_pro.webp" },
  { name: "Poco F7", img: "assets/poco_f7.webp" },
  { name: "Bike Aro 29", img: "assets/bike.webp" }
];

function startSocialProofNotifications() {
  // Primeira notificação rápida
  setTimeout(showFakeNotification, 1500);
  
  // Notificações subsequentes a cada 4-8 segundos
  setInterval(() => {
    showFakeNotification();
  }, Math.random() * (8000 - 4000) + 4000); 
}

function showFakeNotification() {
  const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const product = fakeProducts[Math.floor(Math.random() * fakeProducts.length)];
  
  const notif = document.createElement('div');
  notif.className = 'sale-notification';
  notif.innerHTML = `
    <img src="${product.img}" class="sale-notif-img" alt="Produto">
    <div class="sale-notif-text">
      <strong>${name} acabou de resgatar</strong>
      <span>${product.name}</span>
    </div>
  `;
  
  document.body.appendChild(notif);
  
  // Remove do DOM após a animação (5s total)
  setTimeout(() => {
    notif.remove();
  }, 5000);
}

function mockShare(platform) {
  showCustomAlert(
    "Compartilhado!", 
    `Enviado para ${platform} com sucesso! Sua chance extra foi desbloqueada.`,
    "🚀"
  );
}
