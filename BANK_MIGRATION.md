# 問題データ分離・学習履歴移行

214問を `exams/eisei-1/questions.json` に問題ID付きで保存。`questions.js` は従来の画面との互換データ。問題内容・正解・解説は変更していません。

既存学習履歴 `eisei-pro-2026-v1` を、資格別キー `shikaku-toppa:progress:v1:eisei-1` に初回のみコピーします。旧履歴を削除しません。問題番号から安定IDへの履歴移行は次段階です。

全問の出典・法令基準日・レビューは未確認のまま。商用販売前に法令校閲が必要です。`node --test tests/*.test.mjs` をGitHub Actionsで実行する構成を追加。CIとブラウザの実行結果は別途検証が必要です。mainへの反映・Cloudflare配備はしません。
