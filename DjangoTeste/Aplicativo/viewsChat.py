# views.py
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse

import json
import openai

# Coloque sua chave da OpenAI aqui
openai.api_key = "SUA_CHAVE_OPENAI"

@method_decorator(csrf_exempt, name='dispatch')  # desativa CSRF para testes
class ChatGPTView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            mensagem = data.get('mensagem', '')

            if not mensagem:
                return JsonResponse({'erro': 'Nenhuma mensagem enviada'}, status=400)

            # Chamada para a API do ChatGPT
            resposta = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": mensagem}
                ]
            )

            conteudo_resposta = resposta['choices'][0]['message']['content']

            return JsonResponse({'resposta': conteudo_resposta})

        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=500)
