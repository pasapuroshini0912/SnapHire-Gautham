import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const JobSearch = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship'];
  const locations = ['Chennai', 'Pune', 'Bangalore', 'Hyderabad', 'Noida', 'Gurugram'];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    if (type) params.append('type', type);
    navigate(`/browse-jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg shadow-xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Job title or keyword"
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((jobType) => (
                  <SelectItem key={jobType} value={jobType}>
                    {jobType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Search Jobs
          </Button>
        </div>
      </div>
    </form>
  );
};

export default JobSearch;
