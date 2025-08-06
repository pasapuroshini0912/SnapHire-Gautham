import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApplyJobMutation, useGetJobsByIdQuery } from "@/redux/api/jobsApi";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePostMutation } from "@/redux/api/postApi";

const JobDescription = () => {
  const { id } = useParams();
  const { data: singleJob, isLoading, isError } = useGetJobsByIdQuery(id);
  const [applyJob] = useApplyJobMutation();
  const [createPost] = useCreatePostMutation();

  const { user } = useSelector((store) => store.user);
  const isApplied =
    singleJob?.applications?.find(
      (application) => application.applicant === user?._id
    ) || false;

  // Experience sharing state
  const [experience, setExperience] = useState("");
  const [experienceType, setExperienceType] = useState("job_review");
  const [rating, setRating] = useState(0);
  const [isPosting, setIsPosting] = useState(false);

  const handleApplyJob = async () => {
    try {
      const res = await applyJob({ jobId: id });
      if (res.data?.success) {
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      toast.error("Failed to submit application");
    }
  };

    const handleShareExperience = () => {
    if (!experience.trim()) {
      toast.error("Please enter your experience");
      return;
    }

    if (rating < 1 && experienceType === "job_review") {
      toast.error("Please provide a rating");
      return;
    }

    setIsPosting(true);

    const postData = {
      content: experience,
      type: experienceType,
      relatedJob: id,
      relatedCompany: singleJob?.company?._id,
    };

    // Only add rating if it's not an interview experience
    if (experienceType !== "interview_exp") {
      postData.rating = rating;
    }

    createPost(postData)
      .unwrap()
      .then((res) => {
        if (res.success) {
          toast.success("Experience shared successfully!");
          setExperience("");
          setRating(0);
        }
      })
      .catch((error) => {
        console.error("Failed to share experience:", error);
        toast.error(error.data?.message || "Failed to share experience. Please try again.");
      })
      .finally(() => {
        setIsPosting(false);
      });
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 min-h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-4 min-h-screen text-red-500">Error loading job details</div>;
  }

  if (!singleJob) {
    return <div className="container mx-auto p-4 min-h-screen">Job not found</div>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6 text-white border border-zinc-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">{singleJob.title}</h1>
            <p className="text-zinc-400 mb-4">{singleJob.company?.name}</p>
          </div>
          <Badge variant={singleJob.jobType === "Full Time" ? "default" : "secondary"}>
            {singleJob.jobType}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-zinc-200">Job Description</h3>
            <p className="text-zinc-400">{singleJob.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-zinc-200">Requirements</h3>
            <ul className="list-disc list-inside text-zinc-400">
              {singleJob.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <h4 className="font-semibold text-zinc-200">Location</h4>
            <p className="text-zinc-400">{singleJob.locations}</p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200">Experience</h4>
            <p className="text-zinc-400">{singleJob.experienceLevel} years</p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200">Salary</h4>
            <p className="text-zinc-400">₹{singleJob.salary.toLocaleString()}/year</p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200">Positions</h4>
            <p className="text-zinc-400">{singleJob.positions}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {user?.role === "student" && (
            isApplied ? (
              <Button disabled>Already Applied</Button>
            ) : (
              <Button onClick={handleApplyJob}>Apply Now</Button>
            )
          )}
          <Link to="/browse-jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </div>

      {/* Share Experience Section */}
      {user && (
        <div className="bg-zinc-900 rounded-lg shadow-lg p-6 mt-6 text-white border border-zinc-800">
          <h2 className="text-2xl font-bold mb-4 text-zinc-100">Share Your Experience</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-200">Experience Type</Label>
              <Select onValueChange={(value) => setExperienceType(value)} defaultValue="job_review">
                <SelectTrigger className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  <SelectValue placeholder="Select type of experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_review">Job Review</SelectItem>
                  <SelectItem value="interview_exp">Interview Experience</SelectItem>
                  <SelectItem value="company_review">Company Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-zinc-200">Your Experience</Label>
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Share your experience, tips, or advice about this job..."
                className="mt-2 bg-zinc-800 text-zinc-200 border-zinc-700 placeholder:text-zinc-500"
                rows={4}
              />
            </div>
            <Button onClick={handleShareExperience} disabled={isPosting}>
              {isPosting ? "Posting..." : "Share Experience"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescription;
