import json
import openpyxl
import csv

# Load the 1028 students from our newly created JSON
with open(r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/nec_students_2026.json', 'r', encoding='utf-8') as f:
    all_students = json.load(f)

# Select first 60 students (57 CSE students + 3 ECE students)
sample_60 = all_students[:60]

# Format matching RawStudentRow for sample_students_60.json
sample_60_json = []
for s in sample_60:
    sample_60_json.append({
        "student_id": f"66666666-6666-6666-6666-6666{s['s_no']:08d}",
        "profile_id": f"cccccccc-cccc-cccc-cccc-cccc{s['s_no']:08d}",
        "register_number": s["reg_no"],
        "full_name": s["name"],
        "email": s["email"],
        "department_code": s["dept_code"],
        "department_name": s["dept_name"],
        "degree_type": "UG",
        "program": "B.E.",
        "academic_year": 1,
        "admission_year": 2026,
        "is_active": True,
        "credit_points": 0
    })

# Write sample_students_60.json and nec_students_60.json
p1 = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/sample_students_60.json'
p2 = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/nec_students_60.json'
with open(p1, 'w', encoding='utf-8') as f:
    json.dump(sample_60_json, f, indent=2)
with open(p2, 'w', encoding='utf-8') as f:
    json.dump(sample_60_json, f, indent=2)
print("Updated sample_students_60.json and nec_students_60.json with real students.")

# Write sample_student_database.csv
csv_path = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/sample_student_database.csv'
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["Register Number", "Full Name", "Department", "Degree Level", "Academic Year", "Email", "Password"])
    for s in sample_60:
        writer.writerow([s["reg_no"], s["name"], s["dept_name"], "UG", 1, s["email"], s["password"]])
print("Updated sample_student_database.csv with real students.")

# Write NEC-SCS_Sample_Students_60.xlsx
xlsx_path = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/NEC-SCS_Sample_Students_60.xlsx'
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Students"
ws.append(["Register Number", "Full Name", "Department", "Degree Level", "Academic Year", "Email", "Password", "Mobile Number", "Gender"])
for s in sample_60:
    ws.append([s["reg_no"], s["name"], s["dept_name"], "UG", 1, s["email"], s["password"], s["mobile"], s["gender"]])
wb.save(xlsx_path)
print("Updated NEC-SCS_Sample_Students_60.xlsx with real students.")

