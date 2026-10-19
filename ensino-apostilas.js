import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const C=window.ENSINOMEU_CONFIG||{};const $=id=>document.getElementById(id);
const sb=createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const api=C.supabaseUrl+'/functions/v1/ensino-api';
let manifest=null,zip=null,remote=new Map(),busy=false;
function status(msg,error=false){$('status').textContent=msg;$('status').classList.toggle('error',error)}
async function request(path,data){
 const r=await sb.auth.getSession();const token=r.data?.session?.access_token;if(!token)throw Error('Sessão expirada. Entre novamente.');
 const response=await fetch(api+path,{method:data?'POST':'GET',headers:{'Authorization':'Bearer '+token,'apikey':C.supabasePublishableKey,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 const json=await response.json().catch(()=>({detail:'Resposta do servidor inválida'}));
 if(!response.ok)throw Error(json.detail||'Acesso à API indisponível');
 return json;
}
function refreshCounts(){const count=remote.size;$('uploaded').textContent=count;$('remaining').textContent=Math.max(0,309-count);$('bar').style.width=(100*count/309).toFixed(2)+'%';$('progress').setAttribute('aria-valuenow',String(count))}
async function loadStatus(){
 const r=await request('/admin/apostilas/status');
 remote=new Map(r.materiais.map(x=>[x.storage_path,x]));
 refreshCounts();status('Catálogo privado: '+r.total+' de 309 apostilas registradas.');
}
function expected(path){return /^(fi-[1-5]|fii-[6-9]|em-[1-3])\/(?:fi-[1-5]|fii-[6-9]|em-[1-3])-[a-z0-9-]+\/T[123]\.pdf$/.test(path)}
function hex(arr){return [...new Uint8Array(arr)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function inspect(f){
 if(!window.JSZip)throw Error('Biblioteca ZIP indisponível. Recarregue a página.');
 const archive=await JSZip.loadAsync(f,{checkCRC32:true});
 const mf=archive.file('manifest.json');if(!mf)throw Error('manifest.json ausente no ZIP');
 const m=JSON.parse(await mf.async('string'));
 if(m.schema_version!==1||m.pdf_count!==309||!Array.isArray(m.files)||m.files.length!==309||m.questions_included!==false)throw Error('Pacote inválido: são esperadas 309 apostilas sem simulados.');
 let names=new Set();
 for(const item of m.files){
  if(!item.path.startsWith('apostilas/')||!expected(item.path.slice(10))||!archive.file(item.path))throw Error('Arquivo do manifesto ausente ou inválido: '+item.path);
  if(names.has(item.path))throw Error('Arquivo repetido no ZIP');names.add(item.path);
  if(!Number.isInteger(item.term)||!Number.isInteger(item.pages)||!Number.isInteger(item.size)||!(/^[0-9a-f]{64}$/.test(item.sha256)))throw Error('Metadados inválidos');
  if(item.size<100||item.size>6291456||item.pages<1||item.pages>1000)throw Error('Tamanho ou número de páginas inválido');
  if(item.path!=='apostilas/'+item.path.slice(10,).split('/')[0]+'/'+item.subject_id+'/T'+item.term+'.pdf')throw Error('Caminho e disciplina incompatíveis');
  const entry=archive.file(item.path);if(entry._data.uncompressedSize!==item.size)throw Error('Tamanho divergente: '+item.path);
 }
 if(Object.values(archive.files).filter(x=>!x.dir&&x.name.endsWith('.pdf')).length!==309)throw Error('O pacote contém PDFs inesperados.');
 zip=archive;manifest=m;
 const sum=m.files.reduce((a,x)=>a+x.pages,0);if(sum!==15141)throw Error('Quantidade de páginas divergente.');
 status('Pacote validado: 309 PDFs, 15.141 páginas. Clique em Iniciar importação.');
 $('start').disabled=false;
}
async function uploadOne(item){
 const key=item.path.slice('apostilas/'.length),existing=remote.get(key);
 if(existing?.source_sha256===item.sha256&&Number(existing.source_size_bytes)===item.size)return false;
 const bytes=await zip.file(item.path).async('uint8array');
 if(bytes.length!==item.size||bytes[0]!==37||bytes[1]!==80||bytes[2]!==68||bytes[3]!==70)throw Error('PDF inválido: '+item.path);
 const digest=hex(await crypto.subtle.digest('SHA-256',bytes));
 if(digest!==item.sha256)throw Error('SHA-256 divergente: '+item.path);
 const info={subject_id:item.subject_id,term:item.term,pages:item.pages,size:item.size,sha256:item.sha256};
 const signed=await request('/admin/apostilas/assinar',{arquivos:[info]});
 const authorization=signed.assinaturas?.[0];
 if(!authorization||authorization.path!==key||!authorization.token)throw Error('Assinatura inválida');
 const {error}=await sb.storage.from('ensinomeu-apostilas').uploadToSignedUrl(key,authorization.token,new Blob([bytes],{type:'application/pdf'}),{contentType:'application/pdf',upsert:true});
 if(error)throw Error('Não foi possível enviar: '+item.path+' — '+error.message);
 const verified=await request('/admin/apostilas/confirmar',{arquivos:[info]});
 if(verified.confirmados!==1)throw Error('Servidor não confirmou o arquivo: '+item.path);
 remote.set(key,{storage_path:key,source_sha256:item.sha256,source_size_bytes:item.size});
 refreshCounts();
 return true;
}
async function run(){
 if(busy||!manifest||!zip)return;
 if(!window.confirm('Enviar até 309 apostilas ao armazenamento PRIVADO do EnsinoMeu? A operação não importa simulados e pode demorar alguns minutos.'))return;
 busy=true;$('start').disabled=true;$('file').disabled=true;$('refresh').disabled=true;
 let done=0,skipped=0;
 try{
  for(let i=0;i<manifest.files.length;i++){
   const item=manifest.files[i];
   status('Processando '+(i+1)+'/309: '+item.subject_id+' • trimestre '+item.term+'\nEnviadas nesta sessão: '+done+' | Já registradas: '+skipped);
   const result=await uploadOne(item);if(result)done++;else skipped++;
  }
  status('Importação finalizada. Enviadas: '+done+' • Já existentes: '+skipped+'. Verifique os conteúdos no painel dos estudantes.');
 }catch(e){status('Importação interrompida: '+e.message+'\nVocê pode selecionar o mesmo pacote e continuar. Enviadas nesta sessão: '+done,true)}
 finally{busy=false;$('file').disabled=false;$('refresh').disabled=false;$('start').disabled=false}
}
$('file').addEventListener('change',async e=>{
 $('start').disabled=true;manifest=null;zip=null;
 const file=e.target.files?.[0];if(!file)return;
 try{status('Validando estrutura do ZIP…');await inspect(file)}catch(err){status(err.message,true)}
});
$('start').addEventListener('click',run);
$('refresh').addEventListener('click',()=>loadStatus().catch(err=>status(err.message,true)));
(async()=>{try{
 const me=await request('/me');if(me.perfil!=='admin')throw Error('Acesso exclusivo para administradores.');
 $('file').disabled=false;$('refresh').disabled=false;await loadStatus();
 }catch(e){status(e.message,true)}
})();
