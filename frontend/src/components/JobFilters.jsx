import { useState } from "react";
import {
  FiFilter,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import "./JobFilters.css";

function JobFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    location: "",
    workMode: "all",
    experience: "all",
    jobType: "all",
    salary: 0,
    match: 0,
  });

  const handleChange = (key, value) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      location: "",
      workMode: "all",
      experience: "all",
      jobType: "all",
      salary: 0,
      match: 0,
    };

    setFilters(defaultFilters);

    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  return (
    <aside className="job-filters">
      <div className="filters-header">
        <div>
          <h3>
            <FiFilter />
            Filters
          </h3>

          <p>Refine your job search</p>
        </div>

        <button
          className="clear-filters"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      <div className="filter-group">
        <label>
          <FiMapPin />
          Location
        </label>

        <input
          type="text"
          placeholder="e.g. Bangalore"
          value={filters.location}
          onChange={(e) =>
            handleChange("location", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>
          <FiBriefcase />
          Work Mode
        </label>

        <div className="filter-options">
          {["all", "remote", "hybrid", "onsite"].map(
            (mode) => (
              <button
                key={mode}
                className={
                  filters.workMode === mode ? "selected" : ""
                }
                onClick={() =>
                  handleChange("workMode", mode)
                }
              >
                {mode === "all"
                  ? "All"
                  : mode === "onsite"
                  ? "On-site"
                  : mode.charAt(0).toUpperCase() +
                    mode.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      <div className="filter-group">
        <label>
          <FiBriefcase />
          Experience
        </label>

        <select
          value={filters.experience}
          onChange={(e) =>
            handleChange("experience", e.target.value)
          }
        >
          <option value="all">Any Experience</option>
          <option value="0-1">0–1 Years</option>
          <option value="1-2">1–2 Years</option>
          <option value="2-4">2–4 Years</option>
          <option value="4+">4+ Years</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <FiBriefcase />
          Job Type
        </label>

        <select
          value={filters.jobType}
          onChange={(e) =>
            handleChange("jobType", e.target.value)
          }
        >
          <option value="all">All Types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <FiDollarSign />
          Minimum Salary
        </label>

        <input
          type="range"
          min="0"
          max="30"
          value={filters.salary}
          onChange={(e) =>
            handleChange("salary", e.target.value)
          }
        />

        <div className="range-value">
          <span>₹0 LPA</span>
          <strong>₹{filters.salary} LPA+</strong>
        </div>
      </div>

      <div className="filter-group">
        <label>Minimum AI Match</label>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.match}
          onChange={(e) =>
            handleChange("match", e.target.value)
          }
        />

        <div className="range-value">
          <span>0%</span>
          <strong>{filters.match}%+</strong>
        </div>
      </div>

      <button
        className="mobile-clear"
        onClick={clearFilters}
      >
        <FiX />
        Reset Filters
      </button>
    </aside>
  );
}

export default JobFilters;