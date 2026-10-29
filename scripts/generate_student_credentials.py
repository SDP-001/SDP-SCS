import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import datetime
import json

f1 = r'C:/Users/SDP/.gemini/antigravity/brain/257e1302-6051-4ba8-b085-f5cd855ef30b/.user_uploaded/media_1793268384836_a41ac1d3.xlsx'
f2 = r'C:/Users/SDP/.gemini/antigravity/brain/257e1302-6051-4ba8-b085-f5cd855ef30b/.user_uploaded/media_1793268384850_39e30852.xlsx'

wb1 = openpyxl.load_workbook(f1)
wb2 = openpyxl.load_workbook(f2)

ws1 = wb1['Form Responses 1']
ws2 = wb2['users2030']

# Map Form Responses 1 by Register Number
f1_data = {}
for row in ws1.iter_rows(min_row=2, values_only=True):
    if row[0]:
        reg = str(row[0]).strip().upper()
        father_first = str(row[13]).strip() if row[13] else ""
        father_last = str(row[14]).strip() if row[14] else ""
        father_full = f"{father_first} {father_last}".strip()
        f1_data[reg] = {
            'dob': row[3],
            'gender': row[4],
            'personal_email': row[10],
            'phone': row[12],
            'father_name': father_full,
            'mother_name': row[17],
            'city': row[22],
            'district': row[23],
        }

dept_names = {
    'CSE': 'Computer Science and Engineering',
    'ECE': 'Electronics and Communication Engineering',
    'AI&DS': 'Artificial Intelligence and Data Science',
    'IT': 'Information Technology',
    'EEE': 'Electrical and Electronics Engineering',
    'BME': 'Biomedical Engineering',
    'CSE(CS)': 'Computer Science and Engineering (Cyber Security)',
    'MECH': 'Mechanical Engineering',
    'CSE(IoT)': 'Computer Science and Engineering (Internet of Things)',
    'AGRI': 'Agricultural Engineering',
    'CHEMICAL': 'Chemical Engineering',
    'CIVIL': 'Civil Engineering',
}

students = []
for i, row in enumerate(ws2.iter_rows(min_row=2, values_only=True), 1):
    reg = str(row[0]).strip().upper()
    name = str(row[1]).strip()
    email = str(row[2]).strip().lower()
    
    # EXACT PASSWORD FROM GIVEN DATABASE
    given_pwd = str(row[3]).strip() if row[3] is not None and str(row[3]).strip() != "" else f"Nec{reg}"
    
    dept_code = str(row[20]).strip()
    dept_name = dept_names.get(dept_code, dept_code)
    mobile = row[13]
    if mobile is not None:
        mobile = str(mobile).strip()
        if mobile.lower() == 'notgiven':
            mobile = ''
    else:
        mobile = ''
        
    dob = row[16]
    if isinstance(dob, (datetime.datetime, datetime.date)):
        dob_str = dob.strftime('%d/%m/%Y')
    elif dob:
        dob_str = str(dob).strip()
    else:
        dob_str = ''
        
    father = str(row[17]).strip() if row[17] else ''
    gender = str(row[18]).strip().title() if row[18] else ''
    
    # Merge rich details from F1 if available
    if reg in f1_data:
        m = f1_data[reg]
        if m['phone']:
            mobile = str(m['phone']).strip()
        if m['dob']:
            dob_str = str(m['dob']).strip()
        if m['gender']:
            gender = str(m['gender']).strip().title()
        if m['father_name']:
            father = m['father_name']

    students.append({
        's_no': i,
        'reg_no': reg,
        'name': name,
        'dept_code': dept_code,
        'dept_name': dept_name,
        'email': email,
        'password': given_pwd,
        'mobile': mobile,
        'gender': gender,
        'dob': dob_str,
        'father': father,
        'role': 'STUDENT',
        'status': 'ACTIVE',
    })

print(f"Loaded {len(students)} students with passwords from the given database.")

# Output Excel Workbook
out_wb = openpyxl.Workbook()

# Styling Definitions
font_title = Font(name="Calibri", size=16, bold=True, color="1E3A8A")
font_subtitle = Font(name="Calibri", size=11, bold=True, color="475569")
font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
font_data = Font(name="Calibri", size=10, color="0F172A")
font_bold_data = Font(name="Calibri", size=10, bold=True, color="0F172A")
font_password = Font(name="Consolas", size=11, bold=True, color="047857")

fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
fill_dept_header = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")
fill_zebra = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")

headers = [
    "S.No",
    "Register Number (ID)",
    "Student Name",
    "Department Code",
    "Department Name",
    "Official Email Address",
    "Password",
    "Mobile Number",
    "Gender",
    "Date of Birth",
    "Father's Name",
    "Portal Role",
    "Account Status",
]

# Sheet 1: Master All Students
ws_all = out_wb.active
ws_all.title = "All Students (1028)"
ws_all.views.sheetView[0].showGridLines = True

