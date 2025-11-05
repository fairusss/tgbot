from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def api_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            passcode = data.get('passcode')
            print("Отримано JSON:", data)

            if not passcode:
                return JsonResponse({"error": "no passcode"}, status=400)

            with open("temp_passcode.txt", "w") as f:
                f.write(passcode)

            print(f"[SERVER] Passcode saved: {passcode}")
            return JsonResponse({"status": "ok", "saved": passcode})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse("WebApp працює!")
