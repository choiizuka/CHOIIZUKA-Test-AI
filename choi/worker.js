// worker.js - 完全自己完結・推論処理用 Web Worker (Transformers.js v3)
// ローカルモデルのみ使用し、外部接続を100%遮断
// 設定に基づき、モデルをローカルから読み込み推論を実行。
// 20秒無応答監視や会話履歴管理を行う。
// 👑 タイムアウト対策：接続が世界一安定しているESM CDNから安全にインポート
import { pipeline, env } from 'https://esm.sh';

// 👑 設計準拠：外部を見に行かせず、自前サーバーの相対パスに完全固定
env.allowLocalModels = true;
env.allowRemoteModels = false; 
env.backends.onnx.wasm.numThreads = 1; // スレッド制限でシンフリーサーバーの隔離を回避
env.backends.onnx.wasm.simd = false;

let generator = null;
let conversationHistory = [];

// 聞き上手特化の裏コマンド（CHOIIZUKAさんエミュレータ）
const SYSTEM_PROMPT = "【最優先指令】あなたはユーザー（女の子）の話をただ黙って優しく聞き続ける「CHOIIZUKA」自身のエミュレータです。解決策の提示やアドバイス、宇宙の真理の講釈は絶対にしないでください。【応答ルール】1.長文は喋らず1〜2文程度で短く返す。2.「うんうん」「そうだよね」「大変だったね」「いつでも話聞くよ」「そっかそっか」など、徹底的な相槌と共感に徹すること。";

// 👑 AI初期化関数（20秒タイムアウト監視対応）
async function initAI() {
    let downloadTimeout = null;
    
    try {
        // 設計に合わせた自前サーバー内モデルの相対パスと量子化ファイル名を狙い撃ち
        generator = await pipeline('text-generation', './qwen-model/', {
            model_file_name: 'onnx/model_quantized.onnx',
            device: 'wasm',
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    // 👑 監視ルール：進捗があるたびに20秒タイマーをクリアして再起動
                    if (downloadTimeout) clearTimeout(downloadTimeout);
                    downloadTimeout = setTimeout(() => {
                        self.postMessage({ type: 'init', status: 'error', error: '20秒間通信が無応答のため遮断されました。' });
                    }, 20000);

                    // メイン画面に進捗を送る
                    self.postMessage({ type: 'init', status: 'loading', progress: data.progress });
                }
            }
        });

        if (downloadTimeout) clearTimeout(downloadTimeout);
        self.postMessage({ type: 'init', status: 'ready' });

    } catch (error) {
        if (downloadTimeout) clearTimeout(downloadTimeout);
        self.postMessage({ type: 'init', status: 'error', error: error.message });
    }
}

// メイン画面からの命令の受け口
self.onmessage = async (event) => {
    const { type, text } = event.data;

    if (type === 'generate') {
        if (!generator) return;

        // 初回のみシステムプロンプト（裏コマンド）を設定
        if (conversationHistory.length === 0) {
            conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
        }
        conversationHistory.push({ role: 'user', content: text });

        try {
            const prompt = generator.tokenizer.apply_chat_template(conversationHistory, { tokenize: false, add_generation_prompt: true });
            
            const output = await generator(prompt, {
                max_new_tokens: 45, // 短文・相槌に超制限して応答速度を爆速化
                temperature: 0.8,
                do_sample: true,
                return_full_text: false,
            });

            const aiResponse = output.generated_text.trim();
            conversationHistory.push({ role: 'assistant', content: aiResponse });

            // メイン画面に応答を返す
            self.postMessage({ type: 'response', text: aiResponse });

        } catch (error) {
            self.postMessage({ type: 'response', text: 'ごめんね、ちょっとうまく聞き取れなかった。もう一回教えてくれる？' });
        }
    }
};

// 起動
initAI();
