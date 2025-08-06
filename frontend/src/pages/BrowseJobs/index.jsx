import React from 'react';
import { useLocation } from 'react-router-dom';
import { useGetJobsQuery } from '@/redux/api/jobsApi';
import JobSearch from '@/components/JobSearch';
import JobsList from '@/components/JobsList';

const BrowseJobs = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const jobLocation = searchParams.get('location') || '';
  const jobType = searchParams.get('type') || '';

  const { data: jobs, isLoading, isError, error } = useGetJobsQuery({
    search: query,
    location: jobLocation,
    type: jobType
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Browse Jobs</h1>
        <JobSearch />
      </div>

      <div className="mt-8">
        <JobsList 
          jobs={jobs} 
          loading={isLoading}
          error={isError ? error?.message : null}
        />
      </div>
    </div>
  );
};

export default BrowseJobs;
