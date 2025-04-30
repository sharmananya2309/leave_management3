require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt=require("bcrypt");
app.use(express.json());
app.use(cors());
const multer = require("multer");
const path = require("path");
const axios = require('axios');


// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  //password for mysql db
  database: ""  //name of database
});
// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});
//to check if folder is created,if not then it will create one
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads folder created.");
} else {
  console.log("Uploads folder already exists.");
}

// to set up storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store images in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);  // Unique filename
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//API to register
app.post("/register", upload.single('profile_image'), (req, res) => {

  console.log("Body:", req.body);  //to check
  console.log("File:", req.file);  
  
  const { name, username, email, num, role, dept, gender, password } = req.body;
  let profileImage = req.file ? req.file.path : null;
  if (!profileImage) {
    profileImage = (gender === 'male') 
                   ? 'uploads/maledefaultpp.png' 
                   : 'uploads/femaledefaultpp.png';
  }  
  if (!name || !username || !email || !num || !dept || !password || !role || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password", error: err });
    }
    const query = `INSERT INTO users (name, username, email, phone_number, department, role, password, gender, profile_image) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, username, email, num, dept, role, hashedPassword, gender, profileImage], (err, results) => {
      if (err) {
        console.error("Database error: ", err.sqlMessage);
        return res.status(500).json({ message: "Database error", error: err });
      }

      // ✅ Add leave_balance entry
      const leaveBalanceQuery = `INSERT INTO leave_balance (user_id,sick_leave, casual_leave,earned_leave,unpaid_leave) 
                                 VALUES (?, ?, ?, ?,?)`;
      db.query(leaveBalanceQuery, [results.insertId,10,10,10,20], (err, leaveResults) => {
        if (err) {
          console.error("Leave balance insertion error: ", err.sqlMessage);
          return res.status(500).json({ message: "User registered but failed to set leave balance", error: err });
        }

        res.status(201).json({ message: "User registered successfully", userId: results.insertId });
      });
    });
  });
});


//API For Login Requests
app.post("/login",(req,res)=>
{
  const{email, password}=req.body;

  if(!email || !password){
    return res.status(400).json({message:"please provide correct credentials" });
  }

    const query="SELECT* FROM users WHERE email=?";
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
     
      console.log("SQL Query Results:", results);

      if (results.length === 0) {
          return res.status(401).json({ message: "User not found" });
      }
    const user=results[0];

    console.log("User Role:", user.role);
    //to check hashed password stored during registration
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Error comparing passwords", error: err });

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
       // Password matches, generate token
       const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        "secret_key",
        { expiresIn: "1h" }
      );
    return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          department: user.department,
          role: user.role,
          profile_image: user.profile_image
        }
      });
        
      });
    });
  });

 //to web api to show public holidays
 

 app.get("/public_holidays", async (req, res) => {
   try {
    
     const token = "";  //enter token here for web api
     const response = await axios.get(`https://calendarific.com/api/v2/holidays?api_key=${token}&country=IN&year=2025`) 
   
     
     const holidays = response.data.response.holidays;
 
     if (!holidays || holidays.length === 0) {
       return res.status(404).json({ message: "No holidays found" });
     }
 
     res.status(200).json(holidays);
   } catch (error) {
     console.error("Error fetching holidays", error);
     res.status(500).json({ message: "Error fetching public holidays", error: error,
      error: error.message,  // Provide the error message here for clarity
      stack: error.stack, 
      });
   }
 });
 

//API to get Leave Balance in Staff Dashboard
app.get("/leave_balance/:userId",(req,res) =>{
  const userId=req.params.userId;
  const query="SELECT sick_leave,casual_leave,earned_leave,unpaid_leave FROM leave_balance WHERE user_id=?";

  db.query(query,[userId],(err,results)=>{
    if(err) return res.status(500).json({message:"Database Error",error:err});

    if(results.length===0){
      return res.status(404).json({message:"NO LEAVE BALANCE FOUND"});
    }
    res.status(200).json(results[0]);
  });
});

//API to fetch leave history on staff dashboard
app.get("/leave_history/:userId",(req,res)=>
{
  const userId=req.params.userId;
  const query="SELECT * FROM leaves WHERE user_id = ?";

  db.query(query,[userId],(err,results)=>
  {
    if(err) return res.status(500).json({message:"database error",error:err});

    if(results.length===0){
      return res.status(404).json({message:"NO Leave balanace found"});
    }
    res.status(200).json(results);
  });
});

