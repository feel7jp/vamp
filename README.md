# 🎮 Vampire Hunter Survivor

ヴァンパイアサバイバー風のブラウザゲーム

---

## 🚀 ゲームの始め方（3ステップ）

### ステップ1: ターミナルを開く

- **Mac**: Spotlight検索（⌘+Space）で「ターミナル」と入力
- **Windows**: コマンドプロンプトまたはPowerShellを開く

### ステップ2: このフォルダに移動

```bash
cd path/to/test11
```

（`path/to/test11` を実際のフォルダパスに置き換えてください）


### ステップ3: サーバーを起動

```bash
python3 server.py
```

**これだけ！** ブラウザが自動的に開いてゲームが始まります 🎉

---

## ⚠️ うまくいかない場合

### エラー: `ポート 8000 は既に使用されています`

既に起動中のサーバーがあります。以下のどちらかを実行:

1. **既存のサーバーを停止**: ターミナルで `Ctrl+C` を押す
2. **別のターミナルを確認**: 他のターミナルウィンドウでサーバーが動いていないか確認

### エラー: `python3: command not found`

Pythonがインストールされていません。[Python公式サイト](https://www.python.org/downloads/)からインストールしてください。

---

## 🎮 操作方法

| 操作 | キー |
|------|------|
| **移動** | `W` `A` `S` `D` または 矢印キー |
| **攻撃** | 自動 |
| **レベルアップ** | 経験値を集めて選択 |

**スマホ・タブレット**: 画面タッチで移動

---

## ✨ ゲームの特徴

- 🗡️ **3種類の武器**: ナイフ、ガーリック、爆弾
- 👹 **ボス戦**: 強力な敵との戦い
- 🌧️ **天候システム**: 雨や雪の演出
- ✨ **エフェクト**: パーティクルとスクリーンシェイク

---

## 🌐 オンラインデプロイ（Vercel）

このゲームはVercelに簡単にデプロイできます。

### デプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercelにデプロイ**
   - [Vercel](https://vercel.com)にアクセス
   - GitHubアカウントでログイン
   - 「New Project」をクリック
   - このリポジトリを選択
   - 「Deploy」をクリック

デプロイ後、自動的に公開URLが発行されます 🚀

---

## 📚 その他の起動方法

<details>
<summary>クリックして展開</summary>

### 方法2: Python標準モジュール

```bash
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000` を開く

### 方法3: Node.js

```bash
npx http-server -p 8000
```

その後、ブラウザで `http://localhost:8000` を開く

### 方法4: VS Code拡張機能

1. VS Codeで「Live Server」拡張機能をインストール
2. `index.html` を右クリック
3. 「Open with Live Server」を選択

</details>
