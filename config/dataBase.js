const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectionDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`mongodb connected with server ${data.connection.host}`);
    });
};

module.exports = connectionDatabase;
