import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=read('exams/eisei-1/questions.json').questions;
const drafts=['audit/question-quality-candidates-batch1.json','audit/question-quality-candidates-batch2.json'].flatMap(p=>read(p).candidates.map(x=>x.id));
const drafted=new Set(drafts);
const flags=[];
const easy=/^(?:SNSに投稿|簿記2級|日光浴|花粉症だけ|視力改善|食欲増進|保護具不要|顧客管理|知的財産管理|普通の会話|喫煙)$/;
const key=s=>s.replace(/^(?:次のテーマについて正しいものを選べ：「|確認問題：)/,'').replace(/」$/,'').replace(/として最も適切なのはどれか。?$/,'').replace(/[\s、。・：「」？?（）()]/g,'');
const byId=new Map(bank.map(q=>[q.id,q]));
const rows=bank.map((q,i)=>{
 const issues=[];const ans=q.choices[q.answerIndex];
 if(q.reviewStatus==='未校閲')issues.push('unreviewed');
 if(q.sourceUrl==null)issues.push('source_not_in_live_bank');
 if(q.question.startsWith('次のテーマについて')||q.question.startsWith('確認問題：'))issues.push('template_question');
 if(q.question.includes('として最も適切なのはどれか')&&q.question.includes('最も適切なのはどれか'))issues.push('wordy_question');
 if(q.choices.some(c=>easy.test(c)))issues.push('obvious_distractor');
 if(new Set(q.choices).size!==q.choices.length)issues.push('duplicate_choice');
 if(i>0){const prev=bank[i-1];if(key(prev.question)===key(q.question)||((q.question.startsWith('確認問題：')&&prev.question.startsWith('次のテーマについて'))&&prev.choices[prev.answerIndex]===ans))issues.push('adjacent_near_duplicate')}
 if(q.id==='EISEI1-0014')issues.push('law_change_gate');
 const score=(issues.includes('law_change_gate')?100:0)+(issues.includes('duplicate_choice')?80:0)+(issues.includes('adjacent_near_duplicate')?35:0)+(issues.includes('obvious_distractor')?20:0)+(issues.includes('template_question')?15:0)+(issues.includes('wordy_question')?10:0);
 return {id:q.id,category:q.category,score,priority:score>=60?'P0':score>=30?'P1':score>=15?'P2':'P3',issues,hasRewriteCandidate:drafted.has(q.id),reviewStatus:q.reviewStatus};
});
const priorities={P0:0,P1:0,P2:0,P3:0};for(const x of rows)priorities[x.priority]++;
const flagCounts={};for(const x of rows)for(const f of x.issues)flagCounts[f]=(flagCounts[f]||0)+1;
const out={schemaVersion:1,total:rows.length,model:'heuristic_triage_not_expert_validation',priorityCounts:priorities,flagCounts,existingRewriteCandidates:drafted.size,remainingWithoutRewrite:bank.length-drafted.size,items:rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))};
if(process.argv.includes('--assert')&&(out.total!==214||drafted.size!==14||rows.length!==214))throw Error('Unexpected bank or drafted set');
console.log(JSON.stringify(out,null,2));
