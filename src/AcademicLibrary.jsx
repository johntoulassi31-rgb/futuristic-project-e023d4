import React,{useEffect,useMemo,useState} from 'react';
import {BookOpen,Search,Send,ShieldCheck,CheckCircle2,Clock3,FileText,ExternalLink,RefreshCw} from 'lucide-react';
import {countries,studyFields,studyLevels} from '../shared/curriculum.js';

import {api} from './lib/api.js';
import {supabase} from './lib/supabase.js';
const mapResource=item=>({...item,authorId:item.author_id,authorName:item.author_name,sourceType:item.source_type,sourceUrl:item.source_url,verifiedOfficial:item.verified_official,reviewNote:item.review_note,createdAt:item.created_at});
async function publicResources(filters){
 let query=supabase.from('academic_resources').select('*').eq('status','published').order('created_at',{ascending:false}).limit(200);
 for(const key of ['country','institution','field','level','subject'])if(filters[key])query=query.eq(key,filters[key]);
 const {data,error}=await query;if(error)throw error;
 let rows=(data||[]).map(mapResource);
 const term=(filters.q||'').trim().toLocaleLowerCase('fr');
 if(term)rows=rows.filter(x=>[x.title,x.summary,x.content,x.subject,x.authorName].some(v=>(v||'').toLocaleLowerCase('fr').includes(term)));
 return rows;
}

