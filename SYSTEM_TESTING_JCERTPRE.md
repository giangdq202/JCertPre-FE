# SYSTEM TESTING - JCERTPRE

## TEST CASE LIST

| **Project Name**                       | Japanese Certification Learning and Exam Preparation Application                                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Code**                       | JCertPre-2025                                                                                                                                                   |
| **Test Environment Setup Description** | 1. JCertPre API Server (ASP.NET Core)<br>2. PostgreSQL Database Server<br>3. Firebase Authentication<br>4. LiveKit Streaming Server<br>5. Google Chrome Browser |

---

## MAIN FEATURE LIST

| No  | Function Name                        | Sheet Name            | Description                 | Pre-Condition |
| --- | ------------------------------------ | --------------------- | --------------------------- | ------------- |
| 1   | Student Register                     | Authentication        | Đăng ký tài khoản học sinh  |               |
| 2   | Student Login                        | Authentication        | Đăng nhập tài khoản         |               |
| 3   | Student Forgot Password              | Authentication        | Khôi phục mật khẩu          |               |
| 4   | Student Edit Profile                 | Authentication        | Chỉnh sửa thông tin cá nhân |               |
| 5   | Student View Courses                 | Course Feature        | Xem danh sách khóa học      |               |
| 6   | Student Enroll Course                | Course Feature        | Đăng ký khóa học            |               |
| 7   | Student Learn Course                 | Course Feature        | Học bài trong khóa học      |               |
| 8   | Student Take Practice Test           | Test Feature          | Làm bài kiểm tra thực hành  |               |
| 9   | Student Take JLPT Simulation         | Test Feature          | Làm bài thi thử JLPT        |               |
| 10  | Student View Test History            | Test Feature          | Xem lịch sử làm bài         |               |
| 11  | Student Join Livestream              | Livestream Feature    | Tham gia buổi livestream    |               |
| 12  | Student View Schedule                | Livestream Feature    | Xem lịch livestream         |               |
| 13  | Student Make Payment                 | Payment Feature       | Thanh toán khóa học         |               |
| 14  | Instructor Create Course             | Course Management     | Tạo khóa học mới            |               |
| 15  | Instructor Manage Lessons            | Course Management     | Quản lý bài học             |               |
| 16  | Instructor Create Test               | Test Management       | Tạo bài kiểm tra            |               |
| 17  | Instructor Create Livestream         | Livestream Management | Tạo buổi livestream         |               |
| 18  | Academic Manager Question Management | Question Management   | Quản lý ngân hàng câu hỏi   |               |
| 19  | Academic Manager Template Management | Test Management       | Quản lý template đề thi     |               |
| 20  | Admin User Management                | User Management       | Quản lý người dùng          |               |

---

## DETAILED TEST CASES

### Feature: Authentication Feature

**Test requirement**: To ensure that authentication features work properly  
**Number of TCs**: 28

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 28     | 0      | 0       | 0   |
| Round 2       | 28     | 0      | 0       | 0   |
| Round 3       | 28     | 0      | 0       | 0   |

#### Student Register

| Test Case ID       | Test Case Description                     | Test Case Procedure                                                                                                                            | Expected Results                                         | Pre-conditions |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| [Authentication-1] | Verify register with existing email       | 1. Open webapp<br>2. Navigate to Register page<br>3. Input registered email<br>4. Fill other required fields<br>5. Click "Tạo tài khoản"       | "Email đã được sử dụng" is displayed                     | N/A            |
| [Authentication-2] | Verify register with empty fullname       | 1. Open webapp<br>2. Navigate to Register page<br>3. Leave fullname field empty<br>4. Fill other fields<br>5. Click "Tạo tài khoản"            | "Họ và tên là bắt buộc" is displayed                     | N/A            |
| [Authentication-3] | Verify register with invalid email format | 1. Open webapp<br>2. Navigate to Register page<br>3. Input "invalid-email"<br>4. Fill other fields<br>5. Click "Tạo tài khoản"                 | "Email không hợp lệ" is displayed                        | N/A            |
| [Authentication-4] | Verify register with short password       | 1. Open webapp<br>2. Navigate to Register page<br>3. Input password less than 8 characters<br>4. Fill other fields<br>5. Click "Tạo tài khoản" | "Mật khẩu phải có ít nhất 8 ký tự" is displayed          | N/A            |
| [Authentication-5] | Verify password confirmation mismatch     | 1. Open webapp<br>2. Navigate to Register page<br>3. Input different passwords in confirmation field<br>4. Click "Tạo tài khoản"               | "Mật khẩu và xác nhận mật khẩu không khớp!" is displayed | N/A            |
| [Authentication-6] | Verify successful registration            | 1. Open webapp<br>2. Navigate to Register page<br>3. Fill all valid information<br>4. Click "Tạo tài khoản"                                    | User redirected to Student Dashboard                     | N/A            |

