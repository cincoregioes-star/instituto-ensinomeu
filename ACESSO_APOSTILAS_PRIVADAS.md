# Instituto EnsinoMeu — leitura técnica das apostilas privadas

**Criado e verificado em 07/11/2026.** Esta integração permite que a equipe de produção de videoaulas consulte o **texto real das apostilas** pelo conector Supabase, sem publicar os PDFs e sem solicitar upload manual do estudante/administrador.

## Onde estão os PDFs originais
- Supabase: projeto `instituto-ensinomeu`.
- Bucket: `ensinomeu-apostilas` (**privado**, não alterar).
- Catálogo: `public.material_catalog`, incluindo `storage_path`, `source_sha256`, disciplina e trimestre.
- Trilhas das aulas: `public.lesson_catalog` (`pdf_page`, `lesson_number` e `title`).

## Leitura segura pelo conector Supabase (equipe técnica)
As páginas extraídas ficam em `public.ensinomeu_apostila_text_pages`, com colunas `storage_path`, `page_number` e `content`. Metadados de processamento ficam em `public.ensinomeu_apostila_text_sources`.

**Segurança:** tabelas com RLS habilitada, permissões de `anon` e `authenticated` revogadas, sem políticas públicas. Consultar apenas com ferramenta SQL administrativa autorizada; não expor esse conteúdo ao player público, às páginas do site ou ao navegador dos alunos.

Para consultar a Aula 01 de Educação Física do 9º ano, 1º trimestre, a partir da página 5:

```sql
select page_number, content
from public.ensinomeu_apostila_text_pages
where storage_path = 'fii-9/fii-9-educacao-fisica/T1.pdf'
  and page_number between 5 and 8
order by page_number;
```

Para consultar outro PDF ainda não extraído, use o **procedimento privado** `ensinomeu_internal.queue_apostila_text(text)` via SQL administrativo. Por exemplo:

```sql
select ensinomeu_internal.queue_apostila_text('fii-9/fii-9-ciencias/T2.pdf') as request_id;
```

Essa operação envia um pedido interno com token aleatório de uso único, validade de 10 minutos, para a Edge Function `ensino-apostila-extract`. A função baixa o PDF privadamente, extrai as páginas e as grava nas tabelas protegidas. Ela **não devolve PDFs nem textos na resposta HTTP**. Um PDF já processado e sem mudança de SHA não é reprocessado desnecessariamente (`request_id` nulo).

Após a solicitação, confira:

```sql
select storage_path, status, error_message, completed_at
from public.ensinomeu_apostila_extract_jobs
order by created_at desc
limit 10;
```

Quando `status='completed'`, consultar o texto da apostila usando `page_number`. Se houver falha ou PDF escaneado, **não inventar o conteúdo**.

## Verificação de 07/11/2026
- Foram extraídas **8 apostilas** do 9º ano, 1º trimestre, em **49 páginas cada** (392 páginas no total), todas com `status='completed'`.
- Disciplinas: Arte, Ciências, Educação Física, Geografia, História, Língua Inglesa, Língua Portuguesa e Matemática.
- Educação Física: 49 páginas e 63.469 caracteres; a Aula 01 realmente aborda **“Esportes de invasão e objetivos”**, nas páginas 5 a 8.
- Demais séries e trimestres: permanecem no bucket privado, com extração **sob demanda**, sem custos e processamento desnecessário de todas as 309 apostilas.
- Este acesso **não muda** os arquivos PDF, o conteúdo público do site, as matrículas, os simulados, os históricos e os vídeos existentes.

## Regra editorial indispensável
Antes de produzir cada nova videoaula, consultar `lesson_catalog` e os textos das páginas correspondentes à aula no PDF. Conferir a BNCC. Não produzir roteiro apenas pelo nome da disciplina. O conteúdo de cada aula ocupa páginas próprias: no 9º ano/1º trimestre, a Aula 01 começa na página 5 e a Aula 02 na 9. Não misturar conteúdos de aulas diferentes. A conferência integral de vídeo versus apostila continua sendo uma auditoria pedagógica separada.

**Não copiar senhas, chaves privadas, tokens, documentos originais ou dados pessoais para este repositório público.**
