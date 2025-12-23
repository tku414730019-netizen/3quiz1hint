let player;
let npcs = [];
let hintNpc;
let bg;
let showTutorial = true;   // 一開始顯示使用說明彈窗

// 音樂和音效
let bgMusic;
let gameSound;

let currentNpc = null;
let currentQuestion = null;
let showQuiz = false;
let userAnswer = '';
let quizResult = '';
let resultTimer = 0;

let showHint = false;
let hintMessage = '';

// 記錄最近一次答錯或未回答的題目索引
let lastWrongQuestionIndex = -1;
let lastWrongNpcIndex = -1;

// 記錄最近一次被出題（asked）的題目索引（用於提示）
let lastAskedQuestionIndex = -1;
let lastAskedNpcIndex = -1;

// 用來顯示結果訊息的 NPC（回答後可在該 NPC 頭上顯示正/錯）
let resultNpc = null;

// 新增控制變數
let typewriterIndex = 0;      // 打字機目前顯示到第幾個字
let typewriterSpeed = 0.5;    // 打字速度（數字越小越慢）
let shakeAmount = 0;          // 震動強度

let leaves = []; // 存放葉子的陣列

class Leaf {
  constructor() {
    this.x = random(width);
    this.y = random(-500, -50); // 從螢幕上方外面開始掉落
    this.size = random(10, 20);
    this.speedY = random(1, 3);
    this.speedX = random(-1, 1);
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(0.02, 0.05);
  }

