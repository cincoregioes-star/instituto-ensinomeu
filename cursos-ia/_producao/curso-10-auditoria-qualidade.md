# Curso 10 — Auditoria editorial de qualidade (13/11/2026)

> **Registro histórico de rejeição da primeira versão.** Em 13/11/2026,
> foi publicada uma edição reescrita em cursos-ia/10-planos-de-aula-com-ia/.
> A edição pública contém 30 lições, PDF A4 de 46 páginas, 60 itens inéditos
> com 15 gabaritos por letra e seis missões. Verificações: PDF, HTTP 200,
> navegação e ciclo de 60 respostas com pontuação 60/60 em navegador real.
> As ressalvas a seguir descrevem a versão rejeitada, não a versão pública.

**Status: NÃO PUBLICAR até refazer e validar.** A pasta pública `cursos-ia/10-planos-de-aula-com-ia/index.html` não existia na consulta ao GitHub desta execução. O curso 09 existe.

## Inspeção dos artefatos locais anteriores
- PDF: 45 páginas (meta aproximada 46), mas 30 páginas de lições reutilizam literalmente o bloco “Método em cinco passos”, com substituição superficial do título. Reescrever com conteúdo pedagógico próprio por lição, exemplos reais, comandos específicos e fontes verificadas.
- Banco JSON: 60 perguntas, 15 gabaritos por letra. Apesar de 60 enunciados textualmente distintos, apenas **31 conjuntos de alternativas diferentes** para 60 perguntas; pares consecutivos repetem opções quase idênticas e respostas óbvias. Reprovar.
- Não há comprovação nesta execução de teste real de responsividade, acessibilidade ou fluxo completo do simulado.

## Critérios de liberação
1. Cada uma das 30 lições deve conter objetivo mensurável, exemplo contextualizado único, orientação específica, limites e tarefa prática, sem parágrafos genéricos repetidos.
2. Produzir 60 situações-problema realmente diferentes; alternativas plausíveis com comprimento semelhante, sem pistas de resposta, comentários que expliquem por que as outras opções falham; 15 respostas por letra.
3. Revisar referências à BNCC no texto oficial, sem inventar códigos, e LGPD sem afirmar obrigações inexistentes.
4. Testar HTML em largura 360, 768 e 1366px, navegação por teclado, leitor de tela básico, pontuação, reinício, todas as 60 perguntas, ausência de rolagem interna e sem narração.
5. Verificar PDF por renderização visual de capa, miolo e páginas finais, sumário, acentuação e ausência de cortes.
6. Publicar somente depois de auditar; validar GitHub Pages HTTP 200; só então integrar catálogo e homepage e seguir para o curso 11.

**Observação:** a contagem anterior de 9 cursos publicados é histórica e precisa ser reconfirmada no catálogo. Não declarar o Curso 10 publicado.
