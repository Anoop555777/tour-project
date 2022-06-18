const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION: ');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((connect) => console.log('DataBase connected successfully'));

//4 router listening
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('app running on port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLE REJECTION');
  server.close(() => {
    process.exit(1);
  });
  console.log(err.name, err.message);
});
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
