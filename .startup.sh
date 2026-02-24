#!/bin/bash
gunicorn --bind=0.0.0.0 --workers=4 flask_app:app
