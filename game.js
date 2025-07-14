// HTML에서 'gameCanvas' ID를 가진 캔버스 요소를 가져옵니다.
const canvas = document.getElementById('gameCanvas');
// 캔버스에 그림을 그릴 수 있는 2D 렌더링 컨텍스트를 가져옵니다.
const ctx = canvas.getContext('2d');

// 플레이어 객체를 정의합니다.
const player = {
    x: canvas.width / 2 - 15, // 플레이어의 시작 x 좌표 (캔버스 중앙)
    y: canvas.height - 30,    // 플레이어의 시작 y 좌표 (캔버스 하단)
    width: 30,                // 플레이어의 너비
    height: 30,               // 플레이어의 높이
    color: 'blue',            // 플레이어의 색상
    speed: 5,                 // 플레이어의 이동 속도
    dx: 0                     // 플레이어의 x축 이동 방향 (0: 정지, 양수: 오른쪽, 음수: 왼쪽)
};

// 장애물을 저장할 배열을 생성합니다.
const obstacles = [];
// 장애물의 기본 속성을 정의하는 객체입니다.
const obstacleProps = {
    width: 20,                // 장애물의 너비
    height: 20,               // 장애물의 높이
    color: 'red',             // 장애물의 색상
    speed: 3                  // 장애물의 낙하 속도
};

// 현재 점수를 저장하는 변수입니다.
let score = 0;
// 게임 오버 상태를 저장하는 변수입니다.
let gameOver = false;

// --- 그리기 관련 함수들 ---

// 플레이어를 캔버스에 그리는 함수입니다.
function drawPlayer() {
    ctx.fillStyle = player.color; // 채우기 색상을 플레이어 색상으로 설정합니다.
    ctx.fillRect(player.x, player.y, player.width, player.height); // 플레이어 위치에 사각형을 그립니다.
}

// 모든 장애물을 캔버스에 그리는 함수입니다.
function drawObstacles() {
    ctx.fillStyle = obstacleProps.color; // 채우기 색상을 장애물 색상으로 설정합니다.
    obstacles.forEach(obstacle => { // 배열에 있는 모든 장애물에 대해 반복합니다.
        ctx.beginPath(); // 새로운 경로를 시작합니다.
        ctx.arc(obstacle.x, obstacle.y, obstacle.width / 2, 0, Math.PI * 2); // 장애물 위치에 원을 그립니다.
        ctx.fill(); // 원의 내부를 채웁니다.
    });
}

// 점수를 캔버스에 그리는 함수입니다.
function drawScore() {
    ctx.font = '20px Arial'; // 폰트 스타일을 설정합니다.
    ctx.fillStyle = 'black'; // 폰트 색상을 설정합니다.
    ctx.fillText(`Score: ${score}`, 10, 25); // 좌측 상단에 현재 점수를 텍스트로 씁니다.
}

// --- 게임 로직 관련 함수들 ---

// 캔버스를 깨끗하게 지우는 함수입니다.
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스의 모든 내용을 지웁니다.
}

// 플레이어를 움직이는 함수입니다.
function movePlayer() {
    player.x += player.dx; // 플레이어의 x 좌표를 dx만큼 변경하여 이동시킵니다.

    // 벽 충돌 감지 (왼쪽 벽)
    if (player.x < 0) {
        player.x = 0; // 플레이어가 왼쪽 벽을 넘지 못하게 합니다.
    }
    // 벽 충돌 감지 (오른쪽 벽)
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width; // 플레이어가 오른쪽 벽을 넘지 못하게 합니다.
    }
}

// 새로운 장애물을 생성하는 함수입니다.
function spawnObstacle() {
    const x = Math.random() * (canvas.width - obstacleProps.width); // 캔버스 너비 내에서 무작위 x 좌표를 생성합니다.
    obstacles.push({ x: x, y: 0, width: obstacleProps.width, height: obstacleProps.height }); // 새로운 장애물 객체를 배열에 추가합니다.
}

// 장애물을 아래로 움직이는 함수입니다.
function moveObstacles() {
    obstacles.forEach(obstacle => { // 모든 장애물에 대해 반복합니다.
        obstacle.y += obstacleProps.speed; // 각 장애물의 y 좌표를 속도만큼 증가시켜 아래로 이동시킵니다.
    });
}

