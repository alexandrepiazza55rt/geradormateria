# Modelo padrão de uma estrutura (formato de publicação)

Cada estrutura é **um arquivo JSON** (`<id>.json`). Este é o formato que o programa dos
clientes entende. Formate seus dados neste modelo e suba no painel — ele valida antes de
publicar.

- Template em branco: [`estrutura.template.json`](./estrutura.template.json)
- Exemplo real preenchido: [`estrutura.exemplo.json`](./estrutura.exemplo.json)

> **Regra de ouro:** o programa **não inventa** nada — as quantidades vêm de você. O painel só
> confere o **formato** e se os **códigos de material existem** na base; não confere engenharia.

---

## Campos

| Campo | Tipo | Obrigatório | O que é |
|---|---|---|---|
| `schema_version` | número | sim | Versão do formato. Use `1`. |
| `rev` | número | sim | Revisão DESTA estrutura. **Comece em `1`. Suba +1 sempre que CORRIGIR** uma estrutura já publicada (é o que faz o cliente baixar a correção). |
| `status` | texto | sim | `"ativo"` (aparece para o cliente) ou `"descontinuado"` (some da criação, mas continua válida em orçamentos antigos). **Nunca apague** uma estrutura — descontinue. |
| `id` | texto | sim | Identificador único e permanente. Para estruturas NOVAS suas, use o prefixo **`X-`** (ex.: `X-2026-001`) para nunca colidir com as da planilha (`S...`/`R...`). **Um id nunca muda nem é reusado.** O nome do arquivo deve ser `<id>.json`. |
| `tipo` | texto | sim | Nome/rótulo da estrutura (ex.: `"U1"`, `"N3-CFu"`). |
| `condutor` | texto/null | sim | Condutor (ex.: `"2CAA"`, `"1/0CAA"`, `"N8"`) ou `null` se não se aplica. |
| `tensao_kv` | número | sim | Tensão em kV: `13.8`, `24.2` ou `34.5`. |
| `nominal_kv` | número | sim | Tensão nominal (fase-neutro). Ex.: `7.97` para 13,8 kV. |
| `fases` | número | sim | `1` (monofásico), `2` (bifásico) ou `3` (trifásico). |
| `categoria` | texto | sim | Rótulo da categoria, exatamente como aparece no programa (ex.: `"Monofásico 13,8 kV"`, `"Trifásico 34,5 kV — Rural (NDU 005)"`). |
| `poste_ref` | texto | sim | Poste de referência ao qual o `base_bom` corresponde (ex.: `"DT-10/150"`). Deve ser o `poste` do **primeiro** item de `postes[]`. |
| `base_bom` | objeto | sim | **Lista de materiais no poste de referência.** Mapa `"<código do material>": <quantidade>`. Ver abaixo. |
| `postes` | lista | sim | Variações por poste. Cada item tem `poste` (rótulo) e `delta` (diferença vs. `base_bom`). Ver abaixo. |

Campos opcionais que vêm da planilha (`sheet`, `col`) podem existir mas **não são obrigatórios**
nas suas estruturas novas.

---

## `base_bom` — a relação de materiais

É a quantidade de cada material **no poste de referência**. O **código** é o `id` numérico do
material na base do sistema (o mesmo que aparece em `materiais.json`).

```json
"base_bom": {
  "137": 1.0,     ← material 137, quantidade 1
  "150": 1.0,
  "198": 1.0,
  "201": 1.0
}
```

> ⚠️ Use **os códigos que já existem** na base. Se precisar de um material que ainda não existe,
> ele precisa ser cadastrado na base de materiais primeiro (fale comigo) — senão o painel acusa
> "material X não existe".

## `postes` — variações por poste

A maioria das estruturas serve para vários postes, mudando só alguns materiais. Em vez de repetir
a lista inteira, cada poste guarda só a **diferença** (`delta`) em relação ao `base_bom`:

```json
"postes": [
  { "poste": "DT-10/150", "delta": {} },              ← = base_bom (é o poste de referência)
  { "poste": "DT-10/300", "delta": {                  ← base_bom + estas diferenças:
      "200": 2.0,                                      ← +2 do material 200
      "202": 1.0,                                      ← +1 do material 202
      "201": -1.0                                      ← -1 do material 201
  } }
]
```

- O **primeiro** poste normalmente tem `delta: {}` e seu rótulo = `poste_ref`.
- Um valor **positivo** acrescenta, **negativo** remove (em relação ao `base_bom`).
- O programa calcula o BOM final de cada poste como `base_bom + delta`.

---

## Como o painel valida (antes de publicar)

1. **Formato**: todos os campos obrigatórios presentes e com o tipo certo.
2. **Integridade**: todo código de material citado em `base_bom`/`delta` **existe** na base.
3. **Id único**: não há outra estrutura com o mesmo `id`.
4. **Rev**: se você está corrigindo uma estrutura existente, o `rev` precisa ser **maior** que o
   publicado (senão o cliente não recebe a correção).

Se algo falhar, o painel mostra o erro e **não publica** — sua base nunca quebra para os clientes.
