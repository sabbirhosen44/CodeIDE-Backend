import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.listen(8080, () => {
  console.log("Server is working ");
});
