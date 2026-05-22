// ============================================================
//  SUPER CAT TALES — Enhanced Edition
//  Built on top of the original game code
//  All original mechanics preserved + expanded
// ============================================================

// ======================
// GAME STATE
// ======================
let gameState = "loading"; // loading → instructions → menu → play → gameover

// ======================
// DIFFICULTY
// ======================
let difficulty  = "easy";
let baseGravity = 0.8; // stored so restart resets correctly

// ======================
// BUTTONS
// ======================
let buttons = [];

// ======================
// BACKGROUND OBJECTS
// ======================
let clouds    = [];
let particles = [];
let stars     = [];
let leaves    = [];

// ======================
// PLAYER
// ======================
let player;

// ======================
// ENEMIES
// ======================
let enemies = [];

// ======================
// VISUAL EFFECTS
// ======================
let dustParticles = []; // jump dust
let sparkles      = []; // level-complete sparkles
let goParticles   = []; // game-over floating particles

// ======================
// GAME STATS
// ======================
let level     = 1;
let score     = 0;
let highScore = 0;
let lives     = 3;
let gravity   = 0.8;
let shake     = 0;

// ======================
// INVINCIBILITY
// ======================
let invincible      = false;
let invincibleTimer = 0;

// ======================
// LOADING SCREEN
// ======================
let loadProgress = 0;
let loadDone     = false;

// ======================
// GAME OVER FADE
// ======================
let gameOverAlpha = 0;

// ======================
// LEVEL THEMES (original preserved)
// ======================
let themes = [
  { sky1:[90,180,255],  sky2:[180,255,220], grass:[70,200,90],   mountain:[120,190,180] },
  { sky1:[255,150,120], sky2:[255,220,120], grass:[220,170,70],  mountain:[200,120,100] },
  { sky1:[70,70,150],   sky2:[150,120,255], grass:[90,120,180],  mountain:[80,80,140]   },
  { sky1:[20,20,40],    sky2:[70,90,160],   grass:[60,90,120],   mountain:[40,50,90]    }
];

// ======================
// SOUND PLACEHOLDERS
// ======================
// Uncomment these when adding real audio files:
// let bgMusic, jumpSnd, hitSnd, levelSnd, clickSnd, gameoverSnd;
//
// function preload() {
//   bgMusic    = loadSound('bg.mp3');
//   jumpSnd    = loadSound('jump.mp3');
//   hitSnd     = loadSound('hit.mp3');
//   levelSnd   = loadSound('level.mp3');
//   clickSnd   = loadSound('click.mp3');
//   gameoverSnd= loadSound('gameover.mp3');
// }


// ============================================================
//  SETUP
// ============================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);
  textFont("monospace");

  createButtons();
  createBackgroundObjects();
  resetPlayer();
  createEnemies();
}


// ============================================================
//  DRAW — main loop router
// ============================================================
function draw() {

  // Screen shake (used across all states)
  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
    shake *= 0.85;
    if (shake < 0.5) shake = 0;
  }

  if      (gameState === "loading")      drawLoading();
  else if (gameState === "instructions") drawInstructions();
  else if (gameState === "menu")         drawMenu();
  else if (gameState === "play")         drawGame();
  else if (gameState === "gameover")     drawGameOver();
}


