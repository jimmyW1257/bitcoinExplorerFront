FROM node:18


WORKDIR /root/bitcoin-front

COPY . .

RUN npm install

RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
