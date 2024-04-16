@echo off
cd /d %~dp0

start cmd /k "cd .\landrush && python manage.py runserver"

start cmd /k "cd .\static\land-rush && npm install && npm start"