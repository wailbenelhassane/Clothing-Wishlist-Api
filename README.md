# Clothing Wishlist — Monorepo (Attached + Detached)

API y utilidades para gestionar una wishlist de prendas de ropa. El repo contiene:
- attached: API Express (acoplada) para ejecutar en contenedor
- detached: Handlers AWS Lambda (desacoplada) invocados vía API Gateway.
- web: Frontend estático de ejemplo.
- postman: Colección para probar endpoints.
- scripts: Scripts PowerShell de apoyo.

## Stack
- Node.js 20, Express (attached)
- AWS SDK v3, DynamoDB
- AWS Lambda base image (Node 20) para detached

## Estructura
- `attached/`
  - `src/`
    - `app.js`
    - `config/`
    - `interfaces/` (repositorio DynamoDB y contrato)
    - `modules/`
      - `clothing/`
        - `routes.js`
        - `controller.js`
        - `model.js`
- `detached/`
  - `src/`
    - `lambdaDispatcher.js` (entrypoint de Lambda)
    - `modules/`
      - `clothing/`
        - `repository.js`
        - `validation.js`
        - `handlers/`
          - `create.js`, `list.js`, `get.js`, `update.js`, `delete.js`, `options.js`
  - `yamls/`
    - `ecr.yml`, `lambda.yml` (CloudFormation)
- `web/` (index.html, app.js, styles.css)
- `postman/` (clothing-api.postman_collection.json)
- `scripts/` (variables.ps1, create-image.ps1)

## Variables de entorno (comunes)
- `PORT` / `APP_PORT`: Puerto de la API (por defecto 8080 en attached)
- `HOST`: Host de escucha (por defecto 0.0.0.0)
- `CORS_ORIGIN`: Origen permitido (por defecto *)
- `DYNAMODB_REGION`: Región AWS (por defecto us-east-1)
- `DYNAMODB_TABLE` / `CLOTHING_TABLE`: Nombre de la tabla (por defecto clothing_items)
- `DYNAMODB_ENDPOINT`: Endpoint para DynamoDB local (p.ej. http://localhost:8000)

## Backend acoplado: attached (Express)
1) Instalar y arrancar
- `cd attached`
- `npm install`
- `set DYNAMODB_REGION=us-east-1`
- `set DYNAMODB_TABLE=clothing_items`
- `npm start`
- Servicio: `http://localhost:8080`

2) Endpoints
- `GET /health` — estado
- `GET /clothing` — lista (query: `page`, `limit`, `brand` opcional)
- `POST /clothing` — crea
- `GET /clothing/:id` — obtiene
- `PUT /clothing/:id` — actualiza
- `DELETE /clothing/:id` — elimina

Ejemplo POST body
```
{
  "name": "Chaqueta de cuero",
  "brand": "Zara",
  "size": "M",
  "color": "Negro",
  "price": 79.99,
  "wishlist": true,
  "notes": "Disponible en tienda online"
}
```

3) Docker (opcional)
```
docker build -t clothing-attached attached
docker run --rm -p 8080:8080 ^
  -e DYNAMODB_REGION=us-east-1 ^
  -e DYNAMODB_TABLE=clothing_items ^
  clothing-attached
```

## Backend desacoplado: detached (Lambda)
La imagen contiene todos los handlers y usa un dispatcher (`lambdaDispatcher.js`) que selecciona el handler según `HANDLER_NAME`.

1) Construir imagen
```
cd detached
docker build -t clothing-lambda .
```

2) Probar localmente (RIE)
- La imagen base de Lambda expone el Runtime Interface Emulator en 8080.
```
docker run --rm -p 9000:8080 -e HANDLER_NAME=list clothing-lambda
# Invocar un evento HTTP al RIE
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```
- Cambia `HANDLER_NAME` a: `create`, `list`, `get`, `update`, `delete`, `options`.

3) Despliegue (resumen)
- ECR: `detached/yamls/ecr.yml`
- Lambdas + API Gateway: `detached/yamls/lambda.yml`
- Publica la imagen en ECR (usa `scripts/create-image.ps1` o tu pipeline) y ajusta `ImageUri` en las plantillas si aplica.

## Postman
- Importa `postman/clothing-api.postman_collection.json`.
- Variables: `{{baseUrl}}` (http://localhost:8080), `{{apiKey}}` (opcional).
- Ejecuta “Create Clothing” primero para guardar `{{clothingId}}`.

## Scripts
- `scripts/variables.ps1`: configura credenciales AWS para tu sesión (no subas secretos reales).
- `scripts/create-image.ps1`: construye y publica en ECR una imagen (ajusta ECR y región).

## Frontend (web)
- Archivos estáticos en `web/`.
- Ajusta el endpoint API en `web/app.js` si necesitas apuntar a otra URL.