# Title block
ws_all.merge_cells("A1:M1")
ws_all["A1"] = "NANDHA ENGINEERING COLLEGE (AUTONOMOUS), ERODE"
ws_all["A1"].font = font_title
ws_all["A1"].alignment = align_center
ws_all.row_dimensions[1].height = 28

ws_all.merge_cells("A2:M2")
ws_all["A2"] = "OFFICIAL STUDENT AUTHENTICATION DIRECTORY & CREDENTIALS - GIVEN DATABASE PASSWORDS"
ws_all["A2"].font = font_subtitle
ws_all["A2"].alignment = align_center
ws_all.row_dimensions[2].height = 20

ws_all.merge_cells("A3:M3")
ws_all["A3"] = f"Total Verified Enrolled Students: {len(students)} | Credentials: Exact Given Database Passwords | Generated: {datetime.datetime.now().strftime('%d %B %Y')}"
ws_all["A3"].font = Font(name="Calibri", size=9, italic=True, color="64748B")
ws_all["A3"].alignment = align_center
ws_all.row_dimensions[3].height = 18

# Header row at row 5
header_row = 5
ws_all.row_dimensions[header_row].height = 26
for col_idx, h_text in enumerate(headers, 1):
    cell = ws_all.cell(row=header_row, column=col_idx, value=h_text)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = thin_border

for r_idx, s in enumerate(students, header_row + 1):
    ws_all.row_dimensions[r_idx].height = 20
    is_even = (r_idx % 2 == 0)
    current_fill = fill_zebra if is_even else fill_white
    
    row_values = [
        s['s_no'],
        s['reg_no'],
        s['name'],
        s['dept_code'],
        s['dept_name'],
        s['email'],
        s['password'],
        s['mobile'],
        s['gender'],
        s['dob'],
        s['father'],
        s['role'],
        s['status'],
    ]
    
    for c_idx, val in enumerate(row_values, 1):
        cell = ws_all.cell(row=r_idx, column=c_idx, value=val)
        cell.fill = current_fill
        cell.border = thin_border
        
        if c_idx in [1, 2, 4, 8, 9, 10, 12, 13]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left
            
        if c_idx == 7: # Password column
            cell.font = font_password
        elif c_idx == 2: # Reg No column
            cell.font = font_bold_data
        else:
            cell.font = font_data

