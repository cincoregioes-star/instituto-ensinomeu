# Instituto EnsinoMeu — ambiente público e área de estudos

Plataforma de educação complementar referenciada na BNCC, com 12 anos/séries, exercícios, trilhas e videoaulas.

## Navegação simplificada (04/11/2026)

- `index.html`: página inicial com navegação reduzida a Aulas gratuitas, Séries, Planos e Entrar.
- `login.html` e `ensino-auth.js`: interface de nome de usuário e senha. A convenção técnica interna é `<usuario>@login.ensinomeu.invalid`; o formulário ainda aceita o e-mail antigo durante a transição.
- `painel.html`: área de estudos simplificada, com a série do aluno e os trimestres organizados.
- `cadastro.html`: cadastro público temporariamente encerrado até a gestão de contas estar configurada.
- Videoaulas públicas: Geografia, História, Português e Matemática do 9º ano.

## Status real da migração de contas

**Ainda pendente:** criar no Supabase as duas novas contas de gestão e 16 alunos de teste (duas por série, de 5º ano do Fundamental à 3ª série do Ensino Médio), validá-las e então bloquear/revogar os cinco logins antigos. Não informar que as novas contas funcionam antes da confirmação com o backend. A conexão atual não autorizou a operação de criação das identidades.

**Importante:** as telas novas não substituem a criação real das contas no Supabase Auth. Não colocar senhas nos arquivos públicos.

## Política de segurança e conteúdo

Este repositório é **público** e não recebe senhas, hashes, tokens administrativos, banco de dados, dados pessoais de alunos, PDFs privados ou gabaritos. A autenticação e o controle de matrículas reais dependem do Supabase Auth, dos perfis ativos e da API protegida.

Materiais e testes ainda estão sujeitos à revisão pedagógica. As aulas abertas não exigem login; a área interna só deve aceitar perfis autorizados.

A configuração pública em `config.js` contém somente uma chave publicável, nunca a `service_role`.

## Estrutura

- Vitrine: `index.html`, `planos.html`, `matematica-9ano.html` e outras páginas de aula.
- Autenticação: `login.html`, `ensino-auth.js`, `config.js`.
- Área do aluno: `painel.html`, `ensino-painel.js`.
- Administração: `admin.html`, `ensino-admin.js`.
- API: Supabase Edge Function `ensino-api` com verificação JWT.
