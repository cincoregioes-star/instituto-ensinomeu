import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const C=window.ENSINOMEU_CONFIG||{};
const field=id=>document.getElementById(id);
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(C.supabaseUrl||'')&&/^sb_publishable_[\w.-]+$/.test(C.supabasePublishableKey||'');
const sb=configured?createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
const form=field('login-form'),submit=field('submit');
function status(message,success=false){field('message').textContent=message;field('message').classList.toggle('ok',success)}
function toInternalEmail(username){
  const value=String(username||'').trim().toLowerCase();
  // Compatibilidade temporária com contas anteriores enquanto se provisionam os acessos por usuário.
  if(value.includes('@'))return /^\S+@\S+\.\S+$/.test(value)?value:null;
  if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(value))return null;
  // Este endereço é um identificador técnico interno do Supabase Auth; não recebe e-mails.
  return value+'@login.ensinomeu.invalid';
}
if(!sb){submit.disabled=true;status('Autenticação indisponível. Contate a administração.')}
else{
  const session=await sb.auth.getUser().catch(()=>({data:{user:null}}));
  if(session.data?.user)location.replace('painel.html');
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(submit.disabled)return;
    const email=toInternalEmail(field('username').value),password=field('password').value;
    if(!email){status('Informe um nome de usuário válido.');return}
    submit.disabled=true;status('Autenticando…',true);
    try{
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error||!data?.user)throw Error('Usuário ou senha incorretos.');
      // Validação de autorização no servidor; não basta ter um token de login.
      const response=await fetch(C.supabaseUrl+'/functions/v1/ensino-api/me',{
        headers:{'Authorization':'Bearer '+data.session.access_token,'apikey':C.supabasePublishableKey},cache:'no-store'});
      if(!response.ok){await sb.auth.signOut();throw Error('Conta sem autorização ativa para acessar o Instituto.')}
      location.assign('painel.html');
    }catch(e){status(e.message||'Não foi possível entrar.');submit.disabled=false}
  });
}
