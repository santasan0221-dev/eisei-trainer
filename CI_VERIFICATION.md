# 試験版ZIPの検証とCI確認

- PR #10の後続として、ZIP作成前に `index.html`, `manifest.webmanifest`, `sw.js`, `questions.js` がすべて存在し、中身が空でないことを確認。
- `index.html`の問題JS読み込みとService Workerのキャッシュ設定をCIで突き合わせる。
- Nodeテストに外部データの実際の読み込み・214問保持・教材未校閲告知の検査を追加。
- **CIの実行結果はGitHub Actionsの画面で別途確認すること。** GitHub connectorからPRのワークフロー実行記録を確認できていない。GitHub Actions自体が無効になっている可能性もある。
- このPRもmainを変更せず、一般向け公開を行わない。
