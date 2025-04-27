# Leave-management-portal
A web-based leave management system built using the MERN stack with SQL instead of MongoDB. It allows employees to apply for leaves, track their leave history, and enables HODs to approve or reject leave requests.

#Features
#Staff Features:
✔ View remaining leave balance
✔ Apply for leave (Casual, Sick, Earned, Unpaid)
✔ Check leave request status
✔ View leave history
✔ Calendar to visualize leave applications

HOD Features:
✔ Approve or reject leave requests

#Code contains
1)Login page 
>login using email and password
>redirected to /staff page or /hod page according to the role defined in database

2)staff page
>staff can see leaves left (casual leaves,sick leaves,paid leaves,unpaid leaves)
>leave history:all the leaves they have taken in past
>leave status:shows status of last leave request
>calender
>Apply for leave button

3)Apply for leave button
>redirected to /apply-leave page
>fill the form
>request will be sent to hod(if you have leaves left of that specific type)

4)HOD page
>HOD can see all the requests that are pending and can either
>approve or reject the leave request

#Tech Stack
Frontend: React.js, HTML, CSS
Backend: Node.js, Express.js
Database: MySQL
Authentication: JWT 

#DATABASE SCHEMA
Three tables for
>Users Table
 To store userid,name,role,email,password
>Leave Balance Table
 To store leaves left 
>Leaves Table
 To store leave_type,start_date,end_date,reason,status

#API ENDPOINTS 
1)User Authentication
POST /login – Login a user

2)Staff APIs
GET /leave_balance/:userId – Get leave balance for a user
POST /apply_leave – Apply for leave
GET /leave_history/:userId – Fetch leave history
GET /last_leave_status/:userId – Get last leave request status

3)HOD APIs
GET /staff_leaves – Get all leave requests
POST /update_leave_status – Approve/Reject leave requests

#PROJECT STRUCTURE
leave-management-portal/
│── backend/
│   ├── backend.js       # Main Express Server  
│   ├── db.js            # MySQL Database Connection  
│   ├── routes/          # API Routes  
│   ├── controllers/     # Business Logic  
│   ├── models/          # Database Models  
│              
│  
│── frontend/
│   ├── src/
│   │   ├── components/  # React Components  
│   │   ├── pages/       # Page Components  
│   │   ├── App.js       # Main App Component  
│   │   ├── index.js     # React DOM Rendering  
│   │   └── styles/      # CSS Styles  
│   ├── public/          # Static Assets  
│   ├── package.json     # Dependencies  
│   └── .env             # Frontend Environment Variables  
│  
└── README.md            # Project Documentation
