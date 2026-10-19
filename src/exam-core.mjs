/** Multi-exam storage API, isolated from legacy v1 key for backwards compatibility. */
export const STORAGE_VERSION=1;
export function storageKey(examId){if(!/^[a-z0-9][a-z0-9-]{0,63}$/.test(examId))throw Error('invalid examId');return 'shikaku-toppa:progress:v1:'+examId;}
export function emptyProgress(){return {version:STORAGE_VERSION,history:{},stats:{},sessions:[],stars:[],wrong:[],examDate:''};}
export function loadProgress(storage,examId){let data;try{data=JSON.parse(storage.getItem(storageKey(examId)))}catch{return emptyProgress()}if(!data||typeof data!=='object'||Array.isArray(data))return emptyProgress();return {...emptyProgress(),...data,version:STORAGE_VERSION};}
export function saveProgress(storage,examId,progress){storage.setItem(storageKey(examId),JSON.stringify({...progress,version:STORAGE_VERSION}));}
export function validateExam(exam){return !!exam && typeof exam.id==='string' && typeof exam.name==='string' && Array.isArray(exam.questions)&&exam.questions.every(q=>typeof q.id==='string'&&q.id.length>0&&typeof q.question==='string'&&Array.isArray(q.choices)&&q.choices.length>=2&&Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<q.choices.length);}
export function selectQuestionIds(exam,count){if(!validateExam(exam))throw Error('invalid exam');return exam.questions.slice(0,Math.max(0,count)).map(q=>q.id);}
