# CHOIIZUKA-Test-AI
CHOIIZUKA Test AI Program

---

# 👑 choiizuka.com 専用：Qwen-0.5B WebAI 配置・配信仕様書

## 1. 設置ディレクトリ構造（サーバー側）
シンフリーサーバーの公開フォルダ（public_html 等）の直下に、本番用とテスト用のディレクトリをそれぞれ作成し、モデルファイルや関連スクリプトを丸ごと配置します。
public_html/
  ├── AI/                     <-- 本番環境
  │    ├── index.html         (チャット画面)
  │    ├── main.js            (メイン処理スクリプト)
  │    ├── worker.js          (裏処理用 Web Worker)
  │    └── qwen-model/        <-- ⭕️ ここに Qwen-0.5B のモデルファイル群を丸ごと配置
  │          └── model.onnx   (約350MBの単一モデルファイル等)
  │
  └── TESTAI/                 <-- テスト環境（本番と完全に独立）
       ├── index.html
       ├── main.js
       ├── worker.js
       └── qwen-model/        <-- ⭕️ テスト用のモデル配置エリア
             └── model.onnx

## 2. サーバー設定（.htaccess）の書き込み仕様
各環境の qwen-model/ フォルダの直下に、以下の内容を記述した .htaccess ファイルを設置します（タイムアウトや503エラーを防ぐ必須設定です）。

### 1. ONNXファイルを正しいバイナリデータとして認識させる
AddType application/octet-stream .onnx
AddType application/wasm .wasm

### 2. サーバー側でのリアルタイム圧縮（Gzip等）を強制禁止する

#### ※350MBのファイルをサーバーのCPUで圧縮しようとしてハングアップするのを防ぎます
<IfModule mod_deflate.c>
    SetEnvIfNoCase Request_URI \.onnx$ no-gzip dont-vary
    SetEnvIfNoCase Request_URI \.wasm$ no-gzip dont-vary
</IfModule>

### 3. ブラウザ側（JavaScript）の接続先・設計値
ライブラリ（例: Transformers.js）が外部（Hugging Face）に見に行かないよう、コード側で指定する絶対パスの設計値です。
🌐 接続先エンドポイント（URL）の固定

* 本番環境（/AI/）のコード指定URL： https://choiizuka.com
* テスト環境（/TESTAI/）のコード指定URL： https://choiizuka.com
⏱️ タイムアウトとリトライの監視ルール（Worker内）
単一の巨大ファイル（350MB）をスムーズに引き抜くためのパラメータです。

* データ受信無応答の監視（タイムアウト）：20秒 （ダウンロード中に20秒間、1バイトもデータが進まなかったら「サイレント切断」と判定する）
* 自動リトライ回数：1回 （切断検知後、自動的に最初からもう一度だけダウンロードをやり直す）

### 4. キャッシュと挙動のルール

1. 初回アクセス： choiizuka.com から約350MBの model.onnx を丸ごと一本ダウンロードします。画面のプログレスバーで進捗（〇％完了）を表示します。ダウンロード完了と同時にブラウザの「Cache API」に丸ごと保存します。
2. 2回目以降のアクセス： ブラウザが「すでにキャッシュがある」と判定し、サーバー（choiizuka.com）への通信を発生させずにローカルから一瞬でモデルを読み込みます。これによりサーバーへの負荷は初回訪問時の1回のみに抑えられます。

---

## 📂 タスク1：Qwen-0.5B モデルファイルのダウンロード手順

### 1. パソコン側に受け皿となるフォルダを作る

デスクトップなどに、新しく qwen-model という名前のフォルダを作っておきます。ダウンロードしたファイルはすべてこの中に入れます。

### 2. Hugging Faceの対象ページを開く
ブラウザで以下のURL（Hugging Faceのファイル一覧ページ）を開きます。
👉 huggingface.co

### 3. 最低限必要なファイルをダウンロードする

ページ内にファイルの一覧が表示されています。各ファイルの右側にあるダウンロードアイコン（↓）をクリックして、先ほど作った qwen-model フォルダの中に保存してください。
「丸ごと配置」するために最低限必要なファイルは以下の通りです。

ファイル名	役割	容量（目安）
config.json	モデルの基本設定	数 KB
tokenizer.json	文字をデータに変換する辞書	約 2 MB
tokenizer_config.json	文字変換の設定	数 KB
onnx/model_quantized.onnx	⭕️ AIの本体（量子化済み）	約 370 MB

