from typing import Any, Iterable, List, Set
import networkx as nx
import matplotlib.pyplot as plt


# oi


def find_related(G: nx.Graph, starting_point: Any, depth: int | slice = 1) -> Set[Any] | List[Set[Any]]:
    _max = depth + 1 if isinstance(depth, int) else depth.stop
    _found: List[Set[Any]] = [set() for _ in range(_max)]
    
    def __find(n: int) -> None:
        for point in _found[n - 1]:
            for neighbor in G.neighbors(point):
                if all(neighbor not in s for s in _found[:n + 1]) and neighbor != starting_point:
                    _found[n].add(neighbor)
        
        if n < _max - 1:
            __find(n + 1)
    
    _found[0] = set(G.neighbors(starting_point))
    __find(1)
    return _found[depth]


G: nx.Graph = nx.erdos_renyi_graph(n=15, p=0.35)

'''
G.add_edge("protagas", "roberto")
G.add_edge("roberto", "falber")
G.add_edge("falber", "laiz")
G.add_edge("laiz", "jonifer")
G.add_edge("jonifer", "protagas")
G.add_edge("fabiano", "nichalas")
G.add_edge("fabiano", "protagas")
'''

found = find_related(G, 7, slice(1, 4))

print("ACHADOS PELA FUNÇÃO")
print(found)


nx.draw(G, with_labels=True, node_color='skyblue', node_size=800, font_weight='bold')
plt.show()

# out: {'falber', 'laiz', 'nichalas'}