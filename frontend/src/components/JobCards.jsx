import React from "react";
import logo from "@/assets/company1.png";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";

const JobCards = ({ jobs }) => {
  const daysAgo = (datetime) => {
    const createdAt = new Date(datetime);
    const currentTime = new Date();
    const differenceTime = currentTime - createdAt;
    return Math.floor(differenceTime / (1000 * 24 * 60 * 60));
  };

  return (
    <div className="flex flex-col gap-2 p-3 md:p-[20px] rounded-lg border border-zinc-800 shadow-sm bg-zinc-900 hover:shadow-md transition-shadow h-max">
      <div className="upperpart flex justify-between items-center">
        <div>
          <Link to={`/job/${jobs?._id}`}>
            <p className="font-bold text-zinc-100 hover:text-zinc-200 transition-colors text-xl">{jobs?.title}</p>
          </Link>
          <p className="text-zinc-400 text-sm my-1">{jobs?.locations}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 p-2" variant="secondary">
          {jobs?.positions} positions
        </Badge>
        <Badge className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 p-2" variant="secondary">
          {jobs?.jobType}
        </Badge>
        <Badge className={"text-zinc-200 bg-zinc-800 border-zinc-700 p-2"} variant="outline">
          #{jobs?.salary}LPA
        </Badge>
      </div>
      <span className="text-zinc-400 text-sm">
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="inline mb-0.5 mr-1"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
          <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"></path>
        </svg>
        {daysAgo(jobs?.createdAt) === 0
          ? "Today"
          : `${daysAgo(jobs?.createdAt)} Days Ago`}
      </span>
      <div className="lowerpart border-t border-zinc-700 mt-1">
        <p className="mt-4 text-sm text-zinc-300">
          {jobs?.description.slice(0, 40) + "..."}
        </p>
        <div className="company flex justify-start items-center mt-4 mb-3">
          <img
            className="bg-zinc-700 p-1 rounded-full object-cover h-10"
            src={jobs?.company.logo ? jobs?.company.logo : logo}
            width="40"
            height="40"
            alt={jobs?.company.name}
          />
          <p className="text-sm text-zinc-200 font-medium ml-2">
            {jobs?.company.name}
          </p>
        </div>
      </div>

      <Link
        to={`/job/${jobs?._id}`}
        className="border border-zinc-700 mt-2 font-medium rounded-lg p-2 w-full hover:bg-zinc-800 bg-transparent text-zinc-300 hover:text-zinc-100 flex gap-1 justify-center items-center transition-all"
      >
        View More
        <ArrowRight />
      </Link>
    </div>
  );
};

export default JobCards;
