from typing import Any, Iterable, List, Set
import networkx as nx


# oi


def find_related(G: nx.Graph, starting_point: Any, depth: int | slice = 1) -> Set[Any] | List[Set[Any]]:
    _max = depth + 1 if isinstance(depth, int) else depth.stop
    _found: List[Set[Any]] = [set() for _ in range(_max)]
    
    def __find(points: Iterable[Any], n: int) -> None:
        __continue: bool = n < _max - 1
        
        for point in points:
            for neighbor in G.neighbors(point):
                if all(neighbor not in s for s in _found[:n + 1]) and neighbor != starting_point:
                    _found[n].add(neighbor)
        
        if __continue:
            __find(_found[n], n + 1)
    
    __find([starting_point], 0)
    return _found[depth]


G: nx.Graph = nx.Graph()

G.add_edge("protagas", "roberto")
G.add_edge("roberto", "falber")
G.add_edge("falber", "laiz")
G.add_edge("laiz", "jonifer")
G.add_edge("jonifer", "protagas")
G.add_edge("fabiano", "nichalas")
G.add_edge("fabiano", "protagas")


found = find_related(G, "protagas", 1)
print(found)
# out: {'falber', 'laiz', 'nichalas'}