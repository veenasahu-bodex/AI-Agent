import { FiBookmark, FiMapPin, FiBriefcase, FiClock } from "react-icons/fi";
import "./JobCard.css";

function JobCard({ job, onSave, isSaved }) {
  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="company-logo">
          {job.company?.charAt(0).toUpperCase()}
        </div>

        <button
          className={`save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onSave(job)}
          title={isSaved ? "Remove from saved" : "Save job"}
        >
          <FiBookmark />
        </button>
      </div>

      <div className="job-info">
        <h3>{job.title}</h3>

        <p className="company-name">{job.company}</p>

        <div className="job-details">
          <span>
            <FiMapPin />
            {job.location}
          </span>

          <span>
            <FiBriefcase />
            {job.experience}
          </span>

          <span>
            <FiClock />
            {job.type}
          </span>
        </div>

        <div className="job-salary">
          {job.salary}
        </div>

        <div className="skills-section">
          <span className="skills-label">Skills</span>

          <div className="skills-list">
            {job.skills?.map((skill, index) => (
              <span className="skill-tag" key={index}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="job-card-bottom">
        <span className={`work-mode ${job.workMode}`}>
          {job.workMode === "remote" ? "Remote" : "On-site"}
        </span>

        <div className="match-score">
          <span>{job.match}%</span>
          <small>Match</small>
        </div>
      </div>
    </div>
  );
}

export default JobCard;