# Backend side of clone Beta cinema webside project

you can find fontend side here: https://github.com/PhamPhuck5/clone-beta-cinema-web-FE

## This is a project clone Beta cinema webside using: nodejs and react, it almost done just missing cash after choose combo and membership

## To run app

### Download image

you can find the image here: https://drive.google.com/drive/folders/1yq_9gwkLA04kZwea9Uype8I_TrzKVgQg?usp=sharing

### Write the .env file

download the .env.example
write the .env from the .env.example

```example
PORT=3003
NODE_ENV=test
DB_PASSWORD=yourpassword
URL_FE=http://localhost:3000
URL_BE=http://localhost:3003
REDIS_HOST=redis
REDIS_PORT=6379

FB_APP_ID=123456789
FB_APP_SECRET=yourappsecret

GMAIL_NAME=yourgmailname
GMAIL_SECRET=yourgmailsecret

ACCESS_KEY=sometextlengmorethan32
```

### Run Mysql in your device

### Run container

```bash
# 1️⃣ Import image từ file tar vào Docker local
docker load -i server-app.tar

# 2️⃣ Khởi chạy container
docker compose up
```

## To test app

you can gen sample screening by

```
npx sequelize-cli db:seed:all

```

## NOTE

Because this app don't have cashing so when you push continues the seats and combo will bought
