// ====== SETUP ======
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Adjust for high-DPR (mobile sharpness)
const dpr = window.devicePixelRatio || 1;
canvas.width *= dpr;
canvas.height *= dpr;
ctx.scale(dpr, dpr);

// Game constants
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BLOCK_ROWS = 4;
const BLOCK_COLS = 6;
const BLOCK_WIDTH = 45;
const BLOCK_HEIGHT = 15;
const BLOCK_PADDING = 10;
const BLOCK_OFFSET_TOP = 40;
const BLOCK_OFFSET_LEFT = 20;

// ====== GAME OBJECTS ======
const paddle = {
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  x: canvas.width / dpr / 2 - PADDLE_WIDTH / 2,
  y: canvas.height / dpr - 40,
  speed: 6
};

const ball = {
  x: canvas.width / dpr / 2,
  y: canvas.height / dpr - 60,
  r: BALL_RADIUS,
  dx: 3,
  dy: -3
};

const blocks = [];
for (let r = 0; r < BLOCK_ROWS; r++) {
  for (let c = 0; c < BLOCK_COLS; c++) {
    blocks.push({
      x: BLOCK_OFFSET_LEFT + c * (BLOCK_WIDTH + BLOCK_PADDING),
      y: BLOCK_OFFSET_TOP + r * (BLOCK_HEIGHT + BLOCK_PADDING),
      w: BLOCK_WIDTH,
      h: BLOCK_HEIGHT,
      hit: false
    });
  }
}

// ====== DRAW FUNCTIONS ======
function drawPaddle() {
  ctx.fillStyle = "#ff00ff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlocks() {
  blocks.forEach(b => {
    if (!b.hit) {
      ctx.fillStyle = "#00ffaa";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#550055";
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
  });
}

// ====== GAME UPDATE ======
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBlocks();
  drawPaddle();
  drawBall();

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions
  if (ball.x + ball.r > canvas.width / dpr || ball.x - ball.r < 0) {
    ball.dx *= -1;
  }
  if (ball.y - ball.r < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.y + ball.r > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy *= -1;
    ball.y = paddle.y - ball.r;
  }

  // Bottom out (reset ball)
  if (ball.y + ball.r > canvas.height / dpr) {
    ball.x = canvas.width / dpr / 2;
    ball.y = canvas.height / dpr - 60;
    ball.dx = 3;
    ball.dy = -3;
  }

  // Block collisions
  blocks.forEach(b => {
    if (!b.hit &&
        ball.x > b.x &&
        ball.x < b.x + b.w &&
        ball.y > b.y &&
        ball.y < b.y + b.h
    ) {
      b.hit = true;
      ball.dy *= -1;
    }
  });

  requestAnimationFrame(update);
}

// ====== PADDLE CONTROLS ======
function movePaddle(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  paddle.x = x - paddle.width / 2;

  // Clamp
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width / dpr) {
    paddle.x = canvas.width / dpr - paddle.width;
  }
}

canvas.addEventListener("mousemove", e => movePaddle(e.clientX));
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  movePaddle(e.touches[0].clientX);
});

// ====== START GAME ======
update();