  update() {
    this.y += this.speedY;
    this.x += sin(frameCount * 0.02) + this.speedX; // 讓葉子有左右飄盪感
    this.angle += this.rotationSpeed;
    
    // 如果掉出螢幕下方，重新回到上方
    if (this.y > height) {
      this.y = -50;
      this.x = random(width);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(100, 150, 50, 200); // 綠色葉子，帶點透明
    noStroke();
    // 畫一個簡單的葉子形狀（橢圓）
    ellipse(0, 0, this.size, this.size / 2);
    // 葉脈線條
    stroke(50, 80, 20);
    line(-this.size/2, 0, this.size/2, 0);
    pop();
  }
}

function preload() {
  bg = loadImage('bg.png');

  // 載入音樂和音效
  bgMusic = loadSound('assets/bgmusic.mp3',
    () => console.log('背景音樂載入成功'),
    () => console.error('背景音樂載入失敗')
  );
  
  gameSound = loadSound('assets/gamesound.mp3',
    () => console.log('遊戲音效載入成功'),
    () => console.error('遊戲音效載入失敗')
  );

  // player
  player = {
    x: 1000,
    y: 400,
    vx: 0,
    vy: 0,
    speed: 3,
    state: 'stay',
    direction: 1,
    stayImg: null,
    walkSheet: null,
    walkFrames: [],
    currentFrame: 0,
    frameDelay: 8,
    frameCounter: 0
  };
  
  player.stayImg = loadImage('player/stay.png',
    () => console.log('玩家 stay 載入成功'),
    () => console.error('玩家 stay 載入失敗')
  );
  
  player.walkSheet = loadImage('player/walk/36x36.png',
    (img) => {
      console.log('玩家 walk 載入成功');
      extractFrames(img, player.walkFrames, 36, 36, 5);
    },
    () => console.error('玩家 walk 載入失敗')
  );
  
  // ask NPCs
  let a1 = {
    folder: 'ask1',
    x: 1020+300,
    y: 320,
    state: 'stay',
    staySheet: null,
    frames: [],

    dieSheet: null,
    dieFrames: [],
    dieFrameIndex: 0,
    isDead: false,
    isDying: false,


    fw: 48,
    fh: 51,
    quiz: null,
    scale: 2.0,
    currentFrame: 0,
    frameDelay: 10,
    frameCounter: 0,
    hasQuiz: false,
    answeredQuestions: [],
    npcIndex: 0,
    
    shakeAmount: 0
  };
  
  a1.staySheet = loadImage('ask1/stay/48x51.png',
    (img) => {
      console.log('ask1 載入成功');
      extractFrames(img, a1.frames, 48, 51, 5);
    },
    () => {
      console.error('ask1 載入失敗');
      createPlaceholderFrames(a1.frames, 48, 51);
    }
  );
  a1.dieSheet = loadImage('ask1/die/50x60.png',
    (img) => {
      console.log('ask1 die 載入成功');
      extractFrames(img, a1.dieFrames, 50, 60, 5);
    },
    () => console.error('ask1 die 載入失敗')
  );

  
  loadTable('ask1/quiz1.csv', 'csv', 'header',
    (table) => {
      a1.quiz = table;
      a1.hasQuiz = true;
      console.log('ask1 quiz 載入成功，共 ' + table.getRowCount() + ' 題');
    },
    () => {
      console.log('ask1 quiz 載入失敗，使用預設');
      a1.hasQuiz = false;
    }
  );

  let a2 = {
    folder: 'ask2',
    x: 220+300,
    y: 320,
    state: 'stay',
    staySheet: null,
    frames: [],

    dieSheet: null,
    dieFrames: [],
    dieFrameIndex: 0,
    isDead: false,
    isDying: false,

    fw: 47,
    fh: 62,
    quiz: null,
    scale: 2.0,
    currentFrame: 0,
    frameDelay: 10,
    frameCounter: 0,
    hasQuiz: false,
    answeredQuestions: [],
    npcIndex: 1,

    shakeAmount: 0,
  };
  
  a2.staySheet = loadImage('ask2/stay/47x62.png',
    (img) => {
      console.log('ask2 載入成功');
      extractFrames(img, a2.frames, 47, 62, 5);
    },
    () => {
      console.error('ask2 載入失敗');
      createPlaceholderFrames(a2.frames, 47, 62);
    }
  );
 
  a2.dieSheet = loadImage('ask2/die/47x71.png',
    (img) => {
      console.log('ask2 die 載入成功');
      extractFrames(img, a2.dieFrames, 47, 71, 5);
    },
    () => console.error('ask2 die 載入失敗')
  );

  
  loadTable('ask2/quiz2.csv', 'csv', 'header',
    (table) => {
      a2.quiz = table;
      a2.hasQuiz = true;
      console.log('ask2 quiz 載入成功，共 ' + table.getRowCount() + ' 題');
    },
    () => {
      console.log('ask2 quiz 載入失敗，使用預設');
      a2.hasQuiz = false;
    }
  );

  let a3 = {
    folder: 'ask3',
    x: 620+300,
    y: 550+150,
    state: 'stay',
    staySheet: null,
    frames: [],

    dieSheet: null,
    dieFrames: [],
    dieFrameIndex: 0,
    isDead: false,
    isDying: false,


    fw: 46,
    fh: 40,
    quiz: null,
    scale: 2.0,
    currentFrame: 0,
    frameDelay: 10,
    frameCounter: 0,
    hasQuiz: false,
    answeredQuestions: [],
    npcIndex: 2,

    shakeAmount: 0,
  };
  
  a3.staySheet = loadImage('ask3/stay/46x40.png',
    (img) => {
      console.log('ask3 載入成功');
      extractFrames(img, a3.frames, 46, 40, 5);
    },
    () => {
      console.error('ask3 載入失敗');
      createPlaceholderFrames(a3.frames, 46, 40);
    }
  );

  a3.dieSheet = loadImage('ask3/die/44x40.png',
    (img) => {
      console.log('ask3 die 載入成功');
      extractFrames(img, a3.dieFrames, 44, 40, 5);
    },
    () => console.error('ask3 die 載入失敗')
  );

  
  loadTable('ask3/quiz3.csv', 'csv', 'header',
    (table) => {
      a3.quiz = table;
      a3.hasQuiz = true;
      console.log('ask3 quiz 載入成功，共 ' + table.getRowCount() + ' 題');
    },
    () => {
      console.log('ask3 quiz 載入失敗，使用預設');
      a3.hasQuiz = false;
    }
  );

  npcs.push(a1, a2, a3);

  // hint NPC
  hintNpc = {
    x: 600+300,
    y: 200,
    staySheet: null,
    frames: [],
    fw: 18,
    fh: 21,
    hints: null,
    scale: 3.0,
    currentFrame: 0,
    frameDelay: 10,
    frameCounter: 0,
    hasHints: false
  };
  
  hintNpc.staySheet = loadImage('hint/stay/18x21.png',
    (img) => {
      console.log('hint 載入成功');
      extractFrames(img, hintNpc.frames, 18, 21, 5);
    },
    () => {
      console.error('hint 載入失敗');
      createPlaceholderFrames(hintNpc.frames, 18, 21);
    }
  );
  
  loadTable('hint/hint.csv', 'csv', 'header',
    (table) => {
      hintNpc.hints = table;
      hintNpc.hasHints = true;
      console.log('hint csv 載入成功，共 ' + table.getRowCount() + ' 個提示');
    },
    () => {
      console.log('hint csv 載入失敗，使用預設');
      hintNpc.hasHints = false;
    }
  );
}

function extractFrames(sheet, framesArray, fw, fh, gap) {
  if (!sheet || !sheet.width) {
    console.error('Sheet 無效或未載入');
    return;
  }
  
  let cols = floor((sheet.width + gap) / (fw + gap));
  let rows = floor((sheet.height + gap) / (fh + gap));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * (fw + gap);
      let y = row * (fh + gap);
      let frame = sheet.get(x, y, fw, fh);
      framesArray.push(frame);
    }
  }
  console.log(`提取了 ${framesArray.length} 幀`);
}

