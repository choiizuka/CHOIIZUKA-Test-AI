# CHOIIZUKA-Test-AI
CHOIIZUKA Test AI Program

---

📘 【CHOIIZUKA-AI】Web埋め込みLLM 設置・運用マニュアル本マニュアルは、GitHub Pagesを利用してクライアントサイド動作型（WebAssembly/WebGPU）の軽量LLMチャットシステムを設置・更新するための手順書です。📂 1. ディレクトリ構造のルールGitHubリポジトリ（またはサーバー）のルート直下に、以下のようにディレクトリを配置します。text[GitHubリポジトリルート]
│
├── TestAI/               📂 テスト設置環境（今回の作業場所）
│   └── index.html        📄 先ほど作成したシングルHTMLソースコード
│
└── AI/                   📂 本番設置環境（将来の移行先）
    └── (空または準備用ファイル)
コードは注意してご使用ください。テスト用URL: https://choiizuka.com本番用URL: https://choiizuka.com🚀 2. 初回設置の手順（3ステップ）【ステップ1】ファイルの保存先ほど出力した index.html のソースコードをコピーします。ローカル環境に TestAI というフォルダを作り、その中に index.html という名前で保存します。【ステップ2】GitHubへのプッシュ対象のGitHubリポジトリに TestAI/index.html を追加します。以下のコマンド、またはGitHubデスクトップアプリ等でメインブランチにプッシュします。bashgit add TestAI/index.html
git commit -m "feat: CHOIIZUKA-AIのテスト設置"
git push origin main
コードは注意してご使用ください。【ステップ3】GitHub Pagesの設定確認GitHubリポジトリの [Settings] ＞ [Pages] を開きます。Build and deployment の Source が Deploy from a branch になっていることを確認します。Branch が main（または master）、フォルダが / (root) に設定されていることを確認します。数分待って、https://choiizuka.com にブラウザでアクセスします。🛠️ 3. 動作確認（トラブルシューティング）設置後、ページを開いて以下の3点を確認してください。画面上部のゲージ（プログレスバー）が動き、ダウンロードの％が進むか？🛑 進まない場合: ネットワークの接続状態か、CDN（jsdelivr.net）へのアクセスがブロックされていないか確認してください。「準備完了」に切り替わるか？🛑 「エラー発生」になる場合: ブラウザのデベロッパーツール（F12 キー ＞ Consoleタブ）を開き、エラー内容を確認します。古いスマホや特定のブラウザ環境（WebAssembly/WebGPU未対応環境）では動作しない場合があります。日本語で会話ができるか？ユーザー入力欄に「こんにちは」と入れ、Qwen-0.5Bから適切な返答がストリーミング、または一括で返ってくるかテストします。🔄 4. 将来の運用のためのメモ💡 本番環境（/AI/）への移行方法テスト環境（/TestAI/）での動作に満足し、本番公開する準備ができたら、TestAI/index.html をそのまま AI/index.html にコピー（複製）してGitHubにプッシュするだけで本番移行が完了します。🤖 将来、より賢いモデル（GemmaやPhi-3など）に変えたくなった場合index.html の <script> 内にある以下のモデル指定部分（144行目付近）を書き換えます。javascript// 現在（Qwen-0.5B：約350MB）
generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Instruct', { ... })

// 将来の変更例（Gemma-2B：約1.4GBに変えたい場合 ※Hugging FaceにONNX互換モデルがある前提）
generator = await pipeline('text-generation', 'Xenova/gemma-2b-it', { ... })
コードは注意してご使用ください。※モデルを変更する場合、ファイルサイズが大きくなるためユーザーの初回ロード時間が長くなる点に注意してください。

---

🛠️ 自作LLMモデルをロードする際の手順と注意点1. モデルを「ONNX形式」に変換しておく必要があるブラウザ上のJavaScriptでLLMを動かすため、Python等で自作したモデル（PyTorchの .safetensors や .bin 形式）を、そのままではブラウザが読めません。事前にONNX（オニキス）形式、またはWebGPU（Wasm）に対応した形式に変換（エクスポート）しておく必要があります。簡単な方法：Hugging Face公式のツール（optimum-cli）を使うと、コマンド1発で自作LLMをTransformers.js対応のONNX形式に変換できます。2. 自作モデルの「置き場所」の選択肢HTMLの pipeline('text-generation', 'モデルのパス') の部分に、自作モデルの場所を指定します。置き場所は大きく分けて2つあります。パターンA：Hugging Faceにアップロードする（推奨・簡単）自作モデルをHugging Face（無料）のリポジトリにアップロードしておけば、コード側はリポジトリ名（例: 'CHOIIZUKA/my-own-llm-0.5b'）と書くだけで、自動的に世界中の高速なCDNからブラウザへダウンロードされます。パターンB：自分のサーバー（CHOIIZUKA.COM）に配置する完全に独自のサーバー内にモデルファイルを置くことも可能です。その場合は、HTMLから見た相対パス（例: './my_models/custom-qwen/'）を指定します。※注意：自社サーバーに置く場合は、サーバー側で「CORS設定（他のオリジンからのアクセス許可）」と「大容量ファイルの配信最適化」が必要になる場合があります。

---
