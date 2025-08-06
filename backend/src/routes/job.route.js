import express from "express";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
  getJobPaymentRequest,
  getJobRecommendationsAPI,
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/post", isAuthenticated, postJob);
router.get("/get", getAllJobs);
router.get("/get/:id", getJobById);
router.get("/getadminjobs/", isAuthenticated, getAdminJobs);
router.get("/payment-request", getJobPaymentRequest);
router.get("/recommendations", isAuthenticated, getJobRecommendationsAPI);

export default router;
