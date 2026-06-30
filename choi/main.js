// main.js - UI制御とWorkerの仲介オブジェクト (確定版)
(function() {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const statusBadge = document.getElementById('status-badge');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');

    // 👑 4大原則：トラブル要因排除。Classic Workerとして起動
    const aiWorker = new Worker('worker.js');

    function appendMessage(sender, text) {
        const msgBubble = document.createElement('div');
        msgBubble.classList.add('message', sender);
        msgBubble.innerText = text;
        chatContainer.appendChild(msgBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    aiWorker.onmessage = function(e) {
        const { type, data } = e.data;
        if (type === 'progress') {
            progressBar.style.width = `${data}%`;
            statusBadge.innerText = `ダウンロード中: ${data}%`;
        } else if (type === 'ready') {
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            statusBadge.classList.add('ready');
            progressBar.style.width = '100%';
            userInput.disabled = false;
            sendBtn.disabled = false;
            appendMessage('ai', 'お疲れ様！今日も大変だったね。ここに君の気持ち、全部吐き出しちゃっていいよ。');
        } else if (type === 'response') {
            loadingSpinner.classList.add('hidden');
            appendMessage('ai', data);
            userInput.disabled = false;
            sendBtn.disabled = false;
        }
        // ... (省略: その他イベント処理)
    };

    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;
        appendMessage('user', text);
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;
        aiWorker.postMessage({ type: 'send', data: text });
    }

    sendBtn.addEventListener('click', handleSend);
})();
