from math import inf
from typing import Any, List, Optional, Set
import networkx as nx

from networkx.classes.function import density

def find_related(G: nx.Graph, starting_point: Any, start: int, stop: Optional[int] = None) -> Set[Any]:
    _found: Set[Any] = set()

    def __find(point: Any, n: int) -> None:
        __in_slice = n >= start and (stop is None or (stop is not None and n < stop))
        __continue = (stop is not None and n < stop - 1) or (stop is None and n < start)
        
        for neighbor in G.neighbors(point):
            if neighbor != starting_point:
                if __in_slice:
                    _found.add(neighbor)
                
                if __continue:
                    __find(neighbor, n + 1)
                    
    __find(starting_point, 0)
    return _found

G: nx.Graph = nx.Graph()

G.add_edge("Protagonista", "roberto")
G.add_edge("roberto", "laiz")
G.add_edge("laiz", "fabiano")
G.add_edge("fabiano", "nichalas")


jonas = find_related(G, "laiz", 1)