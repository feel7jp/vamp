/**
 * デバッグ用エラーハンドラー
 * エラーを画面に大きく表示してトラブルシューティングを簡単にする
 */

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.createErrorDisplay();
        this.setupGlobalHandler();
    }
    
    createErrorDisplay() {
        // エラーオーバーレイを作成
        this.overlay = document.createElement('div');
        this.overlay.id = 'error-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 20px;
            box-sizing: border-box;
            z-index: 10000;
            display: none;
            overflow-y: auto;
        `;
        
        document.body.appendChild(this.overlay);
    }
    
    setupGlobalHandler() {
        // すべての未処理エラーをキャッチ
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // 未処理のPromise拒否をキャッチ
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection: ' + event.reason,
                error: event.reason
            });
        });
    }
    
    handleError(errorInfo) {
        console.error('🚨 Error caught:', errorInfo);
        
        this.errors.push({
            timestamp: new Date().toISOString(),
            ...errorInfo
        });
        
        this.displayErrors();
    }
    
    displayErrors() {
        if (this.errors.length === 0) {
            this.overlay.style.display = 'none';
            return;
        }
        
        this.overlay.style.display = 'block';
        
        let html = `
            <div style="max-width: 1200px; margin: 0 auto; user-select: text;">
                <h1 style="color: #ff4757; margin-bottom: 20px;">
                    🚨 ゲームエラーが発生しました
                </h1>
                <p style="color: #ffd700; margin-bottom: 15px;">
                    以下のエラー情報をコピーして開発者に報告してください
                </p>
                <button onclick="navigator.clipboard.writeText(document.getElementById('error-text').innerText).then(() => alert('エラー情報をコピーしました！'))" style="
                    margin-bottom: 20px;
                    padding: 10px 20px;
                    background: #4facfe;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: bold;
                ">📋 全エラー情報をコピー</button>
                
                <div id="error-text" style="user-select: text;">
        `;
        
        this.errors.forEach((err, index) => {
            html += `
                <div style="
                    background: #1a1a2e;
                    border-left: 4px solid #e94560;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    user-select: text;
                ">
                    <div style="color: #ff4757; font-weight: bold; margin-bottom: 10px;">
                        エラー #${index + 1} (${err.timestamp})
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">メッセージ:</strong><br>
                        <code style="color: #fff; background: #000; padding: 5px 10px; display: block; margin-top: 5px; border-radius: 3px; user-select: text;">
                            ${this.escapeHtml(err.message)}
                        </code>
                    </div>
                    
                    ${err.filename ? `
                        <div style="margin-bottom: 5px;">
                            <strong style="color: #4facfe;">ファイル:</strong> 
                            <code style="color: #ffd700; user-select: text;">${err.filename}:${err.lineno}:${err.colno}</code>
                        </div>
                    ` : ''}
                    
                    ${err.error && err.error.stack ? `
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #4facfe;">スタックトレース表示</summary>
                            <pre style="
                                background: #000;
                                padding: 10px;
                                margin-top: 10px;
                                border-radius: 3px;
                                overflow-x: auto;
                                font-size: 12px;
                                color: #ccc;
                                user-select: text;
                            ">${this.escapeHtml(err.error.stack)}</pre>
                        </details>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #16213e; border-radius: 4px;">
                    <h3 style="color: #4facfe; margin-top: 0;">💡 デバッグのヒント</h3>
                    <ul style="color: #ccc; line-height: 1.8;">
                        <li><strong>ブラウザのキャッシュをクリア:</strong> Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)</li>
                        <li><strong>Vercelの場合:</strong> 数分待ってからハードリフレッシュ</li>
                        <li><strong>コンソールを確認:</strong> F12キーを押して開発者ツールを開く</li>
                        <li><strong>サーバーを再起動:</strong> ターミナルでCtrl+C → python3 server.py</li>
                        <li><strong>importエラーの場合:</strong> 該当ファイルの先頭にimport文があるか確認</li>
                    </ul>
                </div>
                
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 15px 30px;
                    background: #e94560;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                    font-family: 'Press Start 2P', cursive;
                ">ゲームを再起動</button>
            </div>
        `;
        
        this.overlay.innerHTML = html;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    clearErrors() {
        this.errors = [];
        this.displayErrors();
    }
}

// 自動初期化
if (typeof window !== 'undefined') {
    window.errorHandler = new ErrorHandler();
}
