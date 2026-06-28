#!/usr/bin/env bash
# Future Jaano API — complete curl command reference
# Usage: export TOKEN="your-clerk-jwt" && bash CURL_COMMANDS.sh

BASE="${BASE:-https://api.futurejaano.com}"
TOKEN="${TOKEN:-YOUR_CLERK_JWT_TOKEN}"
AUTH=(-H "Authorization: Bearer $TOKEN")
JSON=(-H "Content-Type: application/json")

echo "=== Future Jaano API Curl Reference ==="
echo "BASE: $BASE"
echo ""

# ─── Health & Debug ───────────────────────────────────────────────────────────
echo "### HEALTH & DEBUG ###"
echo ""
echo "# Root"
echo "curl '$BASE/'"
echo ""
echo "# Liveness"
echo "curl '$BASE/health'"
echo "curl '$BASE/health/live'"
echo ""
echo "# Readiness (checks DB + env)"
echo "curl '$BASE/health/ready'"
echo ""
echo "# API-level health"
echo "curl '$BASE/api/health'"
echo "curl '$BASE/api/status'"
echo "curl '$BASE/api/healthz'"
echo ""
echo "# Debug endpoints"
echo "curl '$BASE/debug/env'"
echo "curl '$BASE/debug/routes'"
echo "curl '$BASE/debug/db'"
echo "curl '$BASE/debug/version'"
echo ""
echo "# Swagger docs"
echo "curl '$BASE/docs/openapi.json'"
echo ""

# ─── Horoscope ────────────────────────────────────────────────────────────────
echo "### HOROSCOPE ###"
echo ""
echo "curl '$BASE/api/horoscope/signs'"
echo "curl '$BASE/api/horoscope/daily/aries?language=en'"
echo "curl '$BASE/api/horoscope/daily/aries?language=hi'"
echo "curl '$BASE/api/horoscope/weekly/aries?language=en'"
echo "curl '$BASE/api/horoscope?sign=aries&language=en'"
echo "curl '$BASE/api/horoscope/aries'"
echo ""

# ─── Panchang ─────────────────────────────────────────────────────────────────
echo "### PANCHANG ###"
echo ""
echo "curl '$BASE/api/panchang'"
echo "curl '$BASE/api/panchang?date=2026-06-28&language=en'"
echo ""

# ─── Gochar ──────────────────────────────────────────────────────────────────
echo "### GOCHAR ###"
echo ""
echo "curl '$BASE/api/gochar?language=en'"
echo ""

# ─── Kundli ───────────────────────────────────────────────────────────────────
echo "### KUNDLI (auth required) ###"
echo ""
echo "curl -X POST '$BASE/api/kundli' \\"
echo "  \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"name\":\"Rahul\",\"dateOfBirth\":\"1990-05-15\",\"timeOfBirth\":\"10:30\",\"placeOfBirth\":\"Mumbai\",\"language\":\"en\"}'"
echo ""
echo "curl '$BASE/api/kundli/my' \"\${AUTH[@]}\""
echo "curl '$BASE/api/kundli/1' \"\${AUTH[@]}\""
echo ""

# ─── Kundli Milan ─────────────────────────────────────────────────────────────
echo "### KUNDLI MILAN ###"
echo ""
echo "curl -X POST '$BASE/api/kundli-milan' \\"
echo "  \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"person1\":{\"name\":\"Rahul\",\"dateOfBirth\":\"1990-05-15\",\"placeOfBirth\":\"Mumbai\"},\"person2\":{\"name\":\"Priya\",\"dateOfBirth\":\"1992-08-20\",\"placeOfBirth\":\"Delhi\"},\"language\":\"en\"}'"
echo ""

# ─── Numerology ───────────────────────────────────────────────────────────────
echo "### NUMEROLOGY ###"
echo ""
echo "curl -X POST '$BASE/api/numerology' \\"
echo "  \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"fullName\":\"Rahul Sharma\",\"dateOfBirth\":\"1990-05-15\",\"language\":\"en\"}'"
echo "curl '$BASE/api/numerology/1' \"\${AUTH[@]}\""
echo ""

# ─── Yoga ─────────────────────────────────────────────────────────────────────
echo "### YOGA ###"
echo ""
echo "curl -X POST '$BASE/api/yoga/suggestions' \\"
echo "  \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"healthGoals\":\"stress relief\",\"fitnessLevel\":\"beginner\",\"language\":\"en\"}'"
echo "curl '$BASE/api/yoga/plans/my' \"\${AUTH[@]}\""
echo ""

