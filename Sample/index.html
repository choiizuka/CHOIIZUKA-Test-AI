<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>GHPAGES AI TEST</title>
</head>
<body>
    <h1>AI起動テスト（GitHub Pages検証用）</h1>
    <!-- 通信結果、またはエラー内容がここに表示されます -->
    <div id="output" style="font-family: monospace; white-space: pre-wrap; padding: 20px; background: #f4f4f6;">起動中...</div>

    <script type="module">
        // 👑 GitHub Pages環境なら100%CORSエラーを起こさずにインポート可能
        import { pipeline } from 'https://jsdelivr.net';

        async function startTest() {
            const outputDiv = document.getElementById('output');
            try {
                outputDiv.innerText = "通信開始（一番軽い約40MBのモデルを取得中）...";

                // まず通信が通るかチェックするため、軽量の感情分析モデルでテスト
                const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
                    device: 'wasm'
                });

                outputDiv.innerText = "推論実行中...";
                const result = await classifier('GitHub Pages is perfectly working!');

                // 成功すれば、画面にAIの分析結果がテキストで表示されます
                outputDiv.innerText = JSON.stringify(result, null, 2);

            } catch (error) {
                // 万が一エラーが起きれば、ここに事実が書き出されます
                outputDiv.innerText = '【エラー発生の事実】\n' + (error.stack || error.message || error);
            }
        }
        startTest();
    </script>
</body>
</html>
