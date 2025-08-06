import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import {
  extractSkillsFromText,
  getJobRecommendations,
  calculateMatchScore,
} from "../utils/aiUtils.js";
import {
  verifyEthTransaction,
  verifySolTransaction,
  generatePaymentRequest,
} from "../utils/web3Utils.js";

// Post Job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      locations,
      jobType,
      experience,
      positions,
      companyId,
      transactionHash,
      currency = "ETH",
    } = req.body;
    const userId = req.id;

    // Validate required fields
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !locations ||
      !jobType ||
      !experience ||
      !positions ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Please Enter Every Field",
        success: false,
      });
    }

    // Validate field formats
    if (typeof title !== "string" || title.trim().length < 3) {
      return res.status(400).json({
        message: "Title must be at least 3 characters long",
        success: false,
      });
    }

    if (typeof description !== "string" || description.trim().length < 10) {
      return res.status(400).json({
        message: "Description must be at least 10 characters long",
        success: false,
      });
    }

    if (
      !Array.isArray(requirements.split(",")) ||
      requirements.split(",").length === 0
    ) {
      return res.status(400).json({
        message: "Requirements must be comma-separated values",
        success: false,
      });
    }

    const salaryNum = Number(salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      return res.status(400).json({
        message: "Salary must be a positive number",
        success: false,
      });
    }

    const experienceNum = Number(experience);
    if (isNaN(experienceNum) || experienceNum < 0) {
      return res.status(400).json({
        message: "Experience must be a non-negative number",
        success: false,
      });
    }

    const positionsNum = Number(positions);
    if (
      isNaN(positionsNum) ||
      positionsNum <= 0 ||
      !Number.isInteger(positionsNum)
    ) {
      return res.status(400).json({
        message: "Positions must be a positive integer",
        success: false,
      });
    }

    if (typeof locations !== "string" || locations.trim().length < 2) {
      return res.status(400).json({
        message: "Location must be at least 2 characters long",
        success: false,
      });
    }

    // Validate job type to match exactly
    const allowedJobTypes = [
      "Full Time",
      "Part Time",
      "Contract",
      "Internship",
    ];
    if (!jobType || !allowedJobTypes.includes(jobType)) {
      return res.status(400).json({
        message:
          "Job type must be exactly one of: Full Time, Part Time, Contract, Internship",
        allowedTypes: allowedJobTypes,
        receivedValue: jobType,
        success: false,
      });
    }

    // Verify blockchain payment if transaction hash is provided
    let paymentVerified = false;
    if (transactionHash) {
      const verification =
        currency === "SOL"
          ? await verifySolTransaction(transactionHash)
          : await verifyEthTransaction(transactionHash, null, currency);

      paymentVerified = verification.verified;
    }

    // Extract skills from job description using AI
    const aiExtractedSkills = await extractSkillsFromText(description);

    const job = await Job.create({
      title,
      description,
      requirements: requirements ? requirements.split(",") : [],
      salary: Number(salary),
      locations,
      jobType, // Using exact job type
      experienceLevel: Number(experience),
      positions: Number(positions),
      company: companyId,
      created_by: userId,
      aiExtractedSkills,
      blockchainPayment: {
        transactionHash,
        paid: paymentVerified,
        paidAt: paymentVerified ? new Date() : null,
        currency,
        amount: salary.toString(),
      },
    });

    return res.status(201).json({
      message: "Job Created Successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Job posting error:", error);

    // Check for validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation Error",
        errors: validationErrors,
        success: false,
      });
    }

    // Check for MongoDB related errors
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(400).json({
        message: "Database Error",
        error: error.message,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// Get All Jobs with AI recommendations
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const userId = req.id;
    let query = {};

    if (keyword) {
      const words = keyword.split(/\s+/).filter(Boolean);
      const regexArray = words.map((word) => new RegExp(word, "i"));
      query = {
        $or: [{ title: { $in: regexArray } }],
      };
    }

    const jobs = await Job.find(query)
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "company",
      })
      .populate({
        path: "created_by",
      });

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs Not Found",
        success: false,
      });
    }

    // Get user skills for AI recommendations
    const user = await User.findById(userId);
    const userSkills = [
      ...(user?.profile?.skills || []),
      ...(user?.profile?.aiExtractedSkills || []),
    ];

    // Add AI recommendations if user has skills
    let jobsWithRecommendations = jobs;
    if (userSkills.length > 0) {
      jobsWithRecommendations = await getJobRecommendations(userSkills, jobs);
    }

    return res.status(200).json({
      jobs: jobsWithRecommendations,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get Job By ID with match score
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId)
      .populate({
        path: "applications",
      })
      .populate({
        path: "company",
      });

    if (!job) {
      return res.status(404).json({
        message: "Job Not Found",
        success: false,
      });
    }

    // Calculate match score if user is logged in
    let matchScore = null;
    if (userId) {
      const user = await User.findById(userId);
      const userSkills = [
        ...(user?.profile?.skills || []),
        ...(user?.profile?.aiExtractedSkills || []),
      ];
      const jobSkills = [
        ...(job.requirements || []),
        ...(job.aiExtractedSkills || []),
      ];
      matchScore = calculateMatchScore(jobSkills, userSkills);
    }

    return res.status(200).json({
      job,
      matchScore,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get Admin Jobs
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "created_by",
      })
      .populate({
        path: "company",
      });

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get payment request for job posting
export const getJobPaymentRequest = async (req, res) => {
  try {
    const { currency = "ETH" } = req.query;
    const paymentRequest = generatePaymentRequest(currency);

    return res.status(200).json({
      success: true,
      paymentRequest,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get job recommendations for user
export const getJobRecommendationsAPI = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    const userSkills = [
      ...(user.profile?.skills || []),
      ...(user.profile?.aiExtractedSkills || []),
    ];

    const allJobs = await Job.find().populate("company").populate("created_by");

    const recommendations = await getJobRecommendations(userSkills, allJobs);

    return res.status(200).json({
      recommendations,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
