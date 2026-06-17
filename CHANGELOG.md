# CHANGELOG

Registro cronológico das atividades feitas no sistema, em linguagem do dono
(efeito prático, não nome de arquivo).

---

## 2026-06-17 — Sistema de licença (em andamento, branch `feat/licenca-v1`)

- ✅ **Servidor de licença pronto e testado (a "central" das chaves).**
  Construí o servidorzinho (Cloudflare Worker + banco) que vai controlar as licenças.
  Em linguagem simples: é ele quem **cria as chaves**, **confere** quando o cliente ativa,
  **prende a licença a um computador**, e permite **revogar** (desligar) uma licença. Cada
  chave de licença é única e tem um "dígito verificador" (pega erro de digitação). Quando o
  cliente ativa, o servidor devolve um **"passaporte" assinado** que o programa guarda — e que
  só ele consegue criar (a chave secreta de assinatura **nunca** sai do servidor). Já testei
  os casos importantes: ativar num PC funciona; **a mesma chave em outro PC é recusada**;
  **revogar faz travar**; chave digitada errada é barrada; e tentativa repetida (replay) é
  bloqueada. Nada disso apaga dados de ninguém. Falta ligar no programa do cliente e no painel,
  e subir na sua conta Cloudflare. (Detalhes: `ARQUITETURA_LICENCA.md`, `PLANO_DE_EXECUCAO.md`.)

- ✅ **Redesenho visual completo — agora tem cara de PROGRAMA, não de site.**
  Troca só de "pele": **nenhuma função, cálculo, dado, preço, margem,
  snapshot ou regra mudou**. Os mesmos botões, telas, filtros, relatórios,
  versionamento e Configurações continuam exatamente no lugar, com os
  mesmos textos em português — só a aparência ficou sóbria, reta e densa,
  no estilo de software técnico do setor elétrico/industrial. O que mudou
  na aparência:

  - **Cores mais sérias e dessaturadas.** O azul vibrante virou um **azul
    corporativo acinzentado** (usado só em ação principal e foco). Verde
    (aprovado/sucesso), vermelho (reprovado/erro/PDF) e âmbar (pendente/
    aviso) ficaram **discretos** — cor só aparece quando carrega informação
    (status, alerta, ação), nunca como enfeite. O cinza neutro de base foi
    mantido. Fundo geral virou um cinza plano (sem aquele tom azulado de
    site).
  - **Cantos retos.** Acabaram os cantos bem arredondados e as "pílulas":
    tudo agora tem cantos retos (2px). Etiquetas de status viraram
    retângulos sóbrios.
  - **Sem sombras flutuantes.** Os "cartões" não flutuam mais com sombra —
    a separação entre painéis, tabelas e seções é feita por **linha fina de
    1px** (o "grid" visível faz parte da estética de programa).
  - **Sem animações.** Removidos os efeitos de transição, fade e os
    "hovers" que mexiam/cresciam. Toda mudança de estado agora é
    **instantânea** (só o contorno de foco de teclado permanece, por
    acessibilidade).
  - **Números alinhados.** O sistema inteiro passou a usar **algarismos
    tabulares**, então os valores em R$ batem coluna a coluna nas tabelas
    de orçamento. As colunas de dinheiro continuam alinhadas à direita.
  - **Tela inicial.** Os cartões de categoria perderam as **faixas e
    selos coloridos com degradê** (proibidos na nova direção) e viraram
    cartões brancos planos com borda e um selo de tensão discreto.

  **Como foi feito (técnico):** a troca é **centralizada num único lugar**
  — o arquivo de estilo central (`app/src/index.css`) redefine a paleta,
  os cantos, as sombras e desliga as animações de uma vez. Como as telas já
  usavam classes utilitárias (Tailwind), **todas herdaram o novo visual
  automaticamente**, sem reescrever tela a tela — o que garante coerência
  (nenhuma tela destoa) e risco mínimo. Só dois componentes tiveram ajuste
  pontual (a tela inicial, para remover os degradês, e um cartão de seleção
  de estrutura). **167 testes verdes, build verde, sem erros de tipo.**

  Feito no branch **`redesign-visual`** (para reverter: voltar ao branch
  anterior). Nenhum arquivo de lógica/dados/gerador foi tocado.

## 2026-06-13

- ✅ **Auto-reprocessar rascunhos + ranking de Relatórios mais limpo.** Dois
  ajustes pedidos pelo dono na sequência do botão "Reprocessar":

  **1) Ranking de "Materiais que mais aparecem como pendência" em
  Relatórios** agora **EXCLUI materiais que já têm preço cadastrado
  hoje** (e fator de conversão OK quando necessário). Antes, depois de
  cadastrar preço, o material continuava no topo do ranking porque os
  snapshots dos orçamentos antigos ainda o listavam como pendente —
  ruidoso e inútil. Agora a lista mostra só o que de fato continua sem
  solução.

  **2) Auto-reprocessar RASCUNHOS** quando preços novos são salvos.
  Antes: você cadastrava preços, salvava, e tinha que ir em cada
  orçamento rascunho clicar "Reprocessar". Agora: ao clicar "Salvar
  todos" na aba Preços, **todos os orçamentos com status rascunho** que
  tenham pendentes agora resolvíveis são reprocessados em silêncio.
  Atualiza in-place, entrada no histórico com prefixo "(auto)" para
  diferenciar do reprocesso manual.

  **Orçamentos com status enviado / aprovado / recusado / expirado
  continuam exigindo o botão manual** (preserva auditoria — evita
  criar dezenas de versões silenciosas durante um cadastro em massa
  de preços).

  165 testes verdes. Build verde. Lint sem erros novos.

- ✅ **Botão "♻ Reprocessar com preços novos" no Detalhe.** Antes: depois de
  cadastrar os preços dos pendentes, o orçamento salvo continuava mostrando
  os pendentes e o total parcial (snapshot imutável). **Agora**: dentro do
  painel "Pendentes (N)" do Detalhe, quando há pendentes que já têm preço
  cadastrado, aparece uma **barra verde** explicando "X pendentes já têm
  preço cadastrado. Pode reprocessar para somar no total." + botão
  **♻ Reprocessar com preços novos**.

  Comportamento ao clicar:
  - **Se rascunho**: atualiza in-place — pendentes viram itens, total
    recalculado, entrada no histórico "Reprocessado: X itens
    incorporados".
  - **Se enviado/aprovado/recusado/expirado**: cria **nova versão** (v+1,
    rascunho) já reprocessada. A versão atual fica intacta — mesmo padrão
    do botão "Editar".
  - Pendentes que ainda não têm preço (ou que têm preço sem fator de
    conversão necessário) **continuam pendentes** — nada é forçado.

  Em modo edição o botão é escondido (pra não conflitar com as outras
  edições em curso). Helper puro `reprocessar_orcamento_com_precos_atualizados`
  em `lib/orcamento/reprocessamento.ts` com 6 testes (RP1–RP6). Total
  passou de 159 para 165 testes verdes. Build verde. Lint sem erros novos.

