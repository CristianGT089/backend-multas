import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Multas',
      version: '1.0.0',
      description: 'API para la gestión de multas utilizando blockchain e IPFS',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Ruta a los archivos que contienen las anotaciones de Swagger
};

export const specs = swaggerJsdoc(options); 