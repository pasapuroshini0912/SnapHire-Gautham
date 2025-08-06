import React, { useState, useMemo } from "react";
import FilterCard from "../../components/FilterCard";
import JobCards from "../../components/JobCards";
import { useGetJobsQuery } from "@/redux/api/jobsApi";

const Jobs = () => {
  const { data, isLoading, isError } = useGetJobsQuery();
  const [filters, setFilters] = useState({
    location: "",
    salary: "",
    industry: "",
  });

  const allJobs = data?.jobs || [];

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesLocation =
        !filters.location ||
        job.locations.toLowerCase().includes(filters.location.toLowerCase());

      const matchesSalary =
        !filters.salary ||
        (() => {
          if (!filters.salary) return true;
          const [min, max] = filters.salary
            .split("-")
            .map((s) => parseInt(s.replace("K", "000")));
          const jobSalary = job.salary;
          return jobSalary >= min && (!max || jobSalary <= max);
        })();

      const matchesIndustry =
        !filters.industry ||
        job.jobType.toLowerCase().includes(filters.industry.toLowerCase());

      return matchesLocation && matchesSalary && matchesIndustry;
    });
  }, [allJobs, filters]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  if (isError) {
    return <h1>Something went wrong</h1>;
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap md:py-8 mb-6">
      <div className="w-full md:w-1/5">
        <FilterCard onFilterChange={handleFilterChange} />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 w-full h-[80vh] overflow-y-auto md:p-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, i) => <JobCards key={i} jobs={job} />)
        ) : (
          <span>No jobs match your filters</span>
        )}
      </div>
    </div>
  );
};

export default Jobs;
