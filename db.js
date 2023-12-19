/** Database setup for BizTime. */
const {Client} = require("pg");

const client = new Client({
  connectionString: "postgresql:///biztime"
});

client.connect();

// let DB_URI;

// if (process.env.NODE_ENV === "test") {
//     DB_URI = "postgresql:///biztime_test";(DB deleted)
//   } else {
//     DB_URI = "postgresql:///biztime";
//   }

//   let db = new Client({
//     connectionString: DB_URI
//   });
  
//   db.connect();
  
//   module.exports = db;

  module.exports = client;