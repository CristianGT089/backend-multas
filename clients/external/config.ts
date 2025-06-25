import dotenv from 'dotenv';
dotenv.config();

export const externalApiConfig = {
  simit: {
    baseUrl: process.env.SIMIT_API_BASE_URL!,
    apiKey: process.env.SIMIT_API_KEY,
    timeout: 10000, // 10 segundos
    retries: 2,
  },
  // Otras APIs externas pueden ser agregadas aquí
};

// Las APIs externas son opcionales, no lanzamos error si no están configuradas 