import { useState } from "react";
import {
  FiArrowRight,
  FiStar,
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiRefreshCw,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import SearchForm from "../components/SearchForm";
import ResumeUpload from "../components/ResumeUpload";
import AgentChat from "../components/AgentChat";
import JobCard from "../components/JobCard";

import { searchJobs } from "../services/api";

import "./Home.css";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInfo, setSearchInfo] = useState({
    keyword: "",
    location: "",
  });

  const handleSearch = async (data) => {
    if (!data.keyword?.trim()) {
      setError("Please enter a job title or skill.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setJobs([]);

      setSearchInfo({
        keyword: data.keyword,
        location: data.location || "India",
      });

      const result = await searchJobs({
        keyword: data.keyword,
        location: data.location || "India",
        results_wanted: 30,
        hours_old: 72,
        remote: false,
      });

      setJobs(result.jobs || []);

      if (!result.jobs || result.jobs.length === 0) {
        setError(
          "No jobs found. Try another keyword or location."
        );
      }
    } catch (err) {
      console.error("Job search error:", err);

      setError(
        "Unable to search jobs. Please make sure the backend is running."
      );

      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (job) => {
    setSavedJobs((previous) => {
      const exists = previous.some(
        (item) =>
          item.title === job.title &&
          item.company === job.company
      );

      if (exists) {
        return previous.filter(
          (item) =>
            !(
              item.title === job.title &&
              item.company === job.company
            )
        );
      }

      return [...previous, job];
    });
  };

  const isSaved = (job) => {
    return savedJobs.some(
      (item) =>
        item.title === job.title &&
        item.company === job.company
    );
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO */}

      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-badge">
            <FiStar />
            AI-Powered Job Search Agent
          </div>

          <h1>
            Find Your
            <span> Dream Job </span>
            with AI
          </h1>

          <p>
            Search jobs from multiple job platforms in one
            place. Our JobAgent finds relevant opportunities
            based on your skills, location and preferences.
          </p>

          <SearchForm
            onSearch={handleSearch}
            loading={loading}
          />

          <div className="hero-stats">
            <div>
              <strong>Multiple</strong>
              <span>Job Sources</span>
            </div>

            <div>
              <strong>AI</strong>
              <span>Smart Matching</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Job Agent</span>
            </div>
          </div>

        </div>
      </section>

      {/* SEARCH STATUS */}

      {(loading || searchInfo.keyword) && (
        <section className="search-status-section">
          <div className="search-status">

            <div className="status-left">
              {loading ? (
                <div className="status-icon spinning">
                  <FiRefreshCw />
                </div>
              ) : (
                <div className="status-icon">
                  <FiSearch />
                </div>
              )}

              <div>
                <span className="status-label">
                  {loading
                    ? "Searching jobs..."
                    : "Search results"}
                </span>

                {searchInfo.keyword && (
                  <h3>
                    {searchInfo.keyword}
                    <span>
                      <FiMapPin />
                      {searchInfo.location || "India"}
                    </span>
                  </h3>
                )}
              </div>
            </div>

            {!loading && (
              <div className="result-count">
                <strong>{jobs.length}</strong>
                <span>jobs found</span>
              </div>
            )}

          </div>
        </section>
      )}

      {/* JOB RESULTS */}

      {(jobs.length > 0 || loading || error) && (
        <section className="jobs-results-section">

          <div className="section-heading jobs-heading">
            <div>
              <span className="section-label">
                JOB OPPORTUNITIES
              </span>

              <h2>
                {loading
                  ? "Finding the best jobs..."
                  : "Jobs matching your search"}
              </h2>

              <p>
                Results collected from multiple job sources.
              </p>
            </div>

            {!loading && jobs.length > 0 && (
              <span className="total-jobs">
                {jobs.length} Results
              </span>
            )}
          </div>

          {loading && (
            <div className="loading-box">
              <div className="loading-spinner">
                <FiRefreshCw />
              </div>

              <h3>
                JobAgent is searching...
              </h3>

              <p>
                Checking multiple job sources for
                matching opportunities.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="error-box">
              <FiSearch />

              <h3>
                No jobs found
              </h3>

              <p>
                {error}
              </p>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="recommended-jobs">

              {jobs.map((job, index) => (
                <JobCard
                  key={`${job.title}-${job.company}-${index}`}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={isSaved(job)}
                />
              ))}

            </div>
          )}

        </section>
      )}

      {/* RESUME */}

      <section className="resume-section">

        <div className="section-heading">

          <span className="section-label">
            SMART MATCHING
          </span>

          <h2>
            Let AI understand your resume
          </h2>

          <p>
            Upload your resume and JobAgent can analyze
            your skills, experience and find suitable jobs.
          </p>

        </div>

        <div className="resume-container">
          <ResumeUpload />
        </div>

      </section>

      {/* AI AGENT */}

     <section className="agent-section" id="agent">

        <div className="section-heading">

          <span className="section-label">
            YOUR AI ASSISTANT
          </span>

          <h2>
            Talk to JobAgent
          </h2>

          <p>
            Ask questions about jobs, skills, salaries,
            resumes and career opportunities.
          </p>

        </div>

        <div className="agent-container">
          <AgentChat />
        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="how-section">

        <div className="section-heading center-heading">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Your personal AI job agent
          </h2>

          <p>
            Find your next career opportunity in three
            simple steps.
          </p>

        </div>

        <div className="steps">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <FiSearch className="step-icon" />

            <h3>
              Search
            </h3>

            <p>
              Enter the job title, skills and location
              you're looking for.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <FiBriefcase className="step-icon" />

            <h3>
              AI Searches
            </h3>

            <p>
              JobAgent searches multiple job sources and
              collects relevant opportunities.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <FiArrowRight className="step-icon" />

            <h3>
              Apply
            </h3>

            <p>
              Compare jobs and open the original listing
              to apply.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="home-footer">

        <div className="footer-brand">
          <strong>
            JobAgent
          </strong>

          <span>
            Your AI-powered career assistant.
          </span>
        </div>

        <p>
          © 2026 JobAgent
        </p>

      </footer>

    </div>
  );
}

export default Home;