import requests
from rest_framework.views import APIView
from rest_framework.response import Response


class ISBNLookup(APIView):
    def get(self, request):
        isbn = request.query_params.get('isbn')
        
        url = f"https://openlibrary.org/isbn/{isbn}.json" #link correto
        resposta = requests.get(url)
        
        if resposta.status_code != 200:
            return Response({"error": "Erro ao consultar a API externa"}, status=resposta.status_code)
        
        dados = resposta.json()
        if not dados:
            return Response({"error": "Livro não encontrado"}, status=404)
        
        livro = dados
        
        authors = livro.get("authors", [])
        if authors:
            author_names = []
            for a in authors:
                key = a.get("key")
                if key:
                    resp = requests.get(f"https://openlibrary.org{key}.json")
                    if resp.status_code == 200:
                        author_names.append(resp.json().get("name", "Não encontrado"))
        else:
            author_names = ["Autor desconhecido"]
            
        desc = livro.get("description")
        if isinstance(desc, dict):
            desc = desc.get("value", "Descrição não disponível")
        elif isinstance(desc, str):
            desc = desc
        else:
            desc = "Descrição não disponível"
        
        return Response({
            "title": livro.get("title", "Título não encontrado"),
            "author": ', '.join(author_names),
            "publisher": livro.get("publishers", ["Editora desconhecida"])[0],
            "year": livro.get("publish_date", "Ano desconhecido"),
            "description": desc, 
        }, status=200)