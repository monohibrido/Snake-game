const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const lastScoreDisplay = document.getElementById("lastScore");
const highScoreDisplay = document.getElementById("highScore");
const eatSound = new Audio("./media/eat.mp3");
const lossSound = new Audio("./media/fart.mp3");

let lastScore = localStorage.getItem("lastScore") || 0;
let highScore = localStorage.getItem("highScore") || 0;
lastScoreDisplay.textContent = lastScore;
highScoreDisplay.textContent = highScore;

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  startGame();
});

const box = 20; //tamaño de snake al comienzo
let rows = Math.floor(window.innerHeight / box);
let cols = Math.floor(window.innerWidth / box);
canvas.width = cols * box;
canvas.height = rows * box;

let snake = [{ x: 180, y: 180 }];
let food = { x: 90, y: 90 };
let direction = "RIGHT";
let gameOver = false;
let score = 0;

let gameInterval;

function draw() {
  if (gameOver) return;
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  ctx.fillStyle = "lime";
  snake.forEach((segment) => ctx.fillRect(segment.x, segment.y, box, box));
}

function update() {
  if (gameOver) return;
  let head = { ...snake[0] };
  if (direction === "RIGHT") head.x += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // Verificar si la serpiente ha comido la fruta
  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    food = generateFood(); // Generar frutita en una posición aleatoria
    score++;
  } else {
    snake.pop();
  }

  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake.some((seg) => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver = true;
    lossSound.play();
    localStorage.setItem("lastScore", score);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    endGame();
  }

  snake.unshift(head);
}

// Generar comida en una posición aleatoria y que no aparezca en un cuadro que esté la serpiente
function generateFood() {
  let foodPosition;
  let isFoodOnSnake;

  do {
    foodPosition = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };
    isFoodOnSnake = snake.some(
      (segment) => segment.x === foodPosition.x && segment.y === foodPosition.y
    );
  } while (isFoodOnSnake);

  return foodPosition;
}

function changeDirection(event) {
  const key = event.key;
  if ((key === "ArrowUp" || key === "w") && direction !== "DOWN")
    direction = "UP";
  if ((key === "ArrowDown" || key === "s") && direction !== "UP")
    direction = "DOWN";
  if ((key === "ArrowLeft" || key === "a") && direction !== "RIGHT")
    direction = "LEFT";
  if ((key === "ArrowRight" || key === "d") && direction !== "LEFT")
    direction = "RIGHT";
}

document.addEventListener("keydown", changeDirection);

let touchStartX, touchStartY;

canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
  let touchEndX = e.touches[0].clientX;
  let touchEndY = e.touches[0].clientY;
  let diffX = touchEndX - touchStartX;
  let diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (diffX < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (diffY > 0 && direction !== "UP") direction = "DOWN";
    else if (diffY < 0 && direction !== "DOWN") direction = "UP";
  }
});

function gameLoop() {
  update();
  draw();
}

function startGame() {
  gameOver = false;
  snake = [{ x: 180, y: 180 }];
  direction = "RIGHT";
  score = 0;
  food = generateFood(); // Generar comida inicial
  // Reiniciar el intervalo con la velocidad inicial
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
}

function endGame() {
  // Mostrar pantalla principal nuevamente y actualizar puntajes
  startScreen.style.display = "flex";
  canvas.style.display = "none";

  // Actualizar los puntajes mostrados
  lastScoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
}
