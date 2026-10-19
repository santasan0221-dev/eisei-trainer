import fs from 'node:fs';
const bank=JSON.parse(fs.readFileSync(new URL('../exams/eisei-1/questions.json',import.meta.url),'utf8'));
const rows=bank.questions;
const counts={};for(const q of rows)counts[q.category]=(counts[q.category]||0)+1;
const issues=[];const ids=new Set();
for(const [i,q] of rows.entries()){
  const at={id:q.id||'index:'+i,category:q.category};
  if(!q.id||ids.has(q.id))issues.push({...at,type:'duplicate_or_missing_id'});
  ids.add(q.id);
  if(!q.question?.trim()||!q.explanation?.trim())issues.push({...at,type:'missing_question_or_explanation'});
  if(!Array.isArray(q.choices)||q.choices.length!==5||new Set(q.choices).size!==5)issues.push({...at,type:'invalid_or_duplicate_choices'});
  if(!Number.isInteger(q.answerIndex)||q.answerIndex<0||q.answerIndex>4)issues.push({...at,type:'invalid_answer_index'});
  if(!q.sourceUrl||!q.lawAsOf||q.reviewStatus!=='校閲済')issues.push({...at,type:'needs_expert_review'});
}
const metadataPending=rows.filter(q=>!q.sourceUrl||!q.lawAsOf||q.reviewStatus!=='校閲済').length;
const blocking=issues.filter(q=>q.type!=='needs_expert_review');
const report={
  generatedAt:new Date().toISOString(),examId:bank.examId,total:rows.length,categories:counts,
  uniqueQuestionTexts:new Set(rows.map(q=>q.category+'|'+q.question)).size,
  pendingExpertReview:metadataPending,structuralIssues:blocking,readyForPaidRelease:metadataPending===0&&blocking.length===0
};
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync('audit-output/eisei-1-report.json',JSON.stringify(report,null,2)+'\n');
const header=['# 第一種衛生管理者 教材品質監査（自動集計）','','このレポートは形式チェックであり、解答や法令内容の正しさを保証しない。','','- 問題数: '+report.total,'- 異なる設問文（区分込み）: '+report.uniqueQuestionTexts,'- 専門家未校閲・根拠不足: '+metadataPending,'- 形式上の問題: '+blocking.length,'- 有料公開可能: '+(report.readyForPaidRelease?'要・人による最終承認':'いいえ'),'','## 分野別問題数',...Object.entries(counts).map(([k,v])=>'- '+k+': '+v+'問'),'','## 形式上の問題',...blocking.map(x=>'- '+x.id+' ['+x.category+'] '+x.type),'','## 次の作業','公式資料に照らして各問の正答・解説を専門家が校閲し、出典・基準日・担当を記録する。'];
fs.writeFileSync('audit-output/eisei-1-report.md',header.join('\n')+'\n');
console.log(JSON.stringify({total:rows.length,reviewPending:metadataPending,structuralIssues:blocking.length,readyForPaidRelease:report.readyForPaidRelease}));
if(blocking.length)process.exitCode=1;
