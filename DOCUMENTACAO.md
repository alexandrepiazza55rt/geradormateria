# Gerador de Relação de Materiais — Desktop (Tauri v2)
## Documentação geral: onde está, como roda, como funciona e como atualizar

> Documento-mestre. Para os comandos de build puros veja também `BUILD_DESKTOP.md`.

---

## 1. Onde está tudo

### 1.1 O projeto (código-fonte)
O projeto foi **movido para fora do OneDrive** para o build do Rust não brigar com a
sincronização. Local atual:

```
C:\dev\gerador-materiais
```

A pasta antiga no OneDrive virou **apenas backup** — pode apagar quando quiser. **Todo o
trabalho daqui pra frente é em `C:\dev\gerador-materiais`.**

### 1.2 Mapa de pastas
```
C:\dev\gerador-materiais\
├─ app\                         ← a aplicação (frontend + desktop)
│  ├─ src\                      ← código React/TS (telas, lógica, store)
│  │  ├─ store.ts               ← estado (Zustand) + carga da base
│  │  ├─ lib\
│  │  │  ├─ env.ts              ← detecta Tauri vs navegador
│  │  │  ├─ dataSource.ts       ← LÊ A BASE (web=fetch | desktop=%APPDATA%)
│  │  │  ├─ storageBackend.ts   ← registry do backend de persistência
│  │  │  ├─ exportTarget.ts     ← exportação (download | "Salvar como" nativo)
│  │  │  ├─ tauri\bootstrap.ts  ← inicialização do desktop (1º start)
│  │  │  ├─ tauri\sqliteBackend.ts ← persistência em SQLite (cache+write-behind)
│  │  │  ├─ update\             ← COSTURA de atualização de base (manifest + service)
│  │  │  └─ license\activation.ts ← COSTURA de licenciamento
│  │  └─ ...                    ← demais telas/componentes (inalterados)
│  ├─ public\data\*.json        ← BASE DE ENGENHARIA (fonte; é embutida no .exe)
│  └─ src-tauri\                ← o "lado desktop" (Rust)
│     ├─ src\lib.rs             ← registro de plugins + comandos Rust
│     ├─ src\seed.rs            ← embute a base e extrai p/ %APPDATA% no 1º start
│     ├─ src\fingerprint.rs     ← stub de fingerprint da máquina (licença futura)
│     ├─ tauri.conf.json        ← nome, identificador, janela, bundle
│     ├─ capabilities\default.json ← permissões (sql, dialog)
│     └─ target\release\        ← onde o .exe FINAL aparece após o build
├─ analysis\, extraction\       ← ferramentas Python de BUILD-TIME (NÃO entram no .exe)
├─ data\, GERAÇÃO DE MATERIAL.xlsm ← fontes da extração (não entram no .exe)
├─ BUILD_DESKTOP.md             ← comandos de build/distribuição
└─ DOCUMENTACAO.md              ← este arquivo
```

### 1.3 Onde ficam os dados em uso (no computador do cliente)
Quando o programa roda, ele **NÃO** usa os JSON de dentro do `.exe`. Ele usa uma cópia em:

```
%APPDATA%\br.com.sigma.gerador-materiais\
├─ base\                        ← BASE DE ENGENHARIA (read-only p/ o usuário)
│  ├─ estruturas.json, materiais.json, insumos.json, precos.json, ndu005_*.json
│  ├─ data_version             ← versão da base instalada (ex.: 2026.06.16-seed1)
│  └─ .checksums.json          ← SHA-256 de cada arquivo (integridade)
└─ user.db (+ -wal, -shm)       ← DADOS DO USUÁRIO em SQLite
                                   (clientes, orçamentos+histórico, preços ajustados, config)
```
> No Windows, `%APPDATA%` = `C:\Users\<usuário>\AppData\Roaming`.
> Logs de diagnóstico ficam em `%LOCALAPPDATA%\br.com.sigma.gerador-materiais\logs\`.

**Regra de ouro:** `base\` é substituível (atualização); `user.db` é sagrado (nunca é apagado
por atualização). São camadas fisicamente separadas.

---

## 2. Como iniciar o programa

### 2.1 Agora (modo desenvolvimento) — é a janela que está aberta
Para desenvolver/ver com recarga automática. Precisa do ambiente do compilador (Rust+MSVC):

```powershell
# 1) carrega o ambiente do compilador C++ (linker)
$vs = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
Import-Module "$vs\Common7\Tools\Microsoft.VisualStudio.DevShell.dll"
Enter-VsDevShell -VsInstallPath $vs -SkipAutomaticLocation -DevCmdArguments "-arch=x64 -host_arch=x64"
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"

