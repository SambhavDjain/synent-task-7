import json
import os

DB_FILE = 'students.json'

def load_data():
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def save_data(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def add_student(data):
    student_id = input("Enter Student ID: ").strip()
    if not student_id:
        print("Student ID cannot be empty.")
        return
    if student_id in data:
        print("Student ID already exists!")
        return
    
    name = input("Enter Student Name: ").strip()
    age = input("Enter Student Age: ").strip()
    grade = input("Enter Student Grade: ").strip()
    
    data[student_id] = {
        "name": name,
        "age": age,
        "grade": grade
    }
    save_data(data)
    print(f"Student '{name}' added successfully!")

def update_student(data):
    student_id = input("Enter Student ID to update: ").strip()
    if student_id not in data:
        print("Student not found!")
        return
    
    print("Leave field blank to keep current value.")
    name = input(f"Enter new name ({data[student_id]['name']}): ").strip()
    age = input(f"Enter new age ({data[student_id]['age']}): ").strip()
    grade = input(f"Enter new grade ({data[student_id]['grade']}): ").strip()
    
    if name: data[student_id]['name'] = name
    if age: data[student_id]['age'] = age
    if grade: data[student_id]['grade'] = grade
    
    save_data(data)
    print("Student updated successfully!")

def delete_student(data):
    student_id = input("Enter Student ID to delete: ").strip()
    if student_id in data:
        name = data[student_id]['name']
        del data[student_id]
        save_data(data)
        print(f"Student '{name}' deleted successfully!")
    else:
        print("Student not found!")

def view_students(data):
    if not data:
        print("No students found.")
        return
    
    print("-" * 55)
    print(f"{'ID':<10} | {'Name':<20} | {'Age':<5} | {'Grade'}")
    print("-" * 55)
    for s_id, details in data.items():
        print(f"{s_id:<10} | {details['name']:<20} | {details['age']:<5} | {details['grade']}")
    print("-" * 55)

def main():
    data = load_data()
    
    while True:
        print("\n--- Student Management System ---")
        print("1. Add Student")
        print("2. Update Student")
        print("3. Delete Student")
        print("4. View All Students")
        print("5. Exit")
        
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == '1':
            add_student(data)
        elif choice == '2':
            update_student(data)
        elif choice == '3':
            delete_student(data)
        elif choice == '4':
            view_students(data)
        elif choice == '5':
            print("Exiting Student Management System. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 5.")

if __name__ == "__main__":
    main()
