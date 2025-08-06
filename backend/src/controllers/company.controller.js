import { Company } from "../models/company.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataURL from "../utils/dataURI.js";

// Register Company
export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({
        message: "Company Name Is Required",
        success: false,
      });
    }
    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "Company Is Already Added",
        success: false,
      });
    }

    company = await Company.create({
      name: companyName,
      userId: req.id,
    });

    return res.status(201).json({
      message: "Company Added Successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Get Company
export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });
    if (!companies) {
      return res.status(404).json({
        message: "Company Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Get Company By ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company Not Found",
        success: false,
      });
    }
    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Update Company
export const updateCompany = async (req, res) => {
  try {
    const { name, website, description, locations } = req.body;
    const companyId = req.params.id;

    // Verify company exists and user has permission
    const existingCompany = await Company.findById(companyId);
    if (!existingCompany) {
      return res.status(404).json({
        message: "Company Not Found",
        success: false,
      });
    }

    // Check if user owns the company
    if (existingCompany.userId.toString() !== req.id) {
      return res.status(403).json({
        message: "Not authorized to update this company",
        success: false,
      });
    }

    // Handle file upload if provided
    let logoUrl = existingCompany.logo; // Keep existing logo by default
    if (req.file) {
      const fileUri = getDataURL(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      logoUrl = cloudResponse.secure_url;
    }

    // Build update object with only provided fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (website) updatedData.website = website;
    if (description) updatedData.description = description;
    if (locations) updatedData.locations = locations;
    if (logoUrl) updatedData.logo = logoUrl;

    // Validate website URL if provided
    if (website && !website.match(/^https?:\/\/.+/)) {
      return res.status(400).json({
        message:
          "Website must be a valid URL starting with http:// or https://",
        success: false,
      });
    }

    // Update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Company Updated Successfully",
      company: updatedCompany,
      success: true,
    });
  } catch (error) {
    console.error("Error updating company:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Error updating company",
      error: error.message,
      success: false,
    });
  }
};

// Delete Company
export const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findByIdAndDelete(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company Not Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company Deleted Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