# 2) sobe o app desktop
cd C:\dev\gerador-materiais\app
npx tauri dev
```

> Só o site (sem desktop), para testes rápidos no navegador: `npm run dev` → http://localhost:5173

### 2.2 Depois (o programa final que o cliente recebe)
Após gerar o build (seção 3), o programa É um **único arquivo**:

```
C:\dev\gerador-materiais\app\src-tauri\target\release\app.exe
```
O cliente recebe esse `.exe`, dá **duplo clique** e usa. Sem instalação, sem pasta de
arquivos ao lado. (O nome `app.exe` pode ser trocado por algo apresentável — ver seção 3.)

---

## 3. Como gerar o `.exe` final
```powershell
# (mesmo ambiente do compilador da seção 2.1)
cd C:\dev\gerador-materiais\app
npx tauri build --no-bundle      # gera só o .exe portátil
```
Saída: `app\src-tauri\target\release\app.exe`.

- Para também gerar um **instalador** (opcional): `npx tauri build` (cria NSIS em
  `target\release\bundle\nsis`). O entregável principal é o `.exe` portátil.
- **Renomear o executável:** em `src-tauri\tauri.conf.json`, ajuste `productName`/
  `mainBinaryName`, ou em `src-tauri\Cargo.toml` o `[package] name`.

---

## 4. Como funciona (arquitetura)

### 4.1 Visão geral
É o **mesmo app web** rodando dentro de uma janela nativa (Tauri v2 = Rust + WebView2 do
Windows). O frontend não foi reescrito; foram trocadas só as "pontas" que, no desktop,
funcionam diferente do navegador.

### 4.2 Fluxo de inicialização (1º start)
```
duplo clique no .exe
  └─ Rust (seed.rs): a base embutida é extraída p/ %APPDATA%\...\base  (só se ainda não existe)
  └─ bootstrap.ts:
       1. ensure_base_extracted        → garante a base em %APPDATA%
       2. ensureActivated()            → costura de licença (hoje no-op)
       3. SQLite: roda migrations + carrega user.db p/ um cache em memória
       4. instala o backend SQLite como destino da persistência
  └─ React monta → store.load() lê a base de %APPDATA% → telas funcionam
