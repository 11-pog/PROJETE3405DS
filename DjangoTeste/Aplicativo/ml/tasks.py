from celery import shared_task
from Aplicativo.ml.clustering import cluster_publications, cluster_users, update_cluster_interaction_matrix
from Aplicativo.models.user_models import Usuario
from Aplicativo.models.publication_models import Publication
from Aplicativo.ml.vector.shared import build_full_vec
from Aplicativo.ml.vector.user_vector import get_user_feature_vec, get_user_vector, get_user_text_vector
from Aplicativo.ml.vector.pub_vector import get_publication_feature_vec, get_publication_text_vec, get_publication_vector


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
    update_cluster_interaction_matrix()



@shared_task
def update_pending_vectors():
    users_feat = Usuario.objects.filter(updt_feat_vec=True)
    users_text = Usuario.objects.filter(updt_text_vec=True)
    
    for user in users_text:
        text_vec = get_user_text_vector(user)
        full_vec = build_full_vec(user, text=text_vec)
        
        user.description_embedding = text_vec
        user.full_vector = full_vec
        
        user.updt_text_vec = False
        user.save()
    
    for user in users_feat:
        feat_vec = get_user_feature_vec(user)
        full_vec = build_full_vec(user, feat=feat_vec)
        
        user.features_embedding = feat_vec
        user.full_vector = full_vec
        
        user.updt_feat_vec = False
        user.save()
    
    # Publications que precisam de update
    pubs_feat = Publication.objects.filter(updt_feat_vec=True)
    pubs_text = Publication.objects.filter(updt_text_vec=True)
    
    for pub in pubs_text:
        text_vec = get_publication_text_vec(pub)
        full_vec = build_full_vec(pub, text=text_vec)
        
        pub.description_embedding = text_vec
        pub.full_vector = full_vec
        
        pub.updt_text_vec = False
        pub.save()
    
    for pub in pubs_feat:
        feat_vec = get_publication_feature_vec(pub)
        full_vec = build_full_vec(pub, text=text_vec)
        
        pub.description_embedding = text_vec
        pub.full_vector = full_vec
        
        pub.updt_text_vec = False
        pub.save()


@shared_task
def update_user_vector(user_id):
    user = Usuario.objects.get(id=user_id)
    feat_vec, text_vec, full_vec = get_user_vector(user)
    user.features_embedding = feat_vec
    user.description_embedding = text_vec
    user.full_vector = full_vec
    user.updt_feat_vec = False
    user.updt_text_vec = False
    user.save()


@shared_task
def update_publication_vector(pub_id):
    pub = Publication.objects.get(id=pub_id)
    feat_vec, text_vec, full_vec = get_publication_vector(pub)
    pub.features_embedding = feat_vec
    pub.description_embedding = text_vec
    pub.full_vector = full_vec
    pub.updt_feat_vec = False
    pub.updt_text_vec = False
    pub.save()


@shared_task
def debug_task(): # Teste
    print(f'Teste: aoba')