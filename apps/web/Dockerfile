FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g pnpm
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]