import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';
import { Application } from '../src/models/application.model.js';
import { Post } from '../src/models/post.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Post.deleteMany({});
    console.log('All existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Create sample users
const createUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create a recruiter user
    const recruiter = await User.create({
      fullName: 'John Recruiter',
      email: 'recruiter@example.com',
      phoneNumber: 1234567890,
      role: 'recruiter',
      password: hashedPassword,
      profile: {
        bio: 'Experienced recruiter with 5+ years in tech hiring',
        skills: ['Recruiting', 'HR Management', 'Talent Acquisition'],
        linkedinUrl: 'https://linkedin.com/in/johnrecruiter',
        profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg'
      }
    });

    // Create student/job seeker users
    const student1 = await User.create({
      fullName: 'Alice Student',
      email: 'alice@example.com',
      phoneNumber: 2345678901,
      role: 'student',
      password: hashedPassword,
      profile: {
        bio: 'Recent computer science graduate looking for software engineering roles',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        aiExtractedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Full Stack'],
        linkedinUrl: 'https://linkedin.com/in/alicestudent',
        profilePhoto: 'https://randomuser.me/api/portraits/women/1.jpg'
      }
    });

    const student2 = await User.create({
      fullName: 'Bob Developer',
      email: 'bob@example.com',
      phoneNumber: 3456789012,
      role: 'student',
      password: hashedPassword,
      profile: {
        bio: 'Full stack developer with 2 years of experience',
        skills: ['Python', 'Django', 'React', 'PostgreSQL'],
        aiExtractedSkills: ['Python', 'Django', 'React', 'PostgreSQL', 'Full Stack', 'Web Development'],
        linkedinUrl: 'https://linkedin.com/in/bobdev',
        profilePhoto: 'https://randomuser.me/api/portraits/men/2.jpg'
      }
    });

    console.log('Sample users created successfully');
    return { recruiter, student1, student2 };
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

// Create sample companies
const createCompanies = async (recruiterId) => {
  try {
    const company1 = await Company.create({
      name: 'TechCorp',
      description: 'Leading technology solutions provider with global presence',
      website: 'https://techcorp.example.com',
      locations: 'San Francisco, New York, London',
      logo: 'https://logo.clearbit.com/google.com',
      userId: recruiterId
    });

    const company2 = await Company.create({
      name: 'InnovateSoft',
      description: 'Innovative software development company specializing in AI and machine learning',
      website: 'https://innovatesoft.example.com',
      locations: 'Boston, Austin, Bangalore',
      logo: 'https://logo.clearbit.com/microsoft.com',
      userId: recruiterId
    });

    console.log('Sample companies created successfully');
    return { company1, company2 };
  } catch (error) {
    console.error('Error creating companies:', error);
    process.exit(1);
  }
};

// Create sample jobs
const createJobs = async (recruiterId, companies) => {
  try {
    const job1 = await Job.create({
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced Frontend Developer to join our team. The ideal candidate should have strong experience with React and modern JavaScript.',
      requirements: ['5+ years of experience with JavaScript', 'Strong knowledge of React', 'Experience with state management libraries', 'Good understanding of responsive design'],
      experienceLevel: 5,
      salary: 120000,
      locations: 'San Francisco, Remote',
      jobType: 'Full-time',
      positions: 2,
      company: companies.company1._id,
      created_by: recruiterId,
      aiExtractedSkills: ['JavaScript', 'React', 'Redux', 'CSS', 'HTML', 'Frontend Development']
    });

    const job2 = await Job.create({
      title: 'Backend Engineer',
      description: 'Join our backend team to build scalable and efficient server-side applications. You will be working with Node.js and MongoDB to create robust APIs.',
      requirements: ['3+ years of experience with Node.js', 'Experience with MongoDB or similar NoSQL databases', 'Knowledge of RESTful API design', 'Understanding of server-side rendering'],
      experienceLevel: 3,
      salary: 110000,
      locations: 'New York, Remote',
      jobType: 'Full-time',
      positions: 1,
      company: companies.company1._id,
      created_by: recruiterId,
      aiExtractedSkills: ['Node.js', 'MongoDB', 'Express', 'API Development', 'Backend Development']
    });

    const job3 = await Job.create({
      title: 'Machine Learning Engineer',
      description: 'We are seeking a talented Machine Learning Engineer to develop and implement ML models and algorithms. You will work on cutting-edge AI projects.',
      requirements: ['MS or PhD in Computer Science or related field', 'Experience with Python and ML frameworks', 'Knowledge of deep learning', 'Experience with data preprocessing'],
      experienceLevel: 4,
      salary: 140000,
      locations: 'Boston, Remote',
      jobType: 'Full-time',
      positions: 3,
      company: companies.company2._id,
      created_by: recruiterId,
      aiExtractedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'AI']
    });

    console.log('Sample jobs created successfully');
    return { job1, job2, job3 };
  } catch (error) {
    console.error('Error creating jobs:', error);
    process.exit(1);
  }
};