⚠️ 注意点：ページ内の onnx というフォルダの中に model_quantized.onnx があります。これが約370MBの本体ファイルです。これ1本をダウンロードすればOKです（通常の model.onnx は約1GBあるので、軽い方の _quantized を選びます）。

### 4. フォルダ内の配置を確認する

ダウンロードが終わったら、パソコンの qwen-model フォルダの中身が以下のようになっているか確認してください。

qwen-model/
  ├── config.json
  ├── tokenizer.json
  ├── tokenizer_config.json
  └── onnx/
        └── model_quantized.onnx  <-- onnxというフォルダの中に本体を入れます
        
これでパソコン側へのモデルの準備は完了です。Hugging Faceから直接手元に落としたため、もう外部サイトの遅延を気にする必要はありません。

---

## 仕様書のアップデート

## 👑 【CHOIIZUKA-AI】テスト設置仕様書（確定版）## 1. 📂 設置ディレクトリ構造（サーバー側）
シンフリーサーバーの /public_html/TestAI/ ディレクトリ配下に、UI、ロジック、およびモデルアセットをすべて配置する。トラブル要因を排除するため、フォルダ階層は極限まで浅く（フラットに）設計する。

public_html/TestAI/
│
├── index.html                  📄 チャット画面UI（HTML/CSS）
├── main.js                     📄 メインスレッド制御（UI・通信仲介）
├── worker.js                   📄 バックグラウンドAI推論処理（Web Worker）
│
└── local-model/                📂 抽象化モデル格納フォルダ（固有名詞の完全排除）
    ├── .htaccess               📄 配信最適化・CORS解除設定
    ├── config.json             📄 AI基本構成設定（JSON 5種）
    ├── generation_config.json  📄 文章生成用設定
    ├── tokenizer.json          📄 トークナイザー辞書データ
    ├── tokenizer_config.json   📄 辞書用構成ファイル
    ├── special_tokens_map.json 📄 特殊トークンマッピング
    └── model_quantized.onnx    📄 量子化AIモデル本体（約370MB ※直下に配置）

------------------------------

## 2. 🛠️ インフラ制御仕様（local-model/.htaccess）
自前サーバー（共有環境）への負荷を抑え、大容量バイナリをブラウザへ安全にストリーミング配信するための固有定義。

<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
AddType application/octet-stream .onnx
SetEnvIf Request_URI "\.onnx$" no-gzip


* CORS全面解放：ブラウザのセキュリティによる通信遮断を物理的に回避する。
* no-gzipの適用：サーバーのCPUが自動圧縮（Gzip）を試みてハングアップ（503エラー）するのを防止する。

---

## 📡 4. 配信・最適化設計（ローカル内製化・Classic Workerへのアップデート）

自前サーバー（シンフリーサーバー）環境下における外部CDNの通信遅延（タイムアウト）、CORSブロック、およびブラウザによるModule Workerの厳密なMIMEタイプチェック（Strict MIME type checking）を100%物理的に回避するため、アーキテクチャを「完全ローカル配信」および「Classic Worker仕様」へ最適化した。

### ① 外部依存（CDN）の完全排除と内製化
`worker.js` の内部で外部URLからスクリプトを取得する設計を全面的に廃止。ライブラリ本体（`transformers.js`）をチャットシステムと同階層（`./`）に直接ローカル配置し、同一ドメイン内でのファイル配信に切り替えた。
これにより、外部ネットワークの瞬断リスクや、サードパーティ側がかけるクロスオリジン制限（CORS）を根本から無効化し、自前サーバーの支配下だけでシステムが100%完結する堅牢性を担保する。

### ② Classic Worker ＋ `importScripts` によるMIMEタイプエラーの破砕
ブラウザのModule Worker（`{ type: 'module' }`）仕様は、環境によって厳格なMIMEタイプ検知（`text/html`の誤判定）や、仕様上の関数実行制限を引き起こし、ロード停止の最大の要因となっていた。
本設計では、最も原始的かつ確実な「Classic Worker」仕様へと回帰させ、ローカルのライブラリファイルを `importScripts('./transformers.js');` で確実にバックグラウンド空間へ先読みさせる構造を採用。これにより、ブラウザのセキュリティによるブロック（SyntaxError等）を物理的に消滅させ、安全にQwen等のローカルモデルのストリーミングダウンロード（％ゲージ進行）を開始させる。

---

## 関連記事

- [【CHOIIZUKA.COM】CHOIIZUKA-AIホームページに準備中🌏(テスト)」](https://choiizuka.com/20260630-choiizuka-comchoiizuka-ai-test-info/)
