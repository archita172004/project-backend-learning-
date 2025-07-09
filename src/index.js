// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});

//after connecting to database we will listen to the return promise using then and catch
//

connectDB()
  .then(() => {
    //listning to the app on port 8000
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running in port ${process.env.PORT}`);
    });
    app.on("error", (error) => {
      console.log("Not able to connect to database", error);
    });
    throw error;
  })
  .catch((err) => {
    console.log("mongo db connection failed", err);
  });

/*
import express from "express";
const app = express();
import {DB_NAME} from "./constants"
;(async () => {
  try {
    await mongoose.connect(`$process.env.MONGODB_URI`);
    app.on("error", (error) => {
      console.log("not able to talk to database", error);
      throw error;
    }); 
 
    app.listen(process.env.PORT, () => {
      console.log(`App listening on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Error: ", error);
    throw err;
  }
})(); //IIFE
*/
