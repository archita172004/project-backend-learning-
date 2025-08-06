import mongoose from "mongoose";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoById } from "../controllers/video.controller";

const router = Router();

router.use(verifyJWT);
