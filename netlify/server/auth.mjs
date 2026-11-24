import { and, eq, gt } from 'drizzle-orm';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from '../../db/index.ts';
import { courses, learningSpaces, projects, sessions, users } from '../../db/schema.ts';

const SESSION_COOKIE='mentoratplus_session';
const SESSION_SECONDS=60*60*24*30;
const digest=value=>createHash('sha256').update(value).digest('hex');
const publicUser=user=>({id:user.id,email:user.email,displayName:user.displayName,role:user.role});
function passwordHash(password){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
function verifyPassword(password,stored){try{const [scheme,salt,hash]=stored.split(':');if(scheme!=='scrypt'||!salt||!hash)return false;const expected=Buffer.from(hash,'hex'),actual=scryptSync(password,salt,64);return expected.length===actual.length&&timingSafeEqual(expected,actual);}catch{return false;}}
async function createSession(c,userId){const token=randomBytes(32).toString('base64url');await db.insert(sessions).values({userId,tokenHash:digest(token),expiresAt:new Date(Date.now()+SESSION_SECONDS*1000)});setCookie(c,SESSION_COOKIE,token,{httpOnly:true,secure:true,sameSite:'Lax',path:'/',maxAge:SESSION_SECONDS});}
export async function resolveUser(c){const token=getCookie(c,SESSION_COOKIE);if(!token||token.length>100)return null;const [row]=await db.select({user:users}).from(sessions).innerJoin(users,eq(sessions.userId,users.id)).where(and(eq(sessions.tokenHash,digest(token)),gt(sessions.expiresAt,new Date()))).limit(1);return row?.user||null;}
export function registerAuth(app){
 app.get('/api/auth/me',c=>c.json({user:c.get('user')?publicUser(c.get('user')):null}));
 app.post('/api/auth/register',async c=>{
  const b=await c.req.json().catch(()=>null);const email=typeof b?.email==='string'?b.email.trim().toLowerCase():'';const password=b?.password;const displayName=typeof b?.displayName==='string'?b.displayName.trim():'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<12||password.length>128||displayName.length<2||displayName.length>80||!['student','teacher'].includes(b?.role))return c.json({error:'Indiquez un nom, une adresse e-mail valide, un mot de passe de 12 caractères minimum et un profil autorisé.'},400);
  try{
   const [user]=await db.insert(users).values({email,passwordHash:passwordHash(password),displayName,role:b.role}).returning();
   const guestOwner=c.get('guestOwner'),owner=`user:${user.id}`;
   await db.transaction(async tx=>{await tx.update(projects).set({owner}).where(eq(projects.owner,guestOwner));await tx.update(courses).set({owner}).where(eq(courses.owner,guestOwner));await tx.update(learningSpaces).set({owner}).where(eq(learningSpaces.owner,guestOwner));});
   await createSession(c,user.id);return c.json({user:publicUser(user)},201);
  }catch{return c.json({error:'Cette adresse e-mail est peut-être déjà utilisée. Vérifiez-la ou connectez-vous.'},409);}
 });
 app.post('/api/auth/login',async c=>{
  const b=await c.req.json().catch(()=>null);const email=typeof b?.email==='string'?b.email.trim().toLowerCase():'';
  if(!email||typeof b?.password!=='string'||b.password.length>128)return c.json({error:'Adresse e-mail ou mot de passe incorrect.'},401);
  const [user]=await db.select().from(users).where(eq(users.email,email)).limit(1);
  if(!user||!verifyPassword(b.password,user.passwordHash))return c.json({error:'Adresse e-mail ou mot de passe incorrect.'},401);
  await createSession(c,user.id);return c.json({user:publicUser(user)});
 });
 app.post('/api/auth/logout',async c=>{const token=getCookie(c,SESSION_COOKIE);if(token)await db.delete(sessions).where(eq(sessions.tokenHash,digest(token)));deleteCookie(c,SESSION_COOKIE,{path:'/'});return c.json({success:true});});
}
