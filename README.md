NestJS backend scaffold for the weekly word game.

Instructions:
- copy .env.example to .env and fill DATABASE_URL and Google credentials.
- npm install
- npx prisma generate
- npx prisma migrate dev --name init
- npm run start:dev

Auth: Google OAuth via /auth/google -> callback returns token.
Socket: connect to server via socket.io client to receive 'word:new' and 'word:guessed'.
