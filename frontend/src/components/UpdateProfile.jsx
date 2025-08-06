import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_URL } from "@/lib/constant";
import { setUser } from "@/redux/slices/userSlice";

const UpdateProfile = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const { user } = useSelector((store) => store.user);
  const [input, setInput] = useState({
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: +user?.phoneNumber,
    bio: user?.profile?.bio,
    skills: user?.profile?.skills?.join(", ") || "",
    linkedinUrl: user?.profile?.linkedinUrl || "",
    walletAddress: user?.profile?.walletAddress || "",
    file: null,
  });

  const handleExtractSkills = async () => {
    if (!input.file) {
      toast.error("Please upload a resume first");
      return;
    }

    try {
      setExtractingSkills(true);
      const formData = new FormData();
      formData.append("file", input.file);

      const res = await axios.post(`${USER_API_URL}/profile/extract-skills`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (res.data.success && res.data.skills?.length) {
        const newSkills = [...new Set([...input.skills.split(",").map(s => s.trim()), ...res.data.skills])];
        setInput(prev => ({
          ...prev,
          skills: newSkills.join(", ")
        }));
        toast.success("Skills extracted successfully!");
      } else {
        toast.warning("No new skills found in resume");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error extracting skills");
    } finally {
      setExtractingSkills(false);
    }
  };

  const dispatch = useDispatch();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("fullName", input.fullName);
      formData.append("email", input.email);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("bio", input.bio);
      formData.append("skills", input.skills);
      formData.append("linkedinUrl", input.linkedinUrl);
      formData.append("walletAddress", input.walletAddress);

      if (input.file) {
        formData.append("file", input.file);
      }

      const res = await axios.post(`${USER_API_URL}/profile/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (res.data.success === true) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[500px]"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your profile by filling the below form.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Label htmlFor="name">Name</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="name"
              name="fullName"
              onChange={(e) => handleFormChange(e)}
              type="text"
              value={input.fullName}
              placeholder="Enter Your Name"
            />
            <Label htmlFor="email">Email</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="email"
              type="text"
              name="email"
              onChange={(e) => handleFormChange(e)}
              value={input.email}
              placeholder="Enter Your Email"
            />
            <Label htmlFor="number">Phone Number</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="number"
              type="number"
              onChange={(e) => handleFormChange(e)}
              name="phoneNumber"
              value={input.phoneNumber}
              placeholder="Enter Your Number"
            />
            <Label htmlFor="bio">Bio</Label>
            <textarea
              className="p-1 w-full focus:outline-0 rounded border min-h-[80px]"
              id="bio"
              value={input.bio}
              type="text"
              name="bio"
              onChange={(e) => handleFormChange(e)}
              placeholder="Tell us about yourself..."
            />
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="skills"
              type="text"
              value={input.skills}
              onChange={(e) => handleFormChange(e)}
              name="skills"
              placeholder="e.g., React, JavaScript, Python"
            />
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="linkedinUrl"
              type="url"
              value={input.linkedinUrl}
              onChange={(e) => handleFormChange(e)}
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <input
              className="p-1 w-full focus:outline-0 rounded border"
              id="walletAddress"
              type="text"
              value={input.walletAddress}
              onChange={(e) => handleFormChange(e)}
              name="walletAddress"
              placeholder="0x..."
            />
            <Label htmlFor="file">Resume (PDF)</Label>
            <div className="space-y-2">
              <input
                className="p-1 w-full focus:outline-0 rounded border"
                id="file"
                name="file"
                onChange={handleFileChange}
                accept="application/pdf"
                type="file"
              />
              {input.file && (
                <button
                  type="button"
                  onClick={handleExtractSkills}
                  className="bg-purple-100 text-purple-600 px-3 py-1 rounded-md text-sm hover:bg-purple-200 transition-colors"
                >
                  Extract Skills from Resume
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <DialogFooter>
              <button
                title="Updating Profile"
                disabled
                className="text-white bg-primary/80 mt-6 font-medium rounded-lg text-sm w-full py-2.5 cursor-not-allowed "
              >
                <Loader2 size={16} className="animate-spin inline mr-2" />
                Please Wait....
              </button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <button
                type="submit"
                className="text-white  bg-primary mt-6 hover:bg-primary font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Save Changes
              </button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfile;
