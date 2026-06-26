FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 8081
CMD ["node", "dist/index.js"]
