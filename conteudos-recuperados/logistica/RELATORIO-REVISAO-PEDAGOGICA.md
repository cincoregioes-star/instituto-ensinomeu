# Relatório de revisão pedagógica — Gabarito Logística

**Referência:** 11/11/2026  
**Escopo:** 12 trilhas, 1.200 questões, cinco módulos de 20 por trilha.  
**Situação:** revisão pedagógica **em andamento**, não homologada integralmente.

## 1. Base preservada e cobertura

| Medida | Total |
|---|---:|
| Questões originais preservadas | 120 |
| Questões complementares publicadas | 1.080 |
| Questões disponíveis no portal | **1.200** |
| Questões com revisão pedagógica contextual rastreada | **84** |
| Questões que ainda exigem revisão pedagógica individual | **1.116** |
| Trilhas com pelo menos duas questões revisadas | **12 de 12** |

A auditoria automatizada de estrutura verifica presença de quatro alternativas, gabarito válido, comentário de resposta e ausência de enunciados idênticos na mesma trilha. **Isso não comprova correção semântica, equivalência de dificuldade ou validade de avaliação.**

## 2. Problemas pedagógicos identificados

**Alternativas fora do contexto:** na geração inicial, várias alternativas incorretas foram reaproveitadas de situações de outros assuntos. Isso pode tornar a resposta evidente por associação de palavras, sem exigir domínio técnico.

**Reaproveitamento de cenários:** a expansão da maioria das trilhas partiu de 30 situações profissionais, apresentadas por perspectivas diferentes — tomada de decisão, evidência de controle e prevenção de falha. Trata-se de 90 perguntas distintas por trilha, mas não de 90 cenários independentes.

**Indício automático de resposta óbvia:** numa triagem exploratória das 1.080 questões adicionais, a alternativa correta apresentou maior sobreposição lexical com o enunciado em 907 casos; em 115 houve diferença elevada de sobreposição em relação às demais. **Essa medida é apenas uma heurística de priorização, não significa que esses itens estejam incorretos.** A revisão humana deve avaliar o raciocínio exigido.

**Cautela nas áreas de segurança:** os exercícios de EHS e equipamentos são material de estudo, não certificação de segurança nem substituição de treinamento, autorização, manual do fabricante ou procedimento local.

## 3. Correções efetivamente publicadas até agora

**Primeiro lote:** 24 perguntas adicionais, duas por trilha. **Segundo lote:** outras **32 perguntas identificadas como prioritárias**, distribuídas em Segurança EHS (12), Movimentação (7) e Excel Administrativo (13). Foram examinadas as situações e substituídas alternativas desconexas por opções ligadas ao cenário, com explicações específicas sobre a resposta. **Terceiro lote:** 28 questões prioritárias corrigidas em Inventário (8), Liderança (5), Recebimento (7) e Estoque (8), com alternativas do mesmo contexto e justificativas individualizadas. Ao todo, **84 questões revisadas individualmente**. Os enunciados e a alternativa correta foram preservados nesses itens, bem como as dez questões originais de cada trilha.

Os arquivos de dados registram essas intervenções com:
`revisao: "pedagogica-contextual-2026-11-11"` e um campo de critério. O teste `tests/auditoria-pedagogica-logistica.mjs` valida a cobertura e assegura que não sejam confundidas com revisões ainda pendentes.

| Trilha | Questões totais | Revisadas acumuladas | Pendentes |
|---|---:|---:|---:|
| Estoque | 100 | 10 | 90 |
| Recebimento | 100 | 9 | 91 |
| Picking | 100 | 2 | 98 |
| Operação de CD | 100 | 2 | 98 |
| Liderança | 100 | 7 | 93 |
| Excel Administrativo | 100 | 15 | 85 |
| Movimentação | 100 | 9 | 91 |
| Last Mile | 100 | 2 | 98 |
| Segurança EHS | 100 | 14 | 86 |
| Inventário | 100 | 10 | 90 |
| Expedição | 100 | 2 | 98 |
| Packing | 100 | 2 | 98 |
| **Total** | **1.200** | **84** | **1.116** |

## 4. Critérios para os próximos lotes

1. Examinar a **adequação conceitual** da resposta correta e a clareza do enunciado.
2. Substituir alternativas de outros assuntos por alternativas **plausíveis no mesmo cenário**, cada uma com motivo de incorreção.
3. Corrigir explicações que apenas repetem o gabarito, acrescentando o *porquê* da decisão.
4. Reduzir pistas lexicais e evitar questões essencialmente idênticas na mesma trilha.
5. Verificar datas, cálculos, unidades, fórmulas e normas aplicáveis quando um item depender delas.
6. Registrar somente questões efetivamente examinadas com marca de revisão e validar o simulador após cada publicação.

**Ordem prioritária:** Segurança EHS, Movimentação, Excel, Inventário, demais trilhas; começar pelos itens com pistas lexicais excessivas e avaliações de maior risco. Nenhuma pendência deve ser considerada concluída apenas por ter passado no teste técnico.

## 5. Fila de revisão priorizada

Foi criada a lista `PENDENCIAS-PEDAGOGICAS-PRIORITARIAS.json`, contendo **120 itens inicialmente sinalizados** por indício de pista lexical (diferença de similaridade de pelo menos 0,18 entre a resposta indicada e as outras alternativas). **Destes, 60 já receberam revisão individual e 60 permanecem na fila prioritária.** A lista inclui identificação da trilha, posição da questão, enunciado, resposta atual e prioridade. A marcação é **triagem**, não um diagnóstico definitivo de resposta incorreta.

**Acompanhamento:** a lista mantém o histórico das 120 sinalizações e indica o status de cada uma. O teste automático deve conferir se as revisões indicadas realmente existem nos bancos. Novas revisões deverão atualizar os bancos de questões, o marcador de revisão no próprio item, a cobertura do teste automatizado e este relatório, sem declarar como revisadas as questões apenas verificadas por algoritmo.
