// In src/index.js
const express = require("express");
const routes = require("./v1/routes"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Mount the imported router on the desired path (usually "/")
app.all("/", routes);

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
