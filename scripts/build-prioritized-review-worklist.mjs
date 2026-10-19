import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const questions=read('exams/eisei-1/questions.json').questions;
const priority=read('audit/review-priority-rules.json');
const reviewed=new Set([...read('audit/primary-source-checks.json').verifiedForReference,...[2,3,4,5,6].flatMap(n=>read('audit/primary-source-checks-batch'+n+'.json').entries)].map(x=>x.id));
const extra=[read('audit/legal-change-risk.json'),read('audit/health-exam-heat-risk.json'),read('audit/chemical-hazards-review.json'),read('audit/special-health-environment-review.json')];
const flagged=new Map();for(const source of extra)for(const e of source.entries){const old=flagged.get(e.id)||[];old.push(source===extra[0]?'法改正リスク':'重点監査記録あり');flagged.set(e.id,old)}
const law=q=>q.category.includes('法令');
const rows=questions.map(q=>{const flags=[];if(!q.sourceUrl)flags.push('出典欠落');if(!q.lawAsOf&&law(q))flags.push('法令基準日未記録');if(!q.topic)flags.push('論点未設定');if(!reviewed.has(q.id))flags.push('一次照合未着手');flags.push(...(flagged.get(q.id)||[]));const score=(law(q)?30:0)+(reviewed.has(q.id)?-40:40)+(!q.sourceUrl?15:0)+(!q.lawAsOf&&law(q)?15:0)+(flagged.has(q.id)?20:0);return{id:q.id,category:q.category,reviewStage:reviewed.has(q.id)?'主要論点一次照合あり':'未着手',score,flags,expertApproved:false}});
rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
const result={version:1,sourceQuestions:questions.length,reviewedPrimary:rows.filter(x=>x.reviewStage!=='未着手').length,remainingPrimary:rows.filter(x=>x.reviewStage==='未着手').length,definition:'優先順位は監査用ヒューリスティック。品質の保証・法令の確定判断ではない。',rules:priority,queue:rows};
if(result.sourceQuestions!==214||result.reviewedPrimary!==34||result.remainingPrimary!==180)throw Error('Review baseline mismatch');
fs.mkdirSync('audit-output',{recursive:true});fs.writeFileSync('audit-output/prioritized-review-worklist.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({total:result.sourceQuestions,covered:result.reviewedPrimary,remaining:result.remainingPrimary,top10:rows.slice(0,10).map(x=>x.id)}));
