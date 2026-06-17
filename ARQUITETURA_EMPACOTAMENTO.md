# Arquitetura de Empacotamento (.exe Windows)

> O projeto **já é um app Tauri v2**, então a maior parte do empacotamento já vinha pronta.
> Este documento descreve a estratégia final e o que foi ajustado para a distribuição.

## 1. Estratégia
- **Ferramenta:** Tauri v2 (Rust + WebView2). Gera `.exe` nativo Windows.
- **Entrega:** **instalador NSIS**, instalação **por usuário** (sem admin).
- **Runtime:** usa o **WebView2** do Windows (já vem no Win10/11). O instalador embute o
  *bootstrapper* (`embedBootstrapper`) para instalar o WebView2 se faltar.
- **Banco:** **SQLite** (`user.db`), local, na pasta de dados do usuário.

## 2. Pastas (binários × dados graváveis)
| O quê | Onde | Observação |
|---|---|---|
| Binários do programa | pasta de instalação do **usuário** (NSIS `currentUser`) | somente leitura; **nunca** Program Files |
| Base de engenharia | `%APPDATA%\Roaming\br.com.sigma.gerador-materiais\base\` | extraída na 1ª execução; atualizável |
| Dados do usuário | `%APPDATA%\Roaming\br.com.sigma.gerador-materiais\user.db` | clientes/orçamentos/preços/licença |
| Backups do banco | `…\br.com.sigma.gerador-materiais\backups\` | rotativo, 5 mais recentes |
| Logs | `%LOCALAPPDATA%\br.com.sigma.gerador-materiais\logs\` | rotacionados pelo plugin-log |

Caminhos resolvidos por API do SO (`app_data_dir`), nunca hardcoded.

## 3. Primeira execução (setup)
1. `seed.rs::ensure_extracted` cria a pasta de dados e **extrai a base embutida** (só se faltar).
2. `plugin-sql` cria o `user.db`, aplica o **schema/migrations** e registra a versão.
3. Bootstrap do React liga o backend de persistência (cache + SQLite).
4. Idempotente: se interromper, a próxima abertura recupera (re-extrai o que faltar).

## 4. Próximas execuções (boot rápido)
- `ensure_extracted` detecta a base já presente e **não reextrai** → inicia direto.

## 5. Backup antes de migrar (upgrades sem perda)
- No boot, **antes** de o banco abrir, `seed.rs::backup_user_db` copia o `user.db` (+ `-wal`)
  para `backups\user-<timestamp>.db`, mantendo os 5 mais recentes. Assim, se uma migração de
  versão futura falhar, há cópia para restaurar. As migrações do plugin-sql são versionadas.

## 6. Instância única
- `tauri-plugin-single-instance`: abrir o app duas vezes **foca a janela existente** (protege o
  SQLite de escrita concorrente).

## 7. Assinatura de código (SmartScreen / antivírus)
- O `.exe` **não é assinado** (sem certificado). O Windows mostrará *"O Windows protegeu o
  computador"* → **Mais informações → Executar assim mesmo**.
- Para remover o aviso: obter um **certificado de assinatura** (OV/EV) e assinar o instalador.
  No Tauri, configura-se `bundle.windows.signCommand`/certificado. (Fora do escopo desta versão.)

## 8. Desinstalação
- O instalador NSIS cria **atalho** e **desinstalador**. O desinstalador remove os **binários**,
  mas **NÃO apaga** a pasta de dados (`%APPDATA%\...`), preservando clientes/orçamentos. Para
  remover os dados, o usuário apaga essa pasta manualmente (decisão consciente).

## 9. Licença
- O gate de licença (ativação/validação/heartbeat/bloqueio) roda no app empacotado. O token e a
  marca de revalidação ficam no `user.db` (camada de dados). Bloquear nunca apaga dados.

## 10. Build (reprodutível por script)
```powershell
# ambiente do compilador (MSVC) carregado; depois:
cd app
npx tauri build           # gera o instalador NSIS
# saída: app/src-tauri/target/release/bundle/nsis/*-setup.exe
```
Artefatos de build (`target/`, instaladores) **não** vão para o git.
