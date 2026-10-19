import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const config=window.ENSINOMEU_CONFIG||{};
const $=id=>document.getElementById(id);
const msg=(s,ok=false)=>{$('message').textContent=s;$('message').classList.toggle('ok',ok)};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl||'')&&/^sb_publishable_[\w.-]+$/.test(config.supabasePublishableKey||'');
const supabase=configured?createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
let recovering=false;
function section(mode){['login-form','recover-form','new-password-form'].forEach(id=>$(id).hidden=id!==mode);$('title').textContent=mode==='recover-form'?'Recuperar minha senha':mode==='new-password-form'?'Definir nova senha':'Acessar minha conta';msg('')}
async function submit(form,job){const b=form.querySelector('button.primary');b.disabled=true;try{await job()}catch(e){msg(e.message||'Não foi possível completar a solicitação.')}finally{b.disabled=false}}
if(!configured){msg('Configuração da autenticação não encontrada. Fale com a administração.');$('login-form').querySelector('button.primary').disabled=true}
else{
 supabase.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovering=true;section('new-password-form')}});
 const existing=await supabase.auth.getUser();if(existing.data?.user&&!recovering&&!location.hash.includes('type=recovery')&&!location.search.includes('type=recovery'))location.replace('painel.html');
 $('login-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{const {error}=await supabase.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;location.assign('painel.html')})});
 $('recover-link').addEventListener('click',()=>section('recover-form'));
 document.querySelector('[data-return]').addEventListener('click',()=>section('login-form'));
 $('recover-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{const url=new URL('login.html',location.href).href;const {error}=await supabase.auth.resetPasswordForEmail($('recover-email').value.trim(),{redirectTo:url});if(error)throw error;msg('Se o e-mail estiver cadastrado, você receberá as instruções para recuperar sua conta.',true)})});
 $('new-password-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{const pass=$('new-password').value;if(pass.length<12)throw Error('Use pelo menos 12 caracteres.');const {error}=await supabase.auth.updateUser({password:pass});if(error)throw error;msg('Senha atualizada. Redirecionando…',true);location.replace('painel.html')})});
}
