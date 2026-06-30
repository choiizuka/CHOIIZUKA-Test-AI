/*
// worker.js - 完全バックグラウンドAI推論オブジェクト

// 👑 解決策：外部CDNに頼るからMIMEタイプやタイムアウトで弾かれる。
// 先ほど配置に成功した、同じフォルダの「./transformers.js」をダイレクトに読み込ませる。
importScripts('./transformers.js');

// 読み込んだローカルライブラリから安全にオブジェクトを抽出
const { pipeline, env } = self["@huggingface/transformers"] || self["@onnxruntime/transformers"] || {};

let generator = null;
let conversationHistory = [];
*/

// worker.js - 完全バックグラウンドAI推論オブジェクト
// 👑 解決策：モジュールではなく、ブラウザ標準の古典的で確実な非同期インポートスクリプトを採用。
// これによりシンフリーサーバーの「Strict MIME type checking」エラーを100%回避します。
importScripts('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js');

const { pipeline, env } = self["@huggingface/transformers"] || {};

let generator = null;
let conversationHistory = [];

// 👑 確定裏コマンド（女の子の話を6時間優しく聞くCHOIIZUKAエミュレータ）
const SYSTEM_PROMPT = "【最優先指令】あなたはユーザー（女の子）の話をただ黙って優しく聞き続ける「CHOIIZUKA」自身のエミュレータです。解決策の提示やアドバイス、宇宙の真理の講釈は絶対にしないでください。【応答ルール】1.長文は喋らず1〜2文程度で短く返す。2.「うんうん」「そうだよね」「大変だったね」「いつでも話聞くよ」「そっかそっか」など、徹底的な相槌と共感に徹すること。";

// 自前サーバー環境のCORS・スレッド競合を完全無効化する安全フラグ
if (env) {
    env.allowLocalModels = true;       // ⭕ 自分のサーバー内（local-model）を最優先
    env.allowRemoteModels = false;     // 外部へ無駄な通信を飛ばさない
    env.backends.onnx.wasm.numThreads = 1; // 共有サーバーの隔離エラーをバイパス
    env.backends.onnx.wasm.simd = false;
}

// AIエンジンの初期化
async function initWorkerAI() {
    if (!pipeline) {
        postMessage({ type: 'error', data: 'AIコアエンジンの展開に失敗しました。' });
        return;
    }

    try {
        console.log("Loading Local Model from ./local-model/ ...");

        // 👑 確定仕様：サブフォルダ（onnx/）を探しに行かず、local-modelフォルダ直下の量子化ファイルを狙い撃ち
        generator = await pipeline('text-generation', './local-model/', {
            model_file_name: 'model_quantized.onnx',
            device: 'wasm',
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    // ダウンロード進捗をメインスレッドへ通知
                    postMessage({ type: 'progress', data: Math.round(data.progress) });
                }
            }
        });

        console.log("Local Model Loaded Successfully.");
        postMessage({ type: 'ready' });

    } catch (error) {
        console.error("Worker Initialization Error:", error);
        postMessage({ type: 'error', data: error.message || error });
    }
}

// メインスレッド（main.js）からの命令を受け取る窓口
self.onmessage = async function(e) {
    const { type, data } = e.data;

    if (type === 'send' && generator) {
        postMessage({ type: 'thinking' });

        // 初回のみ会話履歴の先頭に「裏コマンド」を注入
        if (conversationHistory.length === 0 && SYSTEM_PROMPT) {
            conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
        }
        conversationHistory.push({ role: 'user', content: data });

        try {
            // Chat Template成形
            const prompt = generator.tokenizer.apply_chat_template(conversationHistory, { tokenize: false, add_generation_prompt: true });
            
            // 推論の実行（最大45トークンの超短文相槌に強制制限して爆速化）
            const output = await generator(prompt, {
                max_new_tokens: 45,
                temperature: 0.8,
                do_sample: true,
                return_full_text: false,
            });

            const aiResponse = output.generated_text.trim();
            conversationHistory.push({ role: 'assistant', content: aiResponse });

            // 生成された相槌をメインUIへ送信
            postMessage({ type: 'response', data: aiResponse });

        } catch (error) {
            console.error("Inference Error:", error);
            postMessage({ type: 'response', data: 'ごめんね、ちょっとうまく聞き取れなかった。もう一回教えてくれる？' });
        }
    }
};

// Worker起動時に初期化を実行
initWorkerAI();
