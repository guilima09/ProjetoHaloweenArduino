// Configuração da aplicação Express.
// Separar app.js de server.js é uma BOA PRÁTICA da indústria:
// permite rodar testes automatizados da API sem precisar abrir portas de rede!

const path = require('path');
const express = require('express');
const env = require('./config/env');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger.json');

const app = express();

// 1. Middleware para ler JSON no corpo das requisições (req.body)
app.use(express.json());

// 2. Middleware customizado para registrar logs no terminal
app.use(logger);

// 3. Servir arquivos estáticos da pasta FrontEnd (HTML, CSS, JS do site)
app.use(express.static(env.FRONTEND_PATH));

// 4. Rota para fornecer a especificação do Swagger em JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// 5. Interface gráfica do Swagger UI (abre direto em /swagger)
app.get('/swagger', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Swagger UI - API Boneco de Vodu</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; padding: 0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: '/api-docs/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ]
          });
        };
      </script>
    </body>
    </html>
  `);
});

// 6. Registrar as rotas da nossa API com o prefixo /api
app.use('/api', routes);

// 7. Middleware de erro (deve ser SEMPRE o último a ser registrado!)
app.use(errorHandler);

module.exports = app;
