import express from "express";
import { connectDB } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();


// app.use(
//   cors({
//     origin: "http://localhost:5173", 
//     credentials: false, 
//   })
// );


app.listen(PORT, () => {
    connectDB();
    console.log("Server Started at http://localhost:" + PORT);
  });
  