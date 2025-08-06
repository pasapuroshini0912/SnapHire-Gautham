import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const FilterCard = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: "",
    salary: "",
    industry: "",
  });

  const filterData = [
    {
      filterType: "location",
      title: "Location",
      array: ["Chennai", "Pune", "Bangalore", "Hyderabad", "Noida", "Gurugram"],
    },
    {
      filterType: "salary",
      title: "Salary",
      array: ["0-40K", "41-100K", "100-300K", "300-500K"],
    },
    {
      filterType: "industry",
      title: "Industry",
      array: [
        "IT",
        "Management",
        "Graphic Designing",
        "Content Writing",
        "Digital Marketing",
      ],
    },
  ];

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="p-3 rounded-md w-full">
      <h2 className="font-bold text-xl text-primary">Filter Jobs</h2>
      <hr className="my-4" />
      <div className="flex justify-between md:block">
        {filterData.map((filter) => (
          <div key={filter.filterType} className="mb-4">
            <h3 className="mb-2 font-bold">{filter.title}</h3>
            <RadioGroup
              value={filters[filter.filterType]}
              onValueChange={(value) =>
                handleFilterChange(filter.filterType, value)
              }
            >
              <div className="flex items-center space-x-3 mb-1">
                <RadioGroupItem value="" id={`${filter.filterType}-all`} />
                <Label htmlFor={`${filter.filterType}-all`}>All</Label>
              </div>
              {filter.array.map((item) => (
                <div key={item} className="flex items-center space-x-3 mb-1">
                  <RadioGroupItem value={item} id={item} />
                  <Label htmlFor={item}>{item}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterCard;
