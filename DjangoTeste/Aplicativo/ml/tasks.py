from celery import shared_task
from Aplicativo.ml.clustering import cluster_publications, cluster_users


# o que precisamos também aqui nesse lugarzinho lindo:
#   - tasks que periodicamente verificam todos os usuarios e publicações
#     e veem quais tem updt_[x]_vec True, (a qual eles recalculam dito vetor)
#   - tasks que podem ser invocadas e calculam vetor pra publicação/usuario especifico

# isso é só pra eu lembrar amanha


# intervalo grande
# depende do jeitinho
# acho q uns 5 min pro comeco se pá serve
@shared_task
def cluster_all_labels():
    cluster_users()
    cluster_publications()