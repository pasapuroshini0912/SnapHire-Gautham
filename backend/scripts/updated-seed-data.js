import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { Company } from "../src/models/company.model.js";
import { Job } from "../src/models/job.model.js";
import { Application } from "../src/models/application.model.js";
import { Post } from "../src/models/post.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const locations = [
  "Chennai",
  "Pune",
  "Bangalore",
  "Hyderabad",
  "Noida",
  "Gurugram",
];
const industries = [
  "IT",
  "Management",
  "Graphic Designing",
  "Content Writing",
  "Digital Marketing",
];

const jobTitles = {
  IT: [
    "Senior Software Engineer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Cloud Architect",
  ],
  Management: [
    "Project Manager",
    "Product Manager",
    "Operations Manager",
    "Team Lead",
    "Business Analyst",
  ],
  "Graphic Designing": [
    "UI/UX Designer",
    "Visual Designer",
    "Art Director",
    "Motion Designer",
    "Brand Designer",
  ],
  "Content Writing": [
    "Technical Writer",
    "Content Strategist",
    "Copy Writer",
    "Content Editor",
    "SEO Content Writer",
  ],
  "Digital Marketing": [
    "Digital Marketing Manager",
    "SEO Specialist",
    "Social Media Manager",
    "PPC Expert",
    "Marketing Analyst",
  ],
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Post.deleteMany({});
    console.log("All existing data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
};

const createUsers = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await User.create([
    {
      fullName: "John Recruiter",
      email: "recruiter@example.com",
      phoneNumber: "1234567890",
      password: hashedPassword,
      role: "recruiter",
    },
    {
      fullName: "Jane Student",
      email: "student@example.com",
      phoneNumber: "9876543210",
      password: hashedPassword,
      role: "student",
    },
  ]);

  console.log("Sample users created successfully");
  return users;
};

const createCompanies = async (recruiterId) => {
  const companies = await Company.create([
    {
      name: "Tech Innovators",
      description: "Leading technology solutions provider",
      website: "www.techinnovators.com",
      locations: "Multiple Locations",
      userId: recruiterId,
    },
    {
      name: "Creative Solutions",
      description: "Creative agency specializing in design and marketing",
      website: "www.creativesolutions.com",
      locations: "Multiple Locations",
      userId: recruiterId,
    },
  ]);

  console.log("Sample companies created successfully");
  return companies;
};

const createJobs = async (companies, recruiterId) => {
  const jobs = [];
  const jobTypes = ["Full Time", "Part Time", "Contract", "Internship"];

  for (const company of companies) {
    for (const industry of industries) {
      for (const title of jobTitles[industry]) {
        const location =
          locations[Math.floor(Math.random() * locations.length)];
        const salary = Math.floor(Math.random() * (500000 - 40000) + 40000);
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];

        jobs.push({
          title,
          description: `We are looking for an experienced ${title} to join our team.`,
          requirements: [
            "Bachelor's degree in related field",
            "Relevant experience",
            "Strong communication skills",
            "Team player",
          ],
          salary,
          locations: location,
          jobType,
          experienceLevel: Math.floor(Math.random() * 5) + 1,
          positions: Math.floor(Math.random() * 5) + 1,
          company: company._id,
          created_by: recruiterId,
          aiExtractedSkills: ["Communication", "Leadership", industry],
        });
      }
    }
  }

  await Job.create(jobs);
  console.log("Sample jobs created successfully");
};

const seedData = async () => {
  try {
    await connectDB();
    await clearData();

    const users = await createUsers();
    const recruiter = users.find((user) => user.role === "recruiter");
    const companies = await createCompanies(recruiter._id);
    await createJobs(companies, recruiter._id);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