// Create sample applications
const createApplications = async (students, jobs) => {
  try {
    // Student 1 applies to job 1 and job 3
    const application1 = await Application.create({
      job: jobs.job1._id,
      applicant: students.student1._id,
      status: 'pending'
    });

    const application2 = await Application.create({
      job: jobs.job3._id,
      applicant: students.student1._id,
      status: 'accepted'
    });

    // Student 2 applies to job 2 and job 3
    const application3 = await Application.create({
      job: jobs.job2._id,
      applicant: students.student2._id,
      status: 'pending'
    });

    const application4 = await Application.create({
      job: jobs.job3._id,
      applicant: students.student2._id,
      status: 'rejected'
    });

    // Update jobs with applications
    await Job.findByIdAndUpdate(jobs.job1._id, {
      $push: { applications: application1._id }
    });

    await Job.findByIdAndUpdate(jobs.job2._id, {
      $push: { applications: application3._id }
    });

    await Job.findByIdAndUpdate(jobs.job3._id, {
      $push: { applications: [application2._id, application4._id] }
    });

    console.log('Sample applications created successfully');
  } catch (error) {
    console.error('Error creating applications:', error);
    process.exit(1);
  }
};

// Create sample social posts
const createPosts = async (users) => {
  try {
    await Post.create({
      author: users.recruiter._id,
      content: 'Excited to announce that we are hiring for multiple positions at TechCorp! Check out our job listings.',
      type: 'job_update',
      tags: ['hiring', 'jobs', 'tech']
    });

    await Post.create({
      author: users.student1._id,
      content: 'Just completed my certification in Advanced React Development. Looking forward to applying these skills in my next role!',
      type: 'achievement',
      tags: ['react', 'certification', 'webdev']
    });

    await Post.create({
      author: users.student2._id,
      content: 'Any tips for preparing for technical interviews in machine learning roles? Would appreciate advice from those who have gone through the process.',
      type: 'career_advice',
      tags: ['machinelearning', 'interviews', 'advice']
    });

    await Post.create({
      author: users.recruiter._id,
      content: 'Pro tip for job seekers: Always research the company thoroughly before your interview. Understanding the company culture and values can give you a significant edge.',
      type: 'career_advice',
      tags: ['jobsearch', 'interviews', 'tips']
    });

    console.log('Sample posts created successfully');
  } catch (error) {
    console.error('Error creating posts:', error);
    process.exit(1);
  }
};

// Main function to seed data
const seedData = async () => {
  try {
    await connectDB();
    await clearData();
    
    const users = await createUsers();
    const companies = await createCompanies(users.recruiter._id);
    const jobs = await createJobs(users.recruiter._id, companies);
    await createApplications({ student1: users.student1, student2: users.student2 }, jobs);
    await createPosts(users);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();