function createPlaceholderFrames(framesArray, w, h) {
  let pg = createGraphics(w, h);
  pg.background(200, 100, 200);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(12);
  pg.text('?', w/2, h/2);
  framesArray.push(pg);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 禁止整個頁面捲動，避免出現白色背景
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  textAlign(CENTER, CENTER);
    // 玩家置中
  player.x = width / 2;
  player.y = height / 2;

  // === 修正：所有 NPC 在 setup 設置，不會被覆蓋 ===
  npcs[0].x = width * (2 / 3);   // ask1
  npcs[0].y = height * (1 / 2)-50;

  npcs[1].x = width * (1 / 3);   // ask2
  npcs[1].y = height * (1 / 2)-50;

  npcs[2].x = width * (1 / 2);   // ask3
  npcs[2].y = height * (2 / 3);

  hintNpc.x = width * (1 / 2);
  hintNpc.y = height * (1 / 3);
}




function draw() {
  background(bg);

    // === 使用說明彈窗 ===
  if (showTutorial) {
    drawTutorialPopup();
    return;   // 阻止後面的遊戲繪製
  }
  
  // 更新玩家
  updatePlayer();
  
  // === 根據 Y 座標排序繪製順序（實現空間感）===
  // 收集所有角色（玩家 + 所有 NPC）
  let allCharacters = [];
  
  // 加入玩家
  allCharacters.push({
    type: 'player',
    y: player.y,
    obj: player
  });
  
  // 加入 hint NPC
  allCharacters.push({
    type: 'hint',
    y: hintNpc.y,
    obj: hintNpc
  });
  
  // 加入所有 ask NPCs
  for (let npc of npcs) {
    allCharacters.push({
      type: 'npc',
      y: npc.y,
      obj: npc
    });
  }
  
  // 根據 Y 座標排序（Y 值小的先畫，Y 值大的後畫，這樣後畫的會覆蓋在上面）
  allCharacters.sort((a, b) => a.y - b.y);
  
  // 按順序繪製所有角色
  for (let char of allCharacters) {
    if (char.type === 'player') {
      drawPlayer();
    } else if (char.type === 'hint') {
      drawNpc(hintNpc);
    } else if (char.type === 'npc') {
      drawNpc(char.obj);
    }
  }
  
  // 檢查互動
  checkInteractions();
  
  // 顯示問答
  if (showQuiz && currentNpc) {
    drawQuizBox();
  }
  
  // 顯示提示
  if (showHint) {
    drawHintPrompt();
  }
  
  // 顯示結果訊息（在提問者頭上）
  if (resultTimer > 0 && resultNpc) {
    drawResultMessage();
    resultTimer--;
    // 當結果訊息倒數結束時，嘗試立即顯示下一題（延遲總計約 1 秒）
    if (resultTimer === 0) {
      // 如果玩家還在該 NPC 附近就顯示下一題
      let d = dist(player.x, player.y, resultNpc.x, resultNpc.y);
      if (d < 100) {
        // 顯示下一題
        currentNpc = resultNpc;
        currentQuestion = getRandomQuestion(currentNpc);
        showQuiz = true;
        userAnswer = '';
        quizResult = '';
        // 記錄最近被出題的題目
        if (currentQuestion && currentNpc) {
          lastAskedQuestionIndex = currentQuestion.index;
          lastAskedNpcIndex = currentNpc.npcIndex;
        }
      }
      // 清除 resultNpc（不再需要顯示）
      resultNpc = null;
    }
  }
  leaves.forEach(leaf => {
    leaf.update();
    leaf.display();
  });
}

