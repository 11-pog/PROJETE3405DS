#!/usr/bin/env python
import os
import django
from daphne.cli import CommandLineInterface

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SiteTeste.settings')
    django.setup()
    
    # Roda Daphne com suporte a WebSocket
    cli = CommandLineInterface()
    cli.run(['-b', '0.0.0.0', '-p', '8000', 'SiteTeste.asgi:application'])