const initialForm=(profile={})=>({title:'',summary:'',content:'',country:profile.country||'TG',institution:profile.customInstitution||profile.institution||'Université de Lomé',field:profile.field||'gestion-marketing',level:profile.level||'licence-1',subject:'',sourceType:'enseignant',sourceUrl:''});
export default function AcademicLibrary({profile}){
 const [user,setUser]=useState(null),[items,setItems]=useState([]),[mine,setMine]=useState([]),[form,setForm]=useState(()=>initialForm(profile)),[filters,setFilters]=useState(()=>({country:profile?.country||'TG',institution:'',field:profile?.field||'',level:profile?.level||'',subject:'',q:''})),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[expanded,setExpanded]=useState('');
 const field=useMemo(()=>studyFields.find(x=>x.id===form.field),[form.field]);
 async function load(){
  setError('');
  try{
   const {data:{user:authUser}}=await supabase.auth.getUser();
   let role=null;
   if(authUser){const {data:profile}=await supabase.from('profiles').select('role').eq('id',authUser.id).maybeSingle();role=profile?.role||null;}
   setUser(authUser?{...authUser,role}:null);
   setItems(await publicResources(filters));
   if(authUser&&['teacher','admin'].includes(role)){const managed=await api('/api/library/manage');setMine((managed.items||[]).map(mapResource));}else setMine([]);
  }catch(e){setError(e.message)}
 }
 useEffect(()=>{load();const refresh=()=>load();window.addEventListener('mentoratplus-auth-changed',refresh);return()=>window.removeEventListener('mentoratplus-auth-changed',refresh)},[]);
 async function search(e){e?.preventDefault();setBusy(true);try{setItems(await publicResources(filters));}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function submit(e){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{await api('/api/library','POST',form);setForm(initialForm(profile));setNotice('Votre ressource a été envoyée à la modération. Elle sera visible après validation.');await load();}
  catch(e){setError(e.message)}finally{setBusy(false)}
 }
 async function showAll(){const empty={country:'',institution:'',field:'',level:'',subject:'',q:''};setFilters(empty);setBusy(true);try{setItems(await publicResources({country:'',institution:'',field:'',level:'',subject:'',q:''}))}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function review(item,decision,verifiedOfficial=false){
  setBusy(true);setError('');
  try{await api('/api/library/'+item.id+'/review','PATCH',{decision,verifiedOfficial,note:''});await load();setNotice(decision==='approved'?'Ressource publiée.':'Ressource refusée.');}
  catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const statusLabel={pending:'En attente',published:'Publiée',rejected:'Refusée'};
 return <div className="academic-library">
  <div className="learn-intro"><span className="learn-kicker">RESSOURCES PARTAGÉES / CAMPUS & SAVOIRS</span><h2>Une bibliothèque qui grandit avec vous.</h2><p>Consultez des cours proposés par la communauté, filtrés selon votre parcours. Les contenus publiés ne sont pas automatiquement des documents officiels : vérifiez toujours les références de votre établissement.</p></div>
  {error&&<p className="form-error" role="alert">{error}</p>}{notice&&<p className="learn-success" role="status"><CheckCircle2 size={16}/>{notice}</p>}
  <form className="library-filters learn-panel" onSubmit={search}>
   <div className="panel-heading"><Search size={20}/><h3>Rechercher une ressource</h3></div>
   <div className="profile-grid">
    <label>Pays<select value={filters.country} onChange={e=>setFilters(f=>({...f,country:e.target.value,institution:''}))}><option value="">Tous les pays</option>{countries.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Établissement<input value={filters.institution} onChange={e=>setFilters(f=>({...f,institution:e.target.value}))} placeholder="Tous les établissements"/></label>
    <label>Filière<select value={filters.field} onChange={e=>setFilters(f=>({...f,field:e.target.value}))}><option value="">Toutes les filières</option>{studyFields.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Niveau<select value={filters.level} onChange={e=>setFilters(f=>({...f,level:e.target.value}))}><option value="">Tous les niveaux</option>{studyLevels.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Matière<input value={filters.subject} onChange={e=>setFilters(f=>({...f,subject:e.target.value}))} placeholder="Ex. Comptabilité générale"/></label>
    <label>Mot-clé<input value={filters.q} onChange={e=>setFilters(f=>({...f,q:e.target.value}))} placeholder="Titre, contenu, auteur…"/></label>
   </div>
   <button className="primary" disabled={busy}><Search size={16}/> Rechercher</button>
  </form>
  <div className="library-results-head"><h3><BookOpen size={19}/> Ressources disponibles <span>{items.length}</span></h3><button className="text-link" disabled={busy} onClick={showAll}><RefreshCw size={14}/> Tout afficher</button></div>
  {items.length?<div className="library-grid">{items.map(item=><article className="library-card learn-panel" key={item.id}>
   <div className="library-card-top"><span>{countries.find(x=>x.id===item.country)?.label||item.country}</span>{item.verifiedOfficial&&<small><ShieldCheck size={13}/> Source officielle vérifiée</small>}</div>
   <h3>{item.title}</h3><p>{item.summary}</p>
   <div className="library-tags"><span>{studyFields.find(x=>x.id===item.field)?.label||item.field}</span><span>{studyLevels.find(x=>x.id===item.level)?.label||item.level}</span><span>{item.subject}</span></div>
   <small className="library-meta">{item.institution} · Proposé par {item.authorName}</small>
   <button className="text-link" onClick={()=>setExpanded(expanded===item.id?'':item.id)}>{expanded===item.id?'Masquer le cours':'Lire le cours'} <FileText size={15}/></button>
   {expanded===item.id&&<div className="library-content"><p>{item.content}</p>{item.sourceUrl&&<a href={item.sourceUrl} target="_blank" rel="noreferrer">Consulter la source <ExternalLink size={13}/></a>}</div>}
  </article>)}</div>:<div className="learn-panel learn-placeholder"><BookOpen size={36}/><h3>Aucune ressource pour ces critères</h3><p>Essayez d’élargir les filtres. Les ressources soumises apparaîtront ici après validation.</p></div>}
  {user&&['teacher','admin'].includes(user.role)&&<section className="library-submit">
   <div className="learn-intro"><span className="learn-kicker">CONTRIBUTION ENSEIGNANTE</span><h2>Partager un cours avec la communauté.</h2><p>Chaque proposition est relue avant publication. Ne partagez pas de données personnelles d’étudiants ni de documents protégés sans autorisation.</p></div>
   <form className="learn-panel" onSubmit={submit}>
    <div className="panel-heading"><Send size={20}/><h3>Proposer une ressource</h3></div>
    <div className="profile-grid">
     <label>Titre<input required maxLength={180} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></label>
     <label>Résumé<input required maxLength={600} value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))}/></label>
     <label>Pays<select value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}>{countries.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
     <label>Établissement<input required maxLength={180} value={form.institution} onChange={e=>setForm(f=>({...f,institution:e.target.value}))}/></label>
     <label>Filière<select value={form.field} onChange={e=>setForm(f=>({...f,field:e.target.value,subject:''}))}>{studyFields.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
     <label>Niveau<select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>{studyLevels.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
     <label>Matière<input required list="library-subjects" maxLength={120} value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Nom de la matière"/><datalist id="library-subjects">{(field?.subjects||[]).map(x=><option key={x} value={x}/>)}</datalist></label>
     <label>Nature de la source<select value={form.sourceType} onChange={e=>setForm(f=>({...f,sourceType:e.target.value}))}><option value="enseignant">Cours d’enseignant</option><option value="institution">Document institutionnel</option><option value="manuel">Manuel / ouvrage</option><option value="autre">Autre</option></select></label>
     <label>Adresse de la source (facultatif)<input type="url" maxLength={500} value={form.sourceUrl} onChange={e=>setForm(f=>({...f,sourceUrl:e.target.value}))} placeholder="https://…"/></label>
    </div>
    <label className="library-content-label">Contenu du cours<textarea required minLength={30} maxLength={50000} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder="Objectifs, notions, explications, exemples et exercices…"/></label>
    <p className="learn-note">30 à 50 000 caractères. Une ressource n’est pas une validation officielle du programme.</p>
    <button className="primary" disabled={busy}><Send size={16}/> Envoyer à la modération</button>
   </form>
  </section>}
  {user?.role==='admin'&&<section className="library-moderation"><div className="library-results-head"><h3><ShieldCheck size={19}/> Modération des ressources</h3><span>{mine.filter(x=>x.status==='pending').length} en attente</span></div><p className="learn-note">N’utilisez « source vérifiée » qu’après avoir consulté et contrôlé vous-même le document référencé. L’adresse fournie seule ne prouve pas son caractère officiel.</p>
   {mine.filter(x=>x.status==='pending').map(item=><article className="learn-panel moderation-card" key={item.id}><h3>{item.title}</h3><p>{item.summary}</p><small>{item.institution} · {item.subject} · {item.authorName}</small><p className="learn-note">{item.sourceUrl||'Aucune adresse de source fournie'} · {item.sourceType}</p><div className="learn-actions"><button className="primary" disabled={busy} onClick={()=>review(item,'approved',false)}><CheckCircle2 size={15}/> Approuver</button><button className="secondary" disabled={busy} onClick={()=>review(item,'rejected')} >Refuser</button>{item.sourceUrl&&<button className="secondary" disabled={busy} onClick={()=>review(item,'approved',true)}><ShieldCheck size={15}/> Approuver + source vérifiée</button>}</div></article>)}
   {!mine.some(x=>x.status==='pending')&&<p className="learn-note">Aucune ressource en attente de validation.</p>}
  </section>}
  {user?.role==='teacher'&&<section className="library-moderation"><div className="library-results-head"><h3><Clock3 size={18}/> Mes propositions</h3><span>{mine.length}</span></div>{mine.map(item=><article className="teacher-submission" key={item.id}><b>{item.title}</b><span className={'resource-status '+item.status}>{statusLabel[item.status]}</span>{item.reviewNote&&<small>{item.reviewNote}</small>}</article>)}</section>}
 </div>;
}
