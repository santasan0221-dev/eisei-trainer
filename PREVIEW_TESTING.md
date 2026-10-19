# 試験版の確認手順

1. Draft PRの `Checks` で `Prototype checks` を確認。失敗なら公開しない。
2. Actionsの成功した実行から `shikaku-toppa-preview` artifact をダウンロード、ZIP解凍。
3. 解凍フォルダで `python -m http.server 8000` を実行し、PCで `http://localhost:8000` を開く（PWAを含む正しいローカルHTTP検証）。
4. 問題回答、採点、カレンダー、XP、学習履歴、模試44問、途中終了を確認。
5. Service WorkerはlocalhostまたはHTTPSが必要。スマホの別端末では別途HTTPSのテスト環境を準備する。

**注意:** この方式はGitHub Actionsのファイル配布であり、一般公開のプレビューURLはまだありません。GitHub Pagesのmainは変更しません。問題校閲は未完了なので有料販売不可。
