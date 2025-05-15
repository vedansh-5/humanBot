# Node.js image from docker hub
FROM node:20-slim

# Install dependencies for Puppeteer (for headless Chrome)
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  xvfb \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libxss1 \
  fonts-liberation \
  x11-utils \
  dbus-x11 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*



# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the bot files into the container
COPY . .

ENV DISPLAY=:99

# Command to run the bot script
CMD ["xvfb-run", "--server-args=-screen 0 1920x1080x24", "node", "index.js"]