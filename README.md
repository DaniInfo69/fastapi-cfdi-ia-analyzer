# fastapi-cfdi-ia-analyzer
Este proyecto se encuentra en desarrollo

## Guía para ejecutar
No es necesario configurar el entorno local para poder usar el programa; basta con seguir estos sencillos pasos:

### 1. Preparar archivo `.env`

En la carpeta raíz se encuentra un archivo llamado **`.env.example`**. Cambia el nombre de este archivo a **`.env`**, ábrelo y sustituye el valor por tu API Key de OpenAI en el campo `OPENAI_API_KEY=`.
    
ejemplo:
    ```
    # Antes
    * OPENAI_API_KEY=your_openai_api_key_here


    # Despues
    * OPENAI_API_KEY=132581295fag125iuy1ba9128457keya2

### 2. Iniciar contenedores

**NOTA:** Es importante asegurarse de tener instalado y configurado Docker (ya sea para Windows o para Linux) antes de ejecutar los siguientes comandos.
    ```
    * docker compose up --build

### 3. Acceder al frontend
    * En el navegador de tu preferencia, escribe o pega la siguiente URL: http://localhost:3000/
    * Para poder ingresar por primera vez como administrador, introduce las siguientes credenciales en el formulario de inicio de sesión:
     ```
    Usuario: usuarioAdmin
    Contraseña: admin123

## Documetación de la API:
Después de ejecutar el contenedor, puedes ingresar a esta URL en el navegador para ver la documentación interactiva:
* _http://localhost:8080/docs_

## Guía para entorno local Ubuntu / Linux
### 1. Preparar el sistema:
    
    ```
    * sudo apt update
    * sudo apt install python3-venv python3-pip

### 2. Configurar Backend:
    
    ```
    * cd backend_
    * python3 -m venv venv
    * source venv/bin/activate
    * pip install --upgrade pip
    * pip install -r requirements.txt

### 3. Configurar Frontend:
    
    ```
    * cd ../frontend
    * npm install

## Guía para entorno local Windows (PowerShell)
### 1. Configurar Backend:
    
    ```
    * cd backend
    * python -m venv venv
    * .\venv\Scripts\Activate.ps1
    * python -m pip install --upgrade pip
    * pip install -r requirements.txt

**Nota**: Si recibes un error de ejecución de scripts de políticas de seguridad, abre PowerShell como Administrador y ejecuta el siguiente comando antes de activar el entorno:
    
    ```
    * Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

### 2. Configurar Frontend:
    ```
    * cd ..\frontend
    * npm install
