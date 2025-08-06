# Database Seeding Scripts

This directory contains scripts to seed the MongoDB database with sample data for testing purposes.

## Available Scripts

### `seed-data.js`

This script populates the database with sample data for testing all functionalities of the application:

- Creates user accounts (both recruiters and job seekers)
- Creates companies
- Creates job listings
- Creates job applications
- Creates social media posts

## How to Run

1. Make sure your MongoDB Atlas connection is properly configured in the `.env` file
2. Navigate to the backend directory
3. Run the seed script:

```bash
node scripts/seed-data.js
```

## Sample Data Created

### Users

- **Recruiter**:
  - Email: recruiter@example.com
  - Password: password123
  - Role: recruiter

- **Job Seekers**:
  - Email: alice@example.com
  - Password: password123
  - Role: student

  - Email: bob@example.com
  - Password: password123
  - Role: student

### Companies

- TechCorp
- InnovateSoft

### Jobs

- Senior Frontend Developer at TechCorp
- Backend Engineer at TechCorp
- Machine Learning Engineer at InnovateSoft

### Applications

- Alice has applied to Senior Frontend Developer (pending) and Machine Learning Engineer (accepted)
- Bob has applied to Backend Engineer (pending) and Machine Learning Engineer (rejected)

### Social Posts

- Various posts from all users with different post types (job updates, achievements, career advice)

## Testing the Application

After running the seed script, you can test the following functionalities:

1. **User Authentication**:
   - Log in with the provided credentials
   - Test both recruiter and job seeker accounts

2. **Company Management** (as recruiter):
   - View created companies
   - Update company details

3. **Job Management** (as recruiter):
   - View created jobs
   - Create new job listings
   - View applicants for each job
   - Accept or reject applications

4. **Job Search and Application** (as job seeker):
   - Browse available jobs
   - View job details
   - Apply for jobs
   - View application status

5. **Social Networking**:
   - View the social feed
   - Create new posts
   - Like and comment on posts

6. **Blockchain Integration**:
   - Test payment for job posting (as recruiter)
   - Test payment for premium social posts