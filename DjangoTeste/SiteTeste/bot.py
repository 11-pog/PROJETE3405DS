from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import openai

openai.api_key = "SUA_CHAVE_DA_OPENAI"

@csrf_exempt
def chat_with_gpt(request):
    if request.method == "POST":
        body = json.loads(request.body)
        user_message = body.get("mensagem", "")

        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um assistente útil sobre troca de livros."},
                {"role": "user", "content": user_message}
            ]
        )

        reply = completion.choices[0].message["content"]
        return JsonResponse({"response": reply})



# É DO PEDROOOOO, FICA SAFE ;) 