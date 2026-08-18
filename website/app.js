const SUPABASE_URL='https://rcjexjhziwcynsjmcdap.supabase.co';
const SUPABASE_KEY='sb_publishable_OglouaI2szEvKmNvK3HEUQ_IOuHv-V-';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const $=s=>document.querySelector(s);
const message=$('#message');

$('#login-form')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const email=$('#email').value.trim(),password=$('#password').value;
 message.textContent='Entrando...';
 const {error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error){message.textContent=error.message;return;}
 message.textContent='Login realizado. Redirecionando...';
 setTimeout(()=>location.href='painel.html',500);
});

$('#register-link')?.addEventListener('click',async e=>{
 e.preventDefault();
 const email=prompt('Digite seu e-mail para criar a conta:');
 if(!email)return;
 const password=prompt('Crie uma senha com pelo menos 6 caracteres:');
 if(!password)return;
 const {error}=await supabaseClient.auth.signUp({email,password});
 message.textContent=error?error.message:'Conta criada. Verifique seu e-mail para confirmar o cadastro.';
});

$('#forgot-link')?.addEventListener('click',async e=>{
 e.preventDefault();
 const email=prompt('Digite o e-mail da sua conta:');
 if(!email)return;
 const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'#login'});
 message.textContent=error?error.message:'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.';
});

$('#ticket-form')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget,out=$('#ticket-message');
 const {data:{user}}=await supabaseClient.auth.getUser();
 if(!user){out.textContent='Faça login antes de abrir um ticket.';location.hash='login';return;}
 const fd=new FormData(form);
 out.textContent='Abrindo atendimento...';
 const {data:ticket,error}=await supabaseClient.from('support_tickets').insert({user_id:user.id,category:fd.get('category'),subject:fd.get('subject')}).select().single();
 if(error){out.textContent=error.message;return;}
 const {error:messageError}=await supabaseClient.from('support_ticket_messages').insert({ticket_id:ticket.id,user_id:user.id,body:fd.get('body')});
 if(messageError){out.textContent=messageError.message;return;}
 form.reset();out.textContent=`Ticket #${ticket.id} aberto com sucesso.`;
});

async function loadLauncher(){
 const {data,error}=await supabaseClient.from('portal_launcher_versions').select('version,apk_url').eq('published',true).order('published_at',{ascending:false}).limit(1).maybeSingle();
 const version=$('#launcher-version'),link=$('#download-apk');
 if(error||!data){version.textContent='Download oficial em preparação.';link.classList.add('disabled');return;}
 version.textContent=`Versão ${data.version}`;link.href=data.apk_url;link.target='_blank';
}
loadLauncher();
