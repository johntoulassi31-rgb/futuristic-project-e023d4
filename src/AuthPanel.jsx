import React,{useEffect,useState} from 'react';
import {LogIn,LogOut,UserRound,UserPlus,X} from 'lucide-react';
import {supabase} from './lib/supabase.js';

export default function AuthPanel(){
 const [user,setUser]=useState(null),[mode,setMode]=useState('login'),[open,setOpen]=useState(false),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState('student'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function refreshUser(authUser){
  if(!authUser){setUser(null);window.dispatchEvent(new Event('mentoratplus-auth-changed'));return;}
  const {data:profile}=await supabase.from('profiles').select('display_name,role').eq('id',authUser.id).maybeSingle();
  setUser({id:authUser.id,email:authUser.email,displayName:profile?.display_name||authUser.user_metadata?.display_name||authUser.email,role:profile?.role||'student'});
  window.dispatchEvent(new Event('mentoratplus-auth-changed'));
 }
 useEffect(()=>{
  supabase.auth.getUser().then(({data})=>refreshUser(data.user));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{refreshUser(session?.user||null)});
  return()=>subscription.unsubscribe();
 },[]);
 async function submit(e){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   if(mode==='register'){
    const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{display_name:name.trim(),role}}});
    if(error)throw error;
    if(data.session){await refreshUser(data.user);setOpen(false);setPassword('');}
    else setNotice('Votre compte a été créé. Consultez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.');
   }else{
    const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
    if(error)throw error;
    await refreshUser(data.user);setOpen(false);setPassword('');
   }
  }catch(e){setError(e.message||'Connexion impossible.')}finally{setBusy(false)}
 }
 async function logout(){
  setBusy(true);setError('');
  try{const {error}=await supabase.auth.signOut();if(error)throw error;await refreshUser(null);window.location.reload();}
  catch(e){setError(e.message||'Déconnexion impossible.')}finally{setBusy(false)}
 }
 return <div className="account-area">{user?<><span className="account-identity"><UserRound size={16}/><span>{user.displayName}<small>{user.role==='teacher'?'Enseignant':user.role==='admin'?'Administrateur':'Étudiant'}</small></span></span><button className="account-action" onClick={logout} disabled={busy} aria-label="Se déconnecter"><LogOut size={16}/></button></>:<><button className="account-action" onClick={()=>{setMode('login');setError('');setNotice('');setOpen(true)}}><LogIn size={16}/> Connexion</button><button className="account-register" onClick={()=>{setMode('register');setError('');setNotice('');setOpen(true)}}><UserPlus size={15}/> Créer un compte</button></>}
 {open&&<div className="overlay account-overlay" onClick={e=>{if(e.target===e.currentTarget&&!busy)setOpen(false)}}><section className="modal account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title"><button className="close icon-btn" onClick={()=>setOpen(false)} disabled={busy} aria-label="Fermer"><X/></button><span className="eyebrow">MENTORATPLUS / ESPACE PERSONNEL</span><h2 id="account-title">{mode==='register'?'Créer votre compte':'Bienvenue à nouveau'}</h2><p>{mode==='register'?'Retrouvez vos cours et votre progression sur vos différents appareils.':'Connectez-vous pour retrouver votre espace pédagogique.'}</p><form onSubmit={submit}>{mode==='register'&&<label>Nom affiché<input required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}<label>Adresse e-mail<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Mot de passe<input required type="password" minLength={mode==='register'?12:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='register'?'new-password':'current-password'}/>{mode==='register'&&<small>12 caractères minimum.</small>}</label>{mode==='register'&&<label>Votre profil<select value={role} onChange={e=>setRole(e.target.value)}><option value="student">Étudiant</option><option value="teacher">Enseignant</option></select></label>}{error&&<p className="form-error" role="alert">{error}</p>}{notice&&<p className="learn-success" role="status">{notice}</p>}<button className="primary generate" disabled={busy}>{busy?'Veuillez patienter…':mode==='register'?'Créer mon compte':'Me connecter'}</button></form><p className="account-switch">{mode==='register'?'Vous avez déjà un compte ?':'Pas encore de compte ?'} <button onClick={()=>{setMode(mode==='register'?'login':'register');setError('');setNotice('')}}>{mode==='register'?'Se connecter':'Créer un compte'}</button></p></section></div>}
 </div>;
}
