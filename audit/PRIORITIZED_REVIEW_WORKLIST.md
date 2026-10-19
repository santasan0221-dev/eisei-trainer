# 214問の優先校閲リスト

`node scripts/build-prioritized-review-worklist.mjs` で `audit-output/prioritized-review-worklist.json` を作成。一次照合済34問と未着手180問を区分し、法令・出典不足・未照合・重点監査の有無から優先度スコアを付ける。**優先順位はヒューリスティックで、客観的な危険度や校閲済みを保証しない。**

レビュー担当は上位から法令条文・適用期間・全選択肢の根拠を記録する。全件専門家最終未承認。既存問題とmainには変更なし。