- ✅ **Cliente vinculável já nos "Dados da obra" (Lista de Obra).** Antes
  o cliente só podia ser vinculado em 2 lugares: na edição do orçamento já
  salvo OU no modal de proprietário na hora de exportar. Agora aparece um
  campo **Cliente** logo no topo dos "Dados da obra" (aba Lista de Obra),
  com select do cadastro + busca + botão **"+ Novo"** (abre o ClienteForm
  modal sem sair da tela). Mostra cartão azul com nome/documento/telefone
  do cliente escolhido para confirmação visual.

  - Ao escolher: **auto-preenche endereço/município SÓ se estiverem
    vazios** (sugere, não sobrescreve — você pode digitar diferente
    depois, ex.: obra com endereço próprio).
  - Ao **Salvar orçamento**: cliente já vai vinculado automaticamente,
    sem precisar abrir e editar depois.
  - Ao **exportar PDF/Excel** com cliente vinculado: vai direto, sem
    abrir o modal de proprietário (continua abrindo se não houver
    cliente).
  - **Cliente é opcional** — se não escolher, mantém o comportamento de
    antes (modal abre na exportação).
  - Campo "Obra / Proprietário" renomeado só para **"Obra"** (proprietário
    virou o seletor separado).
  - `clearObra` agora limpa também o meta inteiro (incluindo cliente_id),
    para a próxima obra começar do zero.

  159 testes verdes. Build verde. Lint sem erros novos. Snapshots
  antigos não foram afetados (campo aditivo, opcional).

- ✅ **Bug corrigido — "Cadastrar preços pendentes" abria a aba Preços
  vazia.** Quando o engenheiro abria um orçamento salvo com pendentes,
  clicava em "Cadastrar preços pendentes (N)" e caía na aba Preços, a
  lista vinha vazia com "Nenhum material para os filtros atuais" mesmo
  havendo materiais pendentes. **Causa:** o filtro `apenas_obra` (com
  os IDs dos pendentes) era aplicado DEPOIS do filtro "usados em BOM",
  então se algum pendente não estivesse mais na lista de "usados em
  BOM" do catálogo atual (catálogo mudou desde que o orçamento foi
  salvo, ou o item era manual), ele era cortado antes. **Fix:** quando
  `apenas_obra` está definido, ele vira o universo — os outros
  filtros de universo são ignorados. Mensagem de empty state também
  melhorada: agora explica especificamente "Nenhum dos N materiais
  pendentes está no catálogo atual" em vez do genérico. Teste novo
  P11 garante a regressão. 159 testes verdes (era 158).

- ✅ **Códigos SAP dos materiais atualizados via planilha de DE-PARA.**
  Aplicado o cruzamento da planilha `cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx`
  (aba MATERIAL com 340 linhas DE-PARA + Banco_Dados como fallback fuzzy)
  contra `app/public/data/materiais.json`. **125 materiais tiveram o
  `cod_sap` atualizado** (era 172 com código, agora 219). Composição:
  - **15** pelo código exato (DE antigo → COD novo da aba MATERIAL).
  - **17** por match de descrição em alta confiança (score ≥ 0,75).
  - **93** por match de descrição em média confiança (0,55–0,75).

  **Decisão do dono:** aceitar todos altos e médios; baixos e sem
  candidato (125 materiais) ficaram intocados — não inventar. 1 caso
  ambíguo (mesmo código antigo apontando para múltiplos novos) ficou
  parado para decisão manual.

  Tudo está documentado em `auditoria/`:
  - `relatorio-2026-06-13.md` — auditoria inicial só com código exato
  - `candidatos-descricao-2026-06-13.md` — 234 materiais × top 5
    candidatos fuzzy
  - `mudancas-aplicadas-2026-06-13.md` — as 125 mudanças efetivamente
    aplicadas em 3 tabelas (origem, score, fonte, descrição da planilha
    pra conferir)
  - `materiais.novo.json` — backup do que foi aplicado
  - Scripts `_gerar.cjs`, `_gerar_fuzzy.cjs`, `_aplicar_aceites.cjs` —
    reproduzem tudo, podem rodar de novo se a planilha for atualizada

  158 testes verdes. Build verde. Nenhum código do gerador foi alterado.

- ✅ **Correção 2 concluída — proprietário do cadastro vai no PDF e Excel.**
  Antes, a exportação só mostrava o "Responsável" (texto livre da obra) e
  ignorava o cliente vinculado. Agora aparece um bloco novo
  **"PROPRIETÁRIO"** no topo do PDF e no Resumo do Excel, com:
  - Nome do cliente
  - CNPJ/CPF formatado (com o tipo: "CNPJ XX.XXX.XXX/0001-XX" ou
    "CPF XXX.XXX.XXX-XX")
  - Contato principal (primeiro contato cadastrado — nome, e-mail,
    telefone)
  - Endereço principal (primeiro endereço cadastrado — logradouro,
    nº, bairro, cidade/UF, CEP)
  - Observações (se houver)

  Os dados puxam o **CADASTRO ATUAL** do cliente (sua decisão) — se você
  editar o cliente depois, a próxima exportação reflete os novos dados.

  **Seletor de proprietário** quando exporta sem vínculo:
  - Em **Detalhe** e **Consulta**: se o orçamento não tem cliente
    vinculado, abre modal "Esse orçamento não tem proprietário. Escolha
    um cliente:" com busca + lista de radio + 3 botões (Cancelar /
    Exportar sem proprietário / Exportar com este cliente).
  - Em **Lista de Obra → Orçamento** (ao vivo, nunca tem cliente
    vinculado): sempre abre o seletor antes de exportar.

  Se você não tem clientes cadastrados, o modal explica e oferece só
  "Exportar sem proprietário" (mantém o comportamento antigo).

  Gerador original intocado. Aviso legal no PDF preservado. 158
  testes verdes. Build verde. Lint sem erros novos.

