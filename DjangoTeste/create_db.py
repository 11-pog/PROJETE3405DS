import os
import django
from psycopg2 import connect, sql

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SiteTeste.settings")
django.setup()

from django.conf import settings

db_conf = settings.DATABASES['default']


conn = connect(
    dbname='postgres',
    user=db_conf['USER'],
    password=db_conf['PASSWORD'],
    host=db_conf['HOST'],
    port=db_conf['PORT']
)
conn.autocommit = True
cur = conn.cursor()


cur.execute(sql.SQL("CREATE DATABASE {}").format(
    sql.Identifier(db_conf['NAME'])
))


cur.execute(sql.SQL("CREATE USER {} WITH PASSWORD %s").format(
    sql.Identifier(db_conf['USER'])
), [db_conf['PASSWORD']])


cur.execute(sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {}").format(
    sql.Identifier(db_conf['NAME']),
    sql.Identifier(db_conf['USER'])
))

cur.close()
conn.close()

print("Database and user created using settings.py configs!")