```

### 4.3 As 3 "pontas" adaptadas
| Ponta | No navegador (web) | No desktop (Tauri) |
|---|---|---|
| **Ler a base** (`dataSource.ts`) | `fetch('/data/x.json')` | lê de `%APPDATA%\base\x.json` (comando Rust) |
| **Salvar dados do usuário** (`storageBackend.ts`) | `localStorage` | **SQLite** `user.db` (cache + gravação em fila) |
| **Exportar** xlsx/pdf/csv (`exportTarget.ts`) | download do navegador | diálogo nativo **"Salvar como"** |

> O detalhe esperto: a persistência continua usando a MESMA interface síncrona de antes.
> No desktop, por baixo, um cache em memória é preenchido no boot a partir do SQLite e cada
> gravação é espelhada no banco em segundo plano. Por isso nenhuma lógica testada precisou
> mudar (167 testes seguem passando).

### 4.4 Preço base × preço do usuário
Os preços de referência vêm da base; os ajustes do usuário ficam no `user.db` e são
**mesclados por cima** em tempo de execução. Atualizar a base **não apaga** os preços que o
cliente ajustou.

---

## 5. 🔄 Atualização da BASE em nuvem (o que você perguntou)

### 5.1 A ideia (por que é simples)
O app sempre lê a base de `%APPDATA%\...\base\`. Então **"atualizar a base" = colocar
arquivos novos nessa pasta**. Fazer isso pela internet é só: baixar os arquivos novos de
algum lugar → validar → gravar nessa pasta → atualizar o `data_version`. **Nunca precisa
reinstalar o `.exe`.**

A estrutura para isso já existe no código (a "costura"); falta só **ligar a parte de rede**,
que foi deixada desligada de propósito.

### 5.2 Onde hospedar (você escolhe UM)
Qualquer lugar que sirva arquivos por HTTPS:
- **GitHub Releases** — grátis e simples: sobe os `.json` + `manifest.json` como "assets".
- **Bucket estático** — Amazon S3 / Azure Blob / Google Cloud Storage.
- **Hospedagem estática** — Vercel, Netlify, ou um Nginx/Apache seu.

> Recomendação para começar: **GitHub Releases** ou um **bucket S3/Azure**. Não precisa de
> servidor com lógica — basta servir arquivos.

### 5.3 O que você publica nesse lugar
1. Os JSON novos da base (`estruturas.json`, `materiais.json`, `precos.json`, …).
2. Um **`manifest.json`** descrevendo a versão e os checksums (formato já definido em
   `app/src/lib/update/manifest.ts`):
```json
{
  "data_version": "2026-07-01-r2",
  "files": [
    { "name": "estruturas.json", "sha256": "<sha256 do arquivo>", "bytes": 1512536 },
    { "name": "materiais.json",  "sha256": "<sha256 do arquivo>", "bytes": 52922 },
    { "name": "precos.json",     "sha256": "<sha256 do arquivo>", "bytes": 1234 }
  ],
  "notes": "Reajuste de preços e novas estruturas compactas"
}
```

### 5.4 Onde CONECTAR no código (os pontos exatos)
1. **A URL** do seu host — ex.: `https://SEU-HOST/gerador/manifest.json`. Guardar numa
   constante de config (sugestão: criar `app/src/lib/update/updateConfig.ts` com
   `export const UPDATE_MANIFEST_URL = "https://…/manifest.json";`).
