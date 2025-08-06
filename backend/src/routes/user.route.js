import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
  getUserProfile,
  extractSkillsFromTextAPI,
  updateWalletAddress,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/profile/update", isAuthenticated, singleUpload, updateProfile);
router.get("/profile", isAuthenticated, getUserProfile);
router.post("/extract-skills", isAuthenticated, extractSkillsFromTextAPI);
router.post("/wallet-address", isAuthenticated, updateWalletAddress);

export default router;
