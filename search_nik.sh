TOKEN_RES=$(curl -s -X POST https://api-absen.unikarta.ac.id/auth -d '{"email":"rizal.alkuja@gmail.com","password":"alkuja07"}' -H 'Content-Type: application/json')
TOKEN=$(echo $TOKEN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
# Fetch logs for April 2026
echo "LOGS FOR APRIL 2026:"
curl -s -H "Authorization: Bearer $TOKEN" https://api-absen.unikarta.ac.id/absens/byBulan/2026-04 | tr '}' '\n' | grep '624ab37385c618c486d5e416' | sed 's/.*tanggal":"\([^"]*\)".*masuk":"\([^"]*\)".*pulang":"\([^"]*\)".*statusOut":"\([^"]*\)".*/Date: \1 | In: \2 | Out: \3 | StatusOut: \4/'
