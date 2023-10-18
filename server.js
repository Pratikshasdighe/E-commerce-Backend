const app = require("./app");
const cors_proxy = require("cors-anywhere");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectionDatabase = require("./config/dataBase");

// uncaught exception handling

process.on("uncaughtException", (err) => {
  console.log(`error:${err.message}`);
  console.log("Shutting down the server due to uncaught exception");

  process.exit(1);
});

//config

dotenv.config({ path: "./config/config.env" });

//connection to database
connectionDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUNDINARY_API_SECRET,
});

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
});
// const server = app.listen(process.env.DB_URI, () => {
//   console.log(`server is working on ${process.env.DB_URI} `);
// });

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working on port ${process.env.PORT}`);
});

// unhandled promise rejection
// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`error:${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection ");
  server.close(() => {
    process.exit(1);
  });
});