function updatePlayer() {
  player.vx = 0;
  player.vy = 0;
  
  if (keyIsDown(LEFT_ARROW)) {
    player.vx = -player.speed;
    player.state = 'walk';
    player.direction = -1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.vx = player.speed;
    player.state = 'walk';
    player.direction = 1;
  }
  if (keyIsDown(UP_ARROW)) {
    player.vy = -player.speed;
    player.state = 'walk';
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.vy = player.speed;
    player.state = 'walk';
  }
  
  if (player.vx === 0 && player.vy === 0) {
    player.state = 'stay';
  }
  
  player.x += player.vx;
  player.y += player.vy;
  
  player.x = constrain(player.x, 50, width - 50);
  player.y = constrain(player.y, 50, height - 50);
  
  if (player.state === 'walk') {
    player.frameCounter++;
    if (player.frameCounter >= player.frameDelay) {
      player.frameCounter = 0;
      player.currentFrame = (player.currentFrame + 1) % player.walkFrames.length;
    }
  }
}

function drawPlayer() {
  push();
  translate(player.x, player.y);
  scale(player.direction * 2, 2);
  imageMode(CENTER);
  
  if (player.state === 'stay' && player.stayImg) {
    image(player.stayImg, 0, 0);
  } else if (player.state === 'walk' && player.walkFrames.length > 0) {
    image(player.walkFrames[player.currentFrame], 0, 0);
  } else {
    fill(100, 100, 255);
    noStroke();
    ellipse(0, 0, 20, 20);
  }
  pop();
}

function drawNpc(npc) {
  push();
  // 1. 先定位到 NPC 的基準點
  translate(npc.x, npc.y); 
  imageMode(CENTER);

  // 2. 計算震動位移（局部變數，不改動 npc.x）
  let sx = 0;
  let sy = 0;
  if (npc.shakeAmount > 0) {
    sx = random(-npc.shakeAmount, npc.shakeAmount);
    sy = random(-npc.shakeAmount, npc.shakeAmount);
    npc.shakeAmount *= 0.85; // 稍微加快衰減速度
    if (npc.shakeAmount < 0.1) npc.shakeAmount = 0;
  }

  // 3. 計算呼吸 (死亡不呼吸)
  let breathe = sin(frameCount * 0.1) * 0.05;
  let currentScale = npc.scale + (npc.isDead ? 0 : breathe);
  let direction = npc.folder === 'ask2' ? -1 : 1;

  scale(direction * currentScale, currentScale);

  // 4. 繪製圖片時才加入 sx, sy
  if (npc.isDying && npc.dieFrames.length > 0) {
    image(npc.dieFrames[npc.dieFrameIndex], sx, sy); // 加入震動位移
    
    npc.frameCounter++;
    if (npc.frameCounter >= npc.frameDelay) {
      npc.frameCounter = 0;
      npc.dieFrameIndex++;
      if (npc.dieFrameIndex >= npc.dieFrames.length) {
        npc.dieFrameIndex = npc.dieFrames.length - 1;
        npc.isDying = false;
        npc.isDead = true;
      }
    }
  } else if (npc.isDead && npc.dieFrames.length > 0) {
    image(npc.dieFrames[npc.dieFrames.length - 1], sx, sy);
  } else {
    // 正常狀態動畫
    npc.frameCounter++;
    if (npc.frameCounter >= npc.frameDelay) {
      npc.frameCounter = 0;
      npc.currentFrame = (npc.currentFrame + 1) % npc.frames.length;
    }
    image(npc.frames[npc.currentFrame], sx, sy); // 加入震動位移
  }
  
  pop();
}



