import Navbar from "../components/Navbar";
import AgentChat from "../components/AgentChat";

import "./AgentPage.css";

function AgentPage() {
  return (
    <div className="agent-page">

      <Navbar />

      <main className="agent-page-content">

        <div className="agent-page-header">
          <span className="agent-label">
            AI JOB ASSISTANT
          </span>

          <h1>
            Find Your Perfect Job
            <span> with AI</span>
          </h1>

          <p>
            Tell JobAgent what kind of job you're looking for.
            I'll search and find matching opportunities for you.
          </p>
        </div>

        <AgentChat />

      </main>

    </div>
  );
}

export default AgentPage;