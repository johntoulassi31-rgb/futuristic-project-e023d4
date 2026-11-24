import React, {useEffect, useState} from 'react';
import {BookOpen, GraduationCap, Save, Sparkles} from 'lucide-react';
import {countries, studyFields, studyLevels} from '../shared/curriculum.js';

const initial={country:'TG',institution:'Université de Lomé',field:'gestion-marketing',level:'licence-1',role:'student'};
export default function LearningProfile({profile,onSaved}){
 const [form,setForm]=useState({...initial,...(profile||{})});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{setForm({...initial,...(profile||{})})},[profile]);
 const country=countries.find(x=>x.id===form.country)||countries[0];
 const field=studyFields.find(x=>x.id===form.field)||studyFields[0];
 function changeCountry(id){const next=countries.find(x=>x.id===id);setForm(f=>({...f,country:id,institution:next.institutions[0],customInstitution:''}));}
 async function save(e){e.preventDefault();setBusy(true);setError('');setSuccess('');try{const r=await fetch('/api/learning/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const data=await r.json();if(!r.ok)throw Error(data.error||'Impossible d’enregistrer ce profil.');onSaved?.(data);setSuccess('Votre parcours pédagogique est enregistré. Mentora adaptera désormais ses réponses à ces choix.');}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="learn-panel academic-profile">
  <div className="panel-heading"><GraduationCap size={21}/><div><h3>Mon parcours d’études</h3><p>Personnalisez les cours et les réponses de Mentora selon votre situation.</p></div></div>
  <form onSubmit={save}>
   <div className="profile-grid">
    <label>Votre profil<select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="student">Étudiant</option><option value="teacher">Enseignant</option>{form.role==='admin'&&<option value="admin">Administrateur</option>}</select></label>
    <label>Pays<select value={form.country} onChange={e=>changeCountry(e.target.value)}>{countries.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Université / établissement<select value={form.institution} onChange={e=>setForm(f=>({...f,institution:e.target.value,customInstitution:''}))}>{country.institutions.map(x=><option key={x}>{x}</option>)}</select></label>
    {form.institution==='Autre établissement'&&<label>Nom de l’établissement<input maxLength={160} value={form.customInstitution||''} onChange={e=>setForm(f=>({...f,customInstitution:e.target.value}))} placeholder="Saisissez le nom de votre établissement"/></label>}
    <label>Filière / domaine<select value={form.field} onChange={e=>setForm(f=>({...f,field:e.target.value}))}>{studyFields.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Niveau d’études<select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>{studyLevels.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
   </div>
   <div className="profile-subjects"><span><BookOpen size={15}/> Matières associées à votre filière</span><div>{field.subjects.map(subject=><small key={subject}>{subject}</small>)}</div></div>
   {error&&<p className="form-error" role="alert">{error}</p>}{success&&<p className="learn-success" role="status">{success}</p>}
   <button className="primary" disabled={busy}><Save size={16}/>{busy?'Enregistrement…':'Enregistrer mon parcours'} <Sparkles size={15}/></button>
  </form>
 </section>;
}
