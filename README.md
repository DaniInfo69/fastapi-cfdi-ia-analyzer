# fastapi-cfdi-ia-analyzer
Building project


# Guía para entorno local Ubuntu / Linux
1. Preparar el sistema:

    _Bash_
    * _sudo apt update_
    * _sudo apt install python3-venv python3-pip_

2. Configurar Backend:

    _Bash_
    * _cd backend_
    * _python3 -m venv venv_
    * _source venv/bin/activate_
    * _pip install --upgrade pip_
    * _pip install -r requirements.txt_

3. Configurar Frontend:

    _Bash_
    * _cd ../frontend_
    * _npm install_

# Guía para entorno local Windows (PowerShell)
1. Configurar Backend:

    _PowerShell_
    * _cd backend_
    * _python -m venv venv_
    * _.\venv\Scripts\Activate.ps1_
    * _python -m pip install --upgrade pip_
    * _pip install -r requirements.txt_

Nota: Si recibes un error de ejecución de scripts, abre PowerShell como administrador y corre: _Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser_

3. Configurar Frontend:

    * _PowerShell_
    * _cd ..\frontend_
    * _npm install_

# Documetación:
Despues de ejecutar el contenedor ingresar este URL al navegador
* _http://localhost:8080/docs_