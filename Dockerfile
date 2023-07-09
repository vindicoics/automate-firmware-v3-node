FROM node
ENV NODE_ENV=production

# RUN apt-get update && apt-get install -y \
#     build-essential \
#     # other dependencies here
#     && rm -rf /var/lib/apt/lists/*

# RUN apt-get install -y coreutils

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

COPY 8mosind-rpi /app/8mosind-rpi

COPY public /app/public

WORKDIR /app/8mosind-rpi
RUN make install

WORKDIR /app
RUN npm install --production 

COPY . .

CMD [ "node", "index.js" ] 

