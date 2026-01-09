# Vampire Hunter Survivor

ヴァンパイアサバイバー風のブラウザゲーム

## ゲームの起動方法

このゲームはES6モジュールを使用しているため、ローカルサーバーが必要です。

### 方法1: Pythonを使う（推奨）

ターミナルでこのフォルダに移動して、以下のコマンドを実行:

```bash
# Python 3の場合
python3 -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000
```

その後、ブラウザで `http://localhost:8000` を開く

### 方法2: Node.jsを使う

```bash
npx http-server -p 8000
```

その後、ブラウザで `http://localhost:8000` を開く

### 方法3: VS Codeの拡張機能

VS Codeの「Live Server」拡張機能をインストールして、index.htmlを右クリック → "Open with Live Server"

## 操作方法

- **移動**: WASD / 矢印キー / タッチ操作
- **武器**: 自動攻撃
- **レベルアップ**: 経験値を集めてアップグレードを選択

## ゲームの特徴

- 複数の武器システム（ナイフ、ガーリック、爆弾）
- ボス戦
- 天候システム
- パーティクルエフェクト
- スクリーンシェイク
