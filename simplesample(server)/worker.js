// worker.js - 抽象化ローカルAI推論 Worker

// 設計書のディレクトリ構造に基づき、libs内のローカルファイルを確実に先読み
importScripts('libs/transformers.min.js');

const { pipeline, env } = self["@huggingface/transformers"] || self["@onnxruntime/transformers"] || {};

// 👑 設計方針：すべてのファイルをローカルからのみ取得する最強フラグ
if (env) {
    env.allowLocalModels = true;       // ローカルファイルを最優先
    env.allowRemoteModels = false;     // 外部（Hugging Face等）への無駄な通信を完全遮断
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.simd = false;
}

async function initWorkerAI() {
    if (!pipeline) {
        postMessage({ type: 'error', data: 'コアエンジンの展開に失敗しました。' });
        return;
    }

    try {
        // 👑 設計書通り、抽象化されたローカルのパスを指定
        // サブフォルダを探させず、直下のファイルを狙い撃ち指定
        const generator = await pipeline('sentiment-analysis', './models/sentiment/', {
            model_file_name: 'model_quantized.onnx',
            device: 'wasm',
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    postMessage({ type: 'progress', data: Math.round(data.progress) });
                }
            }
        });

        postMessage({ type: 'ready' });

        // 確定テスト機能の実行
        const result = await generator('Hello from CHOIIZUKA self-hosted WebLLM architecture!');
        
        postMessage({ type: 'response', data: result });

    } catch (error) {
        postMessage({ type: 'error', data: error.message || error });
    }
}

initWorkerAI();