function checkInteractions() {
  let playerNearNpc = false;
  for (let npc of npcs) {
    if (npc.isDead) continue;
    let d = dist(player.x, player.y, npc.x, npc.y);
    
    if (d < 100) {
      playerNearNpc = true;
      
      // 只有在「目前沒在顯示問答」且「沒在顯示結果訊息」時才觸發新問題
      if (!showQuiz && resultTimer === 0) {
        currentNpc = npc;
        currentQuestion = getRandomQuestion(npc);
        
        // --- 重要：觸發新問題時，重置打字機索引 ---
        typewriterIndex = 0; 
        
        showQuiz = true;
        userAnswer = '';
        quizResult = '';
      }
      break;
    }
  }
  
  // 如果玩家離開所有 NPC，關閉問答框並重置
  if (!playerNearNpc && showQuiz) {
    showQuiz = false;
    userAnswer = '';
    currentNpc = null;
    currentQuestion = null;
    typewriterIndex = 0; // 離開時也重置，確保下次進入正常
  }
  
  // 檢查與 hint NPC 的距離
  let hd = dist(player.x, player.y, hintNpc.x, hintNpc.y);
  if (hd < 100) {
    showHint = true;
  } else {
    showHint = false;
    hintMessage = '';
  }
}

function getRandomQuestion(npc) {
  if (!npc.hasQuiz || !npc.quiz) {
    return null;
  }
  
  let totalQuestions = npc.quiz.getRowCount();
  if (totalQuestions === 0) return null;
  
  // 找出未回答的題目
  let availableQuestions = [];
  for (let i = 0; i < totalQuestions; i++) {
    if (!npc.answeredQuestions.includes(i)) {
      availableQuestions.push(i);
    }
  }
  
  // 如果所有題目都答過了，重置
  if (availableQuestions.length === 0) {
    npc.answeredQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      availableQuestions.push(i);
    }
  }
  
  // 隨機選一題
  let randomIndex = availableQuestions[floor(random(availableQuestions.length))];
  
  return {
    index: randomIndex,
    question: npc.quiz.getString(randomIndex, 'question'),
    answer: npc.quiz.getString(randomIndex, 'answer')
  };
}

