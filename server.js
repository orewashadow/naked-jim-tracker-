const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// serve static files if you have any (optional)
app.use(express.static("public"));

// homepage route
app.get("/", (req, res) => {
  res.send("App is running!");
});

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
