import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const locations = [
  "Chennai",
  "Pune",
  "Bangalore",
  "Hyderabad",
  "Noida",
  "Gurugram",
]

const jobTypes = ["Full Time", "Part Time", "Contract", "Internship"]

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const nav = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append("keyword", searchQuery)
    if (location) params.append("location", location)
    if (jobType) params.append("type", jobType)
    nav(`/browse-jobs?${params.toString()}`)
  }

  return (
    <section className="home-section min-h-[400px] flex items-center" id="search">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl font-bold leading-tight mb-4">
          Search, Apply & <br />
          Get Your<span className="text-primary"> Dream Job</span>
        </h2>
        <p className="mb-8 text-center text-black/75 text-lg">
          Connecting Talent with Opportunity: Your Gateway to the Perfect Job!
        </p>
        
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title or keyword"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex justify-center">
              <Button type="submit" className="w-full md:w-auto min-w-[200px]">
                Search Jobs
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Search
