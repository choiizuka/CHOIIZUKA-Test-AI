# CHOIIZUKA-AI
## シンプルなセルフホスト型WebLLMアーキテクチャ

---

# 目的

このプロジェクトは、単一のサーバー上で完全に動作する、完全なセルフホスト型WebLLM AIを構築することを目的としています。

第一の目標は**パフォーマンスではありません**。

第一の目標は次の通りです：

> **100%確実に動作させること。**

正常に動作するようになった後、システムを段階的に拡張していきます。

---

# 基本原則

## 1. まずは動作させる

動作するシステムは、決して動作しない完璧な設計よりも常に価値があります。

まずは100%の稼働を実現します。

最適化はその後です。

---

## 2. 外部への依存を最小限に抑える

可能な限り、外部のインフラストラクチャは使用しません。

運用に必要なものはすべて、自社のサーバー内に存在すべきです。

理由：

- タイムアウトのリスクを低減
- サービス停止を低減
- 仕様変更を低減
- 保守コストを低減

---

## 3. すべてを最小限に抑える

必要な最小限の機能のみを実装します。

不要な機能は排除します。

不要な複雑さは排除します。

シンプルなシステムほど保守が容易です。

---

## 4. アーキテクチャの抽象化

特定のLLMに合わせて設計してはいけません。

システムアーキテクチャを変更することなく、モデルを置き換え可能にする必要があります。

AIモデルは単なるコンポーネントに過ぎません。

アーキテクチャは不変です。

---

# 対象環境

ドメイン

```
https://choiizuka.com
```

本番環境

```
/ai/
```

テスト環境

```
/testai/
```

ファイルをコピーするだけで、どのディレクトリからでもシステムが正しく動作するべきです。

---

# アーキテクチャ

シングルサーバーアーキテクチャ

```
ブラウザ
        │
        ▼
CHOIIZUKA.COM
        │
        ├── HTML
        ├── CSS
        ├── JavaScript
        ├── Worker
        ├── Transformers.js
        ├── Tokenizer
        ├── ONNX Runtime
        ├── Model
        └── Configuration
```

CDNは使用していません。

外部依存関係はありません。

ローカルモデル以外のランタイムのダウンロードはありません。

---

# ディレクトリ構造

```
/ai/

index.html

main.js

worker.js

style.css

config.js

libs/
    transformers.min.js
    onnxruntime-web.min.js

models/

    sentiment/
        config.json
        tokenizer.json
        tokenizer_config.json
        onnx/

    qwen/
        config.json
        tokenizer.json
        tokenizer_config.json
        onnx/

assets/

logs/
```

テスト環境

```
/testai/

（同じ構造）
```

---

# 開発ロードマップ

## フェーズ 1

目的

ブラウザがローカルの JavaScript を正常に読み込む。

期待される結果

ページが正しく起動する。

---

## フェーズ 2

目的

ローカルの Transformers.js を読み込む。

期待される結果

CDNへのアクセスがないこと。

---

## フェーズ 3

目的

ローカルの tokenizer を読み込む。

期待される結果

tokenizer が正常に初期化される。

---

## フェーズ 4

目的

小規模な ONNX モデル（約 40MB）を読み込む。

モデル

```
Xenova/distilbert-base-uncased-finetuned-sst-2-english
```

期待される結果

推論が成功する。

---

## フェーズ 5

目的

モデルを置き換える。

モデル

```
Qwen2.5-0.5B-Instruct
```

期待される結果

Webチャットが正常に動作する。

---

# モデルポリシー

テスト用モデル

```
Xenova/distilbert-base-uncased-finetuned-sst-2-english
```

本番用モデル

```
Qwen2.5-0.
```

アプリケーションのロジックを変更することなく、モデルを置き換え可能であるべきである。

---

# 設計方針

以下の状況が発生した場合でも、システムは正常に動作し続けなければならない：

- CDNが利用できなくなった場合
- 外部サービスが停止した場合
- Hugging FaceがAPIを変更した場合
- サードパーティのインフラが利用できなくなった場合

必要なファイルはすべてローカルに存在しているべきである。

---

# 成功基準

以下の条件を満たす場合、プロジェクトは成功したとみなされる：

- 外部のCDNを必要としない。
- すべてのファイルがローカルでホストされている。
- モデルを個別に置き換えられる。
- どのディレクトリでもシステムをホストできる。
- 本番環境とテスト環境が同じアーキテクチャを共有している。
- 運用がシンプルで保守しやすい状態が維持される。

---

# 今後の拡張

安定稼働後の計画：

- 追加モデルの導入
- 複数のAIエージェント
- RAG
- 音声機能
- マルチユーザー対応
- GPUサーバーへの展開

これらは将来の機能強化項目です。

初期実装からは意図的に除外されています。

最初の目標は単純に：

**常に動作するシステムを構築すること。**

---

## 関連記事

- [【CHOIIZUKA.COM】CHOIIZUKA-AIホームページに準備中🌏(テスト)」](https://choiizuka.com/20260630-choiizuka-comchoiizuka-ai-test-info/)

---

## 関連URL

### Models
- [@huggingface-Xenova/distilbert-base-uncased-finetuned-sst-2-english](https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/)
- [@huggingface-Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)

### Status
- [huggingface status](https://status.huggingface.co/)

(C) 2026 CHOIIZUKA.
