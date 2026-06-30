// main.js - フロントエンドUI制御 兼 Worker中継スクリプト

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusBadge = document.getElementById('status-badge');
const progressBar = document.getElementById('progress-bar');
const loadingSpinner = document.getElementById('loading-spinner');

// 👑 Web Workerを起動
const aiWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

// メッセージ表示関数
function appendMessage(sender, text) {
    const msgBubble = document.createElement('div');
    msgBubble.classList.add('message', sender);
    msgBubble.innerText = text;
    chatContainer.appendChild(msgBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 👑 Workerからの通知を受け取るイベント
aiWorker.onmessage = (event) => {
    const { type, status, progress, text, error } = event.data;

    if (type === 'init') {
        if (status === 'loading') {
            loadingSpinner.classList.remove('hidden');
            progressBar.style.width = `${progress}%`;
            statusBadge.innerText = `ダウンロード中: ${Math.round(progress)}%`;
        } else if (status === 'ready') {
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            statusBadge.classList.add('ready');
            progressBar.style.width = '100%';
            userInput.placeholder = "今どんな気持ち？お話し聞くよ...";
            userInput.disabled = false;
            sendBtn.disabled = false;
            appendMessage('ai', 'お疲れ様！今日も大変だったね。ここに君の気持ち、全部吐き出しちゃっていいよ。ずっと話聞いてるからね。');
        } else if (status === 'error') {
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "エラー発生";
            statusBadge.classList.add('error');
            appendMessage('ai', `起動エラー: ${error}`);
        }
    } else if (type === 'response') {
        // AIの思考が完了した時
        appendMessage('ai', text);
        userInput.disabled = false;
        sendBtn.disabled = false;
        loadingSpinner.classList.add('hidden');
        statusBadge.innerText = "準備完了";
        userInput.focus();
    }
};

// 送信処理
function handleSend() {
    const text = userInput.value.trim();
    if (!text || userInput.disabled) return;

    appendMessage('user', text);
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;
    statusBadge.innerText = "うんうん...";
    loadingSpinner.classList.remove('hidden');

    // Workerにユーザーのテキストを送信して推論を行わせる
    aiWorker.postMessage({ type: 'generate', text: text });
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