- ✅ **Correção 5 concluída — filtros acumuláveis na Consulta e Relatórios.**
  Dois pontos resolvidos:
  - **Cliente na Consulta**: o `<select>` único (1 cliente por vez) virou
    um **dropdown com lista de clientes + busca local + checkboxes**.
    Marca quantos quiser. Atalhos **"Selecionar todos"** e **"Limpar"**
    (limpar = "só os sem cliente vinculado"). Botão mostra "X clientes" /
    "Todos clientes" / "Só sem cliente" / nome (se 1 só).
  - **Status (Consulta e Relatórios)**: as pílulas (que tecnicamente já
    eram acumuláveis mas confundiam) viraram **checkboxes explícitos**
    em ambas as telas, com os mesmos atalhos **"Selecionar todos"** e
    **"Limpar"**. Visual idêntico nas duas para consistência.

  Composição: **filtros de tipos diferentes são AND** (status=X *E*
  cliente=Y), **dentro de um filtro é OR** (status=enviado *OU* aprovado).
  Comportamento previsível e padrão da indústria.

  No back: `cliente_id: string | null` virou `cliente_ids: string[] | null`
  em `FiltrosConsulta`. `[] = só os sem cliente`, `null = todos`. Teste
  CO02 expandido para cobrir multi-cliente e o caso `[]`. Total continua
  158 testes verdes. Gerador intocado. Build verde. Lint sem erros
  novos.

- ✅ **Correção 4 concluída — Relatórios: cartões "Em aberto" e "Aprovados".**
  Na aba **Relatórios**, acima dos cartões existentes (Total geral, Ticket
  médio, Conversão, Pendentes), aparecem **2 cartões de destaque** maiores
  lado a lado:
  - **Em aberto (enviado)** — soma em R$ + quantidade de orçamentos com
    status **enviado** (decisão sua: rascunho NÃO conta como em aberto).
    Visual em azul.
  - **Aprovados** — soma em R$ + quantidade de orçamentos com status
    aprovado. Visual em verde.

  Os valores respeitam os filtros de **período** e **status** já
  existentes — se filtrar por março/2026, os cartões mostram apenas as
  somas daquele mês. Se filtrar status só "Recusado", os dois cartões
  ficam zerados (correto).

  Os totais são calculados pela função pura `calcular_kpis()` em
  `relatorios.ts`, com 2 testes novos (R9 e R10) garantindo as somas.
  Total de testes subiu para 158 (era 156). Gerador intocado. Build
  verde. Lint sem erros novos.

- ✅ **Correção 3 concluída — mudar status do orçamento direto na Consulta.**
  Antes: para mudar status precisava abrir o orçamento, entrar em modo
  edição, alterar o cabeçalho, salvar. Agora: na **aba Consulta**, cada
  orçamento tem um **dropdown** de status na coluna Status — clica e
  escolhe. O dropdown vem com a cor do status atual (cinza/azul/verde/
  vermelho/âmbar). Mudou? **Já vai pro histórico** do orçamento como
  uma entrada "alterou status: X → Y", e o `salvo_em` atualiza para
  refletir a mudança. Transições **sensíveis** (Aprovado e Recusado)
  pedem **confirmação** antes de aplicar — evita clique acidental.
  Orçamentos excluídos mantêm o badge fixo (não é alterável). Falha
  de gravação dispara alerta de erro. Não altera mais nada — gerador
  intocado.

- ✅ **Correção 7 concluída — nova aba ⚙ Configurações com centralização +
  log + 2 campos novos.** Adicionado botão **⚙ Configurações** no header
  ao lado de Relatórios. A aba reúne TODOS os parâmetros globais do
  gerador em 8 abas internas:
  - **Margem** (markup ou margem %)
  - **Perda** (% por categoria + override por material — mesma UI da
    aba Preços)
  - **Mão de obra** (% sobre material ou tabela por estrutura — agora
    com a lista TOTAL de tipos de estrutura do catálogo, não só os da
    obra atual)
  - **Frete** (R$ fixo)
  - **Imposto** ⬅ **NOVO** — campo único de imposto estimado %. Aparece
    como linha "Imposto estimado (X%): R$ Y" no PDF e Excel após o
    total. **Informativo** — não altera o total final do orçamento.
  - **Empresa** ⬅ **NOVO** — Nome, CNPJ, Endereço, Telefone, E-mail e
    **upload de Logo** (PNG/JPG/SVG, limite 200KB). O logo aparece no
    canto superior do PDF. Os dados ficam no cabeçalho do PDF/Excel.
  - **Validades** (preço e orçamento em dias)
  - **Histórico** ⬅ **NOVO** — lista cronológica de toda mudança feita
    nas configurações (campo, valor antes, valor depois, quando). Limite
    1000 entradas. Botão Limpar log disponível.

  **Regra de vigência (snapshot por orçamento) já estava em pé na Etapa
  5 da feature anterior**: mudar Imposto/Margem/Empresa NÃO altera
  orçamentos antigos — eles mantêm o snapshot da configuração que tinham
  no momento de gerar. Só os próximos usam os valores novos.

  Comportamento da aba: digite/edite à vontade — nada é gravado até
  clicar em **Salvar configurações**. Banner sticky "Mudanças não
  salvas · [Descartar] [Salvar]" aparece com qualquer alteração. O
  modal contextual `ConfigOrcamentoModal` (acessível durante o fluxo
  do orçamento) continua funcionando para Perda/MO/Frete/Margem/Validades
  como atalho.

  Gerador original intocado. 156 testes verdes. Build verde. Lint sem
  erros novos.

- ✅ **Correção 6 concluída — lista de obra esvazia após salvar o orçamento.**
  Antes: depois de "Salvar orçamento", a lista de obra ficava preenchida —
  precisava limpar manualmente para começar uma nova. Agora o fluxo é:
  clica Salvar → orçamento vai pro LocalStorage → **lista de obra é
  esvaziada automaticamente** → navega pro Detalhe → mostra **banner
  verde** no topo: "✅ Orçamento salvo. A lista de obra foi esvaziada —
  pronto para começar uma nova." (banner some sozinho em 5s ou ao clicar
  ✕). Segurança: o botão **fica desabilitado** durante o save (evita
  clique duplo) e se a gravação falhar (ex.: LocalStorage cheio), a
  **lista NÃO é esvaziada** — aparece alerta de erro e tudo fica intacto.
  Nada mais foi alterado.

