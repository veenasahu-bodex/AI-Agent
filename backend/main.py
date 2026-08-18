from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from job_agent import run_agent, search_jobs


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="JobAgent API",
    description="AI powered job search agent using Groq and JobSpy",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# REQUEST MODELS
# =====================================================

class AgentRequest(BaseModel):
    message: str
    location: str = "India"


class JobSearchRequest(BaseModel):
    keyword: str
    location: str = "India"
    results_wanted: int = 10
    hours_old: int = 72
    remote: bool = False


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {
        "message": "JobAgent API is running",
        "status": "online"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "JobAgent",
        "message": "Backend is healthy"
    }


# =====================================================
# AI AGENT
# =====================================================

@app.post("/api/agent")
def agent(request: AgentRequest):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message is required"
        )

    try:

        result = run_agent(
            message=message,
            default_location=request.location
        )

        return result

    except Exception as error:

        print("AGENT ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="JobAgent failed to process the request"
        )


# =====================================================
# DIRECT JOB SEARCH
# =====================================================

@app.post("/api/jobs/search")
def direct_job_search(request: JobSearchRequest):

    keyword = request.keyword.strip()

    if not keyword:
        raise HTTPException(
            status_code=400,
            detail="Job keyword is required"
        )

    try:

        jobs = search_jobs(
            keyword=keyword,
            location=request.location,
            results_wanted=request.results_wanted,
            hours_old=request.hours_old,
            remote=request.remote
        )

        return {
            "success": True,
            "keyword": keyword,
            "location": request.location,
            "remote": request.remote,
            "total": len(jobs),
            "jobs": jobs
        }

    except Exception as error:

        print("JOB SEARCH ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to search jobs"
        )


# =====================================================
# SERVER TEST
# =====================================================

@app.get("/api/test")
def test():

    return {
        "success": True,
        "message": "JobAgent backend is working"
    }