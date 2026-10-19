import fs from 'node:fs';
const bank=JSON.parse(fs.readFileSync('exams/eisei-1/questions.json','utf8')).questions;
const review=JSON.parse(fs.readFileSync('audit/legal-change-risk.json','utf8'));
const byId=new Map(bank.map(q=>[q.id,q]));
const seen=new Set();
for(const e of review.entries){
 if(!byId.has(e.id)||seen.has(e.id))throw Error('Invalid ID '+e.id);
 seen.add(e.id);
 if(e.approved!==false||!e.sourceUrl.startsWith('https://'))throw Error('Unverified approval/source '+e.id);
 if(e.risk==='high'&&!e.effectiveDate)throw Error('Missing law change date');
}
const sc=review.entries.find(x=>x.id==='EISEI1-0014');
if(sc.effectiveDate!=='2028-04-01')throw Error('Stress check effective date mismatch');
console.log('Legal review candidates:',review.entries.length,'High priority:',review.entries.filter(e=>e.risk==='high').length);