- ✅ **Correção 1 concluída — aba Preços agora tem botão "Salvar todos".**
  Você digita os valores (R$, unidade, fator, validade, perda %) de TODOS os
  itens livremente, **nada é gravado** até clicar em **Salvar todos** no
  topo. Cada linha alterada ganha um anel amarelo + badge "✱ pendente".
  Banner fixo "X alterações não salvas · [Descartar] [Salvar todos]"
  aparece assim que tem mudança. Sair do navegador com mudanças pendentes
  agora dispara o aviso do navegador (não perde dados). Validação:
  valor negativo bloqueia, fator obrigatório quando unidade do preço é
  diferente da unidade do BOM. Itens sem valor não viram zero — apenas
  ficam sem preço. **Esse foi o pedido específico para o fluxo "vim do
  orçamento → cadastrar só os sem valor".** Nada mais foi alterado.

- ✅ Nenhuma alteração feita no sistema — apenas leitura/plano da nova lista
  de 7 correções pedidas pelo dono (rascunho + Salvar na aba Preços, limpar
  lista após salvar, aba Configurações com vigência/snapshot, mudança de
  status inline na Consulta, "em aberto" e "aprovados" nos Relatórios,
  filtros acumuláveis, e proprietário do cadastro no PDF/Excel). Aguardando
  aprovação do plano para começar a Correção 1.

- ✅ **Etapa 9 da nova feature concluída — atalhos de gestão (extras).**
  Quatro pequenas funções pedidas, todas independentes:

  **1) Aviso visual de orçamento vencido.**
  - Na **Consulta**, badge amarelo "⚠ vencido" ao lado do número quando a
    validade já passou.
  - No **Detalhe**, o badge já existia; agora a própria data fica em amarelo
    também.
  - **Filtro novo** "⚠ Só vencidos" na barra de filtros da Consulta.

  **2) Renovar validade (botão "↻ Renovar").**
  - Botão pequeno ao lado da data de validade no cabeçalho do orçamento.
  - Modal simples: input de nova data + atalhos rápidos ("hoje +15d, +30d,
    +60d, +90d").
  - **Não cria nova versão** — só ajusta o prazo (entrada no histórico para
    auditoria). É o caso típico: orçamento aprovado que vai vencer e o
    cliente pede mais tempo.

  **3) Duplicar orçamento (botão "📋 Duplicar").**
  - Botão nas ações do Detalhe.
  - Cria cópia independente: novo id, número sufixado com " (cópia)",
    versão volta a 1, status volta a rascunho, mesmos itens e cliente.
  - Histórico inicial: 1 entrada "duplicado de NÚMERO v.X".
  - Após criar, navega direto para a cópia em modo leitura — basta
    renomear (Editar → mudar número) que está pronto.

  **4) Reverter para versão antiga (botão "↺ Reverter").**
  - Botão nas ações do Detalhe — só aparece se existirem versões
    anteriores (v1 não tem para onde voltar).
  - Modal lista todas as versões anteriores do mesmo número com data,
    valor e quantidade de itens.
  - Ao escolher, cria uma **nova versão** (v_atual+1) com o conteúdo da
    escolhida. Histórico fica com a trilha completa + entrada
    "reverteu para v.X".
  - Versões originais ficam intactas.

  Aditivo: gerador original intocado. Demais telas funcionais.

  156 testes verdes (sem testes novos — UI puro + actions simples).
  Build verde. Lint sem erros novos.

- ✅ **Etapa 8 da nova feature concluída — perfil do cliente.** Tela nova
  de **detalhe de cliente** acessível por dois caminhos:
  - Botão **"📂 Ver"** ao lado de cada cliente na lista (aba Clientes).
  - **Nome do cliente vira link clicável** no cabeçalho de qualquer
    orçamento (aba Detalhe) — atalho natural: "estou vendo este
    orçamento, quero ver outros do mesmo cliente".

  A tela mostra:
  - **Cabeçalho rico**: nome, CPF/CNPJ, contato principal, endereço
    principal, observações. Badge "excluído" se for o caso.
  - **Botões**: ✏ Editar cliente (reusa o `ClienteForm` modal),
    ✕ Excluir (com confirmação que avisa se há orçamentos vinculados),
    ou ↺ Restaurar (se já excluído).
  - **2 cards de KPI**: Total faturado (soma de todos os orçamentos
    vinculados ativos, com aviso "inclui parciais") e Quantidade de
    orçamentos vinculados.
  - **Tabela de orçamentos vinculados** ordenada por data de
    salvamento (mais recente primeiro), com número/versão, obra,
    salvo em, status colorido, valor (em amarelo se parcial) e botão
    "📂 Abrir" que leva ao Detalhe do orçamento.
  - **Listas completas de contatos e endereços** cadastrados (só
    aparecem se houver mais de 1 — caso contrário, o cabeçalho já
    cobre).

  **Cliente excluído (soft)**: perfil continua acessível em modo
  leitura. Botões de edição somem, aparece "Restaurar". Mantém a
  história visível.

  Sem testes novos (reaproveitamento puro). Nenhum arquivo do gerador
  original foi tocado.

- ✅ **Etapa 7 da nova feature concluída — sincronização cross-tab + aviso
  de conflito.** Agora se o engenheiro abre o app em **duas abas do mesmo
  navegador** e mexe em alguma coisa em uma, a outra **atualiza
  automaticamente** — sem precisar recarregar. Funciona para: lista de
  orçamentos salvos (a Consulta acompanha em tempo real), cadastro de
  clientes (o select de cliente na edição de cabeçalho ganha o novo
  cliente quando é criado em outra aba), configuração de orçamento
  (perda, mão de obra, frete, margem) e preços (já existia desde a
  Etapa 2). Funciona via `storage event` do navegador — quando uma aba
  grava no LocalStorage, todas as outras são notificadas; o app
  recarrega o estado correspondente sem intervenção do engenheiro.

  **Aviso de conflito durante edição:** se uma aba está com o orçamento
  **aberto em modo edição** e a outra aba salva mudanças no mesmo
  orçamento, a aba que está editando mostra um **banner amarelo no
  topo**: *"⚠ Este orçamento foi alterado em outra aba ou janela. Se
  você clicar Salvar mudanças, suas edições vão sobrescrever as do
  outro lugar."*. Dois botões:
  - **"↺ Recarregar"** — descarta mudanças pendentes (com confirmação
    se houver) e recarrega com os dados atualizados.
  - **"Continuar editando"** — engenheiro decidiu sobrescrever
    conscientemente; o banner some e o Salvar vai prevalecer.

  Resolve o problema clássico de **"último salva ganha em silêncio"**.
  O engenheiro sempre é avisado antes de sobrescrever trabalho de
  outro lugar. **Configuração** durante edição (modal aberto) **não
  atualiza o draft** — o engenheiro continua editando o que estava
  digitando, mudanças externas só aparecem quando reabrir o modal.

  Sem testes novos (sincronização é wiring puro entre storage event e
  actions já testadas). Nenhum arquivo do gerador original foi tocado.