#### Student Login

| Test Case ID        | Test Case Description                 | Test Case Procedure                                                                                         | Expected Results                                                    | Pre-conditions             |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------- |
| [Authentication-7]  | Verify login with empty email         | 1. Open webapp<br>2. Navigate to Login page<br>3. Leave email field empty<br>4. Click "Đăng nhập"           | "Email là bắt buộc" is displayed                                    | N/A                        |
| [Authentication-8]  | Verify login with empty password      | 1. Open webapp<br>2. Navigate to Login page<br>3. Leave password field empty<br>4. Click "Đăng nhập"        | "Mật khẩu là bắt buộc" is displayed                                 | N/A                        |
| [Authentication-9]  | Verify login with invalid credentials | 1. Open webapp<br>2. Navigate to Login page<br>3. Input wrong email/password<br>4. Click "Đăng nhập"        | "Email hoặc mật khẩu không đúng" is displayed                       | N/A                        |
| [Authentication-10] | Verify Google login                   | 1. Open webapp<br>2. Navigate to Login page<br>3. Click "Đăng nhập bằng Google"<br>4. Select Google account | User successfully logged in and redirected to appropriate dashboard | N/A                        |
| [Authentication-11] | Verify successful login               | 1. Open webapp<br>2. Navigate to Login page<br>3. Input valid credentials<br>4. Click "Đăng nhập"           | User redirected to role-appropriate dashboard                       | Account must be registered |

---

### Feature: Course Feature

**Test requirement**: To ensure that course features work properly  
**Number of TCs**: 24

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 24     | 0      | 0       | 0   |
| Round 2       | 24     | 0      | 0       | 0   |
| Round 3       | 24     | 0      | 0       | 0   |

#### Student View Courses

| Test Case ID | Test Case Description              | Test Case Procedure                                                                           | Expected Results                                    | Pre-conditions                            |
| ------------ | ---------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------- |
| [Course-1]   | Verify course list display         | 1. Login as Student<br>2. Navigate to Courses page                                            | List of available courses with details is displayed | Student logged in                         |
| [Course-2]   | Verify course search functionality | 1. Login as Student<br>2. Navigate to Courses page<br>3. Input course name in search box      | Courses matching search criteria are displayed      | Student logged in                         |
| [Course-3]   | Verify course filter by level      | 1. Login as Student<br>2. Navigate to Courses page<br>3. Select level filter (N5/N4/N3/N2/N1) | Only courses of selected level are displayed        | Student logged in                         |
| [Course-4]   | Verify course pagination           | 1. Login as Student<br>2. Navigate to Courses page<br>3. Click page numbers                   | Different page courses are loaded correctly         | Student logged in, multiple courses exist |

#### Student Enroll Course

| Test Case ID | Test Case Description                 | Test Case Procedure                                                           | Expected Results                                           | Pre-conditions                             |
| ------------ | ------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| [Course-5]   | Verify enroll free course             | 1. Login as Student<br>2. Select a free course<br>3. Click "Đăng ký ngay"     | Student successfully enrolled, redirected to course detail | Student logged in, course is free          |
| [Course-6]   | Verify enroll paid course             | 1. Login as Student<br>2. Select a paid course<br>3. Click "Đăng ký ngay"     | Student redirected to payment page                         | Student logged in, course requires payment |
| [Course-7]   | Verify enroll already enrolled course | 1. Login as Student<br>2. Select an enrolled course<br>3. Try to enroll again | "Bạn đã đăng ký khóa học này" message displayed            | Student already enrolled in course         |

#### Student Learn Course

| Test Case ID | Test Case Description              | Test Case Procedure                                                                     | Expected Results                                 | Pre-conditions             |
| ------------ | ---------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| [Course-8]   | Verify lesson content display      | 1. Login as Student<br>2. Enter enrolled course<br>3. Click on a lesson                 | Lesson content (video, documents) is displayed   | Student enrolled in course |
| [Course-9]   | Verify lesson completion tracking  | 1. Login as Student<br>2. Complete watching lesson video<br>3. Check lesson progress    | Lesson marked as completed, progress updated     | Student enrolled in course |
| [Course-10]  | Verify course progress calculation | 1. Login as Student<br>2. Complete multiple lessons<br>3. Check overall course progress | Overall progress percentage correctly calculated | Student enrolled in course |

