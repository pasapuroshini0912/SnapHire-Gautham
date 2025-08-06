import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Please Enter Post Content"],
    },
    type: {
      type: String,
      enum: [
        "general",
        "career_advice",
        "job_update",
        "achievement",
        "job_review",
        "company_review",
        "interview_exp"
      ],
      default: "general",
    },
    tags: [{ type: String }],
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    relatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return ['job_review', 'company_review'].includes(this.type);
      }
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Optional references to jobs or companies being reviewed
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Add text index for better search
postSchema.index({ content: 'text', tags: 'text' });

export const Post = mongoose.model("Post", postSchema);