- ✅ **Etapa 6 da nova feature concluída — edição do cabeçalho.** No modo
  edição, o **cabeçalho do orçamento agora é totalmente editável**.
  Substituiu o bloco somente-leitura por um formulário completo com:
  - **Cliente** (`<select>` com todos os clientes ativos cadastrados +
    botão **"+ Novo cliente"** ao lado que abre o `ClienteForm` em modal
    sem sair da edição — após salvar, o novo cliente já fica selecionado
    automaticamente);
  - **Número, Versão, Status** (5 opções coloridas);
  - **Validade do orçamento** (date picker), **Condições de pagamento**,
    **Prazo de execução**;
  - **Mão de obra manual (R$)** — campo opcional sempre disponível como
    override. Quando preenchido, força esse valor no cálculo
    (recalcula o total na hora). Vazio = usa a lógica padrão (config
    "pct_material" recalcula, "tabela" mantém o valor original do
    snapshot). Resolve o caso da MO "tabela" congelada da Etapa 5;
  - **Dados da obra separados do cliente** (fieldset: Obra,
    Responsável, Endereço, Município) — mesmo cliente pode ter obras
    diferentes;
  - **Observações** (textarea) e **Observações de imposto** (texto livre).

  **Cada mudança** em qualquer campo gera **imediatamente uma entrada no
  histórico pendente** com formato pronto: *"15:42 — Eu alterou Cliente
  de 'Empresa X' para 'Empresa Y'"*, *"alterou Validade de '2026-07-13'
  para '2026-08-13'"*, *"alterou status: Rascunho → Enviado"*. A mudança
  de **MO manual** recalcula o total em tempo real e a entrada já mostra
  o impacto.

  **Persistência:** "Salvar mudanças" aplica tudo em batch — itens,
  decomposição, meta da obra, dados do documento, cliente_id,
  observações, observações de imposto, validade — em uma única gravação
  no LocalStorage. Histórico permanente cresce com tudo que foi feito
  na sessão.

  Os 156 testes anteriores continuam verdes; a função
  `recalcular_decomposicao_de_itens` ganhou parâmetro opcional
  `mao_obra_override` (default null = comportamento antigo). Nenhum
  arquivo do gerador original foi tocado.