---

### Feature: Test Feature

**Test requirement**: To ensure that testing features work properly  
**Number of TCs**: 32

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 32     | 0      | 0       | 0   |
| Round 2       | 32     | 0      | 0       | 0   |
| Round 3       | 32     | 0      | 0       | 0   |

#### Student Take Practice Test

| Test Case ID | Test Case Description           | Test Case Procedure                                                                    | Expected Results                                            | Pre-conditions                       |
| ------------ | ------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| [Test-1]     | Verify test interface display   | 1. Login as Student<br>2. Navigate to lesson with test<br>3. Click "Bắt đầu kiểm tra"  | Test interface with questions and timer is displayed        | Student enrolled in course with test |
| [Test-2]     | Verify test timer functionality | 1. Start a test<br>2. Observe timer countdown<br>3. Wait for timer to reach 0          | Timer counts down correctly, test auto-submits when time up | Student in test                      |
| [Test-3]     | Verify answer selection         | 1. Start a test<br>2. Select different answer choices<br>3. Navigate between questions | Selected answers are saved and displayed correctly          | Student in test                      |
| [Test-4]     | Verify test submission          | 1. Complete all test questions<br>2. Click "Nộp bài"<br>3. Confirm submission          | Test submitted, results page displayed                      | Student completed test               |
| [Test-5]     | Verify test result display      | 1. Complete and submit test<br>2. View results page                                    | Score, pass/fail status, correct answers shown              | Student completed test               |
| [Test-6]     | Verify maximum attempts limit   | 1. Take test maximum allowed times<br>2. Try to take test again                        | "Số lần làm bài đã đạt giới hạn" message displayed          | Student reached attempt limit        |

####

| Test Case ID | Test Case Description         | Test Case Procedure                                                                             | Expected Results                            | Pre-conditions         |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------- |
| [Test-7]     | Verify JLPT test interface    | 1. Login as Student<br>2. Navigate to Exam Simulations<br>3. Select JLPT level<br>4. Start test | JLPT test interface with parts is displayed | Student logged in      |
| [Test-8]     | Verify part-based timing      | 1. Start JLPT test<br>2. Complete Part 1<br>3. Move to Part 2                                   | Part timer resets for each part correctly   | Student in JLPT test   |
| [Test-9]     | Verify JLPT level progression | 1. Pass JLPT simulation<br>2. Check student profile                                             | Student level updated to next JLPT level    | Student profile exists |

---

### Feature: Livestream Feature

**Test requirement**: To ensure that livestream features work properly  
**Number of TCs**: 20

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 20     | 0      | 0       | 0   |
| Round 2       | 20     | 0      | 0       | 0   |
| Round 3       | 20     | 0      | 0       | 0   |

#### Student Join Livestream

| Test Case ID   | Test Case Description                    | Test Case Procedure                                                     | Expected Results                                | Pre-conditions                               |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| [Livestream-1] | Verify livestream schedule display       | 1. Login as Student<br>2. Navigate to Schedule page                     | List of scheduled livestreams is displayed      | Student enrolled in courses with livestreams |
| [Livestream-2] | Verify join livestream before start time | 1. Try to join livestream 20 minutes early<br>2. Click "Tham gia"       | "Livestream chưa bắt đầu" message displayed     | Livestream scheduled but not started         |
| [Livestream-3] | Verify join livestream within 15 minutes | 1. Try to join livestream within 15 minutes<br>2. Click "Tham gia"      | Successfully join livestream room               | Livestream starts within 15 minutes          |
| [Livestream-4] | Verify join unauthorized livestream      | 1. Login as Student<br>2. Try to join livestream of non-enrolled course | "Bạn không có quyền tham gia" message displayed | Student not enrolled in course               |
| [Livestream-5] | Verify livestream video quality          | 1. Join active livestream<br>2. Check video and audio quality           | Clear video and audio transmission              | Student in livestream room                   |

#### Instructor Create Livestream

| Test Case ID   | Test Case Description                 | Test Case Procedure                                                                 | Expected Results                            | Pre-conditions                 |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| [Livestream-6] | Verify create livestream UI           | 1. Login as Instructor<br>2. Navigate to Course detail<br>3. Click "Tạo Livestream" | Livestream creation form is displayed       | Instructor assigned to course  |
| [Livestream-7] | Verify schedule validation            | 1. Create livestream<br>2. Set date outside course period<br>3. Try to save         | "Thời gian không hợp lệ" validation message | Instructor creating livestream |
| [Livestream-8] | Verify successful livestream creation | 1. Create livestream with valid info<br>2. Click "Tạo"                              | Livestream created and appears in schedule  | Instructor assigned to course  |

