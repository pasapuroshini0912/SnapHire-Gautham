import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataURL from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";
import {
  extractSkillsFromText,
  extractSkillsFromResume,
} from "../utils/aiUtils.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, role, password } = req.body;

    if (!fullName || !email || !phoneNumber || !role || !password) {
      return res.status(400).json({
        message: "Please Enter Every Field",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User with this email already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const file = req.file;
    let profilePhotoUrl = ""; // Default empty string for profile photo

    // Only try to upload if file is provided
    if (file) {
      try {
        const fileUri = getDataURL(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        profilePhotoUrl = cloudResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        // Continue with registration even if photo upload fails
      }
    }

    await User.create({
      fullName,
      email,
      phoneNumber,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
        walletAddress: "",
      },
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account Created Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error + "Error Registering the user",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, role, password } = req.body;

    if (!email || !role || !password) {
      return res.status(400).json({
        message: "Please Enter Every Field",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
        success: false,
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Incorrect Password",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account Doesn't Exist With This Role",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .json({ message: "Login Success " + user.fullName, user, success: true });
  } catch (error) {
    return res.status(400).json({
      message: error + "Error Signing the user",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logout Success",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error + "Log Out Error",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      bio,
      skills,
      linkedinUrl,
      walletAddress,
    } = req.body;
    const file = req.file;
    let cloudResponse;
    let aiExtractedSkills = [];

    if (file) {
      const fileUri = getDataURL(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);

      // Extract skills from resume using AI
      if (file.mimetype === "application/pdf") {
        aiExtractedSkills = await extractSkillsFromResume(file.buffer);
      }
    }

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }

    // Extract skills from bio using AI
    if (bio && !aiExtractedSkills.length) {
      aiExtractedSkills = await extractSkillsFromText(bio);
    }

    const userId = req.id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
        success: false,
      });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    if (linkedinUrl) user.profile.linkedinUrl = linkedinUrl;
    if (walletAddress) user.profile.walletAddress = walletAddress;
    if (aiExtractedSkills.length > 0) {
      user.profile.aiExtractedSkills = aiExtractedSkills;
    }
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.json({
      message: "Update Success",
      user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const extractSkillsFromTextAPI = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    const skills = await extractSkillsFromText(text);

    return res.status(200).json({
      skills,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const updateWalletAddress = async (req, res) => {
  try {
    const userId = req.id;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        message: "Wallet address is required",
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    user.profile.walletAddress = walletAddress;
    await user.save();

    return res.status(200).json({
      message: "Wallet address updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
