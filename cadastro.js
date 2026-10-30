import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';

const config = window.ENSINOMEU_CONFIG || {};
const form = document.getElementById('signup');
const button = document.getElementById('signup-btn');
const output = document.getElementById('message');
const field = id => document.getElementById(id);
const okConfig = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl || '') &&
  /^sb_publishable_[a-zA-Z0-9_.-]+$/.test(config.supabasePublishableKey || '');
const client = okConfig ? createClient(config.supabaseUrl, config.supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

function status(message, good = false) {
  output.textContent = message;
  output.style.color = good ? '#08624d' : '#933b30';
}
if (!client) {
  button.disabled = true;
  status('Cadastro temporariamente indisponível. Entre em contato com a administração.');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!client || button.disabled) return;
  const name = field('name').value.trim();
  const email = field('email').value.trim().toLowerCase();
  const grade = field('grade').value;
  const kind = field('kind').value;
  const password = field('password').value;
  if (name.length < 3 || name.length > 100) return status('Informe um nome completo válido.');
  if (!/^((fi-[1-5])|(fii-[6-9])|(em-[1-3]))$/.test(grade)) return status('Escolha uma série válida.');
  if (!['adult_student','guardian'].includes(kind)) return status('Escolha o perfil de interesse.');
  if (password.length < 12 || password !== field('confirm').value) return status('A senha deve ter pelo menos 12 caracteres e coincidir com a confirmação.');
  if (!field('adult').checked || !field('privacy').checked) return status('Confirme os termos e a declaração de maioridade.');

  button.disabled = true;
  status('Registrando sua solicitação…', true);
  try {
    const returnTo = new URL('login.html', window.location.href).href;
    const { error } = await client.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: returnTo,
        data: {
          full_name: name,
          requested_grade: grade,
          requested_kind: kind,
          signup_source: 'public_guarded_signup'
        }
      }
    });
    if (error) throw error;
    await client.auth.signOut();
    form.reset();
    status('Solicitação enviada. Verifique seu e-mail. Sua conta não libera planos ou provas automaticamente; a administração precisa autorizar o acesso.', true);
  } catch (error) {
    status(error?.message || 'Não foi possível concluir o cadastro.');
  } finally {
    button.disabled = false;
  }
});
