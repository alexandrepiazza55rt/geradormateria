# Painel de Publicação da Base

Interface web para publicar a base de engenharia (estruturas/materiais) do "Gerador de
Relação de Materiais" sem usar terminal. Você sobe os JSON de estruturas novas/corrigidas,
o painel valida, versiona e **publica no GitHub** — de onde o programa dos clientes baixa.

## Como funciona (resumo)

- Publica via **commit** num repositório GitHub **público** de dados (ex.: `gerador-base`),
  usando a API do GitHub (Git Data API). Cada publicação também cria uma **release** (tag +
  notas) como marco de versão.
- O programa dos clientes baixa a base de `raw.githubusercontent.com/<owner>/<repo>/<branch>`
  (configurado em `app/src/lib/update/updateConfig.ts`).
- O **token** do GitHub fica só no seu navegador (`localStorage`); o painel é estático (sem
  backend), então o token só vai para `api.github.com`.

## Rodar localmente

```bash
cd publisher
npm install
npm run dev      # abre em http://localhost:5173
```

## Deploy (Vercel)

Projeto Vercel separado, com **Root Directory = `publisher`**. O Vercel detecta Vite
automaticamente (build `vite build`, saída `dist`); o `vercel.json` aqui cuida do roteamento SPA.

## Abas

- **Configuração** — owner/repo/branch + token; "Testar conexão".
- **Modelo** — baixar o template padrão, validar um JSON colado, guia dos campos (`modelo/MODELO.md`).
- **Publicar** — arrasta os `.json`, valida (formato + integridade + id único + disciplina de
  `rev`), define a versão e publica.
- **Histórico** — versões já publicadas (releases do repo).

O modelo padrão de uma estrutura está em [`modelo/`](./modelo/).
