// main.js - フロントエンドUI制御 兼 Worker中継スクリプト

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusBadge = document.getElementById('status-badge');
const progressBar = document.getElementById('progress-bar');
const loadingSpinner = document.getElementById('loading-spinner');

// 👑 Web Worker の生成（バックグラウンドスレッドを立ち上げる）
const aiWorker = new Worker('./worker.js', { type: 'module' });

// メッセージ画面追加関数
function appendMessage(sender, text) {
    const msgBubble = document.createElement('div');
    msgBubble.classList.add('message', sender);
    msgBubble.innerText = text;
    chatContainer.appendChild(msgBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 👑 Worker から届くステータスやAIの返答を受信して画面を更新する
aiWorker.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'STATUS':
            statusBadge.innerText = data;
            break;
            
        case 'PROGRESS':
            progressBar.style.width = `${data}%`;
            statusBadge.innerText = `ダウンロード中: ${Math.round(data)}%`;
            break;

        case 'READY':
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            statusBadge.classList.add('ready');
            progressBar.style.width = '100%';
            userInput.placeholder = "今どんな気持ち？お話し聞くよ...";
            userInput.disabled = false;
            sendBtn.disabled = false;
            appendMessage('ai', 'お疲れ様！今日も大変だったね。ここに君の気持ち、全部吐き出しちゃっていいよ。ずっと話聞いてるからね。');
            break;

        case 'RESPONSE':
            // AIからの回答を画面に出力
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            appendMessage('ai', data);
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
            break;

        case 'ERROR':
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "エラー発生";
            statusBadge.classList.add('error');
            appendMessage('ai', `起動または通信中にエラーが起きたみたい。リロードしてみてね。\n(詳細: ${data})`);
            break;
    }
};

// 送信ボタンのクリックイベント
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;
    statusBadge.innerText = "うんうん...";
    loadingSpinner.classList.remove('hidden');

    // 👑 Worker にユーザーのテキストを送信し、裏で推論を行わせる
    aiWorker.postMessage({ type: 'SEND', data: text });
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