- ✅ **Etapa 5 da nova feature concluída — edição de itens com histórico ao
  vivo.** O botão **"✏ Editar"** na tela de Detalhe agora funciona. Ao
  clicar, dependendo do status do orçamento:
  - Se **Rascunho**: entra direto em modo edição.
  - Se **Enviado / Aprovado / Recusado / Expirado**: **cria automaticamente
    a v2 rascunho** (clona o conteúdo, registra "criou versão v2 a partir
    da v1" no histórico) e abre a v2 em modo edição. A v1 fica **intacta**.

  No modo edição:
  - **Barra amarela no topo** mostra "X mudanças não salvas" e o **total
    atual** recalculado em tempo real, com botões **"Salvar mudanças"**
    e **"Descartar"**.
  - **Tabela de itens fica editável**: cada linha tem inputs para
    quantidade e preço (em R$, com formato pt-BR aceitando vírgula ou
    ponto), botão **"✕"** para remover, e um botão **"+ Adicionar item"**
    no topo.
  - **Modal "Adicionar item"** com duas abas: **"📦 Do catálogo"** (busca
    por descrição/SAP, mostra preço cadastrado quando há, permite digitar
    quantidade) e **"✍ Item manual"** (descrição livre + unidade + qty +
    preço, para taxas/serviços/itens fora do catálogo). Item manual ganha
    `material_id` negativo único e badge "manual" na linha.
  - **Campo "Desconto global %"** na própria tela (0–99,99%), aplicado
    após a margem.
  - **Cada operação** (adicionar/remover/editar qty/editar preço/mudar
    desconto) cria **imediatamente** uma entrada no painel de Histórico
    com formato pronto: *"13/06 15:42 — Eu alterou quantidade de Parafuso
    de 10 para 15 pç (R$ 50,00 → R$ 75,00)"*. A entrada inclui o
    impacto no total geral antes/depois.
  - **"Salvar mudanças"** aplica tudo em batch no LocalStorage:
    atualiza itens, recalcula decomposição completa, anexa as entradas
    pendentes ao histórico permanente, atualiza `salvo_em`.
  - **"Descartar"** com confirmação. Se o engenheiro abriu a v2 recém-
    criada e não fez nenhuma mudança além da entrada "criou v2",
    o sistema **exclui a v2** (sem deixar versão órfã na lista).
  - **Aviso antes de fechar a aba** (beforeunload) se houver mudanças
    não salvas.

  **Detalhes técnicos importantes:**
  - O recálculo da decomposição em modo edição respeita o `config_snapshot`
    do orçamento: perda usa override por material ou heurística por
    categoria; margem markup/margem aplicada; **se a configuração de mão
    de obra é "tabela", o valor original do snapshot é congelado** (o
    snapshot não preservou as estruturas da obra e seria perda de
    informação recalcular; engenheiro pode editar manual na Etapa 6 do
    Cabeçalho). Se é "pct_material", recalcula livremente.
  - Item manual usa `material_id` negativo único baseado em timestamp +
    contador (serializável, sem refator de tipo).
  - **10 testes novos** (E01-E10) cobrindo edição de qty/preço, criação
    de item manual, criação de item do catálogo com/sem preço, recálculo
    de decomposição com perda, margem markup, desconto global, MO
    "tabela" congelada e "pct_material" recalculada (total 156).

  Nenhum arquivo do gerador original foi tocado.

- ✅ **Etapa 4 da nova feature concluída — tela de Detalhe somente leitura,
  com painel de histórico ao lado.** Quando o engenheiro clica em
  **"📂 Abrir"** na tela de Consulta, ele agora vai para uma **tela
  própria do orçamento** (rota `detalhe`), não mais carrega dentro da aba
  Orçamento. A tela mostra: **cabeçalho rico** (cliente puxado do
  cadastro com nome, CNPJ/CPF, contato principal, município/UF do
  endereço — ou texto da obra se ainda não tem cliente vinculado),
  número do orçamento, versão, status colorido, validade (com tag
  amarela **"⚠ Vencido"** se a data passou), salvo em, condições de
  pagamento e prazo se preenchidos, observações, observações de
  imposto, **Total** com indicação "parcial" quando aplicável. À
  direita (desktop) ou no fim (mobile) tem o **painel "Histórico"**:
  por enquanto vazio para snapshots antigos (ganha vida na Etapa 5
  quando a edição existir). A tabela de itens, decomposição e
  pendentes são iguais às existentes (reaproveitadas, sem duplicação).

  **Botões na tela:** ← Voltar para Consulta, Salvar como nova versão
  (clona com versão+1, preservando histórico), ✏ Editar (visível mas
  **desabilitado** com tooltip "em breve" — chega na Etapa 5), 📄 PDF,
  📊 Excel (reexportam o snapshot).

  **Refator importante**: a aba **"Orçamento"** dentro de Lista de Obra
  agora é SÓ "ao vivo" — perdeu o "modo histórico", o banner azul, o
  botão "Voltar para orçamento atual", os botões "Salvar como nova
  versão" e "Meus orçamentos" embutidos. O fluxo agora é: criar o
  orçamento ao vivo → clicar **"Salvar orçamento"** → o sistema cria o
  snapshot e **redireciona automaticamente para o Detalhe** do
  recém-salvo, pronto para enviar ao cliente. Para criar outro, volta
  para Lista de Obra. O componente `OrcamentoSalvarBotoes` foi
  **removido** (substituído por botões simples direto na OrcamentoView)
  e o campo `orcamentoCarregadoId` saiu do store (não é mais
  necessário; o estado da "qual orçamento abrir" agora vive no
  `view.name === "detalhe"; view.id`).

  Nada de novo nos testes (componentes de UI puros, sem lógica nova
  que mereça teste de unidade — total continua 146). Nenhum arquivo do
  gerador original foi tocado.

- ✅ **Nenhuma alteração feita no sistema — apenas leitura, estudo e proposta.**
  Foi feita a engenharia reversa da camada de geração de lista existente
  (modelo de dados, fluxo de consolidação, exportações, identidade visual)
  para avaliar a viabilidade de uma camada de **orçamento automático**.
  O resultado completo está em `RELATORIO_VIABILIDADE_ORCAMENTO.md` (4 fases:
  entendimento, viabilidade, proposta de design e plano em etapas, com
  10 perguntas-portão para o dono validar antes de iniciar qualquer construção).

- ✅ **Etapa 1 do orçamento concluída — motor de cálculo pronto, isolado e
  testado, sem nenhuma alteração no que já existia.** Foi criado o "miolo"
  invisível do orçamento (regras de preço, perda, mão de obra, frete, margem
  e arredondamento monetário) numa pasta nova (`app/src/lib/orcamento/`),
  totalmente separado do código antigo. 44 testes automatizados travam o
  comportamento — cobrem casos como preço faltando (vira "pendente", nunca
  zero), preço de cabo em kg × metro com conversão, validade vencida, markup
  vs margem, e snapshot que impede mudança de preço de alterar orçamento
  antigo. O motor ainda não aparece em tela alguma — isso é a Etapa 4. Nada
  do que o app já fazia foi tocado: a geração de lista de materiais continua
  exatamente igual.

- ✅ **Etapa 2 do orçamento concluída — cadastro de preços disponível, ainda
  sem cálculo de orçamento.** Foi adicionada uma aba nova **"Preços"** no
  topo do app (entre "Início" e "Lista de Obra") onde o engenheiro vê todos
  os materiais usados nas obras (291 por padrão; tem um *toggle* para mostrar
  os 301 do catálogo inteiro). Para cada material ele pode digitar o preço,
  escolher a unidade, informar fator de conversão se necessário (ex.: preço
  por metro × BOM em kg) e a validade. Tudo fica salvo no navegador do
  engenheiro — abrir e fechar não perde nada, e múltiplas abas se sincronizam.
  O preço fica marcado como **🅼 meu** (sobrescreve um eventual oficial)
  ou **🅞 oficial** (vem do `precos.json` que o dono mantém). O engenheiro
  pode "voltar ao oficial" a qualquer momento com o "✕". Quando uma obra
  tem materiais sem preço cadastrado, aparece um **banner amarelo no painel
  lateral** ("X materiais sem preço") com botão "Cadastrar agora" que abre
  Preços já filtrado só para os materiais daquela obra. O motor de cálculo
  continua existindo invisível — mostrar valor em R$ é Etapa 4. Foram
  adicionados 15 testes novos (total 59), e nenhum arquivo do gerador de
  lista de materiais foi alterado.

- ✅ **Etapa 3 do orçamento concluída — agora dá para importar e exportar
  preços em massa por planilha (CSV ou XLSX), sem precisar digitar um por
  um.** Na aba **Preços** apareceram quatro botões novos no canto direito:
  **"Baixar template"** (abre um menu pequeno: escolher se quer já vir
  pré-preenchido com os preços atuais ou começar em branco, e escolher CSV
  ou XLSX), **"Exportar meus"** (baixa só os preços que o engenheiro
  cadastrou, em CSV ou XLSX), **"Importar..."** (escolhe um arquivo CSV ou
  XLSX do computador) e **"Limpar meus preços"** (vermelho, com duas
  confirmações antes de apagar tudo — para evitar acidente). A importação
  é **segura**: nada é aplicado até o engenheiro clicar **"Aplicar"** numa
  tela de prévia que mostra exatamente quantos seriam **criados**,
  **atualizados**, **sem mudança**, **removidos** (linha em branco apaga
  o preço daquele material) e **com erro** — com a lista detalhada dos
  erros (linha do arquivo, descrição clara do problema: id inexistente,
  valor inválido, unidade desconhecida, fator de conversão faltando, data
  inválida etc.). Auto-detecção de separador (vírgula ou ponto-e-vírgula),
  aceita valor pt-BR (1.234,56) e US (1234.56), data ISO (2026-12-31) ou
  pt-BR (31/12/2026). Foram adicionados 27 testes novos cobrindo cada
  caminho de validação e o roundtrip CSV/XLSX (total 86 testes). Nenhum
  arquivo do gerador original foi tocado.

- ✅ **Etapa 3 da nova feature concluída — tela de Consulta de Orçamentos.**
  Apareceu uma aba nova **"Consulta"** no header (logo depois de "Clientes")
  com uma lista completa de todos os orçamentos salvos. Cada linha mostra
  número, **cliente** (puxado do cadastro feito na Etapa 2; orçamentos
  antigos que ainda não têm cliente vinculado mostram a obra), data do
  último salvamento, valor total (em amarelo se "parcial"), status
  colorido, versão. **Filtros poderosos**: busca livre (número, obra,
  observações — sem acento), seletor de cliente, período (de/até), faixa
  de valor (R$ mín/máx), chips multi-select de status, checkbox "Incluir
  excluídos". **Ordenação clicável** em qualquer coluna (número, salvo
  em, valor, status, versão) — clique na coluna alterna asc/desc.
  **Ações por linha**: 📂 Abrir (entra na aba Orçamento em modo
  histórico do escolhido), 📄 PDF e 📊 Excel (reexporta a partir do
  snapshot), ✕ Excluir (soft delete) ou ↺ Restaurar.

  **Refator junto**: o modal antigo "Meus orçamentos" (Etapa 7) foi
  **removido** — toda a sua função está agora na tela de Consulta, sem
  duplicação. O botão "📂 Meus orçamentos" dentro da aba Orçamento agora
  navega direto para a Consulta. O estado de "qual orçamento está
  carregado no modo histórico" migrou para o store, permitindo que a
  Consulta avise a aba Orçamento antes de navegar.

  **Soft delete dos orçamentos** virou semântica real: antes era hard
  delete; agora marca `excluido_em` e mantém o item, igual aos clientes.
  Filtro padrão esconde; checkbox revela. Botão Restaurar desfaz.

  Foram adicionados 9 testes novos cobrindo cada filtro e cada
  ordenação (total 146 testes). Nenhum arquivo do gerador original foi
  tocado.