# ─── Image Analysis ───────────────────────────────────────────────────────────
echo "### VASTU / PALM / FACE ANALYSIS ###"
echo ""
echo "curl -X POST '$BASE/api/vastu/analyze' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"imageBase64\":\"BASE64_STRING\",\"roomType\":\"living_room\",\"language\":\"en\"}'"
echo "curl '$BASE/api/vastu/1' \"\${AUTH[@]}\""
echo ""
echo "curl -X POST '$BASE/api/palm/analyze' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"imageBase64\":\"BASE64_STRING\",\"language\":\"en\"}'"
echo "curl '$BASE/api/palm/1' \"\${AUTH[@]}\""
echo ""
echo "curl -X POST '$BASE/api/face/analyze' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"imageBase64\":\"BASE64_STRING\",\"language\":\"en\"}'"
echo "curl '$BASE/api/face/1' \"\${AUTH[@]}\""
echo ""

# ─── Problem Solver ───────────────────────────────────────────────────────────
echo "### PROBLEM SOLVER ###"
echo ""
echo "curl -X POST '$BASE/api/problems' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"description\":\"Financial difficulties\",\"category\":\"finance\",\"language\":\"en\"}'"
echo "curl '$BASE/api/problems/my' \"\${AUTH[@]}\""
echo "curl '$BASE/api/problems/1' \"\${AUTH[@]}\""
echo ""

# ─── Dasha / Muhurat / Ashtakavarga ──────────────────────────────────────────
echo "### DASHA / MUHURAT / ASHTAKAVARGA ###"
echo ""
echo "curl -X POST '$BASE/api/dasha' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"dateOfBirth\":\"1990-05-15\",\"timeOfBirth\":\"10:30\",\"placeOfBirth\":\"Mumbai\",\"language\":\"en\"}'"
echo ""
echo "curl -X POST '$BASE/api/muhurat' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"date\":\"2026-07-01\",\"purpose\":\"marriage\",\"location\":\"Mumbai\",\"language\":\"en\"}'"
echo ""
echo "curl -X POST '$BASE/api/ashtakavarga' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"dateOfBirth\":\"1990-05-15\",\"timeOfBirth\":\"10:30\",\"placeOfBirth\":\"Mumbai\",\"language\":\"en\"}'"
echo ""

# ─── Users ────────────────────────────────────────────────────────────────────
echo "### USERS ###"
echo ""
echo "curl '$BASE/api/users/me' \"\${AUTH[@]}\""
echo "curl -X PATCH '$BASE/api/users/me' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"name\":\"Rahul Sharma\",\"zodiacSign\":\"aries\",\"language\":\"hi\"}'"
echo "curl '$BASE/api/users/me/dashboard' \"\${AUTH[@]}\""
echo "curl '$BASE/api/users/me/readings' \"\${AUTH[@]}\""
echo ""

# ─── Notifications ────────────────────────────────────────────────────────────
echo "### NOTIFICATIONS ###"
echo ""
echo "curl '$BASE/api/notifications' \"\${AUTH[@]}\""
echo "curl -X PATCH '$BASE/api/notifications/1/read' \"\${AUTH[@]}\""
echo ""

# ─── Push ─────────────────────────────────────────────────────────────────────
echo "### PUSH NOTIFICATIONS ###"
echo ""
echo "curl '$BASE/api/push/vapid-public-key'"
echo "curl '$BASE/api/push/vapid-key'"
echo "curl '$BASE/api/push/preferences' \"\${AUTH[@]}\""
echo "curl -X POST '$BASE/api/push/test' \"\${AUTH[@]}\""
echo ""

# ─── Subscriptions & Payments ─────────────────────────────────────────────────
echo "### SUBSCRIPTIONS & PAYMENTS ###"
echo ""
echo "curl '$BASE/api/subscriptions/plans'"
echo "curl '$BASE/api/subscriptions/my' \"\${AUTH[@]}\""
echo "curl -X POST '$BASE/api/payments/initiate' \"\${AUTH[@]}\" \"\${JSON[@]}\" -d '{\"planId\":1}'"
echo "curl -X POST '$BASE/api/payments/verify' \"\${AUTH[@]}\" \"\${JSON[@]}\" \\"
echo "  -d '{\"razorpayOrderId\":\"order_xxx\",\"razorpayPaymentId\":\"pay_xxx\",\"razorpaySignature\":\"sig\"}'"
echo "curl '$BASE/api/payments/history' \"\${AUTH[@]}\""
echo ""

# ─── Blog ─────────────────────────────────────────────────────────────────────
echo "### BLOG ###"
echo ""
echo "curl '$BASE/api/blog/posts?language=en&page=1&limit=10'"
echo "curl '$BASE/api/blog/posts/trending'"
echo "curl '$BASE/api/blog/posts/my-first-post'"
echo ""

# ─── Admin ────────────────────────────────────────────────────────────────────
echo "### ADMIN (admin JWT required) ###"
echo ""
echo "curl '$BASE/api/admin/stats' \"\${AUTH[@]}\""
echo "curl '$BASE/api/admin/users?page=1&limit=20' \"\${AUTH[@]}\""
echo "curl '$BASE/api/admin/readings/recent' \"\${AUTH[@]}\""
echo "curl '$BASE/api/admin/revenue' \"\${AUTH[@]}\""
