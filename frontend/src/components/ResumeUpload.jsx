import { useRef, useState } from "react";
import {
  FiUploadCloud,
  FiFileText,
  FiX,
} from "react-icons/fi";
import "./ResumeUpload.css";

function ResumeUpload() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF, DOC or DOCX file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="resume-section">
      <div className="resume-header">
        <div>
          <h2>Upload your resume</h2>
          <p>
            Let AI analyze your skills and find better job matches.
          </p>
        </div>

        <span className="optional">Optional</span>
      </div>

      {!file ? (
        <div
          className="upload-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <FiUploadCloud />
          </div>

          <h3>Drop your resume here</h3>

          <p>
            or <span>browse files</span>
          </p>

          <small>PDF, DOC or DOCX • Max 10MB</small>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />
        </div>
      ) : (
        <div className="uploaded-file">
          <div className="file-icon">
            <FiFileText />
          </div>

          <div className="file-details">
            <h3>{file.name}</h3>

            <p>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <button
            className="remove-file"
            onClick={removeFile}
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;