- ✅ **Etapa 2 da nova feature concluída — agora dá para cadastrar clientes.**
  Apareceu uma aba nova **"Clientes"** no topo do app (logo depois de
  "Início") com uma lista de todos os clientes salvos no navegador. Cada
  linha mostra o nome, o documento (CPF/CNPJ com máscara), município/UF
  do primeiro endereço, primeiro contato (nome/email/telefone) e quantos
  orçamentos esse cliente tem vinculados. **Busca** por nome ou pelos
  dígitos do CPF/CNPJ (insensível a acento e máscara) e **checkbox
  "Incluir excluídos"** para ver clientes apagados. **"+ Novo cliente"**
  abre um modal grande com 3 seções: **dados básicos** (nome obrigatório
  + CPF/CNPJ com formato automático + observações), **contatos**
  (adicione quantos quiser — nome, função, email, telefone; contato em
  branco é descartado ao salvar) e **endereços** (rótulo "Sede/Obra X",
  logradouro, número, bairro, município, UF, CEP, complemento; endereço
  sem logradouro é descartado). Botão **"✏ Editar"** abre o mesmo modal
  preenchido. Botão **"✕ Excluir"** é soft delete (cliente fica oculto
  mas guardado para auditoria) e, se houver orçamentos vinculados,
  pergunta antes — esses orçamentos perdem o vínculo (ficam "sem
  cliente"), conforme decidido. Botão **"↺ Restaurar"** traz de volta.
  Tudo persiste no navegador (`clientes_v1`). Foram adicionados 12 testes
  novos cobrindo persistência, formato de CPF/CNPJ, busca insensível a
  acento e limpeza de contatos/endereços em branco antes de salvar
  (total 137 testes). Nenhum arquivo do gerador original foi tocado e
  nenhuma outra tela mudou.

- ✅ **Roteiro aprovado para a feature "Consulta/Edição de Orçamentos com
  Histórico de Alterações" (10 etapas planejadas, incluindo mini-CRM
  completo de clientes).** Nenhuma alteração visível ainda para quem usa o
  app — só foi feito o trabalho invisível de preparação: foram adicionados
  os tipos novos do **histórico de alterações** (cada entrada com autor,
  data/hora, ação e descrição em pt-BR pronta para o painel — *"13/06 14:30
  — Eu adicionei Cabo CAA 2 (50 kg × R$ 18,00 = R$ 900,00)"*), foi escrito
  o **gerador de descrições** para cada tipo de mudança (adicionar/remover
  item, mudar quantidade/preço, mudar desconto/cabeçalho/status, criar
  versão, reverter) e 10 testes automatizados travam o formato exato de
  cada uma. O tipo `OrcamentoSalvo` ganhou os campos opcionais que vão
  guardar histórico, desconto, observações, soft-delete e vínculo com
  cliente — orçamentos antigos continuam carregando sem migração. As
  próximas etapas constroem em cima: cadastro de clientes (2), consulta
  com filtros (3), tela de detalhe (4), edição com histórico ao vivo (5),
  edição do cabeçalho (6), versionamento automático e soft-delete (7),
  perfil do cliente (8), sincronização entre abas (9) e extras (10).
  125 testes verdes (10 novos). Nenhum arquivo do gerador original foi
  tocado e nenhuma tela existente mudou.

- ✅ **Etapa 8 (opcional) concluída — Relatórios consolidados sobre os
  orçamentos salvos.** Apareceu uma aba nova **"Relatórios"** no header
  (entre Preços e Lista de Obra) que mostra, sobre os orçamentos salvos
  no navegador: **(1) cards de KPI** — Total geral, Ticket médio (só dos
  aprovados), Conversão (aprovado ÷ aprovado+recusado+expirado, em %) e
  Pendentes (rascunhos+enviados); **(2) Por status** com contadores
  coloridos; **(3) Evolução mensal** em gráfico de barras CSS simples
  (sem dependência) dos últimos 12 meses, com tooltip de valor/quantidade
  por barra; **(4) Top 10 materiais por quantidade** e **Top 10 por
  valor** lado a lado, mostrando em quantos orçamentos cada material
  aparece; **(5) Materiais que mais aparecem como pendência** (faltando
  preço) com botão **"Cadastrar preços"** que pula para a aba Preços
  filtrando exatamente esses materiais. **Filtros** no topo: período
  (default últimos 12 meses) e chips de status (multi-seleção). Tudo
  recalcula automático ao mudar filtros. Cada `OrcamentoSalvo` conta como
  1 datapoint (v1 e v2 do mesmo número contam como 2 documentos — use o
  filtro de status para evitar dupla contagem entre Rascunho e Enviado).
  Foram adicionados 8 testes cobrindo as 7 funções puras (total 115
  testes). Nenhum arquivo do gerador original foi tocado.

- ✅ **Etapa 7 do orçamento concluída — agora dá para salvar orçamentos
  com versionamento.** Na aba **Orçamento**, ao lado dos botões de
  exportar, apareceram três novos: **"Salvar"** (cria um snapshot do
  orçamento atual no navegador — congela itens, decomposição, total,
  config e metadados), **"Salvar como nova versão"** (só fica ativo quando
  um orçamento histórico está aberto — clona com versão+1), e
  **"📂 Meus orçamentos"** (abre lista com todos os salvos: número,
  versão, status colorido, data de salvamento, obra, total, com botões
  para **Abrir**, **PDF**, **Excel** e **Excluir** em cada um, além de
  **"Limpar todos"** com confirmação dupla no rodapé). Quando o engenheiro
  abre um orçamento salvo entra em **"MODO HISTÓRICO"** com banner azul
  no topo: o snapshot é **imutável** — mudar preço/config depois não muda
  o documento aberto (resolve o problema clássico "mandei um orçamento ao
  cliente, mudei o preço, o orçamento na tela mudou sem eu saber"); só
  metadados (número, status, condições, prazo) ficam editáveis. Botão
  **"← Voltar para orçamento atual"** sai do modo histórico. Após salvar
  pela primeira vez, o app já entra no modo histórico desse novo
  orçamento — assim "Salvar" de novo atualiza ele, em vez de criar outro.
  Persistência LocalStorage com chave versionada
  (orcamentos_salvos_v1). Foram adicionados 7 testes novos cobrindo
  round-trip de até 50 orçamentos (total 107 testes). Nenhum arquivo do
  gerador original foi tocado.

- ✅ **Etapa 6 do orçamento concluída — agora dá para baixar o orçamento
  como PDF e Excel para mandar ao cliente.** Na aba **Orçamento**, depois
  da lista de pendentes, apareceu um painel novo **"Dados do documento"**
  com 5 campos: **Número** (gerado automaticamente no padrão
  *ORC-AAAA-MM-DD-NNN* com contador por dia, mas editável), **Versão**
  (default 1), **Status** (Rascunho/Enviado/Aprovado/Recusado/Expirado),
  **Condições de pagamento** (texto livre, ex.: "30/60/90 dd") e
  **Prazo de execução** (texto livre, ex.: "30 dias após autorização").
  Abaixo, dois botões grandes: **"Exportar PDF"** (vermelho, retrato A4
  com cabeçalho da obra, condições, tabela de itens precificados,
  decomposição completa, lista de pendentes em vermelho se houver e aviso
  legal fixo no rodapé — "valores NÃO incluem tributos") e **"Exportar
  Excel"** (verde, workbook com 3 abas: **Resumo** com cabeçalho e
  decomposição; **Itens precificados** com a tabela em formato numérico
  para o engenheiro poder somar/multiplicar; e **Pendentes**, só se
  houver). Os arquivos saem com nome *ORC-AAAA-MM-DD-NNN_v1.pdf* (ou
  .xlsx). Tudo no navegador — sem servidor. Dados do documento ficam
  guardados na sessão (trocar de aba dentro do app não perde os campos
  preenchidos; fechar a janela esquece). Os exports antigos da BOM (na
  Lista de Obra) continuam funcionando exatamente igual — orçamento ganhou
  exports próprios, não substituiu nada. Foram adicionados 5 testes novos
  para geração de número e preparação das linhas do documento (total 100
  testes). Nenhum arquivo do gerador original foi tocado.

- ✅ **Etapa 5 do orçamento concluída — engenheiro agora configura
  perda, mão de obra, frete, margem e validades pela tela.** Na aba
  **Orçamento**, dentro do bloco "Decomposição", apareceu o botão
  **"⚙ Editar configuração"** que abre um modal com 5 seções em abas:
  **Perda** (5 inputs % por categoria — cabo, fio/parafuso/conector,
  cinta/isolador/mão-francesa, equipamento grande, outros; já vêm
  pré-preenchidos com os defaults razoáveis 5/3/2/0/2%), **Mão de obra**
  (radio: % sobre material **ou** tabela de R$ por tipo de estrutura — a
  tabela mostra automaticamente só os tipos que aparecem na obra atual),
  **Frete** (valor fixo em R$), **Margem** (radio markup/margem com
  fórmula matemática visível que recalcula conforme o engenheiro digita
  — markup 25% mostra "preço = custo × 1,25", margem 25% mostra
  "preço = custo ÷ 0,75 ≈ custo × 1,333"; margem ≥ 100% bloqueia o
  Salvar) e **Validades** (dias para preço e para orçamento). Mudanças
  vivem num "rascunho" local até o engenheiro clicar **"Salvar"** — antes
  disso, "Cancelar" descarta sem efeito. Tem botão **"Restaurar padrões"**
  com confirmação que zera tudo (avisa se vai apagar overrides de perda
  por material também). Tudo persiste no navegador e o orçamento recalcula
  na hora — qualquer mudança aqui aparece imediatamente na tabela e no
  chip de total. A aba **Preços** também ganhou uma coluna nova
  **"Perda %"** ao lado da validade: o engenheiro pode dizer "este cabo
  específico tem 8% de perda, não os 5% da categoria" e o input fica
  amarelo enquanto há override. Defaults razoáveis valem só para
  navegadores novos — quem já estava com config zerada (Etapa 4) mantém
  o que tinha salvo. Foram adicionados 6 testes para a persistência da
  config (total 95 testes). Nenhum arquivo do gerador original foi tocado.

- ✅ **Etapa 4 do orçamento concluída — agora o valor em R$ aparece em tela.**
  Quando o engenheiro abre a **Lista de Obra**, surgiu uma terceira aba
  ao lado de "Relação consolidada" e "Por estrutura": **"Orçamento"**.
  Ela mostra a **tabela de itens precificados** (descrição × unidade ×
  quantidade × preço unitário × subtotal × origem do preço 🅞/🅼, com tag
  de validade vencida e badge de conversão de unidade quando aplicável), a
  **decomposição** linha-a-linha (subtotal material → perda → mão de obra
  → frete → base → margem → **TOTAL**), e a **lista de pendentes** (itens
  sem preço, com motivo: sem preço cadastrado / conversão indefinida /
  quantidade inválida). Se a obra tem itens pendentes, o total fica
  marcado como **"(parcial)"** em amarelo e aparece um botão **"Cadastrar
  preços pendentes →"** que pula direto para a aba Preços já filtrada só
  para os faltantes daquela obra. No painel lateral (preview da relação)
  apareceu o **chip "Total estimado: R$ X,XX"** sempre visível enquanto
  houver itens na obra — o valor cresce conforme o engenheiro cadastra
  preços, criando o gancho de adoção. Defaults conservadores nesta etapa:
  perda 0%, MO 0%, frete R$ 0, margem 0% (a Etapa 5 trará a UI para
  configurar essas camadas). O motor de cálculo (Etapa 1) é a única fonte
  da verdade: tudo que aparece em tela vem de `montar_orcamento(...)`,
  sem cálculo paralelo. Foram adicionados 3 testes novos para o helper
  que prepara estruturas-da-obra para o motor (total 89 testes). Nenhum
  arquivo do gerador original foi alterado.
