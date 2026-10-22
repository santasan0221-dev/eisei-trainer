# 未着手189問の一括監査トリアージ

既存25問の法令一次レビューと合わせ214問全件の5択を、漏れ・重複なしで一覧化した。残189問は隣接した実質重複、定型文、短い解説、法令適用基準日の欠落、人手承認の不足を機械的に抽出。

検出数（同一問に重複フラグあり）：human_approval_missing: 189、short_explanation: 178、law_as_of_required: 64、template_wording: 152、near_duplicate_previous: 76。

**これは検証済みの正誤監査ではない。** 189問の各肢はすべて `checkedAgainstSource:false`。本文未検証のまま専門家承認や公開READY扱いにしてはならない。公開教材・main・214問の原本に変更なし。
