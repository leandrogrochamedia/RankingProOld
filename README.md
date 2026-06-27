# Ranking Pro — Núcleo (Ponte Proofly)

Infraestrutura de reputação verificada via QR Code. Escopo: **QR → avaliação anônima → perfil público**.

## Stack

- HTML estático + JavaScript vanilla
- Supabase Proofly (`pyywdhjstvhmarvzijji`) — REST + RPC
- Dev local: `python3 -m http.server 8765` (sem Netlify nesta fase)

## Estrutura

```
ranking-pro-shark/
├── qr/           → /qr/?token=XXX (canônico; legado index.html?token= redireciona)
├── avaliar/      → formulário nota + comentário (sem login)
├── p/            → perfil público /p/?id=UUID
├── dev/          → gerador de QR (dev)
├── js/           → api, qr, reviews, profile services
├── sql/
│   ├── 001_nucleo.sql      → referência (NÃO rodar no Proofly)
│   └── 002_proofly_bridge.sql → RPCs + used_at (rodar no Proofly)
└── config.js     → credenciais MVP (gitignored)
```

## Setup local

### 1. SQL no Supabase Proofly

No SQL Editor do projeto `pyywdhjstvhmarvzijji`, execute **`sql/002_proofly_bridge.sql`**.

Não rode `001_nucleo.sql` no banco Proofly.

### 2. Config

```bash
cp config.example.js config.js
```

Use a mesma **Project URL** e **anon key** do MVP (`MVP Hanking PRO/config.js`).

### 3. Servidor

```bash
cd ranking-pro-shark
python3 -m http.server 8765
```

Abra `http://localhost:8765`

## Fluxo de teste

1. `http://localhost:8765/dev/gerar-qr.html` — lista profissionais reais do Proofly
2. Gerar QR → URL canônica `/qr/?token=...`
3. Abrir URL → redireciona `/avaliar/` → nota + comentário (**sem login**)
4. `/p/?id=UUID` — avaliação verificada + `avg_rating` atualizado
5. Reabrir mesmo QR → bloqueado (`used_at` + RPC)
6. Forçar `expires_at` no passado em `qr_codes` → bloqueado

## Decisões Shark (ponte)

| Tema | Valor |
|------|-------|
| Banco | Supabase Proofly (mesmo do MVP) |
| Avaliação QR | Anônima via RPC (`user_id` NULL) |
| Perfil | `/p/?id=UUID` |
| QR canônico | `/qr/?token=`; legado `?token=` na home redireciona |
| Single-use | RPC + coluna `used_at` em `qr_codes` |
| Expiração novos QRs | 2 horas |

## RPCs

| Função | Uso |
|--------|------|
| `validate_qr_token(token)` | Valida antes de avaliar |
| `submit_qr_review(token, rating, comment)` | INSERT anônimo em `reviews` |
| `create_qr_session(professional_id, hours, app_base_url)` | Gera `qr_codes` (dev) |

Agregação de nota: trigger existente `recalc_prof_talent_metrics` → `avg_rating`.

## Fase 2 — Entrada + Auth + Seletor

| Tela | Rota |
|------|------|
| Landing | `index.html` — Entrar · Escanear QR · Buscar |
| Login | `login.html` — Google fake (Leandro Rocha) |
| Seletor multi-perfil | `selecionar-perfil.html` |
| Stubs | `cliente.html`, `dashboard-profissional.html`, `dashboard-estabelecimento.html` |

Sessão: `sessionStorage.proofly_session` via `js/session.js`.

Scripts core: `js/loader.js` → `session.js`, `profile-selector.js`, `flow-registry.js`, `user-service.js`.

## Fora do escopo (Fase 3+)

`cliente.js` completo (busca + drawer), `menu.js` dock, onboarding completo, slug/Página de Reputação, Asaas.