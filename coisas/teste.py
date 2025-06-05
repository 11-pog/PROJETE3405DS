from typing import Any, List, Optional, Set
import networkx as nx
import matplotlib.pyplot as plt


# oi


def find_related(G: nx.Graph, starting_point: Any, depth: int | slice = 1, set_per_layer: Optional[bool] = True) -> Set[Any] | List[Set[Any]]:
    """
    Encontra os nós relacionados a partir de um ponto inicial em um grafo, em camadas de profundidade.

    Esta função realiza uma busca por camadas (semelhante a uma BFS) em um grafo `G` a partir de um nó inicial, 
    retornando os vizinhos encontrados até a profundidade desejada.

    Parâmetros:
    ----------
    G : nx.Graph
        O grafo onde a busca será realizada.
    starting_point : Any
        O nó inicial a partir do qual a busca terá início.
    depth : int | slice, opcional
        A profundidade da busca. Pode ser um inteiro (profundidade máxima) ou um `slice(start, stop, step)` para retornar camadas específicas.
        Por padrão, busca até a primeira camada de vizinhos (depth=1).
    set_per_layer : bool, opcional
        Se `True`, retorna um `List[Set[Any]]` contendo os nós encontrados em cada camada especificada.
        Se `False`, retorna um único `List[Any]` com todos os nós encontrados, mesclando as camadas.
        Este parâmetro só afeta o retorno se `depth` for do tipo `slice`.

    Retorno:
    -------
    List[Any] | List[Set[Any]]
        - Se `depth` for um `int`, retorna um `List` com os nós da camada correspondente.
        - Se `depth` for um `slice`:
            - Retorna `List[Set[Any]]` se `set_per_layer=True`.
            - Retorna `List[Any]` com todos os nós combinados se `set_per_layer=False`.

    Exemplo:
    -------
    >>> G = nx.path_graph(5)  # G = 0-1-2-3-4
    >>> find_related(G, starting_point=0, depth=1)
    {2}

    >>> find_related(G, starting_point=0, depth=slice(0, 1))
    [{1}, {2}]
    
    >>> find_related(G, starting_point=0, depth=slice(0, 1), set_per_layer=False)
    [1, 2]
    """
   
    _max = depth if isinstance(depth, int) else depth.stop
    _found: List[Set[Any]] = [set() for _ in range(_max + 1)]
    
    def _find(n: int) -> None:
        for point in _found[n - 1]:
            _last_found = _found[max(n - 2, 0)]
            for neighbor in G.neighbors(point):
                if neighbor not in _last_found:
                    _found[n].add(neighbor)
        
        if n < _max:
            _find(n + 1)
    
    _found[0] = set([starting_point])
    _find(1)
    
    _final_depth = depth + 1 if isinstance(depth, int) else slice(depth.start + 1, depth.stop + 1, depth.step)
    _result = list(_found[_final_depth]) if set_per_layer or isinstance(depth, int) else [item for items in _found[_final_depth] for item in items]
    
    return _result


G: nx.Graph = nx.grid_2d_graph(7, 7)

'''
G.add_edge("protagas", "roberto")
G.add_edge("roberto", "falber")
G.add_edge("falber", "laiz")
G.add_edge("laiz", "jonifer")
G.add_edge("jonifer", "protagas")
G.add_edge("fabiano", "nichalas")
G.add_edge("fabiano", "protagas")
'''

found = find_related(G, (3,3), slice(0, 4), set_per_layer=True)

print("ACHADOS PELA FUNÇÃO")
print(found)

nx.draw(G, with_labels=True, node_color='skyblue', node_size=800, font_weight='bold')
plt.show()

# out: {'falber', 'laiz', 'nichalas'}