function drawQuizBox() {
  if (!currentNpc || !currentQuestion) return;

  // 使用 p5.js 的繪圖上下文來製作發光/陰影效果
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 0, 0, 100);

  // --- A. NPC 提問框美化 ---
  let bx = currentNpc.x - 150, by = currentNpc.y - 220, bw = 300, bh = 150;
  
  // 外框
  fill(40, 40, 60, 240); // 深色質感背板
  stroke(255);
  strokeWeight(2);
  rect(bx, by, bw, bh, 15);
  
  // 內裝飾線
  noFill();
  stroke(255, 100);
  rect(bx + 5, by + 5, bw - 10, bh - 10, 10);

  // 角色名字標籤 (Name Tag)
  fill(255);
  rect(bx + 20, by - 15, 80, 25, 5);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text("REAPER", bx + 60, by -1); // 標籤文字

  // 問題文字 (打字機)
  fill(255);
  textAlign(LEFT, TOP);
  textSize(15);
  if (typewriterIndex < currentQuestion.question.length) {
    typewriterIndex += typewriterSpeed;
  }
  let qText = currentQuestion.question.substring(0, floor(typewriterIndex));
  text(qText, bx + 20, by + 25, bw - 40);

  // --- B. 玩家輸入框美化 ---
  drawingContext.shadowBlur = 10;
  let px = player.x - 100, py = player.y - 90, pw = 200, ph = 45;
  
  fill(255);
  stroke(0);
  strokeWeight(3);
  rect(px, py, pw, ph, 8); // 稍微加寬的輸入框

  // 游標與文字
  let cursor = (floor(frameCount / 25) % 2 === 0) ? "|" : "";
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  text(userAnswer + cursor, player.x, py + ph/2+2);

  // 重置陰影，避免影響後續繪圖
  drawingContext.shadowBlur = 0;
}

function drawHintPrompt() {
  push();
  // 加上陰影
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 0, 0, 120);

  let bx = hintNpc.x - 110, by = hintNpc.y - 110, bw = 220, bh = 70;

  // --- 外框 (琥珀色系) ---
  fill(255, 245, 200, 240); // 柔和的羊皮紙色
  stroke(150, 100, 50);    // 棕色邊框
  strokeWeight(3);
  rect(bx, by, bw, bh, 12);

  // 內裝飾線
  stroke(150, 100, 50, 80);
  strokeWeight(1);
  rect(bx + 4, by + 4, bw - 8, bh - 8, 8);

  // 標籤 (Label)
  fill(150, 100, 50);
  rect(bx + 15, by - 12, 60, 22, 5);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(11);
  text("CAT INFO", bx + 45, by +1);

  // 提示文字內容
  fill(60, 40, 20); // 深褐色文字
  noStroke();
  textAlign(CENTER, CENTER);
  
  if (hintMessage === '') {
    textSize(14);
    text('按 F 以獲取提示', hintNpc.x, by + bh/2+2);
  } else {
    let hint = hintNpc.hasHints ? hintMessage : '???';
    textSize(14);
    // 使用 wrap 寬度，避免文字超出
    text(hint, bx + 15, by + 13, bw - 30, bh - 20);
  }

  pop();
}

function drawResultMessage() {
  if (!resultNpc) return;

  push();
  // 強力陰影，讓反饋更醒目
  drawingContext.shadowBlur = 20;
  
  // 判定配色：答對(綠) vs 答錯(紅)
  let isCorrect = quizResult.includes('對');
  let mainColor = isCorrect ? color(46, 204, 113) : color(231, 76, 60);
  drawingContext.shadowColor = mainColor;

  let bx = resultNpc.x - 100, by = resultNpc.y - 140, bw = 200, bh = 60;

  // --- 背景框 ---
  fill(255, 255, 255, 250); 
  stroke(mainColor);
  strokeWeight(4);
  rect(bx, by, bw, bh, 10);

  // 標籤 (STATUS)
  fill(mainColor);
  rect(bx + 15, by - 12, 70, 22, 5);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(11);
  text(isCorrect ? "SUCCESS" : "FAILED", bx + 50, by - 1);

  // 結果文字
  fill(isCorrect ? color(20, 100, 50) : color(100, 20, 20));
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text(quizResult, resultNpc.x, by + bh/2+5);

  pop();
}