# Create Department-wise Sheets
for dept_code in dept_names.keys():
    dept_students = [s for s in students if s['dept_code'] == dept_code]
    if not dept_students:
        continue
    
    ws_dept = out_wb.create_sheet(title=dept_code[:31])
    ws_dept.views.sheetView[0].showGridLines = True
    
    # Title
    ws_dept.merge_cells("A1:M1")
    ws_dept["A1"] = f"NANDHA ENGINEERING COLLEGE (AUTONOMOUS) - DEPARTMENT OF {dept_names[dept_code].upper()}"
    ws_dept["A1"].font = font_title
    ws_dept["A1"].alignment = align_center
    ws_dept.row_dimensions[1].height = 28
    
    ws_dept.merge_cells("A2:M2")
    ws_dept["A2"] = f"Class Roster & Student Login Credentials | Enrolled Count: {len(dept_students)} Students"
    ws_dept["A2"].font = font_subtitle
    ws_dept["A2"].alignment = align_center
    ws_dept.row_dimensions[2].height = 20
    
    ws_dept.row_dimensions[4].height = 25
    for col_idx, h_text in enumerate(headers, 1):
        cell = ws_dept.cell(row=4, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_dept_header
        cell.alignment = align_center
        cell.border = thin_border
        
    for r_idx, s in enumerate(dept_students, 5):
        ws_dept.row_dimensions[r_idx].height = 20
        is_even = (r_idx % 2 == 0)
        current_fill = fill_zebra if is_even else fill_white
        
        row_values = [
            r_idx - 4,
            s['reg_no'],
            s['name'],
            s['dept_code'],
            s['dept_name'],
            s['email'],
            s['password'],
            s['mobile'],
            s['gender'],
            s['dob'],
            s['father'],
            s['role'],
            s['status'],
        ]
        
        for c_idx, val in enumerate(row_values, 1):
            cell = ws_dept.cell(row=r_idx, column=c_idx, value=val)
            cell.fill = current_fill
            cell.border = thin_border
            if c_idx in [1, 2, 4, 8, 9, 10, 12, 13]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left
            if c_idx == 7:
                cell.font = font_password
            elif c_idx == 2:
                cell.font = font_bold_data
            else:
                cell.font = font_data

# Sheet: Summary & Statistics
ws_sum = out_wb.create_sheet(title="Summary & Statistics")
ws_sum.views.sheetView[0].showGridLines = True

ws_sum.merge_cells("A1:F1")
ws_sum["A1"] = "NANDHA ENGINEERING COLLEGE (AUTONOMOUS) - INSTITUTIONAL CREDENTIAL SUMMARY"
ws_sum["A1"].font = font_title
ws_sum["A1"].alignment = align_center
ws_sum.row_dimensions[1].height = 30

ws_sum["A3"] = "Metric"
ws_sum["B3"] = "Value"
ws_sum["A3"].font = font_header
ws_sum["A3"].fill = fill_header
ws_sum["B3"].font = font_header
ws_sum["B3"].fill = fill_header
ws_sum.row_dimensions[3].height = 24

summary_stats = [
    ("Institution Name", "Nandha Engineering College (Autonomous), Erode"),
    ("Affiliation", "Anna University, Chennai"),
    ("Portal System", "NEC-SCS (CampusCred) Co-Curricular Management"),
    ("Target Student Batch", "2026 - 2030 (1st Year Undergraduate)"),
    ("Total Enrolled Students", str(len(students))),
    ("Total Engineering Departments", str(len(dept_names))),
    ("Password Source", "Official Passwords From Given Database (users2030)"),
    ("Default Portal URL", "http://localhost:3000"),
    ("Supported Login Identifiers", "Register Number (e.g., 732226CS001) or Official Email"),
    ("Demo Logins for Students", "REMOVED (Students authenticate using official credentials)"),
    ("Student Roles Activated", "STUDENT (Full Access to Dashboard, Cert Uploads & Credits)"),
]

for idx, (metric, val) in enumerate(summary_stats, 4):
    ws_sum.row_dimensions[idx].height = 20
    ws_sum.cell(row=idx, column=1, value=metric).font = font_bold_data
    ws_sum.cell(row=idx, column=2, value=val).font = font_data
    ws_sum.cell(row=idx, column=1).border = thin_border
    ws_sum.cell(row=idx, column=2).border = thin_border

# Department Breakdown Table
start_row = len(summary_stats) + 6
ws_sum.merge_cells(f"A{start_row}:D{start_row}")
ws_sum[f"A{start_row}"] = "Department-Wise Student Distribution & Credential Allocation"
ws_sum[f"A{start_row}"].font = font_subtitle
ws_sum.row_dimensions[start_row].height = 22

dept_headers = ["Dept Code", "Department Name", "Student Count", "Percentage"]
ws_sum.row_dimensions[start_row + 1].height = 24
for c_idx, dh in enumerate(dept_headers, 1):
    c = ws_sum.cell(row=start_row + 1, column=c_idx, value=dh)
    c.font = font_header
    c.fill = fill_dept_header
    c.alignment = align_center
    c.border = thin_border

curr_r = start_row + 2
for d_code, d_name in dept_names.items():
    d_count = sum(1 for s in students if s['dept_code'] == d_code)
    pct = f"{(d_count / len(students) * 100):.2f}%"
    ws_sum.row_dimensions[curr_r].height = 20
    ws_sum.cell(row=curr_r, column=1, value=d_code).alignment = align_center
    ws_sum.cell(row=curr_r, column=2, value=d_name).alignment = align_left
    ws_sum.cell(row=curr_r, column=3, value=d_count).alignment = align_center
    ws_sum.cell(row=curr_r, column=4, value=pct).alignment = align_center
    for ci in range(1, 5):
        ws_sum.cell(row=curr_r, column=ci).border = thin_border
        ws_sum.cell(row=curr_r, column=ci).font = font_data
    curr_r += 1

# Total row
ws_sum.row_dimensions[curr_r].height = 22
ws_sum.cell(row=curr_r, column=1, value="TOTAL").alignment = align_center
ws_sum.cell(row=curr_r, column=2, value="All Departments").alignment = align_left
ws_sum.cell(row=curr_r, column=3, value=len(students)).alignment = align_center
ws_sum.cell(row=curr_r, column=4, value="100.00%").alignment = align_center
for ci in range(1, 5):
    ws_sum.cell(row=curr_r, column=ci).border = thin_border
    ws_sum.cell(row=curr_r, column=ci).font = font_bold_data

# Adjust column widths across all sheets
for sheet in out_wb.worksheets:
    for col in sheet.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row in [1, 2, 3]:
                continue
            if cell.value:
                val_str = str(cell.value)
                if len(val_str) > max_len:
                    max_len = len(val_str)
        sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

# Save to multiple targets
target_paths = [
    r'C:/Users/SDP/.gemini/antigravity/brain/257e1302-6051-4ba8-b085-f5cd855ef30b/NEC_Student_Credentials_2026.xlsx',
    r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC_Student_Credentials_2026.xlsx',
    r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/NEC_Student_Credentials_2026.xlsx',
]

for p in target_paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    out_wb.save(p)
    print(f"Excel file successfully generated at: {p}")

# Also save JSON of all students for our typescript seeder
json_path = r'c:/Users/SDP/OneDrive/Desktop/NEC-SCS-main (2)/NEC-SCS-main/NEC-SCS-main/public/nec_students_2026.json'
with open(json_path, 'w', encoding='utf-8') as jf:
    json.dump(students, jf, indent=2)
print(f"JSON student database written to: {json_path}")
