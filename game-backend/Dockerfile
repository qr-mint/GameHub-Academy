FROM node:21.1.0

RUN mkdir /core

WORKDIR /core
# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
# Run npm start script when container starts
CMD [ "npm", "start" ]
