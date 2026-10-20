import fs from 'node:fs';
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=load('exams/eisei-1/questions.json').questions;
const manifest=load('audit/evidence-ledger-manifest.json').files;
const evidence=new Map();
for(const path of manifest){const x=load(path);for(const e of x.verifiedForReference||x.entries||x.newPrimaryChecks||[]) {if(evidence.has(e.id))throw Error('duplicate evidence '+e.id);evidence.set(e.id,{file:path,record:e})}}
const drafts=['batch1','batch2','batch3'].flatMap(n=>load('audit/question-quality-candidates-'+n+'.json').candidates);
const draftIds=new Set(drafts.map(x=>x.id));
const blockerTypes=['law_effective_date_unconfirmed','all_choices_unreviewed','source_only_in_audit','weak_explanation','question_template','quality_rewrite_unapproved'];
const rows=bank.map(q=>{
const issues=[];const ev=evidence.get(q.id);
if(!ev)issues.push('missing_evidence');
if(q.reviewStatus!=='専門家承認済')issues.push('all_choices_unreviewed');
if(!q.sourceUrl)issues.push('source_only_in_audit');
if(q.category.startsWith('関係法令')&&!q.lawAsOf)issues.push('law_effective_date_unconfirmed');
if((q.explanation||'').length<35)issues.push('weak_explanation');
if(q.question.startsWith('確認問題：')||q.question.startsWith('次のテーマについて'))issues.push('question_template');
if(draftIds.has(q.id))issues.push('quality_rewrite_unapproved');
if(q.id==='EISEI1-0014')issues.push('law_change_sensitive');
const priority=issues.includes('missing_evidence')||issues.includes('law_change_sensitive')?'P0':issues.includes('law_effective_date_unconfirmed')?'P1':'P2';
return {id:q.id,category:q.category,priority,issues,sourceLedger:ev?.file||null,reviewerSignoff:false,releaseReady:false};
});
const flags=Object.fromEntries([...new Set(rows.flatMap(x=>x.issues))].map(f=>[f,rows.filter(x=>x.issues.includes(f)).length]));
const output={generatedBy:'static-source-and-structure-checks',total:bank.length,sourceCoverage:evidence.size,releaseReady:rows.filter(r=>r.releaseReady).length,blockers:flags,priorityCounts:Object.fromEntries(['P0','P1','P2'].map(p=>[p,rows.filter(r=>r.priority===p).length])),rewriteCandidates:draftIds.size,notes:['No assertion of factual correctness: option-level source checking and human approval remain required.','Do not release content based on tracked sources alone.'],items:rows};
if(process.argv.includes('--assert')&&(bank.length!==214||evidence.size!==214||draftIds.size!==30||rows.length!==214))throw Error('Expected coverage or drafts mismatch');
console.log(JSON.stringify(output,null,2));
