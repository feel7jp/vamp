#!/usr/bin/env python3
"""
Vampire Hunter Survivor - ゲームサーバー起動スクリプト
起動時にアクセスURLを表示し、ブラウザを自動起動します
"""

import http.server
import socketserver
import sys
import webbrowser
import threading
import time

# サーバー設定
PORT = 8000
HOST = "localhost"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """カスタムHTTPリクエストハンドラー"""
    
    def log_message(self, format, *args):
        """ログメッセージをカスタマイズ"""
        # 通常のアクセスログを表示
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def open_browser():
    """サーバー起動後にブラウザを開く"""
    time.sleep(1.5)  # サーバーが完全に起動するまで待機
    url = f"http://{HOST}:{PORT}"
    print(f"🌐 ブラウザを起動しています: {url}")
    webbrowser.open(url)

def main():
    """メイン関数"""
    
    # 起動メッセージを表示
    print("=" * 50)
    print("🎮 Vampire Hunter Survivor")
    print("=" * 50)
    print()
    print("サーバーを起動しています...")
    print()
    print(f"✅ ゲームURL: http://{HOST}:{PORT}")
    print()
    print("ブラウザが自動的に開きます...")
    print("終了するには Ctrl+C を押してください")
    print("=" * 50)
    print()
    
    # HTTPサーバーを起動
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"サーバーがポート {PORT} で起動しました")
            print()
            
            # ブラウザを別スレッドで起動
            browser_thread = threading.Thread(target=open_browser, daemon=True)
            browser_thread.start()
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n")
        print("=" * 50)
        print("サーバーを停止しました")
        print("=" * 50)
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ エラー: ポート {PORT} は既に使用されています")
            print(f"   既存のサーバーを停止してから再度実行してください")
        else:
            print(f"\n❌ エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
