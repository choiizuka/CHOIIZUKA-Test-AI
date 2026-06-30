// main.js - UI制御とWorkerの仲介オブジェクト
(function() {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const statusBadge = document.getElementById('status-badge');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');

    // 👑 解決策：MIMEタイプチェックをすり抜けるため、明示的に通常のWeb Workerオブジェクトとして生成
    //const aiWorker = new Worker('worker.js');
    const aiWorker = new Worker('worker.js', { type: 'module' });

    // 画面にチャットバブルを追加する関数
    function appendMessage(sender, text) {
        const msgBubble = document.createElement('div');
        msgBubble.classList.add('message', sender);
        msgBubble.innerText = text;
        chatContainer.appendChild(msgBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 裏方（Worker）からの返事を受け取るリスナー
    aiWorker.onmessage = function(e) {
        const { type, data } = e.data;

        if (type === 'progress') {
            // ロード進捗の更新
            progressBar.style.width = `${data}%`;
            statusBadge.innerText = `ダウンロード中: ${data}%`;
        } else if (type === 'ready') {
            // AIの準備完了
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            statusBadge.classList.add('ready');
            progressBar.style.width = '100%';
            userInput.placeholder = "今どんな気持ち？お話し聞くよ...";
            userInput.disabled = false;
            sendBtn.disabled = false;
            appendMessage('ai', 'お疲れ様！今日も大変だったね。ここに君の気持ち、全部吐き出しちゃっていいよ。ずっと話聞いてるからね。');
        } else if (type === 'thinking') {
            // AIが思考中
            statusBadge.innerText = "うんうん...";
            loadingSpinner.classList.remove('hidden');
        } else if (type === 'response') {
            // AIの相槌が返ってきた
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "準備完了";
            appendMessage('ai', data);
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        } else if (type === 'error') {
            // エラー検知
            loadingSpinner.classList.add('hidden');
            statusBadge.innerText = "エラー発生";
            statusBadge.classList.add('error');
            appendMessage('ai', `システムの起動または処理中にエラーが発生しました。(詳細: ${data})`);
        }
    };

    // 送信ボタンが押された時の処理
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        // 裏方のWorkerへユーザーの入力を送信
        aiWorker.postMessage({ type: 'send', data: text });
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
})();
