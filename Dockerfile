FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose the port Render uses
ENV PORT=3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
