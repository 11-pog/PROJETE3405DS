import requests
from rest_framework.views import APIView
from rest_framework.response import Response


class Buscadelivro(APIView):
    def get(self, request):
            return Response({"error": "ISBN não fornecido"}, status=400)
    
    
    def post(self, request):
        isbn = request.data.get('isbn')
        url = f"https://openlibrary.org/isbn/{isbn}.json" #link correto
        resposta = requests.get(url)
        
        if resposta.status_code != 200:
            return Response({"error": "Erro ao consultar a API externa"}, status=500)
        
        dados = resposta.json()
        if not dados:
            return Response({"error": "Livro não encontrado"}, status=404)
        
        livro = dados["docs"][0]
        
        authors = livro.get("authors", [])
        if authors:
            autorkey = authors[0].get("key", None)
            
            if autorkey:
                url_autor = f"https://openlibrary.org{autorkey}.json"
                resposta_autor = requests.get(url_autor)
                
                if resposta_autor.status_code == 200:
                        autor = resposta_autor.json().get("name", "Não encontrado")
        
        resultado = {
            "titulo": livro.get("title", "Título não encontrado"),
            "autor(a)": livro.get("authors []"), #outro URL
            "editor(a)": livro.get("publishers", ["Editora desconhecida"])[0],
            "ano_publicacao": livro.get("publish_date", "Ano desconhecido"),
            "Descricao": livro.get("value", "Descrição não disponível"), 
        }
        
        return Response(resultado, status=200)