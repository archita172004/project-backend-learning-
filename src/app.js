import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //url we want to allow to make req to server
    credentials: true, // if you're sending cookies/auth headers
  })
);

app.use(express.json({ limit: "16kb" })); //for getting form data

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // tells express that url will also have the data encoded ,
// extended is used to tell object inside object is also readable

app.use(express.static("public")); // stores assets like pdfs favicon etc.

app.use(cookieParser());

//routes

import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter); //after http://localhost:8000/api/v1/users  control will be passed to userRouter

export { app };
