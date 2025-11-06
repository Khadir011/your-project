const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();

// Middleware to handle form data
app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // For JSON data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rani', // Update this with your MySQL password
    database: 'ydatabase'
});

connection.connect(function (error) {
    if (error) {
        throw error;
    } else {
        console.log('MySQL Database is connected successfully');
    }
});

// Serve the login page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the student management page (student.html)
app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

// Handle form submission and store teacher credentials
app.post('/store-credentials', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Insert credentials into teacher table
    connection.query(
        'INSERT INTO teacher (username, password) VALUES (?, ?)',
        [username, password],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error storing user data' });
            }
            res.json({ message: 'User data stored successfully' });
        }
    );
});

// Handle form submission and store student data
app.post('/add-student', (req, res) => {
    const { name, number, city, rollNo } = req.body;

    // Check if all fields are provided
    if (!name || !number || !city || !rollNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert student data into students table
    connection.query(
        'INSERT INTO students (name, number, city, roll_no) VALUES (?, ?, ?, ?)',
        [name, number, city, rollNo],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error storing student data' });
            }
            res.json({ message: 'Student data stored successfully', id: results.insertId });
        }
    );
});

// Endpoint to get all students
app.get('/students', (req, res) => {
    connection.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching students' });
        }
        res.json(results);
    });
});

// Endpoint to update student attendance
app.post('/update-attendance', (req, res) => {
    const { id, status } = req.body;

    // Check if id and status are provided
    if (!id || !status) {
        return res.status(400).json({ message: 'Student ID and status are required' });
    }

    // Update attendance in the database
    connection.query(
        'UPDATE students SET attendance = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error updating attendance' });
            }
            res.json({ message: 'Attendance updated successfully' });
        }
    );
});

// Endpoint to get attendance summary
app.get('/attendance-summary', (req, res) => {
    connection.query(
        'SELECT attendance, COUNT(*) as count FROM students GROUP BY attendance',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error fetching attendance summary' });
            }
            
            const summary = { present: 0, absent: 0 };
            results.forEach(row => {
                if (row.attendance === 'present') {
                    summary.present = row.count;
                } else if (row.attendance === 'absent') {
                    summary.absent = row.count;
                }
            });
            
            res.json(summary);
        }
    );
});

// Start the server
app.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});
