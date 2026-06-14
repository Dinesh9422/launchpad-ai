from jobs.models import Job
import random

TITLES = [
    "Python Developer", "Full Stack Developer", "React Developer",
    "Django Developer", "Software Engineer", "Backend Developer",
    "Frontend Developer", "Data Analyst", "Machine Learning Engineer",
    "DevOps Engineer", "QA Engineer", "Java Developer"
]

COMPANIES = [
    "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL Technologies",
    "Tech Mahindra", "Capgemini", "IBM India", "Zoho", "Freshworks",
    "Razorpay", "Swiggy", "Flipkart", "Amazon India", "Mindtree"
]

LOCATIONS = [
    "Bangalore", "Chennai", "Hyderabad", "Pune", "Salem", "Coimbatore",
    "Mumbai", "Remote", "Delhi NCR", "Kochi"
]

SKILLS_MAP = {
    "Python Developer": ["Python", "Django", "REST API", "PostgreSQL", "Git"],
    "Full Stack Developer": ["React", "Node.js", "MongoDB", "JavaScript", "Express"],
    "React Developer": ["React", "JavaScript", "Redux", "HTML", "CSS", "TypeScript"],
    "Django Developer": ["Django", "Python", "PostgreSQL", "REST Framework", "Celery"],
    "Software Engineer": ["Java", "Python", "Data Structures", "Algorithms", "SQL"],
    "Backend Developer": ["Python", "Node.js", "Django", "FastAPI", "PostgreSQL", "Redis"],
    "Frontend Developer": ["React", "Vue", "JavaScript", "CSS", "HTML", "Tailwind"],
    "Data Analyst": ["Python", "SQL", "Excel", "Power BI", "Pandas", "NumPy"],
    "Machine Learning Engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Jenkins"],
    "QA Engineer": ["Selenium", "Python", "Manual Testing", "API Testing", "Postman"],
    "Java Developer": ["Java", "Spring Boot", "Hibernate", "MySQL", "REST API"],
}

SOURCES = ['linkedin', 'naukri', 'indeed', 'internshala']
EXPERIENCE_LEVELS = ["0-1 years", "1-3 years", "2-4 years", "3-5 years", "Fresher"]
SALARY_RANGES = ["3-5 LPA", "4-7 LPA", "5-8 LPA", "6-10 LPA", "8-12 LPA", "Not disclosed"]


def run():
    Job.objects.all().delete()
    jobs_created = 0

    for _ in range(150):
        title = random.choice(TITLES)
        company = random.choice(COMPANIES)
        location = random.choice(LOCATIONS)
        skills = SKILLS_MAP.get(title, ["Python", "SQL"])

        Job.objects.create(
            title=title,
            company=company,
            location=location,
            salary=random.choice(SALARY_RANGES),
            experience=random.choice(EXPERIENCE_LEVELS),
            description=f"We are looking for a {title} to join {company}. "
                         f"You will work on building scalable applications using {', '.join(skills[:3])}. "
                         f"Strong problem-solving skills and a passion for technology required.",
            skills_required=skills,
            source=random.choice(SOURCES),
            url=f"https://example.com/jobs/{title.lower().replace(' ', '-')}-{company.lower().replace(' ', '-')}"
        )
        jobs_created += 1

    print(f"{jobs_created} jobs created successfully!")