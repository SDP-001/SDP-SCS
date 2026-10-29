import json
import hashlib
import os

def generate_deterministic_uuid(seed: str) -> str:
    h = hashlib.sha256(seed.encode('utf-8')).hexdigest()
    return f"{h[0:8]}-{h[8:12]}-4{h[13:16]}-a{h[17:20]}-{h[20:32]}"

DEFAULT_COLLEGE_ID = "11111111-1111-1111-1111-111111111111"

# 1. College
colleges = [
    {
        "id": DEFAULT_COLLEGE_ID,
        "name": "Nandha Engineering College (NEC)",
        "code": "NEC",
        "logo_url": "/nec-logo.png",
        "created_at": "2026-01-01T00:00:00.000Z",
    }
]

# 2. College Settings
college_settings = [
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "college_id": DEFAULT_COLLEGE_ID,
        "max_points_per_certificate": 100,
        "reviewer_reclaim_timeout_minutes": 30,
        "max_file_size_mb": 10,
        "updated_at": "2026-10-29T10:00:00.000Z",
    }
]

# 3. Departments (12 UG + 4 PG)
departments = [
    # UG
    { "id": "33333333-3333-3333-3333-333333333301", "college_id": DEFAULT_COLLEGE_ID, "name": "Computer Science and Engineering", "code": "CSE", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333302", "college_id": DEFAULT_COLLEGE_ID, "name": "Information Technology", "code": "IT", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333303", "college_id": DEFAULT_COLLEGE_ID, "name": "Electronics and Communication Engineering", "code": "ECE", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333304", "college_id": DEFAULT_COLLEGE_ID, "name": "Mechanical Engineering", "code": "MECH", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333305", "college_id": DEFAULT_COLLEGE_ID, "name": "Electrical and Electronics Engineering", "code": "EEE", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333306", "college_id": DEFAULT_COLLEGE_ID, "name": "Civil Engineering", "code": "CIVIL", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333307", "college_id": DEFAULT_COLLEGE_ID, "name": "Artificial Intelligence and Data Science", "code": "AIDS", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333312", "college_id": DEFAULT_COLLEGE_ID, "name": "Agricultural Engineering", "code": "AGRI", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333313", "college_id": DEFAULT_COLLEGE_ID, "name": "Biomedical Engineering", "code": "BME", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333314", "college_id": DEFAULT_COLLEGE_ID, "name": "Chemical Engineering", "code": "CHEMICAL", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333315", "college_id": DEFAULT_COLLEGE_ID, "name": "Computer Science and Engineering (Cyber Security)", "code": "CSE(CS)", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333316", "college_id": DEFAULT_COLLEGE_ID, "name": "Computer Science and Engineering (Internet of Things)", "code": "CSE(IoT)", "type": "UG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    # PG
    { "id": "33333333-3333-3333-3333-333333333308", "college_id": DEFAULT_COLLEGE_ID, "name": "M.E. Computer Science and Engineering", "code": "ME-CSE", "type": "PG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333309", "college_id": DEFAULT_COLLEGE_ID, "name": "M.E. VLSI Design", "code": "ME-VLSI", "type": "PG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333310", "college_id": DEFAULT_COLLEGE_ID, "name": "Master of Business Administration", "code": "MBA", "type": "PG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": "33333333-3333-3333-3333-333333333311", "college_id": DEFAULT_COLLEGE_ID, "name": "Master of Computer Applications", "code": "MCA", "type": "PG", "is_active": True, "created_at": "2026-01-01T00:00:00.000Z" },
]

dept_map = {
    "CSE": "33333333-3333-3333-3333-333333333301",
    "IT": "33333333-3333-3333-3333-333333333302",
    "ECE": "33333333-3333-3333-3333-333333333303",
    "MECH": "33333333-3333-3333-3333-333333333304",
    "EEE": "33333333-3333-3333-3333-333333333305",
    "CIVIL": "33333333-3333-3333-3333-333333333306",
    "AIDS": "33333333-3333-3333-3333-333333333307",
    "AI&DS": "33333333-3333-3333-3333-333333333307",
    "AGRI": "33333333-3333-3333-3333-333333333312",
    "BME": "33333333-3333-3333-3333-333333333313",
    "CHEMICAL": "33333333-3333-3333-3333-333333333314",
    "CSE(CS)": "33333333-3333-3333-3333-333333333315",
    "CSE(IoT)": "33333333-3333-3333-3333-333333333316",
    "ME-CSE": "33333333-3333-3333-3333-333333333308",
    "ME-VLSI": "33333333-3333-3333-3333-333333333309",
    "MBA": "33333333-3333-3333-3333-333333333310",
    "MCA": "33333333-3333-3333-3333-333333333311",
}

# 4. Categories (13 Institutional categories with required fields)
category_names = [
    ("Academic", "University ranks, semester honors, academic symposium merits"),
    ("Technical", "National coding contests, project expos, technical paper presentations"),
    ("Sports", "Inter-collegiate, zonal, state, and national athletic championships"),
    ("Cultural", "Music, dance, fine arts, literary debate, and drama competitions"),
    ("Workshop", "Accredited hands-on technical workshops, industrial bootcamps"),
    ("Seminar", "Specialized seminars, research symposiums, and invited talks"),
    ("Hackathon", "National and global 24h-48h software & hardware hackathons"),
    ("Competition", "Quiz leagues, business plan expos, robotic grand challenges"),
    ("Certification", "Industry certifications (AWS, Cisco, Red Hat, Microsoft, NPTEL)"),
    ("Research", "Scopus/SCI indexed journal publications, conferences, and patents"),
    ("Leadership", "Elected student council officers, technical society presidents, club leads"),
    ("Volunteering", "NSS, YRC, social outreach, environmental awareness campaigns"),
    ("Other", "Other verified institutional and co-curricular achievements"),
]

categories = []
for idx, (c_name, c_desc) in enumerate(category_names, 1):
    categories.append({
        "id": f"44444444-4444-4444-4444-4444444444{idx:02d}",
        "college_id": DEFAULT_COLLEGE_ID,
        "name": c_name,
        "description": c_desc,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    })

profiles = []
passwords = {}
audit_logs = []

# Admin Profile
admin_profile_id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
profiles.append({
    "id": admin_profile_id,
    "college_id": DEFAULT_COLLEGE_ID,
    "role": "ADMIN",
    "email": "admin@nandhaengg.org",
    "phone_number": "+91 94433 11220",
    "full_name": "Dr. Arthur Vance (Dean / Admin)",
    "avatar_url": None,
    "is_active": True,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
})
passwords[admin_profile_id] = "password123"

# Faculty & HOD Roster (All 16 departments)
faculty = []
faculty_config = [
    # CSE
    { "deptCode": "CSE", "deptId": "33333333-3333-3333-3333-333333333301", "members": [
        { "profileId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03", "facultyId": "55555555-5555-5555-5555-555555555503", "empId": "FAC-CSE-001", "name": "Dr. Murugan Pillai (HOD-CSE)", "email": "hod.cse@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00101" },
        { "profileId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01", "facultyId": "55555555-5555-5555-5555-555555555501", "empId": "FAC-CSE-101", "name": "Prof. Ramesh Sharma", "email": "prof.sharma@nandhaengg.org", "designation": "Associate Professor", "isHod": False, "phone": "+91 94432 00102" },
        { "profileId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05", "facultyId": "55555555-5555-5555-5555-555555555505", "empId": "FAC-CSE-102", "name": "Prof. N. Radhika", "email": "prof.radhika@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 00103" },
    ]},
    # IT
    { "deptCode": "IT", "deptId": "33333333-3333-3333-3333-333333333302", "members": [
        { "profileId": generate_deterministic_uuid("fac-it-hod"), "facultyId": generate_deterministic_uuid("fac-rec-it-hod"), "empId": "FAC-IT-001", "name": "Dr. S. K. Balamurugan (HOD-IT)", "email": "hod.it@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00201" },
        { "profileId": generate_deterministic_uuid("fac-it-p1"), "facultyId": generate_deterministic_uuid("fac-rec-it-p1"), "empId": "FAC-IT-102", "name": "Prof. K. Soundararajan", "email": "prof.soundararajan@nandhaengg.org", "designation": "Associate Professor", "isHod": False, "phone": "+91 94432 00202" },
    ]},
    # ECE
    { "deptCode": "ECE", "deptId": "33333333-3333-3333-3333-333333333303", "members": [
        { "profileId": generate_deterministic_uuid("fac-ece-hod"), "facultyId": generate_deterministic_uuid("fac-rec-ece-hod"), "empId": "FAC-ECE-001", "name": "Dr. C. N. Marimuthu (HOD-ECE)", "email": "hod.ece@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00301" },
        { "profileId": generate_deterministic_uuid("fac-ece-p1"), "facultyId": generate_deterministic_uuid("fac-rec-ece-p1"), "empId": "FAC-ECE-101", "name": "Prof. V. Sivakumar", "email": "prof.sivakumar@nandhaengg.org", "designation": "Associate Professor", "isHod": False, "phone": "+91 94432 00302" },
    ]},
    # MECH
    { "deptCode": "MECH", "deptId": "33333333-3333-3333-3333-333333333304", "members": [
        { "profileId": generate_deterministic_uuid("fac-mech-hod"), "facultyId": generate_deterministic_uuid("fac-rec-mech-hod"), "empId": "FAC-MECH-001", "name": "Dr. E. Raja (HOD-MECH)", "email": "hod.mech@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00401" },
        { "profileId": generate_deterministic_uuid("fac-mech-p1"), "facultyId": generate_deterministic_uuid("fac-rec-mech-p1"), "empId": "FAC-MECH-101", "name": "Prof. M. Saravanan", "email": "prof.saravanan@nandhaengg.org", "designation": "Associate Professor", "isHod": False, "phone": "+91 94432 00402" },
    ]},
    # EEE
    { "deptCode": "EEE", "deptId": "33333333-3333-3333-3333-333333333305", "members": [
        { "profileId": generate_deterministic_uuid("fac-eee-hod"), "facultyId": generate_deterministic_uuid("fac-rec-eee-hod"), "empId": "FAC-EEE-001", "name": "Dr. P. Jamuna (HOD-EEE)", "email": "hod.eee@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00501" },
        { "profileId": generate_deterministic_uuid("fac-eee-p1"), "facultyId": generate_deterministic_uuid("fac-rec-eee-p1"), "empId": "FAC-EEE-101", "name": "Prof. S. Karthick", "email": "prof.karthick@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 00502" },
    ]},
    # CIVIL
    { "deptCode": "CIVIL", "deptId": "33333333-3333-3333-3333-333333333306", "members": [
        { "profileId": generate_deterministic_uuid("fac-civil-hod"), "facultyId": generate_deterministic_uuid("fac-rec-civil-hod"), "empId": "FAC-CIVIL-001", "name": "Dr. K. Nirmalkumar (HOD-CIVIL)", "email": "hod.civil@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00601" },
        { "profileId": generate_deterministic_uuid("fac-civil-p1"), "facultyId": generate_deterministic_uuid("fac-rec-civil-p1"), "empId": "FAC-CIVIL-101", "name": "Prof. T. Poongodi", "email": "prof.poongodi@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 00602" },
    ]},
    # AIDS
    { "deptCode": "AIDS", "deptId": "33333333-3333-3333-3333-333333333307", "members": [
        { "profileId": generate_deterministic_uuid("fac-aids-hod"), "facultyId": generate_deterministic_uuid("fac-rec-aids-hod"), "empId": "FAC-AIDS-001", "name": "Dr. R. Senthamilselvan (HOD-AIDS)", "email": "hod.aids@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00701" },
        { "profileId": generate_deterministic_uuid("fac-aids-p1"), "facultyId": generate_deterministic_uuid("fac-rec-aids-p1"), "empId": "FAC-AIDS-101", "name": "Prof. A. Geetha", "email": "prof.geetha@nandhaengg.org", "designation": "Associate Professor", "isHod": False, "phone": "+91 94432 00702" },
    ]},
    # AGRI
    { "deptCode": "AGRI", "deptId": "33333333-3333-3333-3333-333333333312", "members": [
        { "profileId": generate_deterministic_uuid("fac-agri-hod"), "facultyId": generate_deterministic_uuid("fac-rec-agri-hod"), "empId": "FAC-AGRI-001", "name": "Dr. K. Saravanan (HOD-AGRI)", "email": "hod.agri@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01201" },
        { "profileId": generate_deterministic_uuid("fac-agri-p1"), "facultyId": generate_deterministic_uuid("fac-rec-agri-p1"), "empId": "FAC-AGRI-101", "name": "Prof. P. Ramesh", "email": "prof.ramesh.agri@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 01202" },
    ]},
    # BME
    { "deptCode": "BME", "deptId": "33333333-3333-3333-3333-333333333313", "members": [
        { "profileId": generate_deterministic_uuid("fac-bme-hod"), "facultyId": generate_deterministic_uuid("fac-rec-bme-hod"), "empId": "FAC-BME-001", "name": "Dr. S. Kavitha (HOD-BME)", "email": "hod.bme@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01301" },
        { "profileId": generate_deterministic_uuid("fac-bme-p1"), "facultyId": generate_deterministic_uuid("fac-rec-bme-p1"), "empId": "FAC-BME-101", "name": "Prof. R. Deepa", "email": "prof.deepa.bme@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 01302" },
    ]},
    # CHEMICAL
    { "deptCode": "CHEMICAL", "deptId": "33333333-3333-3333-3333-333333333314", "members": [
        { "profileId": generate_deterministic_uuid("fac-chem-hod"), "facultyId": generate_deterministic_uuid("fac-rec-chem-hod"), "empId": "FAC-CHEM-001", "name": "Dr. M. Senthil Kumar (HOD-CHEM)", "email": "hod.chem@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01401" },
        { "profileId": generate_deterministic_uuid("fac-chem-p1"), "facultyId": generate_deterministic_uuid("fac-rec-chem-p1"), "empId": "FAC-CHEM-101", "name": "Prof. V. Anand", "email": "prof.anand.chem@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 01402" },
    ]},
    # CSE(CS)
    { "deptCode": "CSE(CS)", "deptId": "33333333-3333-3333-3333-333333333315", "members": [
        { "profileId": generate_deterministic_uuid("fac-csecs-hod"), "facultyId": generate_deterministic_uuid("fac-rec-csecs-hod"), "empId": "FAC-CSECS-001", "name": "Dr. R. Karthikeyan (HOD-CSE-CS)", "email": "hod.csecs@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01501" },
        { "profileId": generate_deterministic_uuid("fac-csecs-p1"), "facultyId": generate_deterministic_uuid("fac-rec-csecs-p1"), "empId": "FAC-CSECS-101", "name": "Prof. S. Dinesh", "email": "prof.dinesh.csecs@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 01502" },
    ]},
    # CSE(IoT)
    { "deptCode": "CSE(IoT)", "deptId": "33333333-3333-3333-3333-333333333316", "members": [
        { "profileId": generate_deterministic_uuid("fac-cseiot-hod"), "facultyId": generate_deterministic_uuid("fac-rec-cseiot-hod"), "empId": "FAC-CSEIOT-001", "name": "Dr. P. Venkatesh (HOD-CSE-IoT)", "email": "hod.cseiot@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01601" },
        { "profileId": generate_deterministic_uuid("fac-cseiot-p1"), "facultyId": generate_deterministic_uuid("fac-rec-cseiot-p1"), "empId": "FAC-CSEIOT-101", "name": "Prof. M. Priya", "email": "prof.priya.cseiot@nandhaengg.org", "designation": "Assistant Professor", "isHod": False, "phone": "+91 94432 01602" },
    ]},
    # ME-CSE
    { "deptCode": "ME-CSE", "deptId": "33333333-3333-3333-3333-333333333308", "members": [
        { "profileId": generate_deterministic_uuid("fac-mecse-hod"), "facultyId": generate_deterministic_uuid("fac-rec-mecse-hod"), "empId": "FAC-MECSE-001", "name": "Dr. B. Senguttuvan (HOD-M.E. CSE)", "email": "hod.mecse@nandhaengg.org", "designation": "Professor & Head (PG)", "isHod": True, "phone": "+91 94432 00801" },
    ]},
    # ME-VLSI
    { "deptCode": "ME-VLSI", "deptId": "33333333-3333-3333-3333-333333333309", "members": [
        { "profileId": generate_deterministic_uuid("fac-vlsi-hod"), "facultyId": generate_deterministic_uuid("fac-rec-vlsi-hod"), "empId": "FAC-MEVLSI-001", "name": "Dr. S. Prakash (HOD-VLSI)", "email": "hod.vlsi@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 00901" },
    ]},
    # MBA
    { "deptCode": "MBA", "deptId": "33333333-3333-3333-3333-333333333310", "members": [
        { "profileId": generate_deterministic_uuid("fac-mba-hod"), "facultyId": generate_deterministic_uuid("fac-rec-mba-hod"), "empId": "FAC-MBA-001", "name": "Dr. N. Thangavel (Director & HOD-MBA)", "email": "hod.mba@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01001" },
    ]},
    # MCA
    { "deptCode": "MCA", "deptId": "33333333-3333-3333-3333-333333333311", "members": [
        { "profileId": generate_deterministic_uuid("fac-mca-hod"), "facultyId": generate_deterministic_uuid("fac-rec-mca-hod"), "empId": "FAC-MCA-001", "name": "Dr. P. Sathish (HOD-MCA)", "email": "hod.mca@nandhaengg.org", "designation": "Professor & Head", "isHod": True, "phone": "+91 94432 01101" },
    ]},
]

for group in faculty_config:
    for mem in group["members"]:
        profiles.append({
            "id": mem["profileId"],
            "college_id": DEFAULT_COLLEGE_ID,
            "role": "HOD" if mem["isHod"] else "FACULTY",
            "email": mem["email"],
            "phone_number": mem["phone"],
            "full_name": mem["name"],
            "avatar_url": None,
            "is_active": True,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z",
        })
        faculty.append({
            "id": mem["facultyId"],
            "profile_id": mem["profileId"],
            "college_id": DEFAULT_COLLEGE_ID,
            "department_id": group["deptId"],
            "designation": mem["designation"],
            "employee_id": mem["empId"],
            "is_hod": mem["isHod"],
            "created_at": "2026-01-01T00:00:00Z",
        })
        passwords[mem["profileId"]] = "password123"

# 5. ALL 1,028 STUDENTS
students = []
with open(r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/nec_students_2026.json', 'r', encoding='utf-8') as f:
    student_records = json.load(f)

for st in student_records:
    reg = st["reg_no"]
    prof_id = generate_deterministic_uuid(f"stu-prof-{reg}")
    stu_id = generate_deterministic_uuid(f"stu-rec-{reg}")
    d_id = dept_map.get(st["dept_code"], dept_map["CSE"])
    
    profiles.append({
        "id": prof_id,
        "college_id": DEFAULT_COLLEGE_ID,
        "role": "STUDENT",
        "email": st["email"],
        "phone_number": f"+91 {st['mobile']}" if st.get("mobile") else None,
        "full_name": st["name"],
        "avatar_url": None,
        "is_active": True,
        "created_at": "2026-08-01T00:00:00Z",
        "updated_at": "2026-08-01T00:00:00Z",
    })
    
    students.append({
        "id": stu_id,
        "profile_id": prof_id,
        "college_id": DEFAULT_COLLEGE_ID,
        "department_id": d_id,
        "register_number": reg,
        "academic_year": 1,
        "created_at": "2026-08-01T00:00:00Z",
    })
    
    passwords[prof_id] = st["password"]

# 6. Certificates, Files, Reviews & Points
certificates = []
certificate_files = []
certificate_reviews = []
point_records = []
notifications = []

default_reviewer_id = faculty[0]["id"]
hack_cat_id = categories[6]["id"]

# Single Anchor Certificate conforming exactly to Certificate interface
if students:
    s0 = students[0]
    c0_id = "77777777-7777-7777-7777-777777777701"
    certificates.append({
        "id": c0_id,
        "college_id": DEFAULT_COLLEGE_ID,
        "student_id": s0["id"],
        "achievement_id": None,
        "title": "Smart India Hackathon 2026 Winner (Hardware Edition)",
        "event_name": "Smart India Hackathon (SIH) 2026 Grand Finale",
        "category_id": hack_cat_id,
        "event_level": "NATIONAL",
        "organizer": "Ministry of Education & AICTE, New Delhi",
        "event_date": "2026-02-14",
        "achievement": "First Prize Winner",
        "description": "Developed IoT Autonomous Water Quality Monitoring Subsystem.",
        "status": "APPROVED",
        "reviewer_id": default_reviewer_id,
        "review_started_at": "2026-09-02T00:00:00Z",
        "submitted_at": "2026-09-01T00:00:00Z",
        "created_at": "2026-09-01T00:00:00Z",
        "updated_at": "2026-09-05T00:00:00Z",
    })

    certificate_files.append({
        "id": generate_deterministic_uuid(f"file-{c0_id}"),
        "certificate_id": c0_id,
        "version": 1,
        "file_type": "PRIMARY",
        "storage_path": f"certificates/{c0_id}/sih2026_first_prize_winner.pdf",
        "original_filename": "sih2026_first_prize_winner.pdf",
        "file_size": 1845200,
        "mime_type": "application/pdf",
        "file_hash": hashlib.sha256(c0_id.encode('utf-8')).hexdigest(),
        "created_at": "2026-09-01T00:00:00Z",
    })

    certificate_reviews.append({
        "id": generate_deterministic_uuid(f"rev-{c0_id}"),
        "certificate_id": c0_id,
        "reviewer_id": default_reviewer_id,
        "action": "APPROVED",
        "reason": None,
        "comment": "Outstanding national achievement verified with AICTE SIH records.",
        "created_at": "2026-09-05T00:00:00Z",
    })

    point_records.append({
        "id": generate_deterministic_uuid(f"pt-{c0_id}"),
        "student_id": s0["id"],
        "certificate_id": c0_id,
        "points": 100,
        "awarded_by": default_reviewer_id,
        "comment": "SIH Winner First Prize points.",
        "is_latest": True,
        "created_at": "2026-09-05T00:00:00Z",
    })

    notifications.append({
        "id": generate_deterministic_uuid("notif-welcome"),
        "user_id": s0["profile_id"],
        "type": "SYSTEM",
        "title": "Welcome to NEC-SCS Portal",
        "message": "Official student database loaded successfully.",
        "entity_type": None,
        "entity_id": None,
        "read_at": None,
        "created_at": "2026-09-01T00:00:00Z",
    })

# Audit Log
audit_logs.append({
    "id": generate_deterministic_uuid("audit-db-refresh-2026"),
    "college_id": DEFAULT_COLLEGE_ID,
    "actor_id": admin_profile_id,
    "action": "CONFIGURATION_CHANGED",
    "entity_type": "STUDENT",
    "entity_id": DEFAULT_COLLEGE_ID,
    "metadata": {
        "event": "OFFICIAL_DATABASE_LOADED",
        "enrolled_students": len(students),
        "departments": len(departments),
    },
    "ip_address": "127.0.0.1",
    "created_at": "2026-10-29T10:00:00Z",
})

# Write to lib/db/store.ts
store_path = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/lib/db/store.ts'

store_content = f"""// lib/db/store.ts
// In-Memory Persistent Data Store for Nandha Engineering College (Autonomous)
// Generated by scripts/rebuild_database_with_real_students.py (1028 Verified Students)

import {{
  College,
  CollegeSettings,
  Department,
  Profile,
  Student,
  Faculty,
  Category,
  Certificate,
  CertificateFile,
  CertificateReview,
  PointRecord,
  Notification,
  AuditLog,
}} from "@/types/database.types";

export interface DBState {{
  colleges: College[];
  collegeSettings: CollegeSettings[];
  departments: Department[];
  profiles: Profile[];
  students: Student[];
  faculty: Faculty[];
  categories: Category[];
  certificates: Certificate[];
  certificateFiles: CertificateFile[];
  certificateReviews: CertificateReview[];
  pointRecords: PointRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  passwords?: Record<string, string>;
  passwordResets?: Record<string, {{ code: string; email: string; expiresAt: string }}>;
  emailLogs?: Array<{{ id: string; to: string; subject: string; body: string; sentAt: string }}>;
}}

declare global {{
  // eslint-disable-next-line no-var
  var __CAMPUSCRED_DB: DBState | undefined;
}}

function initializeState(): DBState {{
  const colleges: College[] = {json.dumps(colleges, indent=2)};
  const collegeSettings: CollegeSettings[] = {json.dumps(college_settings, indent=2)};
  const departments: Department[] = {json.dumps(departments, indent=2)};
  const categories: Category[] = {json.dumps(categories, indent=2)};
  const profiles: Profile[] = {json.dumps(profiles, indent=2)};
  const faculty: Faculty[] = {json.dumps(faculty, indent=2)};
  const students: Student[] = {json.dumps(students, indent=2)};
  const certificates: Certificate[] = {json.dumps(certificates, indent=2)};
  const certificateFiles: CertificateFile[] = {json.dumps(certificate_files, indent=2)};
  const certificateReviews: CertificateReview[] = {json.dumps(certificate_reviews, indent=2)};
  const pointRecords: PointRecord[] = {json.dumps(point_records, indent=2)};
  const notifications: Notification[] = {json.dumps(notifications, indent=2)};
  const auditLogs: AuditLog[] = {json.dumps(audit_logs, indent=2)};
  const passwords: Record<string, string> = {json.dumps(passwords, indent=2)};

  return {{
    colleges,
    collegeSettings,
    departments,
    profiles,
    students,
    faculty,
    categories,
    certificates,
    certificateFiles,
    certificateReviews,
    pointRecords,
    notifications,
    auditLogs,
    passwords,
  }};
}}

export function getDB(): DBState {{
  if (!globalThis.__CAMPUSCRED_DB) {{
    globalThis.__CAMPUSCRED_DB = initializeState();
  }}
  return globalThis.__CAMPUSCRED_DB;
}}

export function resetDB(): void {{
  globalThis.__CAMPUSCRED_DB = initializeState();
}}
"""

with open(store_path, 'w', encoding='utf-8') as sf:
    sf.write(store_content)

print("Updated store.ts with complete type-safe records.")
