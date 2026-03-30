FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g pnpm
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]