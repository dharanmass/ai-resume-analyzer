from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from pydantic import BaseModel
from database import engine
from models import Base
from database import SessionLocal
from models import ResumeAnalysis

Base.metadata.create_all(bind=engine)

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str

skills_db = [
    "python",
    "java",
    "sql",
    "react",
    "typescript",
    "javascript",
    "html",
    "css",
    "docker",
    "aws",
    "git",
    "github",
    "fastapi",
    "mongodb",
    "mysql",
    "linux",
    "ui",
    "ux",
    "figma",
    "ruby",
    "go",
    "rust",
    "nodejs",
    "angular",
    "kubernetes"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend running successfully"}

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    filepath = f"uploads/{file.filename}"

    with open(filepath, "wb") as f:
        f.write(await file.read())

    text = ""

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    detected_skills = []

    lower_text = text.lower()

    for skill in skills_db:
        if skill in lower_text:
            detected_skills.append(skill)

    return {
        "filename": file.filename,
        "text": text,
        "skills": detected_skills
    }

@app.post("/match")
def match_job(data: JobMatchRequest):

    resume_text = data.resume_text.lower()
    job_description = data.job_description.lower()

    matched_skills = []
    missing_skills = []

    for skill in skills_db:

        if skill in job_description:

            if skill in resume_text:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

    total = len(matched_skills) + len(missing_skills)

    score = 0

    if total > 0:
        score = round((len(matched_skills) / total) * 100)

    return {
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }

@app.post("/ats-score")
def ats_score(data: JobMatchRequest):

    text = data.resume_text.lower()

    print(text[:1000])

    checks = {
        "skills": any(word in text for word in ["skills", "technical skills"]),
        "education": any(word in text for word in ["education", "academic"]),
        "experience": any(word in text for word in ["experience", "work experience"]),
        "projects": any(word in text for word in ["project", "projects"]),
        "certifications": any(word in text for word in ["certification", "certificate"]),
    }
    
    score = sum(checks.values()) * 20

    return {
        "score": score,
        "checks": checks
    }

@app.post("/suggestions")
def suggestions(data: JobMatchRequest):

    resume_text = data.resume_text.lower()
    job_description = data.job_description.lower()

    suggestions = []

    for skill in skills_db:
        if skill in job_description and skill not in resume_text:
            suggestions.append(
                f"Add {skill} to your resume."
            )

    if "project" not in resume_text:
        suggestions.append(
            "Add a Projects section."
        )

    if "certification" not in resume_text:
        suggestions.append(
            "Add Certifications section."
        )

    if len(suggestions) == 0:
        suggestions.append(
            "Resume looks good for this job."
        )

    return {
        "suggestions": suggestions
    }

@app.post("/save")
def save_result():

    db = SessionLocal()

    analysis = ResumeAnalysis(
        filename="resume.pdf",
        match_score=80,
        ats_score=60,
        skills="python,react,docker"
    )

    db.add(analysis)
    db.commit()

    return {
        "message": "Saved Successfully"
    }

@app.get("/results")
def get_results():

    db = SessionLocal()

    results = db.query(ResumeAnalysis).all()

    data = []

    for item in results:
        data.append({
            "id": item.id,
            "filename": item.filename,
            "match_score": item.match_score,
            "ats_score": item.ats_score,
            "skills": item.skills
        })

    return data