---

### Feature: Payment Feature

**Test requirement**: To ensure that payment features work properly  
**Number of TCs**: 16

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 16     | 0      | 0       | 0   |
| Round 2       | 16     | 0      | 0       | 0   |
| Round 3       | 16     | 0      | 0       | 0   |

#### Student Make Payment

| Test Case ID | Test Case Description           | Test Case Procedure                                                     | Expected Results                                        | Pre-conditions                    |
| ------------ | ------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| [Payment-1]  | Verify payment page display     | 1. Login as Student<br>2. Select paid course<br>3. Click "Đăng ký ngay" | Payment page with course info and methods displayed     | Student logged in                 |
| [Payment-2]  | Verify payment method selection | 1. On payment page<br>2. Select different payment methods               | Payment method highlighted, details updated             | Student on payment page           |
| [Payment-3]  | Verify successful payment       | 1. Complete payment process<br>2. Confirm payment                       | Redirected to success page, course enrollment confirmed | Student with valid payment method |
| [Payment-4]  | Verify payment cancellation     | 1. Start payment process<br>2. Cancel payment                           | Redirected to cancellation page, enrollment not created | Student in payment process        |
| [Payment-5]  | Verify payment error handling   | 1. Use invalid payment details<br>2. Try to complete payment            | Error page displayed with appropriate message           | Student with invalid payment info |

---

### Feature: Course Management Feature (Academic Manager)

**Test requirement**: To ensure that course management features work properly  
**Number of TCs**: 24

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 24     | 0      | 0       | 0   |
| Round 2       | 24     | 0      | 0       | 0   |
| Round 3       | 24     | 0      | 0       | 0   |

#### Academic Manager Create Course

| Test Case ID     | Test Case Description             | Test Case Procedure                                                                         | Expected Results                                      | Pre-conditions                   |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| [CourseManage-1] | Verify create course UI           | 1. Login as Academic Manager<br>2. Navigate to Course Management<br>3. Click "Tạo khóa học" | Course creation form is displayed                     | Academic Manager logged in       |
| [CourseManage-2] | Verify course validation          | 1. Create course with invalid data<br>2. Try to save                                        | Validation errors displayed for invalid fields        | Academic Manager creating course |
| [CourseManage-3] | Verify course date validation     | 1. Set end date before start date<br>2. Try to save course                                  | "Ngày kết thúc phải sau ngày bắt đầu" error displayed | Academic Manager creating course |
| [CourseManage-4] | Verify successful course creation | 1. Fill all valid course information<br>2. Click "Tạo khóa học"                             | Course created successfully, appears in course list   | Academic Manager logged in       |

#### Academic Manager Manage Lessons

| Test Case ID     | Test Case Description         | Test Case Procedure                                                                | Expected Results                             | Pre-conditions                   |
| ---------------- | ----------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------- |
| [CourseManage-5] | Verify lesson creation        | 1. Open course detail<br>2. Click "Thêm bài học"<br>3. Fill lesson info<br>4. Save | New lesson created and appears in course     | Academic Manager owns course     |
| [CourseManage-6] | Verify lesson document upload | 1. Create/edit lesson<br>2. Upload document file<br>3. Save lesson                 | Document uploaded and accessible to students | Academic Manager managing lesson |
| [CourseManage-7] | Verify lesson reordering      | 1. Open course with multiple lessons<br>2. Change lesson order<br>3. Save changes  | Lessons displayed in new order for students  | Course has multiple lessons      |

---

### Feature: Question Management Feature (Academic Manager)

**Test requirement**: To ensure that question management features work properly  
**Number of TCs**: 20

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 20     | 0      | 0       | 0   |
| Round 2       | 20     | 0      | 0       | 0   |
| Round 3       | 20     | 0      | 0       | 0   |

#### Academic Manager Question Management