//API to apply for leave on staff dashboard
app.post("/apply_leave",(req,res)=>{
  const { userId, startdate, enddate, reason, leavetype } = req.body;
  console.log("Leave Application Request:", req.body); // Debugging

  if (!userId || !startdate || !enddate || !reason || !leavetype) {
    return res.status(400).json({ message: "All fields are required" });
  }

  
  const checkBalanceQuery = `SELECT ?? AS balance FROM leave_balance WHERE user_id = ?`;

  db.query(checkBalanceQuery, [`${leavetype}_leave`, userId], (err, results) => {
    if (err) {
      console.error("Database error while fetching leave balance:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No leave balance found" });
    }

    const leaveBalance = results[0].balance;
    console.log(`Current ${leavetype} balance:`, leaveBalance);

    //Check if user has enough leaves
    if (leaveBalance <= 0) {
      return res.status(400).json({ message: `No leaves left for ${leavetype}. Cannot apply.` });
    }
     const insertLeaveQuery = `
      INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason, status) 
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.query(insertLeaveQuery, [userId, leavetype, startdate, enddate, reason], (err, results) => {
      if (err) {
        console.error("Database error while inserting leave request:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(200).json({ message: "Leave Request Submitted" });
    });
  });
});

//API to get status of last leave applied on staff dashboard
app.get("/last_leave_status/:userId",(req,res)=>
{
  const userId=req.params.userId;
  const query="SELECT status FROM leaves WHERE user_id=?ORDER BY id DESC LIMIT 1";

  db.query(query,[userId],(err,results)=>{
    if(err) return res.status(500).json({message:"Database error ",error:err});

    if(results.length===0){
      return res.status(404).json({message:"no leave requests found"});
   }

    res.status(200).json({status:results[0].status});
  });
});

//API for HOD page to check all leave requests
app.get("/leave_requests",(req,res)=>{
  const dept = req.query.dept;
  const query=`SELECT l.id,l.user_id,u.name,l.leave_type,l.start_date,
  l.end_date,l.reason,l.status 
  FROM leaves l
  JOIN users u ON l.user_id=u.id
  WHERE l.status='Pending'
  AND u.department = ?
  AND end_date >= CURDATE()
  ORDER BY l.start_date ASC`;

  db.query(query,[dept],(err,results)=>
  {
    if(err) return res.status(500).json({message:"Database Error",error:err});
    res.status(200).json(results);
  });
});

// API to get staff by department (for HOD)
app.get("/staff_by_dept/:dept", (req, res) => {
  const dept = req.params.dept;

  const query = `SELECT id, name, username, email, phone_number, department, role, profile_image 
                 FROM users WHERE department = ?`;

  db.query(query, [dept], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "No staff found in this department" });
    }

    res.status(200).json(results);
  });
});

// API to view staff profile(Hod page)

app.get("/staff_profile/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT id, name, username, email, phone_number,department,role, profile_image FROM users WHERE id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(results[0]);
  });
});

//api to see approved and rejected leave req in hod page
app.get('/approved-rejected',(req,res)=>{
  const dept = req.query.dept;
  const query =`SELECT l.id, l.user_id, u.name, l.leave_type, l.start_date, 
           l.end_date, l.reason, l.status
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.status IN ('Approved', 'Rejected')
    AND u.department = ?
    ORDER BY l.start_date ASC`;
  db.query(query,[dept],(err,result)=>{
    if(err) return res.status(500).send(err);
    res.json(result);
  });
});


//api to get leave history :all the approved,pending,rejected where date<current date
app.get('/leave-history',(req,res)=>{
  const dept = req.query.dept;
  if (!dept) {
    return res.status(400).json({ message: 'Department is required' });
  } 

  const query=`SELECT l.id, l.user_id, u.name, l.leave_type, l.start_date, 
           l.end_date, l.reason, l.status
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.end_date < CURDATE()
    AND l.status IN ('Pending', 'Approved', 'Rejected')
    AND u.department = ?
    ORDER BY l.start_date ASC `;
  db.query(query,(err,result)=>{
    if(err) return res.status(500).send(err);
    res.json(result);
  });
});


//API to approve or reject leaves
app.put("/update_leaves_status/:id",(req,res)=>{
  const leaveId=req.params.id;
  const {status,userId,leavetype}=req.body;
  if (!status || !userId || !leavetype) {
    return res.status(400).json({ message: "Status, User ID, and Leave Type are required" });
  }
  //to check if user exist in dept
  const checkDeptQuery = `
    SELECT u.department FROM users u
    JOIN leaves l ON u.id = l.user_id
    WHERE l.id = ? AND u.department = ?
  `;
  db.query(checkDeptQuery, [leaveId, req.query.dept], (err, result) => {
    if (err) return res.status(500).json({ message: "Error checking department", error: err });
    
    if (!result.length) {
      return res.status(403).json({ message: 'Unauthorized action: Department mismatch' });
    }
   //if yes then proceeding with this part 
  const updateQuery ="UPDATE leaves SET status =? WHERE id=?";
  db.query(updateQuery,[status,leaveId],(err,results)=>
  {
    if(err) return res.status(500).json({message:"database error",error:err});

    if (status==="Approved"){
      const deductLeaveQuery = `UPDATE leave_balance SET ${leavetype}_leave = 
      ${leavetype}_leave - 1 WHERE user_id = ? AND ${leavetype}_leave > 0`;

     
        db.query(deductLeaveQuery, [userId], (err, results) => 
      {
        if(err) return res.status(500).json( {message : "Error updating leave balance", error: err });

       return res.status(200).json({ message: "Leave approved and balance updated" });
      });
    }
    else {
      res.status(200).json({message:`leave ${status}`});
    }
  });
});
});
// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = db;