2. **`app/src/lib/update/UpdateService.ts`**:
   - `checkForUpdate(manifest)` → **já pronto**: compara `data_version` remoto × local.
   - `applyUpdate(manifest, fetchFile)` → **hoje lança "não habilitado"**. É AQUI que entra
     o download: para cada arquivo do manifest, baixar de `UPDATE_BASE_URL/<name>`, conferir
     o `sha256`, e gravar em `base\`.
3. **Gravar no disco** — adicionar um comando Rust `apply_base_update(arquivos)` em
   `src-tauri/src/lib.rs` que grava **de forma atômica** em `%APPDATA%\base` e atualiza
   `data_version` + `.checksums.json` (já existem `write_file_bytes` e `reextract_seed`
   como base; o ideal é um comando dedicado que valida ANTES de trocar e guarda um backup
   da base anterior para rollback).
4. **Botão na interface** — em *Configurações*, um "Verificar atualizações" que: busca o
   `manifest.json`, chama `checkForUpdate`, e se houver novidade chama `applyUpdate` e
   recarrega a base (`store.load()` de novo).

### 5.5 Passo a passo do fluxo (quando o servidor existir)
```
1. App abre (ou usuário clica "Verificar atualizações")
2. Baixa o manifest.json do seu host
3. Compara data_version remoto × local (%APPDATA%\base\data_version)
4. Se for mais novo → avisa "Atualização disponível: <notes>"
5. Usuário aceita → baixa cada JSON, confere o SHA-256, grava em base\
6. Atualiza data_version e .checksums.json
7. App recarrega a base → pronto. Clientes/orçamentos/preços do usuário INTACTOS.
```

### 5.6 Prova de que a arquitetura já funciona HOJE (sem servidor)
Você pode simular a atualização manualmente agora mesmo:
1. Edite/derrube um arquivo novo em `%APPDATA%\br.com.sigma.gerador-materiais\base\`
   (ex.: troque o `precos.json`).
2. Abra o `data_version` (mesmo arquivo) e mude o valor.
3. Reabra o programa → a base nova aparece, e seus clientes/orçamentos continuam lá.

Isso comprova que, para a nuvem, só falta automatizar os passos 1–2 com um download.

### 5.7 Cuidados
- Use **HTTPS** e **valide o SHA-256** (já previsto) — evita base corrompida/adulterada.
- A atualização **não toca** no `user.db`. É impossível, por essa via, apagar dados do cliente.
- Se um arquivo baixado falhar na validação, **não troque** a base (mantenha a anterior).

---

## 6. Atualização do PRÓPRIO programa (.exe) — diferente da base
Atualizar a **base** (seção 5) é uma coisa; lançar uma **nova versão do programa** (correção
de bug, tela nova) é outra. Opções:
- **Manual:** você envia o `.exe` novo; o cliente troca o arquivo. Os dados em `%APPDATA%`
  continuam (não se perde nada).
- **Automática:** o Tauri tem o plugin oficial **`@tauri-apps/plugin-updater`**, que baixa e
  instala uma nova versão **assinada** do app. Exige hospedar um `latest.json` + os binários
  e configurar uma chave pública de assinatura. Dá para adicionar quando quiser (é outra
  camada, hoje não incluída).

---

## 7. Licenciamento (costura — como conectar depois)
- `app/src-tauri/src/fingerprint.rs` → `machine_fingerprint()` gera um ID da máquina (stub;
  trocar por HWID real na implementação).
- `app/src/lib/license/activation.ts` → `ensureActivated()` (hoje retorna "ativado") é o
  **único ponto** onde plugar a validação. Roda no 1º start (bootstrap).
- **Para conectar a um backend de licença:** dentro de `ensureActivated`, chamar seu servidor
  enviando `machineFingerprint()` + a chave/serial do cliente; se válido, gravar o estado na
  tabela `meta` do SQLite e liberar; se não, mostrar uma tela de ativação e bloquear o uso.

---

## 8. Backup e suporte ao cliente
- **Backup dos dados do usuário:** copiar o arquivo
  `%APPDATA%\br.com.sigma.gerador-materiais\user.db`. Restaurar = colocar de volta.
- **"Resetar" a base:** apagar a pasta `base\` → na próxima abertura ela é reextraída do `.exe`.
- **Diagnóstico:** logs em `%LOCALAPPDATA%\br.com.sigma.gerador-materiais\logs\`.
- **WebView2:** o `.exe` usa o runtime do Windows. Já vem no Win11 e no Win10 atualizado; se
  faltar, instalar o "Evergreen Bootstrapper" da Microsoft.
- **SmartScreen:** `.exe` não assinado mostra "O Windows protegeu o computador" → "Mais
  informações" → "Executar assim mesmo". Para evitar, usar certificado de assinatura (OV/EV).

---

## 9. Estado atual (o que está pronto)
- [x] App desktop Tauri v2 com paridade total com a web
- [x] Base embutida → extraída p/ `%APPDATA%` (atualizável sem reinstalar)
- [x] Dados do usuário em SQLite (separados da base; sobrevivem a troca de base)
- [x] Exportações xlsx/pdf/csv via "Salvar como" nativo
- [x] Costura de atualização de base (falta só ligar a rede — seção 5)
- [x] Costura de licenciamento (falta só ligar o backend — seção 7)
- [ ] **Build final do `.exe`** — aguardando seu aval (seção 3)
- [ ] Atualização em nuvem ligada (quando você definir o host — seção 5)
- [ ] Atualização automática do `.exe` e assinatura de código (quando quiser)
