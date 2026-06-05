import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  const [atsScore, setAtsScore] = useState(0);
  const [atsChecks, setAtsChecks] = useState<any>({});

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const uploadResume = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      setMessage("Resume processed successfully");
      setResumeText(response.data.text);
      setSkills(response.data.skills);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
    }
  };

  const matchJob = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/match",
        {
          resume_text: resumeText,
          job_description: jobDescription,
        }
      );
  
      setScore(response.data.score);
      setMatchedSkills(response.data.matched_skills);
      setMissingSkills(response.data.missing_skills);
    } catch (error) {
      console.error(error);
    }
  };

  const analyzeATS = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ats-score",
        {
          resume_text: resumeText,
          job_description: "",
        }
      );
  
      setAtsScore(response.data.score);
      setAtsChecks(response.data.checks);
  
    } catch (error) {
      console.error(error);
    }
  };

  const getSuggestions = async () => {

    try {
  
      const response = await axios.post(
        "http://127.0.0.1:8000/suggestions",
        {
          resume_text: resumeText,
          job_description: jobDescription,
        }
      );
  
      setSuggestions(
        response.data.suggestions
      );
  
    } catch (error) {
      console.error(error);
    }
  
  };

  return (
    <div className="container">
  
      <h1 className="title">AI Resume Analyzer</h1>
  
      {/* Upload Section */}
      <div className="card upload-box">
  
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />
  
        <br />
        <br />
  
        <button onClick={uploadResume}>
          Upload Resume
        </button>
  
        <p>{message}</p>
  
      </div>
  
      {/* Resume + JD */}
      <div className="row">
  
        <div className="card left">
  
          <h2>Resume Text</h2>
  
          <textarea
            rows={18}
            value={resumeText}
            readOnly
          />
  
        </div>
  
        <div className="card right">
  
          <h2>Job Description</h2>
  
          <textarea
            rows={18}
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder="Paste Job Description Here"
          />
  
          <br />
          <br />
  
          <div className="button-group">
            <button onClick={matchJob}>
              Analyze Match
            </button>

            <button onClick={analyzeATS}>              
              Check ATS Score
            </button>

            <button onClick={getSuggestions}>
              Get Suggestions
             </button>
          </div>
  
        </div>
  
      </div>
  
      {/* Score Cards */}
  
      <div className="row">
  
        <div className="card score-card skill-box">
  
          <h2>Match Score</h2>
  
          <div className="score-value">
            {score}%
          </div>
  
        </div>
  
        <div className="card score-card skill-box">
  
          <h2>ATS Score</h2>
  
          <div className="score-value">
            {atsScore}/100
          </div>
  
        </div>
  
      </div>
  
      {/* Skills */}
  
      <div className="row">
  
        <div className="card skill-box">
  
          <h2>Detected Skills</h2>
  
          <div className="skill-container">
  
            {skills.map((skill, index) => (
  
              <span
                key={index}
                className="skill-tag"
              >
                {skill}
              </span>
  
            ))}
  
          </div>
  
        </div>
  
        <div className="card skill-box">
  
          <h2>Matched Skills</h2>
  
          <div className="skill-container">
  
            {matchedSkills.map((skill, index) => (
  
              <span
                key={index}
                className="skill-tag"
              >
                ✓ {skill}
              </span>
  
            ))}
  
          </div>
  
        </div>
  
      </div>
  
      {/* Missing Skills */}
  
      <div className="card">
  
        <h2>Missing Skills</h2>
  
        <div className="skill-container">
  
          {missingSkills.map((skill, index) => (
  
            <span
              key={index}
              className="skill-tag"
            >
              ✗ {skill}
            </span>
  
          ))}
  
        </div>
  
      </div>
  
      {/* ATS Checklist */}
  
      <div className="card">
  
        <h2>ATS Checklist</h2>
  
        <ul>
  
          {Object.entries(atsChecks).map(
            ([key, value]) => (
  
              <li key={key}>
                {value ? "✅" : "❌"} {key}
              </li>
  
            )
          )}
  
        </ul>
  
      </div>

      <div className="card">

        <h2>Resume Suggestions</h2>

        <ul>

          {suggestions.map(
            (item, index) => (

             <li key={index}>
          💡  {item}
             </li>

            )
          )}

        </ul>

      </div>
  
    </div>
  );
}

export default App;
