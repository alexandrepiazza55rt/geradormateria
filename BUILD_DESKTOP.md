# Build & Distribuição — Desktop (Tauri v2)

Conversão do app web (Vite + React) para um **.exe portátil único** para Windows,
mantendo paridade total com a versão web. O frontend é o mesmo; o Tauri embute os
assets e a base de engenharia dentro do binário.

## Pré-requisitos de build

- **Node 18+** e **npm**
- **Rust** (stable, MSVC): `rustup` + toolchain `stable-x86_64-pc-windows-msvc`
- **Microsoft C++ Build Tools** (workload *Desktop development with C++*) — fornece o `link.exe`
- **(Runtime) WebView2** — já presente no Windows 11 e no Windows 10 atualizado

## Desenvolvimento

```bash
cd app
npm install
npm run dev        # só web (navegador) em http://localhost:5173
npx tauri dev      # app desktop nativo (janela) com hot-reload
```

No `tauri dev`, a janela usa o servidor Vite (devUrl). Tanto a versão web quanto a
desktop continuam funcionando a partir do mesmo código.

## Build do .exe portátil

```bash
cd app
npx tauri build --no-bundle
```

Saída — **arquivo único** (frontend + base embutidos no binário):

```
app/src-tauri/target/release/app.exe
```

> O nome do binário é definido pelo `[package] name` em `src-tauri/Cargo.toml`
> (hoje `app` → `app.exe`). Para um nome final mais bonito, ajuste o `productName`
> em `tauri.conf.json` e/ou `mainBinaryName`. Esse `.exe` roda sozinho (duplo
> clique), **sem instalação e sem arquivos ao lado**.

### Instalador opcional (NSIS)

```bash
npx tauri build        # além do .exe, gera o instalador em target/release/bundle/nsis
```

O entregável principal é o **.exe portátil**; o instalador NSIS é opcional.

## Arquitetura de dados

- A **base de engenharia** (`app/public/data/*.json`) é **embutida** no binário (crate
  `include_dir`) — não fica como arquivo solto.
- No **primeiro start**, é extraída para
  `%APPDATA%\br.com.sigma.gerador-materiais\base\` (+ `data_version` e `.checksums.json`).
- A cada execução o app lê a base **dessa pasta** em `%APPDATA%`, nunca de dentro do
  `.exe` → permite **atualizar a base sem reinstalar**.
- Os **dados do usuário** (clientes, orçamentos+histórico, overrides de preço, config)
  ficam em **SQLite** com migrations versionadas:
  `%APPDATA%\br.com.sigma.gerador-materiais\user.db`.
- **Trocar a base NÃO apaga os dados do usuário** — são camadas fisicamente separadas.
- **Atualizar a base manualmente** (prova da arquitetura de update): substitua os
  arquivos em `...\base\` por uma versão mais nova e ajuste `data_version`. O app
  reconhece na próxima abertura, preservando clientes/orçamentos/preços.

## WebView2

O `.exe` depende do runtime **WebView2** do sistema (mantém o binário pequeno e único).
Está presente no Windows 11 e no Windows 10 atualizado. Fallback, se faltar:
[Evergreen Bootstrapper](https://developer.microsoft.com/microsoft-edge/webview2/).

## Assinatura de código (SmartScreen / antivírus)

Um `.exe` **não assinado** pode disparar *"O Windows protegeu o seu computador"*:
**Mais informações → Executar assim mesmo**. Para distribuição ampla, considerar um
**certificado de code signing (OV/EV)**. Não bloqueia a entrega.

## Não empacotado

`analysis/` e `extraction/` (Python) são ferramentas de **build-time** que geram os
JSON da base. **NÃO** entram no app desktop — o programa consome apenas o JSON final.
