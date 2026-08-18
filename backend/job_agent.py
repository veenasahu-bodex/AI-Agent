import os
import json
import re
import unicodedata

from dotenv import load_dotenv
from groq import Groq
from jobspy import scrape_jobs


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. "
        "Please add GROQ_API_KEY to your .env file."
    )


client = Groq(api_key=GROQ_API_KEY)


# =========================================================
# SUPPORTED JOB SOURCES
# =========================================================

JOB_SITES = [
    "linkedin",
    "indeed",
    "glassdoor",
]


# =========================================================
# LOCATION ALIASES
# =========================================================

LOCATION_ALIASES = {
    "bangalore": [
        "bangalore",
        "bengaluru",
    ],

    "bengaluru": [
        "bangalore",
        "bengaluru",
    ],

    "bombay": [
        "bombay",
        "mumbai",
    ],

    "mumbai": [
        "bombay",
        "mumbai",
    ],

    "calcutta": [
        "calcutta",
        "kolkata",
    ],

    "kolkata": [
        "calcutta",
        "kolkata",
    ],

    "madras": [
        "madras",
        "chennai",
    ],

    "chennai": [
        "madras",
        "chennai",
    ],

    "delhi": [
        "delhi",
        "new delhi",
    ],

    "new delhi": [
        "delhi",
        "new delhi",
    ],

    "gurgaon": [
        "gurgaon",
        "gurugram",
    ],

    "gurugram": [
        "gurgaon",
        "gurugram",
    ],
}


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def normalize_text(value):
    """
    Normalize text for comparison.

    Example:
    'New York, NY'
    ->
    'new york ny'
    """

    if value is None:
        return ""

    value = str(value)

    value = unicodedata.normalize(
        "NFKD",
        value
    )

    value = value.encode(
        "ascii",
        "ignore"
    ).decode()

    value = value.lower()

    value = re.sub(
        r"[^a-z0-9\s]",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


# =========================================================
# LOCATION MATCHING
# =========================================================

def get_location_terms(location):
    """
    Convert requested location into searchable terms.

    Example:

    Chhattisgarh
    ->
    ['chhattisgarh']

    Bangalore
    ->
    ['bangalore', 'bengaluru']
    """

    normalized = normalize_text(location)

    if not normalized:
        return []

    if normalized in LOCATION_ALIASES:
        return LOCATION_ALIASES[normalized]

    return [normalized]


def location_matches(
    requested_location,
    job_location,
    remote=False,
):
    """
    Check whether a job belongs to requested location.

    Important:
    This prevents results like:

    User:
    Python Developer in Chhattisgarh

    Result:
    New York, NY

    from being shown.
    """

    requested = normalize_text(
        requested_location
    )

    actual = normalize_text(
        job_location
    )

    # ---------------------------------------------
    # Remote search
    # ---------------------------------------------

    if remote:

        if "remote" in actual:
            return True

        if "work from home" in actual:
            return True

        if "wfh" in actual:
            return True

        # If remote is requested and location is
        # also provided, require either remote or
        # requested location.
        if requested:
            terms = get_location_terms(
                requested
            )

            return any(
                term in actual
                for term in terms
            )

        return True

    # ---------------------------------------------
    # No location requested
    # ---------------------------------------------

    if not requested:
        return True

    # ---------------------------------------------
    # Location terms
    # ---------------------------------------------

    terms = get_location_terms(
        requested
    )

    if not terms:
        return True

    # ---------------------------------------------
    # Exact/partial location match
    # ---------------------------------------------

    for term in terms:

        term = normalize_text(term)

        if not term:
            continue

        if term in actual:
            return True

    return False


# =========================================================
# CLEAN VALUE
# =========================================================

def clean_value(value):
    """
    Convert pandas/NaN/None values
    into JSON/frontend safe values.
    """

    if value is None:
        return ""

    try:

        if value != value:
            return ""

    except Exception:
        pass

    return str(value)


# =========================================================
# AI JOB REQUIREMENT EXTRACTION
# =========================================================

def extract_job_requirements(message):
    """
    Use Groq AI to understand natural language.

    Example:

    'mujhe chhattisgarh me python developer ki job chahiye'

    becomes:

    {
        "intent": "job_search",
        "job_title": "Python Developer",
        "location": "Chhattisgarh",
        "experience": "",
        "remote": false,
        "keywords": ["Python"]
    }
    """

    prompt = f"""
You are JobAgent, an AI job search assistant.

Analyze the user's message and extract job search requirements.

User message:
"{message}"

Return ONLY valid JSON.

Use exactly this structure:

{{
    "intent": "job_search",
    "job_title": "",
    "location": "",
    "experience": "",
    "remote": false,
    "keywords": []
}}

Rules:

1. job_title:
Extract the main job role.

Examples:
React Developer
Python Developer
Data Analyst
Software Engineer
Frontend Developer

2. location:
Extract the requested city, state, country,
or geographical area.

Examples:
Chhattisgarh
Raipur
Delhi
Bangalore
Mumbai
India

If no location is mentioned:
return an empty string.

3. experience:
Extract experience if mentioned.

Examples:
2 years
3 years
5 years
fresher

If not mentioned:
return an empty string.

4. remote:
Return true when the user asks for:
remote
work from home
WFH
work remotely

Otherwise return false.

5. keywords:
Extract useful technologies and skills.

Examples:
["Python", "Django"]
["React", "JavaScript"]
["Java", "Spring Boot"]

6. Conversation:

If the user is only greeting or casual chatting,
return:

{{
    "intent": "conversation",
    "job_title": "",
    "location": "",
    "experience": "",
    "remote": false,
    "keywords": []
}}

Do not add explanations.
Return JSON only.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are a job requirement extraction "
                    "assistant. Return valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],

        temperature=0,

        max_tokens=500,
    )

    content = (
        response.choices[0]
        .message
        .content
        .strip()
    )

    # Remove markdown code fences
    content = re.sub(
        r"^```json\s*|\s*```$",
        "",
        content,
        flags=re.IGNORECASE,
    ).strip()
    try:
        data = json.loads(content)

    except json.JSONDecodeError:

        raise ValueError(
            "Groq returned invalid JSON: "
            + content
        )

    return data
# JOB SEARCH
def search_jobs(
    keyword,
    location="India",
    results_wanted=30,
    hours_old=72,
    remote=False,
):
    """
    Search LinkedIn, Indeed and Glassdoor
    using JobSpy.

    Then:

    1. Clean results
    2. Filter location
    3. Remove duplicates
    4. Count sources
    """

    keyword = keyword.strip()

    if not keyword:
        return []

    location = (
        location.strip()
        if location
        else "India"
    )

    print()
    print("=" * 60)
    print("JOB SEARCH")
    print("=" * 60)
    print("Keyword :", keyword)
    print("Location:", location)
    print("Remote  :", remote)
    print("Sources :", JOB_SITES)
    print("=" * 60)

    try:

        jobs = scrape_jobs(
            site_name=JOB_SITES,

            search_term=keyword,

            location=location,

            results_wanted=results_wanted,

            hours_old=hours_old,

            is_remote=remote,

            verbose=1,
        )

        if jobs is None:
            print("JobSpy returned no data.")
            return []

        records = jobs.to_dict(
            orient="records"
        )

        print(
            f"Raw jobs received: {len(records)}"
        )

        # LOCATION FILTER
        location_filtered = []

        for job in records:

            job_location = clean_value(
                job.get("location")
            )

            matches = location_matches(
                requested_location=location,
                job_location=job_location,
                remote=remote,
            )

            if matches:
                location_filtered.append(
                    job
                )

            else:
                print(
                    "Location filtered:",
                    clean_value(
                        job.get("title")
                    ),
                    "|",
                    job_location,
                )

        print(
            "After location filtering:",
            len(location_filtered)
        )

        # CLEAN + DUPLICATE REMOVAL
        cleaned_jobs = []

        seen_urls = set()
        seen_keys = set()

        for job in location_filtered:

            title = clean_value(
                job.get("title")
            )

            company = clean_value(
                job.get("company")
            )

            job_location = clean_value(
                job.get("location")
            )

            site = clean_value(
                job.get("site")
            ).lower()

            job_url = clean_value(
                job.get("job_url")
            )

            # URL duplicate
            normalized_url = normalize_text(
                job_url
            )

            if normalized_url:
                if normalized_url in seen_urls:
                    continue

                seen_urls.add(
                    normalized_url
                )

            # Title + company + location duplicate
            duplicate_key = (
                normalize_text(title)
                + "|"
                + normalize_text(company)
                + "|"
                + normalize_text(job_location)
            )

            if duplicate_key in seen_keys:
                continue

            seen_keys.add(
                duplicate_key
            )

            # Clean job
            cleaned_job = {
                "title": title,

                "company": company,

                "location": job_location,

                "site": site,

                "job_url": job_url,

                "date_posted": clean_value(
                    job.get("date_posted")
                ),

                "job_type": clean_value(
                    job.get("job_type")
                ),

                "is_remote": bool(
                    job.get(
                        "is_remote",
                        remote
                    )
                ),

                "description": clean_value(
                    job.get("description")
                ),
            }

            cleaned_jobs.append(
                cleaned_job
            )

        print(
            "After duplicate removal:",
            len(cleaned_jobs)
        )
        cleaned_jobs = cleaned_jobs[:20]

        print(
        "Final jobs returned:",
          len(cleaned_jobs)
        )


        print("=" * 60)

        return cleaned_jobs

    except Exception as error:

        print()
        print("JOBSPY ERROR:")
        print(error)
        print()

        return []


# =========================================================
# SOURCE COUNT
# =========================================================

def get_source_counts(jobs):
    """
    Count jobs source-wise.

    Example:

    {
        "linkedin": 4,
        "indeed": 3,
        "glassdoor": 2
    }
    """

    counts = {}

    for job in jobs:

        source = normalize_text(
            job.get("site")
        )

        if not source:
            source = "unknown"

        counts[source] = (
            counts.get(source, 0) + 1
        )

    return counts


# =========================================================
# AGENT
# =========================================================

def run_agent(
    message,
    default_location="India",
):
    """
    Complete JobAgent workflow.

    User
      ↓
    Groq
      ↓
    Requirements
      ↓
    JobSpy
      ↓
    Location filtering
      ↓
    Duplicate removal
      ↓
    Source counting
      ↓
    Response
    """

    message = message.strip()

    if not message:

        return {
            "success": False,
            "intent": "conversation",
            "message": (
                "Please tell me what type of "
                "job you are looking for."
            ),
            "jobs": [],
            "source_counts": {},
            "total": 0,
        }

    try:

        # =================================================
        # AI PARSING
        # =================================================

        requirements = (
            extract_job_requirements(
                message
            )
        )

        print()
        print("AI REQUIREMENTS:")
        print(
            json.dumps(
                requirements,
                indent=2
            )
        )

        # =================================================
        # CONVERSATION
        # =================================================

        if (
            requirements.get("intent")
            == "conversation"
        ):

            return {
                "success": True,
                "intent": "conversation",

                "message": (
                    "Hi! I'm JobAgent. Tell me what "
                    "kind of job you're looking for "
                    "and I'll search matching jobs."
                ),

                "requirements": requirements,

                "jobs": [],

                "source_counts": {},

                "total": 0,
            }

        # =================================================
        # JOB TITLE
        # =================================================

        job_title = clean_value(
            requirements.get(
                "job_title"
            )
        ).strip()

        keywords = requirements.get(
            "keywords",
            []
        )

        if not isinstance(
            keywords,
            list
        ):
            keywords = []

        keywords = [
            str(keyword).strip()
            for keyword in keywords
            if str(keyword).strip()
        ]

        # If AI didn't extract title,
        # use keywords.

        if not job_title and keywords:

            job_title = " ".join(
                keywords
            )

        # =================================================
        # NO JOB TITLE
        # =================================================

        if not job_title:

            return {
                "success": True,
                "intent": "conversation",

                "message": (
                    "What type of job are you "
                    "looking for? For example, "
                    "Python Developer or "
                    "React Developer."
                ),

                "requirements": requirements,

                "jobs": [],

                "source_counts": {},

                "total": 0,
            }

        # =================================================
        # LOCATION
        # =================================================

        requested_location = clean_value(
            requirements.get(
                "location"
            )
        ).strip()

        if not requested_location:

            requested_location = (
                default_location
                or "India"
            )

        # =================================================
        # REMOTE
        # =================================================

        remote = bool(
            requirements.get(
                "remote",
                False
            )
        )

        # =================================================
        # SEARCH KEYWORD
        # =================================================

        search_terms = [
            job_title
        ]

        for keyword in keywords:

            if normalize_text(
                keyword
            ) not in normalize_text(
                job_title
            ):

                search_terms.append(
                    keyword
                )

        search_keyword = " ".join(
            search_terms
        )

        # =================================================
        # SEARCH
        # =================================================

        jobs = search_jobs(
            keyword=search_keyword,

            location=requested_location,

            results_wanted=30,

            hours_old=72,

            remote=remote,
        )

        # =================================================
        # SOURCE COUNTS
        # =================================================

        source_counts = (
            get_source_counts(
                jobs
            )
        )

        # =================================================
        # NO RESULTS
        # =================================================

        if not jobs:

            return {
                "success": True,

                "intent": "job_search",

                "message": (
                    f"I couldn't find matching "
                    f"{job_title} jobs in "
                    f"{requested_location}."
                ),

                "requirements": {
                    "job_title": job_title,
                    "location": requested_location,
                    "experience": clean_value(
                        requirements.get(
                            "experience"
                        )
                    ),
                    "remote": remote,
                    "keywords": keywords,
                },

                "jobs": [],

                "source_counts": {},

                "total": 0,
            }

        # =================================================
        # SOURCE SUMMARY
        # =================================================

        source_parts = []

        for source, count in (
            source_counts.items()
        ):

            source_name = (
                source.title()
            )

            source_parts.append(
                f"{source_name}: {count}"
            )

        source_summary = ", ".join(
            source_parts
        )

        # =================================================
        # SUCCESS MESSAGE
        # =================================================

        remote_text = (
            " remote"
            if remote
            else ""
        )

        message_text = (
            f"I found {len(jobs)}"
            f"{remote_text} "
            f"{job_title} jobs in "
            f"{requested_location}."
        )

        if source_summary:

            message_text += (
                f" Sources: "
                f"{source_summary}."
            )

        # =================================================
        # FINAL RESPONSE
        # =================================================

        return {
            "success": True,

            "intent": "job_search",

            "message": message_text,

            "requirements": {
                "job_title": job_title,

                "location": requested_location,

                "experience": clean_value(
                    requirements.get(
                        "experience"
                    )
                ),

                "remote": remote,

                "keywords": keywords,
            },

            "total": len(jobs),

            "source_counts": source_counts,

            "jobs": jobs,
        }

    except Exception as error:

        print()
        print("JOB AGENT ERROR:")
        print(error)
        print()

        return {
            "success": False,

            "intent": "error",

            "message": (
                "Sorry, something went wrong "
                "while searching for jobs."
            ),

            "error": str(error),

            "jobs": [],

            "source_counts": {},

            "total": 0,
        }