// ============================================================
//  SCREEN 1 — LOADING
// ============================================================
function drawLoading() {

  // Animated dark gradient background
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(15, 15, 50), color(60, 20, 100), y / height);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // Drifting particles behind everything
  drawParticles();

  // ── Mini cat as logo icon ──
  drawCat(width / 2 - 30, height / 2 - 170);

  // ── Title text ──
  push();
  translate(width / 2, height / 2 - 40);

  // Glow layers
  for (let i = 4; i > 0; i--) {
    fill(255, 200, 60, 30 / i);
    textAlign(CENTER, CENTER);
    textSize(54);
    text("SUPER CAT TALES", i, i);
  }
  fill(255, 215, 60);
  textSize(54);
  text("SUPER CAT TALES", 0, 0);

  fill(255, 255, 255, 180);
  textSize(20);
  text("Mini Platformer Adventure", 0, 50);
  pop();

  // ── Loading bar ──
  let barW = min(420, width - 80);
  let barH = 32;
  let barX = width / 2 - barW / 2;
  let barY = height / 2 + 80;

  // Track background
  fill(255, 255, 255, 35);
  rect(barX, barY, barW, barH, barH / 2);

  // Filled portion with colour transition
  let fillW = barW * (loadProgress / 100);
  let barCol = lerpColor(color(80, 200, 255), color(255, 140, 60), loadProgress / 100);
  fill(barCol);
  rect(barX, barY, fillW, barH, barH / 2);

  // Shine stripe
  fill(255, 160);
  rect(barX + 5, barY + 5, fillW - 10, barH * 0.35, 5);

  // Border
  noFill();
  stroke(255, 140);
  strokeWeight(2);
  rect(barX, barY, barW, barH, barH / 2);
  noStroke();

  // Percentage label
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(floor(loadProgress) + "%", width / 2, barY + barH / 2);

  // Animated "Loading…" dots
  let dots = ".".repeat(1 + floor(frameCount / 18) % 4);
  fill(255, 190);
  textSize(16);
  text("Loading" + dots, width / 2, barY + barH + 28);

  // ── Progress logic: fills over ~2.5 seconds ──
  loadProgress = min(loadProgress + random(0.7, 2.4), 100);

  if (loadProgress >= 100 && !loadDone) {
    loadDone = true;
    setTimeout(() => { gameState = "instructions"; }, 450);
  }
}


// ============================================================
//  SCREEN 2 — INSTRUCTIONS / HOW TO PLAY
// ============================================================
function drawInstructions() {

  // Animated background (uses level 1 theme)
  drawBackground();
  drawParticles();

  // ── Panel dimensions ──
  let pw = min(580, width - 60);
  let ph = 490;
  let px = width / 2 - pw / 2;
  let py = height / 2 - ph / 2;

  // Drop shadow
  fill(0, 110);
  rect(px + 14, py + 14, pw, ph, 28);

  // Panel body
  fill(8, 16, 48, 225);
  stroke(100, 180, 255, 200);
  strokeWeight(3);
  rect(px, py, pw, ph, 28);
  noStroke();

  // Coloured top accent bar
  fill(80, 160, 255);
  rect(px, py, pw, 8, 28, 28, 0, 0);

  // ── Title ──
  fill(255, 220, 60);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("HOW TO PLAY", width / 2, py + 48);

  // Divider
  fill(100, 160, 255, 120);
  rect(px + 30, py + 76, pw - 60, 2, 2);

  // ── Controls list ──
  let controls = [
    ["Move Left",    "← Arrow  /  A"],
    ["Move Right",   "→ Arrow  /  D"],
    ["Jump",         "Space  /  W  /  ↑"],
    ["Double Jump",  "Jump again mid-air!"],
    ["Click to Jump","Mouse click during play"],
    ["Menu",         "M key anytime"]
  ];

  let rowH  = 42;
  let startY = py + 104;

  for (let i = 0; i < controls.length; i++) {
    let iy = startY + i * rowH;

    // Alternating row tint
    if (i % 2 === 0) {
      fill(255, 255, 255, 14);
      rect(px + 18, iy - 13, pw - 36, 36, 8);
    }

    fill(190, 225, 255);
    textAlign(LEFT, CENTER);
    textSize(17);
    text("▸  " + controls[i][0], px + 36, iy + 5);

    fill(255, 215, 60);
    textAlign(RIGHT, CENTER);
    text(controls[i][1], px + pw - 36, iy + 5);
  }

  // ── Objectives ──
  fill(255, 255, 255, 150);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Avoid enemies  ·  Reach the flag  ·  Earn points each level", width / 2, py + ph - 88);

  // ── Continue button ──
  let bw = 260, bh = 50;
  let bx = width / 2 - bw / 2;
  let by = py + ph - 60;

  let hov = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

  fill(hov ? color(110, 210, 255) : color(60, 140, 220));
  stroke(255, 190);
  strokeWeight(2);
  rect(bx, by, bw, bh, 14);
  noStroke();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(19);
  text("PRESS ENTER  or  CLICK HERE", width / 2, by + bh / 2);
}


