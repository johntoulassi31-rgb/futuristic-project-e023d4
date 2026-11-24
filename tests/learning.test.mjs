import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Hono} from 'hono';
import {stream} from 'hono/streaming';
import {academy,careers,careerProgress} from '../shared/academy.js';
import {countries,studyFields,studyLevels} from '../shared/curriculum.js';

// Isolate route behavior from infrastructure: no database writes or provider calls.
async function harness(){
 const courseTable={name:'courses',id:'id',owner:'owner',createdAt:'createdAt'},spaceTable={name:'spaces',owner:'owner',career:'career'},resourceTable={name:'academic_resources',id:'id',authorId:'authorId',status:'status',country:'country',institution:'institution',field:'field',level:'level',subject:'subject',createdAt:'createdAt'};
 const rows={courses:[],spaces:[],academic_resources:[]};let nextId=0;
 const match=(r,p)=>!p||p(r);
 const db={
  select(){let table,predicate;const q={from(t){table=t;return q},where(p){predicate=p;return q},orderBy(){return q},limit(){return q},for(){return q},then(ok,no){return Promise.resolve(structuredClone(rows[table.name].filter(r=>match(r,predicate)))).then(ok,no)}};return q},
  insert(t){return {values(values){const q={onConflictDoNothing(){if(!rows[t.name].some(r=>r.owner===values.owner))rows[t.name].push({career:null,completed:[],portfolio:[],day:'',profile:{country:'TG',institution:'Université de Lomé',field:'gestion-marketing',level:'licence-1',role:'student'},...values});return Promise.resolve()},returning(){const row={id:`00000000-0000-4000-8000-${String(++nextId).padStart(12,'0')}`,explanation:'',quiz:null,attempts:[],messages:[],createdAt:new Date().toISOString(),...values};rows[t.name].push(row);return Promise.resolve([structuredClone(row)])}};return q}}},
  update(t){return {set(values){let predicate;const perform=()=>{const updated=[];for(const r of rows[t.name])if(match(r,predicate)){Object.assign(r,structuredClone(values));updated.push(structuredClone(r))}return updated};const q={where(p){predicate=p;return q},returning(){return Promise.resolve(perform())},then(ok,no){return Promise.resolve(perform()).then(ok,no)}};return q}}},
  transaction(fn){return fn(db)},
 };
 let invalidAI=false;
 class OpenAI {constructor(){this.chat={completions:{create:async()=>({choices:[{message:{content:JSON.stringify(invalidAI?{quiz:[{question:'invalide'}]}:{text:'Une réponse pédagogique.',quiz:Array.from({length:5},(_,i)=>({question:`Question ${i+1}`,options:['A','B','C','D'],answer:i%4,explanation:'Voici la correction.'}))})}}]})}}}}
 const bindings={
  'drizzle-orm':{eq:(field,value)=>row=>row[field]===value,and:(...ps)=>row=>ps.every(p=>p(row)),desc:x=>x},
  'hono/streaming':{stream},openai:{default:OpenAI},'../../db/index.ts':{db},'../../db/schema.ts':{courses:courseTable,learningSpaces:spaceTable,academicResources:resourceTable},'../../shared/academy.js':{academy,careers},'../../shared/curriculum.js':{countries,studyFields,studyLevels},
 };
 const context=vm.createContext({console,Date,Set,JSON,Error,Number,Object,Array});
 const module=new vm.SourceTextModule(await readFile(new URL('../netlify/server/learning.mjs',import.meta.url),'utf8'),{context});
 await module.link(name=>{const values=bindings[name];assert.ok(values,`Import inattendu : ${name}`);return new vm.SyntheticModule(Object.keys(values),function(){for(const [key,value] of Object.entries(values))this.setExport(key,value)},{context})});await module.evaluate();
 const app=new Hono();app.use('/api/*',async(c,next)=>{const owner=c.req.header('x-test-owner')||'alice';const role=c.req.header('x-test-role');c.set('owner',owner);c.set('user',role?{id:owner+'-id',displayName:'Utilisateur test',role}:null);await next()});module.namespace.registerLearning(app);
 async function call(path,body,owner='alice',method=body===undefined?'GET':'POST',role='student'){
  const r=await app.request(path,{method,headers:{'Content-Type':'application/json','x-test-owner':owner,'x-test-role':role},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const text=await r.text();const payload=r.headers.get('content-type')?.includes('ndjson')?JSON.parse(text.trim().split('\n').at(-1)):JSON.parse(text);return {status:r.status,payload};
 }
 return {call,rows,setInvalidAI:value=>{invalidAI=value}};
}

test('Chaque métier ne compte que ses compétences liées à des cours terminés',()=>{
 assert.equal(careerProgress({career:'analyste-financier',completed:['bilan','tableau']}).percent,33);
 assert.equal(careerProgress({career:'comptable',completed:['bilan','budget','ecritures']}).percent,100);
 assert.equal(careerProgress({}).percent,0);
 for(const c of Object.values(careers))for(const id of c.skills)assert.ok(academy.some(a=>a.id===id));
});

test('Cours et IA : validation, isolation par propriétaire, quiz corrigé côté serveur et scores persistés',async()=>{
 const {call,rows,setInvalidAI}=await harness();
 assert.equal((await call('/api/courses',{title:'Court',content:'abc'})).status,400);
 const created=await call('/api/courses',{title:'Finance',content:'Les actifs sont financés par les capitaux propres et les dettes.'});
 assert.equal(created.status,201);const id=created.payload.id;assert.equal(created.payload.owner,undefined);
 assert.equal((await call('/api/learning',undefined,'bob')).payload.courses.length,0);
 for(const action of ['explain','quiz','question','submit'])assert.equal((await call(`/api/courses/${id}/${action}`,{question:'Pourquoi ?',answers:[0,1,2,3,0]},'bob')).status,404);
 assert.equal((await call(`/api/courses/${id}/question`,{question:''})).status,400);
 setInvalidAI(true);const invalid=await call(`/api/courses/${id}/quiz`,{});assert.ok(invalid.payload.error);assert.equal(rows.courses[0].quiz,null);
 setInvalidAI(false);const quiz=(await call(`/api/courses/${id}/quiz`,{})).payload.result;assert.equal(quiz.quiz.length,5);assert.equal(quiz.quiz[0].answer,undefined);assert.equal(quiz.quiz[0].explanation,undefined);
 assert.equal((await call(`/api/courses/${id}/submit`,{answers:[99]})).status,400);
 const submission=await call(`/api/courses/${id}/submit`,{answers:[0,1,2,3,0]});assert.equal(submission.payload.attempt.score,5);assert.equal(submission.payload.correction.length,5);
 await call(`/api/courses/${id}/explain`,{});await call(`/api/courses/${id}/question`,{question:'Un exemple ?'});
 const saved=(await call('/api/learning')).payload.courses[0];assert.equal(saved.attempts[0].score,5);assert.equal(saved.messages.length,1);assert.ok(saved.explanation);assert.equal(saved.quiz[0].answer,undefined);
});

test('Académie, métier et portfolio : validation idempotente, instantané et isolation',async()=>{
 const {call}=await harness();
 assert.equal((await call('/api/learning/portfolio',{})).status,400);
 assert.equal((await call('/api/learning',{career:'inconnu'},'alice','PATCH')).status,400);
 await call('/api/learning',{career:'comptable'},'alice','PATCH');
 assert.equal((await call('/api/learning/complete',{id:'inconnu'})).status,400);
 await call('/api/learning/complete',{id:'bilan'});await call('/api/learning/complete',{id:'bilan'});
 let state=(await call('/api/learning')).payload.space;assert.deepEqual(state.completed,['bilan']);assert.equal(state.owner,undefined);
 await call('/api/learning/portfolio',{});await call('/api/learning/complete',{id:'budget'});
 state=(await call('/api/learning')).payload.space;assert.deepEqual(state.portfolio[0].completed,['bilan']);
 await call('/api/learning/portfolio',{});state=(await call('/api/learning')).payload.space;assert.equal(state.portfolio.length,1);assert.deepEqual(state.portfolio[0].completed,['bilan','budget']);
 const bob=(await call('/api/learning',undefined,'bob')).payload.space;assert.equal(bob.career,null);assert.equal(bob.completed.length,0);assert.equal(bob.portfolio.length,0);
 const day=(await call('/api/learning/day',{})).payload.result;assert.equal(day.career,'comptable');assert.ok(day.day);
 await call('/api/learning',{career:'analyste-financier'},'alice','PATCH');assert.equal((await call('/api/learning')).payload.space.day,'');
});

test('Profil académique : validation, persistance et isolation',async()=>{
 const {call}=await harness();
 const profile={country:'TG',institution:'Université de Lomé',field:'gestion-marketing',level:'licence-2',role:'student'};
 const saved=await call('/api/learning/profile',profile,'alice','PATCH');
 assert.equal(saved.status,200);assert.equal(saved.payload.profile.level,'licence-2');
 assert.equal((await call('/api/learning')).payload.space.profile.level,'licence-2');
 assert.equal((await call('/api/learning/profile',{...profile,level:'niveau-inventé'},'alice','PATCH')).status,400);
 assert.equal((await call('/api/learning',undefined,'bob')).payload.space.profile.level,'licence-1');
});

test('Bibliothèque partagée : accès enseignant, filtres de visibilité et modération admin',async()=>{
 const {call,rows}=await harness();
 const draft={title:'Introduction à la comptabilité',summary:'Les bases des écritures comptables.',content:'La comptabilité enregistre les opérations qui affectent le patrimoine de l’entreprise. Chaque opération est analysée selon le principe de la partie double.',country:'TG',institution:'Université de Lomé',field:'gestion-marketing',level:'licence-1',subject:'Comptabilité générale',sourceType:'enseignant',sourceUrl:'https://example.edu/cours'};
 assert.equal((await call('/api/library',draft,'student','POST','student')).status,403);
 assert.equal((await call('/api/library',draft,'teacher','POST','teacher')).status,201);
 assert.equal(rows.academic_resources[0].status,'pending');
 assert.equal((await call('/api/library',undefined,'student')).payload.items.length,0);
 assert.equal((await call('/api/library/manage',undefined,'teacher','GET','teacher')).payload.items.length,1);
 assert.equal((await call('/api/library/'+rows.academic_resources[0].id+'/review',{decision:'approved'},'teacher','PATCH','teacher')).status,403);
 const adminList=await call('/api/library/manage',undefined,'admin','GET','admin');
 assert.equal(adminList.payload.items.length,1);
 const approved=await call('/api/library/'+rows.academic_resources[0].id+'/review',{decision:'approved',verifiedOfficial:false},'admin','PATCH','admin');
 assert.equal(approved.status,200);assert.equal(approved.payload.status,'published');assert.equal(approved.payload.verifiedOfficial,false);
 const visible=await call('/api/library?country=TG&level=licence-1',undefined,'student');
 assert.equal(visible.payload.items.length,1);assert.equal(visible.payload.items[0].authorId,undefined);
 assert.equal((await call('/api/library?field=informatique-numerique',undefined,'student')).payload.items.length,0);
 const verified=await call('/api/library/'+rows.academic_resources[0].id+'/review',{decision:'approved',verifiedOfficial:true},'admin','PATCH','admin');
 assert.equal(verified.payload.verifiedOfficial,true);
 assert.equal((await call('/api/library', {...draft,title:'Lien incorrect',sourceUrl:'javascript:alert(1)'},'teacher','POST','teacher')).status,400);
 const rejected=await call('/api/library/'+rows.academic_resources[0].id+'/review',{decision:'rejected',note:'Source à revoir.'},'admin','PATCH','admin');
 assert.equal(rejected.payload.status,'rejected');assert.equal((await call('/api/library',undefined,'student')).payload.items.length,0);
});
