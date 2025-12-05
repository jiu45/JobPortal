//BACKEND

1.npm init -y

2.npm i express bcryptjs cors dotenv jsonwebtoken mongoose multer

3.npm i nodemon --save-dev

4.package.json:

"scripts" : { "start": "node server.js", "dev": "nodemon server.js"}


5.Run: npm run dev


6.Get JWT_SECRET:

nvm use node

node -e console.log(require('crypto').randomBytes(64).toString('hex'))