// ============================================================
//  SCREEN 3 — MAIN MENU (original structure kept + improved)
// ============================================================
function drawMenu() {

  drawBackground();
  drawParticles();

  // ── Title card ──
  push();
  translate(width / 2, 178);

  // Card shadow
  fill(0, 100);
  rect(-262 + 12, -82 + 12, 524, 168, 32);

  // Card body
  fill(15, 25, 70, 230);
  stroke(255, 200);
  strokeWeight(4);
  rect(-262, -82, 524, 168, 32);
  noStroke();

  // Shine stripe
  fill(255, 28);
  rect(-248, -72, 496, 42, 10);

  // "SUPER"
  fill(80, 190, 255);
  textAlign(CENTER, CENTER);
  textSize(40);
  textStyle(BOLD);
  text("SUPER", 0, -34);
  textStyle(NORMAL);

  // "CAT TALES"
  fill(255, 110, 80);
  textSize(56);
  text("CAT TALES", 0, 24);
  pop();

  // Subtitle
  fill(255, 220);
  textAlign(CENTER);
  textSize(22);
  text("SELECT DIFFICULTY TO BEGIN", width / 2, 296);

  // Difficulty buttons
  for (let btn of buttons) {
    drawButton(btn);
  }

  // High score badge
  if (highScore > 0) {
    fill(0, 0, 0, 120);
    rect(width / 2 - 170, height - 76, 340, 44, 14);
    fill(255, 215, 60);
    textAlign(CENTER, CENTER);
    textSize(19);
    text("BEST SCORE :  " + highScore, width / 2, height - 54);
  }
}


// ============================================================
//  BUTTON DRAW (original structure kept + hover improved)
// ============================================================
function drawButton(btn) {

  let hover =
    mouseX > btn.x && mouseX < btn.x + btn.w &&
    mouseY > btn.y && mouseY < btn.y + btn.h;

  push();
  translate(btn.x + btn.w / 2, btn.y + btn.h / 2);
  scale(hover ? 1.08 : 1);
  rectMode(CENTER);

  // Shadow
  noStroke();
  fill(0, 130);
  rect(8, 10, btn.w, btn.h, 20);

  // Body
  stroke(0);
  strokeWeight(5);
  fill(btn.color);
  rect(0, 0, btn.w, btn.h, 20);

  // Shine
  noStroke();
  fill(255, 90);
  rect(0, -btn.h / 4, btn.w - 20, btn.h / 4 - 2, 8);

  // Label
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(btn.text, 0, 4);
  pop();
}


