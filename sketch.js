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
    npcIndex: 0
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
    npcIndex: 1
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
    npcIndex: 2
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

// ===== ask2 左右翻轉版本 =====
function drawNpc(npc) {
  push();
  translate(npc.x, npc.y);
  imageMode(CENTER);

  // === die 動畫中 ===
  if (npc.isDying && npc.dieFrames.length > 0) {
    let frame = npc.dieFrames[npc.dieFrameIndex];
    scale(npc.folder === 'ask2' ? -npc.scale : npc.scale, npc.scale);
    image(frame, 0, 0);

    npc.frameCounter++;
    if (npc.frameCounter >= npc.frameDelay) {
      npc.frameCounter = 0;
      npc.dieFrameIndex++;

      // 播完 → 停住
      if (npc.dieFrameIndex >= npc.dieFrames.length) {
        npc.dieFrameIndex = npc.dieFrames.length - 1;
        npc.isDying = false;
        npc.isDead = true;
      }
    }

    pop();
    return;
  }

  // === 已死亡：停在最後一禎 ===
  if (npc.isDead && npc.dieFrames.length > 0) {
    scale(npc.folder === 'ask2' ? -npc.scale : npc.scale, npc.scale);
    image(npc.dieFrames[npc.dieFrames.length - 1], 0, 0);
    pop();
    return;
  }

  // === 正常 stay 動畫 ===
  npc.frameCounter++;
  if (npc.frameCounter >= npc.frameDelay) {
    npc.frameCounter = 0;
    npc.currentFrame = (npc.currentFrame + 1) % npc.frames.length;
  }

  scale(npc.folder === 'ask2' ? -npc.scale : npc.scale, npc.scale);
  image(npc.frames[npc.currentFrame], 0, 0);

  pop();
}



function checkInteractions() {
  let playerNearNpc = false;
  for (let npc of npcs) {
    if (npc.isDead) continue;
    let d = dist(player.x, player.y, npc.x, npc.y);
    if (d < 100) {
      playerNearNpc = true;
      // 只有在沒有顯示結果訊息時才顯示新問題（避免蓋掉結果訊息）
      if (!showQuiz && resultTimer === 0) {
        currentNpc = npc;
        currentQuestion = getRandomQuestion(npc);
        showQuiz = true;
        userAnswer = '';
        quizResult = '';
        
      }
      break;
    }
  }
  
  // 如果玩家離開所有 NPC，關閉問答框
  if (!playerNearNpc && showQuiz) {
    showQuiz = false;
    userAnswer = '';
    // 記錄為未回答的題目
    
    currentNpc = null;
    currentQuestion = null;
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
  // ===== 提問者對話框設定 =====
  // 位置：提問者頭上
  // 大小：寬 300px，高 150px
  // 背景色：白色，透明度 230
  // 邊框：黑色，粗細 3px
  // 圓角：10px
  fill(255, 255, 255, 230);
  stroke(0);
  strokeWeight(3);
  rect(currentNpc.x - 150, currentNpc.y - 200, 300, 150, 10);
  
  // 問題文字設定
  // 字體大小：14px
  // 顏色：黑色
  // 對齊：左上對齊
  // 自動換行寬度：280px
  fill(0);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  
  let question = '???';
  if (currentQuestion) {
    question = currentQuestion.question;
  }
  
  text(question, currentNpc.x - 140, currentNpc.y - 190, 280);
  
  // ===== 玩家輸入框設定 =====
  // 位置：玩家頭上
  // 大小：寬 160px，高 40px
  // 背景色：白色
  // 邊框：黑色，粗細 2px
  // 圓角：5px
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(player.x - 80, player.y - 80, 160, 40, 5);
  
  // 輸入文字設定
  // 字體大小：20px
  // 顏色：黑色
  // 對齊：置中
  fill(0);
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text(userAnswer, player.x, player.y - 50);
  
  // 提示文字設定
  // 字體大小：12px
  textSize(12);
  text('輸入答案並按 Enter', player.x, player.y - 70);
}

function drawHintPrompt() {
  fill(255, 255, 255, 230);
  stroke(0);
  strokeWeight(2);
  rect(hintNpc.x - 110, hintNpc.y - 100, 220, 60, 10);
  
  fill(0);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  
  if (hintMessage === '') {
    text('按 F 以獲取提示', hintNpc.x, hintNpc.y - 70);
  } else {
    let hint = hintMessage;
    if (!hintNpc.hasHints) {
      hint = '???';
    }
    text(hint, hintNpc.x - 88, hintNpc.y - 70, 180);
  }
}

function drawResultMessage() {
  // 結果訊息顯示在提問者頭上
  if (!resultNpc) return;
  
  fill(255, 255, 255, 230);
  stroke(0);
  strokeWeight(3);
  rect(resultNpc.x - 100, resultNpc.y - 130, 200, 60, 10);
  
  fill(0);
  noStroke();
  textSize(18);
  textAlign(CENTER, CENTER);
  text(quizResult, resultNpc.x, resultNpc.y - 97);
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

  // 半透明黑色背景
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);

  // 白色彈窗本體
  let w = 500;
  let h = 320;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, 12);

  // 文字內容
  fill(0);
  noStroke();
  textSize(18);
  textAlign(CENTER, TOP);

  let msg = 
    "使用說明\n\n" +
    "往左、往右、往下走會遇到死神。\n" +
    "他們各有兩題問題，會隨機問你。\n\n" +
    "如果答錯了，往上走找貓咪可以取得提示。\n\n" +
    "答對了才會切換下一題喔！\n" +
    "努力打敗所有死神吧！";

  text(msg, width / 2, y + 25);

  // OK 按鈕
  let btnW = 120;
  let btnH = 40;
  let btnX = width / 2 - btnW / 2;
  let btnY = y + h - 60;

  fill(230);
  stroke(0);
  strokeWeight(2);
  rect(btnX, btnY, btnW, btnH, 8);

  fill(0);
  noStroke();
  textSize(20);
  text("OK", width / 2, btnY + btnH / 2 - 8);

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
