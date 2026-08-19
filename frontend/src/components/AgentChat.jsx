import { useState } from "react";
import {
  FiSend,
  FiUser,
  FiBriefcase,
  FiLoader,
} from "react-icons/fi";

import axios from "axios";

import "./AgentChat.css";

function AgentChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hi! I'm JobAgent. Tell me what kind of job you're looking for, and I'll search for the best matches.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ai-agent-ylzp.onrender.com/api/agent",
        {
          message: text,
          location: "India",
        }
      );

      const data = response.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text:
            data.message ||
            "I couldn't find any matching jobs.",
          jobs: data.jobs || [],
        },
      ]);
    } catch (error) {
      console.error("Agent error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text:
            "Sorry, I couldn't connect to the JobAgent backend. Please make sure FastAPI is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-chat">

      <div className="agent-chat-header">
        <div className="agent-avatar">
          <FiBriefcase />
        </div>

        <div>
          <h3>JobAgent</h3>
          <span>
            AI Job Search Assistant
          </span>
        </div>

        <div className="agent-online">
          <span></span>
          Online
        </div>
      </div>

      <div className="agent-messages">

        {messages.map((item, index) => (
          <div
            className={`agent-message ${
              item.role === "user"
                ? "user-message"
                : "bot-message"
            }`}
            key={index}
          >

            <div className="message-avatar">
              {item.role === "user" ? (
                <FiUser />
              ) : (
                <FiBriefcase />
              )}
            </div>

            <div className="message-content">
              <strong>
                {item.role === "user"
                  ? "You"
                  : "JobAgent"}
              </strong>

              <p>{item.text}</p>

              {/* JOB RESULTS */}

              {item.jobs?.length > 0 && (
                <div className="agent-job-results">

                  {item.jobs.map((job, jobIndex) => (
                    <div
                      className="agent-job-card"
                      key={jobIndex}
                    >
                      <div>
                        <h4>
                          {job.title}
                        </h4>

                        <span>
                          {job.company}
                        </span>
                      </div>

                      <div className="agent-job-info">
                        {job.location && (
                          <small>
                            📍 {job.location}
                          </small>
                        )}

                        {job.site && (
                          <small>
                            🌐 {job.site}
                          </small>
                        )}
                      </div>

                      {job.job_url && (
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Job
                        </a>
                      )}
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        ))}

        {loading && (
          <div className="agent-message bot-message">

            <div className="message-avatar">
              <FiBriefcase />
            </div>

            <div className="message-content">
              <strong>JobAgent</strong>

              <div className="agent-thinking">
                <FiLoader />
                Searching jobs...
              </div>
            </div>

          </div>
        )}

      </div>

      <form
        className="agent-input"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder="Ask JobAgent for a job..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
        >
          <FiSend />
        </button>
      </form>

    </div>
  );
}

export default AgentChat;