FROM node:18

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

# IMPORTANT: this copies public/, index.js, etc
COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["npm", "start"]
