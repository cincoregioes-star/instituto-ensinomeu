# Instituto EnsinoMeu

Plataforma brasileira de **educação complementar**, organizada por ano/série e referenciada na **BNCC**. Não substitui o ensino regular, e a classificação pedagógica ainda está sujeita à revisão docente.

## Implantação nacional

Este repositório **público** será utilizado apenas para a **vitrine institucional e conteúdo expressamente público** do Instituto EnsinoMeu. A aplicação interna (autenticação, correção de simulados e acesso ao acervo) usa serviços protegidos do Supabase.

**ATENÇÃO:** este repositório NÃO contém o código completo da plataforma. A versão de implantação é a V7.40, com acervo local privado. A publicação da vitrine e os testes online ainda devem ser concluídos.

- Modelo comercial: **1 série = 1 plano = todas as disciplinas + 3 trimestres**.
- 12 planos: 1º ao 9º ano do Ensino Fundamental e 1ª à 3ª série do Ensino Médio.
- Plano Família: histórico individual e vínculos com responsáveis verificados.
- Identidade visual: azul-marinho, verde-escuro, dourado e branco.

### Política de publicação

Nunca publicar aqui:
- Diretórios `private/`, `server/` e `ferramentas/` da distribuição privada.
- Bancos SQLite/PostgreSQL exportados, dados pessoais, logs ou senhas.
- Apostilas privadas integrais, bancos de questões e gabaritos.
- Arquivos `.env`, chaves `service_role` ou `sb_secret_...`.
- Credenciais das cinco contas de teste.

A configuração do site pode incluir a **chave publicável** do Supabase, mas jamais uma chave administrativa. O controle real de acesso reside na autenticação do Supabase, em RLS e nos endpoints de servidor.

Para o código-fonte interno, usar outro repositório **privado**, separado deste site público.

## Estado atual

O projeto Supabase `instituto-ensinomeu` já existe. A publicação completa ainda depende da configuração da área do aluno, criação/verificação de usuários e importação protegida dos materiais. Nenhum pagamento foi ativado.

> Instituto EnsinoMeu — educação complementar para todo o Brasil.