function keyPressed() {
  if (showQuiz && key === 'Enter') {
    checkAnswer();
    // 播放音效
    if (gameSound) {
      gameSound.play();
    }
  }
  
  if (showQuiz && keyCode === BACKSPACE) {
    userAnswer = userAnswer.slice(0, -1);
  }
  
  if (showHint && (key === 'f' || key === 'F')) {

    // 尚未答錯：不給提示
    if (lastWrongQuestionIndex < 0) {
      hintMessage = "尚未回答題目，先嘗試看看吧！";
      // 播放音效
      if (gameSound) {
        gameSound.play();
      }
      return;
    }

    // 有答錯 → 顯示提示
    if (hintNpc.hasHints && hintNpc.hints) {
      try {
        let total = hintNpc.hints.getRowCount();
        let gIndex = lastWrongQuestionIndex;  // 全域題號 0~5

        if (gIndex < 0 || gIndex >= total) {
          hintMessage = "此題沒有對應提示";
          // 播放音效
          if (gameSound) {
            gameSound.play();
          }
          return;
        }

        hintMessage = hintNpc.hints.getString(gIndex, 'hint');
        // 播放音效
        if (gameSound) {
          gameSound.play();
        }

      } catch(e) {
        console.error("讀取提示失敗:", e);
        hintMessage = "???";
      }

    } else {
      hintMessage = "???";
    }
  }

}


function keyTyped() {
  if (showQuiz && key.length === 1 && key !== ' ') {
    userAnswer += key.toUpperCase();
  }
}

function checkAnswer() {
  if (!currentQuestion) {
    quizResult = 'CSV 檔案未載入';
  } else if (userAnswer === currentQuestion.answer) {
    quizResult = '答對了！';
    // 記錄為已答對的題目
    if (currentNpc) {
      currentNpc.answeredQuestions.push(currentQuestion.index);
      // ⭐ 如果兩題都答對，啟動死亡動畫
      if (currentNpc.answeredQuestions.length >= 2 && !currentNpc.isDead) {
        currentNpc.isDying = true;
        currentNpc.dieFrameIndex = 0;
      }
    }
  } else {
    quizResult = '答錯了，答案是 ' + currentQuestion.answer;
    shakeAmount = 10; // 觸發震動，強度為 10
    if (currentNpc) {
      currentNpc.shakeAmount = 10; // 只有當前的提問者會抖
    }
    // 記錄為答錯的題目
    if (currentNpc && currentQuestion) {
      let npcIdx = currentNpc.npcIndex;   // 0,1,2
      let localIdx = currentQuestion.index; 
      let globalIdx = npcIdx * 2 + localIdx;   // << 每人 2 題

      lastWrongQuestionIndex = globalIdx;
      lastWrongNpcIndex = npcIdx;
    }
  }
  
  // 顯示結果訊息約 1 秒（60 幀）
  resultTimer = 60;
  // 設定 resultNpc 為當前 NPC（讓結果顯示在該 NPC 頭上）
  resultNpc = currentNpc;

  // 關閉問答框（玩家頭上的輸入框）
  showQuiz = false;
  userAnswer = '';
  
  // 清除目前編輯的 NPC / 題目（等待結果結束後若玩家仍在範圍內會自動出下一題）
  currentNpc = null;
  currentQuestion = null;
}

// ----------- Background cover (保持比例填滿，並置中，避免 transform 影響) -----------
function drawBackgroundCover(img) {
  if (!img || !img.width || !img.height) {
    // 如果圖片尚未載入或無效就跳過
    background('#414071');
    return;
  }

  // 計算影像與畫布比例
  let imgRatio = img.width / img.height;
  let canvasRatio = width / height;
  let drawW, drawH;

  // 畫布比圖像寬（橫向較寬）→ 以寬為基準放大
  if (canvasRatio > imgRatio) {
    drawW = width;
    drawH = width / imgRatio;
  } else {
    // 畫布較窄或較高 → 以高為基準放大
    drawH = height;
    drawW = height * imgRatio;
  }

  // 計算置中偏移（使 cover 後置中）
  let x = (width - drawW) / 2;
  let y = (height - drawH) / 2;

  // 使用 CORNER 模式並重置 matrix，避免前面 transform 影響
  push();
  resetMatrix();        // 恢復到預設變換矩陣
  imageMode(CORNER);
  image(img, x, y, drawW, drawH);
  pop();
}

