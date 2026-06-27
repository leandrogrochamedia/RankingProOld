#!/bin/sh
# Teste E2E da ponte Proofly (requer 002_proofly_bridge.sql rodado no Supabase)
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f config.js ]; then
  echo "ERRO: config.js ausente. cp config.example.js config.js"
  exit 1
fi

SUPABASE_URL=$(python3 -c "import re; c=open('config.js').read(); m=re.search(r\"SUPABASE_URL:\\s*'([^']+)'\", c); print(m.group(1) if m else '')")
SUPABASE_KEY=$(python3 -c "import re; c=open('config.js').read(); m=re.search(r\"SUPABASE_ANON_KEY:\\s*'([^']+)'\", c); print(m.group(1) if m else '')")

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "ERRO: não foi possível ler credenciais de config.js"
  exit 1
fi

HDR1="apikey: $SUPABASE_KEY"
HDR2="Authorization: Bearer $SUPABASE_KEY"

echo "1) Listar profissionais..."
PROF_JSON=$(curl -s "$SUPABASE_URL/rest/v1/professionals?select=id,name&order=name.asc&limit=1" -H "$HDR1" -H "$HDR2")
PROF_ID=$(echo "$PROF_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")
PROF_NAME=$(echo "$PROF_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['name'] if d else '')")
if [ -z "$PROF_ID" ]; then
  echo "FALHA: nenhum profissional"
  exit 1
fi
echo "   OK: $PROF_NAME ($PROF_ID)"

echo "2) RPC create_qr_session..."
CREATE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/create_qr_session" \
  -H "$HDR1" -H "$HDR2" -H "Content-Type: application/json" \
  -d "{\"p_professional_id\":\"$PROF_ID\",\"p_expires_hours\":2,\"p_app_base_url\":\"http://localhost:8765\"}")
STATUS=$(echo "$CREATE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','') or d.get('code','ERR'))")
if [ "$STATUS" != "success" ]; then
  echo "   FALHA: $CREATE"
  echo "   → Rode sql/002_proofly_bridge.sql no Supabase Proofly"
  exit 1
fi
TOKEN=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "   OK: token=$TOKEN"

echo "3) RPC validate_qr_token..."
VAL=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/validate_qr_token" \
  -H "$HDR1" -H "$HDR2" -H "Content-Type: application/json" \
  -d "{\"p_token\":\"$TOKEN\"}")
echo "$VAL" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('status')=='valid', d; print('   OK: valid')"

echo "4) RPC submit_qr_review (anônimo)..."
SUB=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/submit_qr_review" \
  -H "$HDR1" -H "$HDR2" -H "Content-Type: application/json" \
  -d "{\"p_token\":\"$TOKEN\",\"p_rating\":5,\"p_comment\":\"Teste ponte Magrão $(date +%H:%M)\"}")
echo "$SUB" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('status')=='success', d; print('   OK: review', d.get('review_id'))"

echo "5) Single-use (revalidate)..."
VAL2=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/validate_qr_token" \
  -H "$HDR1" -H "$HDR2" -H "Content-Type: application/json" \
  -d "{\"p_token\":\"$TOKEN\"}")
echo "$VAL2" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('status')=='used', d; print('   OK: used')"

echo "6) Perfil avg_rating..."
PROF=$(curl -s "$SUPABASE_URL/rest/v1/professionals?id=eq.$PROF_ID&select=name,avg_rating,total_reviews" -H "$HDR1" -H "$HDR2")
echo "$PROF" | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; print('   OK:', d['name'], 'avg=', d['avg_rating'], 'total=', d['total_reviews'])"

echo ""
echo "PONTE PROOFLY — teste API OK"
echo "Perfil: http://localhost:8765/p/?id=$PROF_ID"