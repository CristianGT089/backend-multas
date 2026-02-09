FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY hardhat.config.cjs ./
COPY tsconfig.json ./
COPY env.example ./.env

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src
COPY contracts ./contracts
COPY scripts ./scripts
COPY clients ./clients

# Compilar contratos (solo para tener los ABIs)
RUN npm run build:contracts

# Compilar TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]