// ====================== 使用說明彈窗 ======================
function drawTutorialPopup() {
  push();

  // 1. 全螢幕半透明黑色背景 (稍微加深增加氛圍)
  fill(0, 180);
  noStroke();
  rect(0, 0, width, height);

  // 2. 彈窗設定
  let w = 500;
  let h = 350; // 稍微加高一點點，讓文字不擁擠
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  // --- 增加外發光效果 ---
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(0, 150, 255, 150);

  // 彈窗本體 (深色質感)
  fill(30, 35, 50, 250); 
  stroke(255);
  strokeWeight(3);
  rect(x, y, w, h, 20); // 增加圓角

  // 內部裝飾細邊框
  stroke(255, 40);
  strokeWeight(1);
  rect(x + 10, y + 10, w - 20, h - 20, 15);

  // 3. 頂部標籤標題 (GAME INFO)
  drawingContext.shadowBlur = 0; // 關閉文字陰影避免模糊
  fill(255);
  rect(x + w / 2 - 60, y - 15, 120, 30, 8);
  
  fill(0);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("使用說明", width / 2, y+2);

  // 4. 文字內容 (分段上色以突出重點)
  textAlign(CENTER, TOP);
  let contentY = y + 45;
  
  // 第一段
  fill(255);
  textStyle(NORMAL);
  textSize(17);
  text("往左、往右、往下走會遇到", width / 2, contentY);
  
  // 關鍵字：死神
  fill(255, 80, 80); // 紅色
  textStyle(BOLD);
  textSize(22);
  text("【 死 神 】", width / 2, contentY + 30);
  
  // 第二段
  fill(255);
  textStyle(NORMAL);
  textSize(16);
  text("他們各有兩題問題，會隨機問你。", width / 2, contentY + 65);
  text("如果答錯了，往上走尋找", width / 2, contentY + 95);

  // 關鍵字：貓咪
  fill(255, 215, 0); // 金黃色
  textStyle(BOLD);
  textSize(22);
  text("【 神 祕 貓 咪 】", width / 2, contentY + 125);

  // 第三段
  fill(200, 255, 200); // 淡淡的綠色
  textStyle(NORMAL);
  textSize(16);
  text("即可取得提示。", width / 2, contentY + 160);
  
  fill(255);
  textSize(18);
  textStyle(ITALIC);
  text("努力打敗所有死神吧！", width / 2, contentY + 200);

  // 5. OK 按鈕設計
  let btnW = 140;
  let btnH = 45;
  let btnX = width / 2 - btnW / 2;
  let btnY = y + h - 65;

  // 按鈕發光
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(46, 204, 113, 150);

  // 按鈕本體
  fill(46, 204, 113); // 翡翠綠
  stroke(255);
  strokeWeight(2);
  rect(btnX, btnY, btnW, btnH, 10);

  // 按鈕文字
  drawingContext.shadowBlur = 0;
  fill(255);
  noStroke();
  textStyle(BOLD);
  textSize(20);
  text("GO!", width / 2, btnY + btnH / 2 - 8);

  pop();
}

function mousePressed() {

  // 如果彈窗存在 → 檢查是否點擊 OK
  if (showTutorial) {
    let w = 500;
    let h = 320;
    let x = (width - w) / 2;
    let y = (height - h) / 2;

    let btnW = 120;
    let btnH = 40;
    let btnX = width / 2 - btnW / 2;
    let btnY = y + h - 60;

    // 點擊 OK 按鈕
    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btnY && mouseY < btnY + btnH) {

      showTutorial = false;  // 關閉彈窗
      for (let i = 0; i < 30; i++) {
        leaves.push(new Leaf());
      }
      
      // 播放音效
      if (gameSound) {
        gameSound.play();
      }
      
      // 開始播放背景音樂（循環）
      if (bgMusic && !bgMusic.isPlaying()) {
        bgMusic.loop();
      }
    }
    return; // 不處理其他點擊
  }

  // 若沒有彈窗 → 這裡放你原本的 mousePressed 行為（如果有的話）
}
