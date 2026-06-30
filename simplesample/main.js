// main.js - UI制御とWorkerの仲介オブジェクト
(function() {
    const statusDiv = document.getElementById('status');
    const progressBar = document.getElementById('progress-bar');
    const outputDiv = document.getElementById('output');

    // 設計書通り、完全ローカル配置されたClassic Workerを生成
    const aiWorker = new Worker('worker.js');

    aiWorker.onmessage = function(e) {
        const { type, data } = e.data;

        if (type === 'progress') {
            progressBar.style.width = `${data}%`;
            statusDiv.innerText = `モデル取得中: ${data}%`;
        } else if (type === 'ready') {
            statusDiv.innerText = `準備完了`;
            progressBar.style.width = '100%';
            outputDiv.innerText = 'AIエンジンの初期化が完了しました。推論を実行します...';
        } else if (type === 'response') {
            statusDiv.innerText = `推論成功`;
            outputDiv.innerText = JSON.stringify(data, null, 2);
        } else if (type === 'error') {
            statusDiv.innerText = `エラー発生`;
            outputDiv.innerText = `詳細: ${data}`;
        }
    };
})();
