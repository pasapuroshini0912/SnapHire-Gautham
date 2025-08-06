import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(salary);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600 mt-1">{job.company?.name || 'Company Name'}</p>
        </div>
        <Badge variant={job.jobType === 'Full Time' ? 'default' : 'secondary'}>
          {job.jobType}
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{job.locations}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Briefcase className="h-4 w-4 mr-2" />
          <span>{job.experienceLevel} years experience</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="h-4 w-4 mr-2" />
          <span>{formatSalary(job.salary)}/year</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Button 
          variant="outline"
          onClick={() => navigate(`/job/${job._id}`)}
        >
          View Details
        </Button>
        <div className="flex items-center text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const JobsList = ({ jobs, loading, error }) => {
  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading jobs: {error}</div>;
  }

  if (!jobs?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium">No jobs found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
};

export default JobsList;