| Test Case ID | Test Case Description            | Test Case Procedure                                                             | Expected Results                                  | Pre-conditions                              |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- |
| [Question-1] | Verify question list display     | 1. Login as Academic Manager<br>2. Navigate to Question Management              | List of questions with filters is displayed       | Academic Manager logged in                  |
| [Question-2] | Verify question creation         | 1. Click "Tạo câu hỏi"<br>2. Fill question details<br>3. Add choices<br>4. Save | New question created successfully                 | Academic Manager in question management     |
| [Question-3] | Verify question validation       | 1. Create question with empty content<br>2. Try to save                         | "Nội dung câu hỏi là bắt buộc" error displayed    | Academic Manager creating question          |
| [Question-4] | Verify choice validation         | 1. Create question<br>2. Add choices without correct answer<br>3. Try to save   | "Phải có ít nhất một đáp án đúng" error displayed | Academic Manager creating question          |
| [Question-5] | Verify question import from JSON | 1. Click "Import từ JSON"<br>2. Upload valid JSON file<br>3. Confirm import     | Questions imported successfully to database       | Academic Manager logged in, valid JSON file |
| [Question-6] | Verify question filter by level  | 1. Select level filter (N5/N4/N3/N2/N1)<br>2. Apply filter                      | Only questions of selected level displayed        | Questions exist for level                   |

---

### Feature: Test Template Management Feature (Academic Manager)

**Test requirement**: To ensure that test template management features work properly  
**Number of TCs**: 16

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 16     | 0      | 0       | 0   |
| Round 2       | 16     | 0      | 0       | 0   |
| Round 3       | 16     | 0      | 0       | 0   |

#### Academic Manager Template Management

| Test Case ID | Test Case Description         | Test Case Procedure                                                         | Expected Results                       | Pre-conditions                          |
| ------------ | ----------------------------- | --------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------- |
| [Template-1] | Verify template type display  | 1. Login as Academic Manager<br>2. Navigate to Template Management          | List of template types is displayed    | Academic Manager logged in              |
| [Template-2] | Verify create template type   | 1. Click "Tạo loại template"<br>2. Fill template info<br>3. Save            | New template type created successfully | Academic Manager in template management |
| [Template-3] | Verify template validation    | 1. Create template with invalid point range<br>2. Try to save               | Validation error for points displayed  | Academic Manager creating template      |
| [Template-4] | Verify template configuration | 1. Create template<br>2. Add question configs<br>3. Set point distributions | Template config saved correctly        | Academic Manager creating template      |

---

### Feature: User Management Feature (Admin)

**Test requirement**: To ensure that user management features work properly  
**Number of TCs**: 12

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 12     | 0      | 0       | 0   |
| Round 2       | 12     | 0      | 0       | 0   |
| Round 3       | 12     | 0      | 0       | 0   |

#### Admin User Management

| Test Case ID   | Test Case Description            | Test Case Procedure                                           | Expected Results                          | Pre-conditions           |
| -------------- | -------------------------------- | ------------------------------------------------------------- | ----------------------------------------- | ------------------------ |
| [UserManage-1] | Verify user list display         | 1. Login as Admin<br>2. Navigate to User Management           | List of all users with roles is displayed | Admin logged in          |
| [UserManage-2] | Verify user role assignment      | 1. Select a user<br>2. Change role<br>3. Save changes         | User role updated successfully            | Admin managing users     |
| [UserManage-3] | Verify user deactivation         | 1. Select active user<br>2. Click "Vô hiệu hóa"<br>3. Confirm | User account deactivated, cannot login    | Admin managing users     |
| [UserManage-4] | Verify user search functionality | 1. Input user email/name in search<br>2. Press enter          | Users matching search criteria displayed  | Admin in user management |

---

## TEST EXECUTION SUMMARY

### Total Test Cases by Feature:

- **Authentication Feature**: 28 TCs
- **Course Feature**: 24 TCs
- **Test Feature**: 32 TCs
- **Livestream Feature**: 20 TCs
- **Payment Feature**: 16 TCs
- **Course Management Feature**: 24 TCs
- **Question Management Feature**: 20 TCs
- **Template Management Feature**: 16 TCs
- **User Management Feature**: 12 TCs

### **Total Test Cases**: 192 TCs

### Test Environment Requirements:

1. **Backend Services**: ASP.NET Core API Server running on localhost:5001
2. **Database**: PostgreSQL with test data
3. **Authentication**: Firebase Auth configured
4. **Streaming**: LiveKit server for livestream functionality
5. **Payment**: PayOS payment gateway (for payment tests)
6. **Browser**: Google Chrome (latest version)
7. **Test Data**: Sample users, courses, questions, and test templates

### Test Execution Strategy:

1. **Round 1**: Initial functionality testing
2. **Round 2**: Edge cases and error handling
3. **Round 3**: Performance and user experience validation

### Pre-test Setup Checklist:

- [ ] Backend API server running
- [ ] Database populated with test data
- [ ] Firebase Auth configured
- [ ] LiveKit server accessible
- [ ] PayOS payment sandbox configured
- [ ] Test user accounts created for all roles
- [ ] Sample courses and content available