// 플레이어와 장애물의 충돌을 감지하는 함수입니다.
function checkCollision() {
    obstacles.forEach((obstacle, index) => { // 모든 장애물에 대해 반복하며 인덱스도 함께 가져옵니다.
        // 간단한 사각형 충돌 감지 로직입니다.
        if (
            player.x < obstacle.x + obstacle.width && // 플레이어의 왼쪽이 장애물의 오른쪽보다 왼쪽에 있고
            player.x + player.width > obstacle.x &&   // 플레이어의 오른쪽이 장애물의 왼쪽보다 오른쪽에 있고
            player.y < obstacle.y + obstacle.height && // 플레이어의 위쪽이 장애물의 아래쪽보다 위에 있고
            player.y + player.height > obstacle.y      // 플레이어의 아래쪽이 장애물의 위쪽보다 아래에 있으면 충돌입니다.
        ) {
            gameOver = true; // 충돌 시 게임 오버 상태로 변경합니다.
        }

        // 화면 밖으로 나간 장애물을 제거하고 점수를 올립니다.
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1); // 배열에서 해당 장애물을 제거합니다.
            score++; // 점수를 1 증가시킵니다.
        }
    });
}

// 게임 오버 화면을 표시하는 함수입니다.
function showGameOver() {
    ctx.fillStyle = 'black'; // 텍스트 색상을 검은색으로 설정합니다.
    ctx.font = '40px Arial'; // 폰트 크기를 40px로 설정합니다.
    ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2); // 'GAME OVER' 텍스트를 화면 중앙에 표시합니다.
    ctx.font = '20px Arial'; // 폰트 크기를 20px로 설정합니다.
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 70, canvas.height / 2 + 40); // 최종 점수를 표시합니다.
    ctx.fillText('Press Enter to Restart', canvas.width / 2 - 95, canvas.height / 2 + 80); // 재시작 안내 문구를 표시합니다.
}

// 게임을 초기 상태로 리셋하는 함수입니다.
function resetGame() {
    gameOver = false; // 게임 오버 상태를 false로 되돌립니다.
    score = 0; // 점수를 0으로 초기화합니다.
    player.x = canvas.width / 2 - 15; // 플레이어 위치를 초기 위치로 설정합니다.
    player.y = canvas.height - 30; // 플레이어 위치를 초기 위치로 설정합니다.
    obstacles.length = 0; // 장애물 배열을 비웁니다.
    update(); // 게임 루프를 다시 시작합니다.
}


// --- 메인 게임 루프 ---
let obstacleSpawnTimer = 0; // 장애물 생성 타이머 변수입니다.

// 매 프레임마다 게임 상태를 업데이트하고 화면을 다시 그리는 메인 함수입니다.
function update() {
    if (gameOver) { // 만약 게임 오버 상태라면
        clearCanvas(); // 캔버스를 지우고
        showGameOver(); // 게임 오버 화면을 표시합니다.
        return; // update 함수 실행을 중단합니다.
    }

    clearCanvas(); // 매 프레임 시작 시 캔버스를 지웁니다.

    // 주기적으로 장애물을 생성합니다.
    obstacleSpawnTimer++; // 타이머를 1 증가시킵니다.
    if (obstacleSpawnTimer % 50 === 0) { // 타이머가 50의 배수가 될 때마다 (약 50프레임마다)
        spawnObstacle(); // 새로운 장애물을 생성합니다.
    }

    drawPlayer(); // 플레이어를 그립니다.
    drawObstacles(); // 장애물을 그립니다.
    drawScore(); // 점수를 그립니다.

    movePlayer(); // 플레이어를 움직입니다.
    moveObstacles(); // 장애물을 움직입니다.
    checkCollision(); // 충돌을 확인합니다.

    requestAnimationFrame(update); // 다음 애니메이션 프레임에 update 함수를 다시 호출하여 루프를 만듭니다.
}

// --- 이벤트 리스너 ---

// 키보드 키가 눌렸을 때 호출되는 함수입니다.
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') { // 오른쪽 화살표 키가 눌리면
        player.dx = player.speed; // 플레이어의 이동 방향을 오른쪽으로 설정합니다.
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') { // 왼쪽 화살표 키가 눌리면
        player.dx = -player.speed; // 플레이어의 이동 방향을 왼쪽으로 설정합니다.
    } else if (gameOver && e.key === 'Enter') { // 게임 오버 상태에서 Enter 키가 눌리면
        resetGame(); // 게임을 리셋합니다.
    }
}

// 눌렸던 키보드 키가 떼어졌을 때 호출되는 함수입니다.
function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) { // 좌우 화살표 키가 떼어지면
        player.dx = 0; // 플레이어의 이동을 멈춥니다.
    }
}

// 'keydown' 이벤트가 발생하면 keyDown 함수를 호출하도록 이벤트 리스너를 추가합니다.
document.addEventListener('keydown', keyDown);
// 'keyup' 이벤트가 발생하면 keyUp 함수를 호출하도록 이벤트 리스너를 추가합니다.
document.addEventListener('keyup', keyUp);

// 게임을 시작합니다.
update();