# Guia de Build e Distribuição (.exe)

## Pré-requisitos (máquina de build, Windows)
- **Rust** + **Visual Studio Build Tools** (MSVC/linker C++).
- **Node.js** (npm).
- **WebView2** (já vem no Win10/11).

## Gerar o instalador
No PowerShell, com o ambiente do compilador carregado (ver `DOCUMENTACAO.md` §2.1):
```powershell
cd C:\dev\gerador-materiais\app
npx tauri build
```
Saída:
```
app\src-tauri\target\release\bundle\nsis\Gerador de Relação de Materiais_1.0.0_x64-setup.exe
```
Esse `*-setup.exe` é o que você **entrega ao cliente**.

> Build portátil (sem instalador), opcional: `npx tauri build --no-bundle` → gera só
> `target\release\app.exe`.

## Versão
- A versão fica em `app/src-tauri/tauri.conf.json` → `"version"`. Suba ao lançar uma nova
  versão (ex.: 1.0.1) e gere o instalador de novo.

## Distribuir / atualizar a versão do programa
- Sem auto-update (decisão desta versão): você envia o novo `*-setup.exe`; o cliente instala
  por cima. **Os dados do cliente são preservados** (ficam em `%APPDATA%`, fora do programa).

## Assinatura de código (tirar o aviso do Windows)
- O `.exe` **não assinado** dispara *"O Windows protegeu o computador"* (SmartScreen) →
  **Mais informações → Executar assim mesmo**. Funciona, só assusta.
- Para remover: obtenha um **certificado de assinatura de código** (OV ou EV) de uma autoridade
  (ex.: Certum, DigiCert, Sectigo). Com o certificado, configure a assinatura no Tauri
  (`bundle.windows` → `certificateThumbprint`/`signCommand`) e gere o instalador assinado.
- EV remove o SmartScreen imediatamente; OV ganha reputação com o tempo.

## O que NÃO commitar
- `target/`, instaladores (`*.exe`), certificados, segredos. (Já no `.gitignore`.)
