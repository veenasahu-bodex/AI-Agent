import { useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiChevronDown,
} from "react-icons/fi";

import "./SearchForm.css";

function SearchForm({ onSearch, loading = false }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    onSearch({
      keyword: keyword.trim(),
      location: location.trim() || "India",
    });
  };

  return (
    <div className="job-search-wrapper">

      <div className="search-top-label">
        <span className="search-ai-dot"></span>
        AI Job Search
      </div>

      <form className="job-search-box" onSubmit={handleSubmit}>

        {/* KEYWORD */}
        <div className="search-input-group keyword-group">

          <div className="search-icon-box">
            <FiBriefcase />
          </div>

          <div className="search-input-content">
            <label>WHAT ARE YOU LOOKING FOR?</label>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, skill or keyword"
            />
          </div>

        </div>

        <div className="search-separator"></div>

        {/* LOCATION */}
        <div className="search-input-group location-group">

          <div className="search-icon-box">
            <FiMapPin />
          </div>

          <div className="search-input-content">
            <label>WHERE?</label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state or remote"
            />
          </div>

          <FiChevronDown className="location-arrow" />

        </div>

        {/* BUTTON */}
        <button
          className="job-search-button"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="search-loader"></span>
              Searching
            </>
          ) : (
            <>
              <FiSearch />
              Search Jobs
            </>
          )}
        </button>

      </form>

      {/* QUICK SEARCH */}
      <div className="quick-search">

        <span>Popular:</span>

        <button
          type="button"
          onClick={() => {
            setKeyword("React Developer");
            onSearch({
              keyword: "React Developer",
              location: location || "India",
            });
          }}
        >
          React Developer
        </button>

        <button
          type="button"
          onClick={() => {
            setKeyword("Python Developer");
            onSearch({
              keyword: "Python Developer",
              location: location || "India",
            });
          }}
        >
          Python Developer
        </button>

        <button
          type="button"
          onClick={() => {
            setKeyword("Frontend Developer");
            onSearch({
              keyword: "Frontend Developer",
              location: location || "India",
            });
          }}
        >
          Frontend Developer
        </button>

        <button
          type="button"
          onClick={() => {
            setKeyword("Data Analyst");
            onSearch({
              keyword: "Data Analyst",
              location: location || "India",
            });
          }}
        >
          Data Analyst
        </button>

      </div>

    </div>
  );
}

export default SearchForm;