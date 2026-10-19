import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=read('exams/eisei-1/questions.json').questions;
const proposals=[...read('audit/explanation-proposals-batch1.json').entries,...read('audit/explanation-proposals-batch2.json').entries];
const checked=new Set([...read('audit/primary-source-checks.json').verifiedForReference,...[2,3,4,5,6].flatMap(n=>read('audit/primary-source-checks-batch'+n+'.json').entries)].map(e=>e.id));
const proposed=new Set(proposals.map(x=>x.id));
const normalize=x=>(x||'').normalize('NFKC').replace(/\s+/g,'').replace(/[？?。、．.]/g,'');
const topic=q=>q.topic||q.question.replace(/^確認問題：/,'').replace(/^次のテーマについて正しいものを選べ：「/,'').replace(/」$/,'');
const groups=new Map();
for(const q of bank){const key=q.category+'|'+normalize(topic(q));if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q.id)}
const queue=bank.map(q=>{const group=[...groups.values()].find(a=>a.includes(q.id));const issues=[];if(!q.sourceUrl)issues.push('出典欠落');if(!q.lawAsOf)issues.push('基準日未記録');if(!q.topic)issues.push('論点ID未設定');if((group?.length||0)>1)issues.push('同論点候補（機械判定）');if(!proposed.has(q.id)&&q.explanation.trim().length<20)issues.push('短い解説の改善草案なし');return{id:q.id,category:q.category,topic:q.topic||null,groupIds:group,proposalExists:proposed.has(q.id),primarySourceCheck:checked.has(q.id),expertApproved:false,issues}});
const result={total:queue.length,sourceCheckCount:queue.filter(q=>q.primarySourceCheck).length,unreviewed:queue.filter(q=>!q.expertApproved).length,topicMissing:queue.filter(q=>q.issues.includes('論点ID未設定')).length,duplicateCandidateGroups:[...groups.values()].filter(v=>v.length>1).length,queue};
fs.mkdirSync('audit-output',{recursive:true});fs.writeFileSync('audit-output/full-bank-review-queue.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({total:result.total,sourceCheckCount:result.sourceCheckCount,unreviewed:result.unreviewed,topicMissing:result.topicMissing,duplicateCandidateGroups:result.duplicateCandidateGroups}));
if(result.total!==214||result.sourceCheckCount!==34)process.exitCode=1;
