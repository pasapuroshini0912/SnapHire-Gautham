import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { Post } from "../models/post.model.js";
import {
  verifyEthTransaction,
  verifySolTransaction,
} from "../utils/web3Utils.js";

const router = express.Router();

// Create a new post
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { content, type, tags, relatedJob, relatedCompany, rating } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    // Validate rating for job and company reviews
    if ((type === 'job_review' || type === 'company_review') && (!rating || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating is required for job and company reviews (1-5)",
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      type: type || "general",
      tags: tags || [],
      relatedJob,
      relatedCompany,
      rating,
    });

    await post.populate("author", "fullName profile.profilePhoto");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all posts (social feed)
router.get("/feed", isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) {
      filter.type = type;
    }

    const posts = await Post.find(filter)
      .populate("author", "fullName profile.profilePhoto")
      .populate("relatedJob", "title company")
      .populate("relatedCompany", "name")
      .populate("likes", "fullName")
      .populate("comments.user", "fullName profile.profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      posts,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Like/Unlike a post
router.post("/:postId/like", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate("author", "fullName profile.profilePhoto");

    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? "Post liked" : "Post unliked",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add comment to a post
router.post("/:postId/comment", isAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      content,
    });

    await post.save();
    await post.populate("author", "fullName profile.profilePhoto");
    await post.populate("comments.user", "fullName profile.profilePhoto");

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete a post
router.delete("/:postId", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