// ============================================================
//  BACKGROUND (original preserved + glow on sun/moon)
// ============================================================
function drawBackground() {

  let t = themes[(level - 1) % themes.length];

  // Sky gradient (original technique preserved)
  for (let y = 0; y < height; y++) {
    let c = lerpColor(
      color(t.sky1[0], t.sky1[1], t.sky1[2]),
      color(t.sky2[0], t.sky2[1], t.sky2[2]),
      y / height
    );
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // Sun or Moon with soft glow ring
  if (level % 2 === 0) fill(255, 220, 100);
  else                  fill(240);
  circle(180, 130, 170);

  noFill();
  stroke(255, 255, 200, 50);
  strokeWeight(18);
  circle(180, 130, 200);
  noStroke();

  // Stars (levels 3+)
  if (level >= 3) {
    for (let s of stars) { fill(255); circle(s.x, s.y, s.size); }
  }

  // Clouds (original movement preserved)
  for (let cloud of clouds) {
    fill(255, 215);
    ellipse(cloud.x,      cloud.y,      cloud.size);
    ellipse(cloud.x + 40, cloud.y + 10, cloud.size * 0.7);
    ellipse(cloud.x - 40, cloud.y + 10, cloud.size * 0.7);
    cloud.x += cloud.speed;
    if (cloud.x > width + 300) cloud.x = -300;
  }

  // Mountains (original triangles preserved)
  fill(t.mountain[0], t.mountain[1], t.mountain[2]);
  triangle(-100, height-150, 250, height-520, 600,  height-150);
  triangle(350,  height-150, 750, height-560, 1150, height-150);
  triangle(900,  height-150, 1300,height-500, 1700, height-150);

  // Hills (original ellipses preserved)
  fill(t.grass[0], t.grass[1], t.grass[2]);
  ellipse(200,  height - 60, 500, 250);
  ellipse(700,  height - 40, 700, 300);
  ellipse(1300, height - 70, 600, 250);

  // Ground
  rect(0, height - 120, width, 120);

  // Floating leaves (original preserved)
  for (let leaf of leaves) {
    push();
    translate(leaf.x, leaf.y);
    rotate(leaf.rot);
    fill(255, 180, 50, 200);
    ellipse(0, 0, leaf.size, leaf.size / 2);
    pop();
    leaf.y   += leaf.speed;
    leaf.x   += sin(frameCount * 0.02) * 0.8;
    leaf.rot += 0.02;
    if (leaf.y > height + 20) { leaf.y = -20; leaf.x = random(width); }
  }
}


// ============================================================
//  PARTICLES — floating white dots (original)
// ============================================================
function drawParticles() {
  for (let p of particles) {
    fill(255, 255, 255, 160);
    noStroke();
    circle(p.x, p.y, p.size);
    p.y -= p.speed;
    if (p.y < -10) { p.y = height + 10; p.x = random(width); }
  }
}


// ============================================================
//  SCREEN 4 — GAMEPLAY  (original structure preserved + new features)
// ============================================================
function drawGame() {

  drawBackground();

  // Ground
  fill(70, 180, 90);
  rect(0, height - 100, width, 100);

  // Platforms (original positions preserved)
  drawPlatform(width * 0.20, height - 220, 250, 40);
  drawPlatform(width * 0.50, height - 340, 250, 40);
  drawPlatform(width * 0.78, height - 470, 200, 40);

  // Finish flag
  drawFlag();

  // ── Physics ──
  player.velY += gravity;
  player.y    += player.velY;

  // Ground collision
  if (player.y + player.h >= height - 100) {
    player.y     = height - 100 - player.h;
    player.velY  = 0;
    player.jumps = 0; // reset double jump
    spawnDust(player.x + player.w / 2, player.y + player.h);
  }

  // Platform collisions
  checkPlatform(width * 0.20, height - 220, 250, 40);
  checkPlatform(width * 0.50, height - 340, 250, 40);
  checkPlatform(width * 0.78, height - 470, 200, 40);

  // ── Invincibility countdown ──
  if (invincible) {
    invincibleTimer--;
    if (invincibleTimer <= 0) invincible = false;
  }

  // ── Draw player (flicker when hit) ──
  if (!invincible || frameCount % 6 < 3) {
    drawCat(player.x, player.y);
  }

  // ── Effects ──
  updateDustParticles();
  updateSparkles();

  // ── Enemies ──
  drawEnemies();

  // ── HUD ──
  drawHUD();

  // ── Movement input ──
  movement();

  // ── Next level trigger (reach right edge near flag) ──
  if (player.x > width - 120) {
    advanceLevel();
  }
}


// ============================================================
//  ADVANCE LEVEL
// ============================================================
function advanceLevel() {
  level++;
  score += 250;
  shake  = 12;

  // Celebrate with sparkles at the flag
  for (let i = 0; i < 24; i++) {
    sparkles.push({
      x:   width - 90,
      y:   height - 250,
      vx:  random(-4, 4),
      vy:  random(-7, -1),
      life: 70,
      col: color(random(200,255), random(180,255), random(50,180))
    });
  }
  // levelSnd.play(); // placeholder

  player.x  = 120;
  gravity  += 0.04; // progressive difficulty
  createEnemies();
}


// ============================================================
//  PLATFORM DRAW (original + small mushroom decoration)
// ============================================================
function drawPlatform(x, y, w, h) {
  fill(120, 90, 50);
  rect(x, y, w, h, 12);
  fill(80, 220, 90);
  rect(x, y, w, 12, 12);

  // Tiny mushroom
  fill(255, 70, 70);
  circle(x + 28, y - 8, 16);
  fill(255);
  circle(x + 25, y - 10, 4);
  circle(x + 31, y - 12, 3);
}


// ============================================================
//  FLAG (original + waving animation)
// ============================================================
function drawFlag() {
  // Pole
  fill(210, 210, 210);
  rect(width - 92, height - 262, 10, 144);

  // Waving flag
  let wave = sin(frameCount * 0.1) * 5;
  fill(255, 40, 40);
  beginShape();
  vertex(width - 82, height - 262);
  vertex(width - 82 + 70, height - 237 + wave);
  vertex(width - 82, height - 208);
  endShape(CLOSE);

  // Star detail
  fill(255, 230, 0);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("★", width - 82 + 32, height - 234 + wave);

  // Base
  fill(140, 110, 55);
  rect(width - 102, height - 124, 28, 15, 5);
}


// ============================================================
//  ENEMIES (original + directional eyes + angry brow)
// ============================================================
function drawEnemies() {

  for (let e of enemies) {

    // Body
    fill(255, 80, 80);
    rect(e.x, e.y, e.w, e.h, 15);

    // Eyes follow movement direction
    let eo = e.dir > 0 ? 5 : -5;
    fill(255);
    circle(e.x + 16 + eo, e.y + 18, 11);
    circle(e.x + 38 + eo, e.y + 18, 11);
    fill(0);
    circle(e.x + 17 + eo, e.y + 19, 5);
    circle(e.x + 39 + eo, e.y + 19, 5);

    // Angry brows
    stroke(0);
    strokeWeight(2.5);
    if (e.dir > 0) {
      line(e.x + 12, e.y + 10, e.x + 23, e.y + 14);
      line(e.x + 34, e.y + 14, e.x + 45, e.y + 10);
    } else {
      line(e.x + 12, e.y + 14, e.x + 23, e.y + 10);
      line(e.x + 34, e.y + 10, e.x + 45, e.y + 14);
    }
    noStroke();

    // Spikes (original)
    fill(220, 55, 55);
    triangle(e.x + 5,  e.y, e.x + 15, e.y - 15, e.x + 25, e.y);
    triangle(e.x + 25, e.y, e.x + 35, e.y - 15, e.x + 45, e.y);

    // Movement (original)
    e.x += e.speed * e.dir;
    if (e.x < 0 || e.x > width - e.w) e.dir *= -1;

    // Collision check
    if (
      !invincible &&
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ) {
      playerHit();
    }
  }
}


// ============================================================
//  PLAYER HIT — lives system
// ============================================================
function playerHit() {
  lives--;
  shake          = 26;
  invincible     = true;
  invincibleTimer= 62; // ~1 second
  // hitSnd.play(); // placeholder

  if (lives <= 0) {
    if (score > highScore) highScore = score;
    gameOverAlpha = 0;
    spawnGoParticles();
    gameState = "gameover";
    // gameoverSnd.play(); // placeholder
  }
}


// ============================================================
//  CAT DRAW (original structure + improved details)
// ============================================================
function drawCat(x, y) {
  push();
  translate(x, y);

  // Tail with bezier + wag
  stroke(140, 140, 155);
  strokeWeight(7);
  noFill();
  let wag = sin(frameCount * 0.15) * 14;
  bezier(50, 40, 82, 8 + wag, 104, -8 + wag, 88, -22 + wag);
  noStroke();

  // Shadow
  fill(0, 45);
  ellipse(30, 66, 54, 14);

  // Body
  fill(175, 175, 188);
  rect(0, 10, 60, 50, 20);

  // Belly highlight
  fill(220, 215, 220);
  ellipse(30, 40, 30, 26);

  // Ears (outer + inner pink)
  fill(175, 175, 188);
  triangle(10, 10, 18, -14, 30, 10);
  triangle(30, 10, 42, -14, 50, 10);
  fill(255, 160, 175);
  triangle(13, 8,  20, -9,  28, 8);
  triangle(32, 8,  40, -9,  47, 8);

  // Eyes (white + green iris + pupil + shine)
  fill(255);
  circle(20, 30, 13);
  circle(40, 30, 13);
  fill(40, 160, 60);
  circle(21, 31, 7);
  circle(41, 31, 7);
  fill(0);
  circle(21, 31, 4);
  circle(41, 31, 4);
  fill(255);
  circle(23, 29, 2);
  circle(43, 29, 2);

  // Nose
  fill(255, 130, 145);
  triangle(30, 38, 25, 46, 35, 46);

  // Whiskers
  stroke(120, 120, 130);
  strokeWeight(1.5);
  line(0,  43, 24, 41);
  line(0,  48, 24, 46);
  line(36, 41, 60, 43);
  line(36, 46, 60, 48);
  noStroke();

  pop();
}


// ============================================================
//  HUD (improved — lives, high score, rounded panel)
// ============================================================
function drawHUD() {

  // ── Left info panel ──
  fill(0, 0, 0, 155);
  stroke(255, 255, 255, 70);
  strokeWeight(2);
  rect(16, 16, 308, 148, 22);
  noStroke();

  textAlign(LEFT, CENTER);
  textSize(20);

  fill(185, 220, 255);
  text("LEVEL",    38, 46);
  text("SCORE",    38, 78);
  text("BEST",     38, 110);
  text("MODE",     38, 142);

  fill(255, 215, 60);
  textAlign(RIGHT, CENTER);
  textSize(22);
  text(level,         308, 46);
  text(score,         308, 78);
  text(highScore,     308, 110);

  // Difficulty colour coded
  if      (difficulty === "easy")   fill(90, 255, 120);
  else if (difficulty === "medium") fill(255, 210, 70);
  else                              fill(255, 85, 85);
  text(difficulty.toUpperCase(),    308, 142);

  // ── Lives (hearts) — top right ──
  textSize(30);
  for (let i = 0; i < 3; i++) {
    if (i < lives) fill(255, 70, 95);
    else           fill(70, 70, 90);
    textAlign(RIGHT, CENTER);
    text("♥", width - 20 - i * 40, 44);
  }

  // ── New high score banner ──
  if (score > 0 && score >= highScore) {
    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(17);
    text("✦  NEW HIGH SCORE!  ✦", width / 2, 34);
  }
}


// ============================================================
//  GAME OVER SCREEN (original + fade, particles, panel)
// ============================================================
function drawGameOver() {

  // Fade overlay
  gameOverAlpha = min(gameOverAlpha + 5, 225);
  fill(8, 8, 30, gameOverAlpha);
  rect(0, 0, width, height);

  // Stars still visible
  for (let s of stars) { fill(255, 255, 255, 190); circle(s.x, s.y, s.size); }

  // Floating particles
  updateGoParticles();

  // ── Panel ──
  let pw = min(480, width - 60);
  let ph = 360;
  let px = width / 2 - pw / 2;
  let py = height / 2 - ph / 2 - 10;

  fill(0, 0, 0, 200);
  rect(px + 10, py + 10, pw, ph, 28);

  fill(18, 18, 55, 245);
  stroke(220, 50, 50, 190);
  strokeWeight(3);
  rect(px, py, pw, ph, 28);
  noStroke();

  // Top accent
  fill(210, 40, 40);
  rect(px, py, pw, 9, 28, 28, 0, 0);

  // ── GAME OVER title ──
  fill(255, 75, 75);
  textAlign(CENTER, CENTER);
  textSize(52);
  text("GAME OVER", width / 2, py + 65);

  // Divider
  fill(255, 255, 255, 55);
  rect(px + 30, py + 106, pw - 60, 2, 2);

  // ── Stats ──
  textSize(21);
  textAlign(LEFT, CENTER);
  fill(185, 220, 255);
  text("Final Score",   px + 48, py + 148);
  text("Level Reached", px + 48, py + 188);
  text("Difficulty",    px + 48, py + 228);

  fill(255, 215, 60);
  textAlign(RIGHT, CENTER);
  text(score,                    px + pw - 48, py + 148);
  text(level,                    px + pw - 48, py + 188);
  text(difficulty.toUpperCase(), px + pw - 48, py + 228);

  // New high score note
  if (score > 0 && score >= highScore) {
    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(17);
    text("🏆  NEW HIGH SCORE!", width / 2, py + 268);
  }

  // ── Controls hint ──
  fill(255, 255, 255, 185);
  textSize(17);
  textAlign(CENTER, CENTER);
  text("SPACE / CLICK — Play Again     M — Menu", width / 2, py + ph - 28);
}


// ============================================================
//  PLATFORM COLLISION (original logic preserved)
// ============================================================
function checkPlatform(px, py, pw, ph) {
  if (
    player.x + player.w > px &&
    player.x < px + pw &&
    player.y + player.h > py &&
    player.y + player.h < py + ph + 22 &&
    player.velY >= 0
  ) {
    player.y     = py - player.h;
    player.velY  = 0;
    player.jumps = 0; // reset double jump when landing on platform
    spawnDust(player.x + player.w / 2, player.y + player.h);
  }
}


// ============================================================
//  MOVEMENT (original + A/D keys added)
// ============================================================
function movement() {
  let speed = 5;
  if (difficulty === "medium") speed = 6;
  if (difficulty === "hard")   speed = 7;
  speed += level * 0.08;

  if (keyIsDown(LEFT_ARROW)  || keyIsDown(65))  player.x -= speed; // 65 = A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68))  player.x += speed; // 68 = D

  player.x = constrain(player.x, 0, width - player.w);
}


// ============================================================
//  DOUBLE JUMP — centralised jump function
// ============================================================
function doJump() {
  if (player.jumps < 2) {
    player.velY   = -17;
    player.jumps += 1;
    spawnDust(player.x + player.w / 2, player.y + player.h);
    // jumpSnd.play(); // placeholder
  }
}


// ============================================================
//  KEY PRESSED
// ============================================================
function keyPressed() {

  // Instructions screen: ENTER or SPACE → menu
  if (gameState === "instructions") {
    if (keyCode === ENTER || keyCode === 32) gameState = "menu";
    return;
  }

  // Gameplay: W / Up / Spacebar = jump
  if (gameState === "play") {
    if (key === 'w' || keyCode === UP_ARROW || keyCode === 32) doJump();
  }

  // Game Over: SPACE = restart, R = restart, M = menu
  if (gameState === "gameover") {
    if (keyCode === 32 || key === 'r' || key === 'R') restartGame();
  }

  // M key = go to menu from anywhere
  if (key === 'm' || key === 'M') gameState = "menu";
}


// ============================================================
//  MOUSE PRESSED
// ============================================================
function mousePressed() {

  // Instructions → menu
  if (gameState === "instructions") {
    gameState = "menu";
    return;
  }

  // Menu: click difficulty buttons
  if (gameState === "menu") {
    for (let btn of buttons) {
      if (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h) {
        startGame(btn.mode);
        // clickSnd.play(); // placeholder
      }
    }
    return;
  }

  // Gameplay: click to jump
  if (gameState === "play") {
    doJump();
    return;
  }

  // Game Over: click to restart
  if (gameState === "gameover") {
    restartGame();
  }
}


// ============================================================
//  START GAME
// ============================================================
function startGame(mode) {
  difficulty = mode;

  if      (difficulty === "easy")   { gravity = 0.7;  baseGravity = 0.7;  }
  else if (difficulty === "medium") { gravity = 0.9;  baseGravity = 0.9;  }
  else                              { gravity = 1.2;  baseGravity = 1.2;  }

  level         = 1;
  score         = 0;
  lives         = 3;
  invincible    = false;
  dustParticles = [];
  sparkles      = [];

  resetPlayer();
  createEnemies();
  gameState = "play";
  // bgMusic.loop(); // placeholder
}


// ============================================================
//  RESTART GAME
// ============================================================
function restartGame() {
  gravity       = baseGravity;
  level         = 1;
  score         = 0;
  lives         = 3;
  invincible    = false;
  dustParticles = [];
  sparkles      = [];
  goParticles   = [];

  resetPlayer();
  createEnemies();
  gameState = "menu";
}


// ============================================================
//  RESET PLAYER
// ============================================================
function resetPlayer() {
  player = {
    x:     100,
    y:     height - 220,
    w:     60,
    h:     60,
    velY:  0,
    jumps: 0   // 0=on ground, 1=first jump, 2=double jump used
  };
}


// ============================================================
//  CREATE ENEMIES (progressive difficulty)
// ============================================================
function createEnemies() {
  enemies = [];

  let enemyCount = level + 1;
  if (difficulty === "medium") enemyCount += 2;
  if (difficulty === "hard")   enemyCount += 4;
  enemyCount = min(enemyCount, 14); // cap so screen isn't impossible

  let minSpeed = 2.0 + level * 0.35;
  let maxSpeed = 4.0 + level * 0.55;

  if (difficulty === "medium") { minSpeed *= 1.2; maxSpeed *= 1.2; }
  if (difficulty === "hard")   { minSpeed *= 1.6; maxSpeed *= 1.6; }

  for (let i = 0; i < enemyCount; i++) {
    enemies.push({
      x:     random(350, width - 150),
      y:     random(height - 500, height - 150),
      w:     55,
      h:     55,
      dir:   random([1, -1]),
      speed: random(minSpeed, maxSpeed)
    });
  }
}


// ============================================================
//  CREATE BACKGROUND OBJECTS
// ============================================================
function createBackgroundObjects() {
  clouds    = [];
  particles = [];
  stars     = [];
  leaves    = [];

  for (let i = 0; i < 15; i++)
    clouds.push({ x:random(width), y:random(50,300), size:random(100,220), speed:random(0.2,1) });

  for (let i = 0; i < 80; i++)
    particles.push({ x:random(width), y:random(height), size:random(2,6), speed:random(0.5,2) });

  for (let i = 0; i < 120; i++)
    stars.push({ x:random(width), y:random(height), size:random(1,4) });

  for (let i = 0; i < 30; i++)
    leaves.push({ x:random(width), y:random(height), size:random(10,25), speed:random(1,3), rot:random(TWO_PI) });
}


// ============================================================
//  CREATE BUTTONS
// ============================================================
function createButtons() {
  buttons = [
    { text:"EASY",   x:width/2-170, y:362, w:340, h:72, color:color(100,255,140), mode:"easy"   },
    { text:"MEDIUM", x:width/2-170, y:460, w:340, h:72, color:color(255,220,90),  mode:"medium" },
    { text:"HARD",   x:width/2-170, y:558, w:340, h:72, color:color(255,100,100), mode:"hard"   }
  ];
}


// ============================================================
//  JUMP DUST EFFECT
// ============================================================
function spawnDust(x, y) {
  for (let i = 0; i < 7; i++) {
    dustParticles.push({
      x: x + random(-16, 16),
      y: y,
      vx: random(-2.5, 2.5),
      vy: random(-3, -0.5),
      life: 22,
      size: random(6, 14)
    });
  }
}

function updateDustParticles() {
  for (let i = dustParticles.length - 1; i >= 0; i--) {
    let d = dustParticles[i];
    fill(255, 255, 255, map(d.life, 0, 22, 0, 145));
    noStroke();
    circle(d.x, d.y, d.size);
    d.x    += d.vx;
    d.y    += d.vy;
    d.life--;
    if (d.life <= 0) dustParticles.splice(i, 1);
  }
}


// ============================================================
//  SPARKLE EFFECT (level complete)
// ============================================================
function updateSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i];
    push();
    translate(s.x, s.y);
    rotate(frameCount * 0.12);
    fill(red(s.col), green(s.col), blue(s.col), map(s.life, 0, 70, 0, 240));
    noStroke();
    // 4-pointed star
    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 4) {
      let r = (a % (PI / 2) === 0) ? 9 : 3;
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
    pop();
    s.x    += s.vx;
    s.y    += s.vy;
    s.vy   += 0.14;
    s.life--;
    if (s.life <= 0) sparkles.splice(i, 1);
  }
}


// ============================================================
//  GAME OVER PARTICLES
// ============================================================
function spawnGoParticles() {
  goParticles = [];
  for (let i = 0; i < 55; i++) {
    goParticles.push({
      x: random(width),  y: random(height),
      vx: random(-2,2),  vy: random(-2.5,1),
      life: random(90,200),
      size: random(4,12),
      col: color(random(200,255), random(40,120), random(40,120))
    });
  }
}

function updateGoParticles() {
  for (let i = goParticles.length - 1; i >= 0; i--) {
    let p = goParticles[i];
    fill(red(p.col), green(p.col), blue(p.col), map(p.life, 0, 200, 0, 200));
    noStroke();
    circle(p.x, p.y, p.size);
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) goParticles.splice(i, 1);
  }
}


// ============================================================
//  RESPONSIVE RESIZE
// ============================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createButtons();
  createBackgroundObjects();
  resetPlayer();
}