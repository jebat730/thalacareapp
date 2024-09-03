const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'thalacare'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Secret key for JWT
const JWT_SECRET = 'ff6e897064d772afb19355f3d828ef71663d2242a9a216af6f37f2298253a69f'; // Change this to a secure random string

// Middleware for token verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.patientID = decoded.patientID;
    req.username = decoded.username;
    next();
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  
    // Set the destination folder for uploaded images
    cb(null, '../backend/uploads');
  },
  filename: function (req, file, cb) {
    // Log the original filename
    console.log('Original filename:', file.originalname);

    // Log the filename for the uploaded image
    const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    console.log('Filename for uploaded image:', filename);

    // Set the filename for the uploaded image
    cb(null, filename);
  }
});


const upload = multer({ 
  storage: storage, 
});

app.use('/uploads', express.static('../backend/uploads'));

//############################### REGISTER #############################################################################
// Endpoint for user registration
app.post('/register', (req, res) => {
  const { email, username, password } = req.body;

  // Check if all required patient data is provided
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required for registration' });
  }

  // Check if the username already exists in the database
  connection.query('SELECT * FROM patient WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error checking username:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // If the username already exists, return an error
    if (results.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Insert patient data into the database
      connection.query('INSERT INTO patient (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error registering patient:', insertError);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Patient registered successfully
        res.sendStatus(200);
      });
    });
  });
});


//############################### lOGIN ###############################################################
// Endpoint for user login 
app.post('/patient/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Query the database to retrieve the hashed password and role for the provided username
  connection.query('SELECT * FROM patient WHERE username = ?', [username], async (error, results) => {
    if (error) {
      console.error('Error validating credentials:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Retrieve the hashed password and role from the database
    const { password: hashedPasswordFromDB, role } = results[0];

    // Compare the user input password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);
    if (!passwordMatch) {
      console.log('Password does not match!');
      return res.status(401).json({ error: 'Invalid username or password' });
    } else {
      console.log('Password match!');
      // Generate JWT token if password matches
      const tokenPayload = { patientID: results[0].patientID, username: results[0].username };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, role }); // Include role in the response
    }
  });
});

// Endpoint for admin login 
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Query the database to retrieve the password and role for the provided username
  connection.query('SELECT * FROM admins WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error validating credentials:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Retrieve the password and role from the database
    const { password: storedPassword, role } = results[0];

    // Compare the user input password with the stored password from the database
    if (password !== storedPassword) {
      console.log('Password does not match!');
      return res.status(401).json({ error: 'Invalid username or password' });
    } else {
      console.log('Password match!');
      // Generate JWT token if password matches
      const token = jwt.sign({ adminID: results[0].adminID }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, role }); // Include role in the response
    }
  });
});



//############################### LOGOUT ##################################################

app.post('/logout', (req, res) => {
  console.log('jadi bang')
  // You can perform any necessary cleanup or logging here

  // Respond with success message
  res.status(200).json({ message: 'Logout successful' });
});


//############################### USER PROFILE ###############################################################
//Display user profile
app.get('/profile', verifyToken, (req, res) => {
  
  const patientID = req.patientID;

  connection.query('SELECT * FROM patient WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching user information:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Endpoint to update user profile
app.put('/profile/update', verifyToken, (req, res) => {
  const patientID = req.patientID;
  const updatedUserData = req.body; 

  // Update user data in the database
  connection.query('UPDATE patient SET ? WHERE patientID = ?', [updatedUserData, patientID], (error, results) => {
    if (error) {
      console.error('Error updating user information:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json({ message: 'User information updated successfully' });
  });
});

//upload images
app.post('/profile/upload', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    console.log('No image uploaded');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  console.log('Processing image upload request:', req.file);

  // Save the filename of the uploaded image to the patient table
  const patientID = req.patientID;
  const filename = req.file.filename; // Assuming the filename property exists

  // Update the patient table with the profile image filename
  connection.query('UPDATE patient SET profile_image = ? WHERE patientID = ?', [filename, patientID], (error, results) => {
    if (error) {
      console.error('Error updating profile image in database:', error);
      return res.status(500).json({ error: 'Failed to update profile image' });
    }

    console.log('Profile image updated successfully:', filename);
    
    res.status(200).json({ message: 'Profile image updated successfully', filename: filename });
  });
});


//####################################################################################################
// Protected endpoint that requires authentication
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Authenticated user', patientID: req.patientID});
});

//######################################Iron Level############################################################################
// Diplay
app.get('/DisplayIron', verifyToken, (req, res) => {
  
  const patientID = req.patientID;
  connection.query('SELECT * FROM ironlevels WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching iron levels:', error);
      res.status(500).json({ error: 'Failed to fetch iron levels' });
      return;
    }
    res.json(results);
  });
});

// Insert / Add
app.post('/AddIron', verifyToken, (req, res) => {
  const { iron_level, measurement_date } = req.body;
  const patientID = req.patientID;

  console.log('Received iron level:', iron_level);
  console.log('Received measurement date:', measurement_date);
  console.log('Patient ID:', patientID);

  connection.query('INSERT INTO ironlevels (patientID, iron_level, measurement_date) VALUES (?, ?, ?)', [patientID, iron_level, measurement_date], (error, results) => {
    if (error) {
      console.error('Error adding iron level:', error);
      res.status(500).json({ error: 'Failed to add iron level' });
      return;
    }
    res.json({ message: 'Iron level added successfully' });
  });
});


// DELETE iron level record by ID
app.delete('/DeleteIron/:iron_level_ID', verifyToken, (req, res) => {
  const iron_level_ID = req.params.iron_level_ID;
  const patientID = req.patientID; // Assuming patientID is available in the request
  
  console.log('Received iron level ID:', iron_level_ID);
  console.log('Received patient ID:', patientID);
  
  if (!iron_level_ID || !patientID) {
    return res.status(400).json({ error: 'Missing iron level ID or patient ID' });
  }

  // Perform the deletion in your database, considering both iron_level_ID and patientID
  const sql = 'DELETE FROM ironlevels WHERE iron_level_ID = ? AND patientID = ?';
  connection.query(sql, [iron_level_ID, patientID], (error, results) => {
    if (error) {
      console.error('Error deleting iron level:', error);
      return res.status(500).json({ error: 'Failed to delete iron level' });
    }

    console.log('Deleted iron level:', results);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No iron level found with the provided ID' });
    }

    res.status(200).json({ message: 'Iron level deleted successfully' });
  });
});

// PUT endpoint for editing iron levels
app.put('/EditIron/:iron_level_ID', verifyToken, (req, res) => {
  const iron_level_ID = req.params.iron_level_ID;
  const { iron_level, measurement_date } = req.body;

  // Validate input parameters
  if (!iron_level || !measurement_date) {
    return res.status(400).json({ error: 'Please provide both iron level and measurement date' });
  }

  // Update iron level in the database
  connection.query('UPDATE ironlevels SET iron_level = ?, measurement_date = ? WHERE iron_level_ID = ?', 
                   [iron_level, measurement_date, iron_level_ID], (error, results) => {
    if (error) {
      console.error('Error updating iron level:', error);
      return res.status(500).json({ error: 'Failed to update iron level' });
    }

    // Check if any rows were affected by the update operation
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No iron level found with the provided ID' });
    }

    // Iron level updated successfully
    res.status(200).json({ message: 'Iron level updated successfully' });
  });
});

//######################################### BlOOD TRANSFUSION ######################################

app.get('/transfusions', verifyToken, (req, res) => {
  const patientID = req.patientID;
  connection.query('SELECT * FROM bloodtransfusions WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching transfusion records:', error);
      res.status(500).json({ error: 'Failed to fetch transfusion records' });
      return;
    }
    res.json(results);
  });
});

// Endpoint to add blood transfusion records
app.post('/transfusions', verifyToken, (req, res) => {
  const { transfusion_date, transfusion_type, transfusion_quantity, note } = req.body;
  const patientID = req.patientID;

  connection.query('INSERT INTO bloodtransfusions (patientID, transfusion_date, transfusion_type, transfusion_quantity, note) VALUES (?, ?, ?, ?,?)', [patientID, transfusion_date, transfusion_type, transfusion_quantity, note], (error, results) => {
    if (error) {
      console.error('Error adding blood transfusion record:', error);
      res.status(500).json({ error: 'Failed to add blood transfusion record' });
      return;
    }
    res.json({ message: 'Blood transfusion record added successfully' });
  });
});

// Endpoint to update a transfusion
app.put('/transfusions/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const { transfusion_date, transfusion_type, transfusion_quantity, note } = req.body;

  connection.query('UPDATE bloodtransfusions SET transfusion_date = ?, transfusion_type = ?, transfusion_quantity = ?, note = ? WHERE transfusion_ID = ?', [transfusion_date, transfusion_type, transfusion_quantity, note, id], (error, results) => {
    if (error) {
      console.error('Error updating transfusion record:', error);
      res.status(500).json({ error: 'Failed to update transfusion record' });
      return;
    }
    res.json({ message: 'Transfusion record updated successfully' });
  });
});

// Delete blood
app.delete('/DeleteTransfusion/:transfusion_ID', verifyToken, (req, res) => {
  const transfusion_ID = req.params.transfusion_ID;
  const patientID = req.patientID;
  
  console.log('Received transfusion ID:', transfusion_ID);
  console.log('Received user ID:', patientID);
  
  if (!transfusion_ID || !patientID) {
    return res.status(400).json({ error: 'Missing transfusion ID or user ID' });
  }

  const sql = 'DELETE FROM bloodtransfusions WHERE transfusion_ID = ? AND patientID = ?';
  connection.query(sql, [transfusion_ID, patientID], (error, results) => {
    if (error) {
      console.error('Error deleting transfusion:', error);
      return res.status(500).json({ error: 'Failed to delete transfusion' });
    }

    console.log('Deleted transfusion:', results);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No transfusion found with the provided ID' });
    }

    res.status(200).json({ message: 'Transfusion deleted successfully' });
  });
});

//###################################### MedicationPage ######################################

// Display Medication Records
app.get('/medications', verifyToken, (req, res) => {
  const patientID = req.patientID;
  connection.query('SELECT * FROM medications WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching medication records:', error);
      res.status(500).json({ error: 'Failed to fetch medication records' });
      return;
    }
    res.json(results);
  });
});

// Add Medication Record
app.post('/medications', verifyToken, (req, res) => {
  const { medType, medColor, medName, mealTiming, dose, doseUnit, medStartDate, medEndDate, medFrequency } = req.body;
  const patientID = req.patientID;

  connection.query('INSERT INTO medications (patientID, medType, medColor, medName, mealTiming, dose, doseUnit, medStartDate, medEndDate, medFrequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [patientID, medType, medColor, medName, mealTiming, dose, doseUnit, medStartDate, medEndDate, medFrequency], (error, results) => {
    if (error) {
      console.error('Error adding medication record:', error);
      res.status(500).json({ error: 'Failed to add medication record' });
      return;
    }
    res.json({ message: 'Medication record added successfully' });
  });
});


// Update Medication Record
app.put('/medications/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const { medType, medColor, medName, mealTiming, dose, doseUnit, medStartDate, medEndDate, medFrequency } = req.body;

  connection.query('UPDATE medications SET medType = ?, medColor = ?, medName = ?, mealTiming = ?, dose = ?, doseUnit = ?, medStartDate = ?, medEndDate = ?, medFrequency = ? WHERE medID = ?', [medType, medColor, medName, mealTiming, dose, doseUnit, medStartDate, medEndDate, medFrequency, id], (error, results) => {
    if (error) {
      console.error('Error updating medication record:', error);
      res.status(500).json({ error: 'Failed to update medication record' });
      return;
    }
    res.json({ message: 'Medication record updated successfully' });
  });
});


// Delete Medication Record
app.delete('/medications/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const patientID = req.patientID;
  
  if (!id || !patientID) {
    return res.status(400).json({ error: 'Missing medication ID or patient ID' });
  }

  const sql = 'DELETE FROM medications WHERE medID = ? AND patientID = ?';
  connection.query(sql, [id, patientID], (error, results) => {
    if (error) {
      console.error('Error deleting medication record:', error);
      return res.status(500).json({ error: 'Failed to delete medication record' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No medication record found with the provided ID' });
    }

    res.status(200).json({ message: 'Medication record deleted successfully' });
  });
});

//################################ EDUCATIONAL ############################################

//################################ emergo ############################################
// Endpoint to fetch edu_emergo data

app.get('/emergo/:dataType', (req, res) => {
  const dataType = req.params.dataType;

  if (dataType !== 'emergency' && dataType !== 'symptoms') {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  let sqlQuery;
  if (dataType === 'emergency') {
    sqlQuery = 'SELECT * FROM edu_emergo WHERE type = "emergency"';
  } else if (dataType === 'symptoms') {
    sqlQuery = 'SELECT * FROM edu_emergo WHERE type = "symptoms"';
  }

  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error(`Error fetching ${dataType} data:`, error);
      return res.status(500).json({ error: `Failed to fetch ${dataType} data` });
    }
    res.json(results);
  });
});

app.get('/emergo/all', (req, res) => {
  const sqlQuery = 'SELECT * FROM edu_emergo';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching emergo data:', error);
      return res.status(500).json({ error: 'Failed to fetch emergo data' });
    }
    res.json(results);
  });
});







//################################ article ######################################
// Endpoint to fetch article data
app.get('/articles', (req, res) => {
  // Query the database to retrieve educational articles
  connection.query('SELECT * FROM articles', (error, results) => {
    if (error) {
      console.error('Error fetching educational articles:', error);
      res.status(500).json({ error: 'Failed to fetch educational articles' });
      return;
    }
    res.json(results);
  });
});

// Endpoint to add a new article
app.post('/articles', async (req, res) => {
  const { arTitle, arContent, arImages } = req.body;

  if (!arTitle || !arContent || !arImages) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newArticle = {
    arTitle,
    arContent,
    arImages
  };

  // Query to insert a new article into the database
  const query = 'INSERT INTO articles (arImages, arTitle, arContent ) VALUES (?, ?, ?)';

  connection.query(query, [newArticle.arImages, newArticle.arTitle, newArticle.arContent], (error, results) => {
    if (error) {
      console.error('Error adding new article:', error);
      return res.status(500).json({ error: 'Failed to add new article' });
    }
    res.status(201).json({ message: 'Article added successfully', articleId: results.insertId });
  });
});

// Endpoint to delete an article by ID
app.delete('/articles/:articleID', (req, res) => {
  const { articleID } = req.params;

  // Query to delete an article from the database
  const query = 'DELETE FROM articles WHERE articleID = ?';

  connection.query(query, [articleID], (error, results) => {
    if (error) {
      console.error('Error deleting article:', error);
      return res.status(500).json({ error: 'Failed to delete article' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(200).json({ message: 'Article deleted successfully' });
  });
});

// Endpoint to update an article by ID
app.put('/articles/:articleID', (req, res) => {
  const { articleID } = req.params;
  const { arTitle, arContent, arImages } = req.body;

  if (!arTitle || !arContent || !arImages) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Query to update an article in the database
  const query = 'UPDATE articles SET arTitle = ?, arContent = ?, arImages = ? WHERE articleID = ?';

  connection.query(query, [arTitle, arContent, arImages, articleID], (error, results) => {
    if (error) {
      console.error('Error updating article:', error);
      return res.status(500).json({ error: 'Failed to update article' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(200).json({ message: 'Article updated successfully' });
  });
});

//############################# FORUM ###############################################

//display forum
// app.get('/forumpostlist', verifyToken, (req, res) => {
//   connection.query('SELECT * FROM forumposts ORDER BY timestamp DESC', (err, results) => {
//     if (err) {
//       console.error('Error fetching forum posts:', err);
//       return res.status(500).json({ message: 'Error fetching forum posts' });
//     }
//     res.json(results);
//   });
// });

// Display forum posts in random order
app.get('/forumpostlist', verifyToken, (req, res) => {
  connection.query('SELECT * FROM forumposts ORDER BY RAND()', (err, results) => {
    if (err) {
      console.error('Error fetching forum posts:', err);
      return res.status(500).json({ message: 'Error fetching forum posts' });
    }
    res.json(results);
  });
});


//add forum
app.post('/createforumpost', verifyToken, (req, res) => {
  const { forumTitle, postContent} = req.body;
  const { patientID, username } = req;

  connection.query('INSERT INTO forumposts (patientID, forumTitle, postContent, patient_username) VALUES (?, ?, ?, ?)', [patientID, forumTitle, postContent, username], (error, results) => {
    if (error) {
      console.error('Error adding forum post:', error);
      res.status(500).json({ error: 'Failed to add forum post' });
      return;
    }
    res.json({ message: 'Forum post added successfully' });
  });  
});

// Like or unlike a forum post
app.post('/likepost', verifyToken, (req, res) => {
  const { postId } = req.body;
  const { patientID } = req;

  // Check if the user has already liked the post
  connection.query('SELECT * FROM likes WHERE postId = ? AND patientID = ?', [postId, patientID], (error, results) => {
    if (error) {
      console.error('Error checking if user has already liked the post:', error);
      res.status(500).json({ error: 'Failed to toggle like for forum post' });
      return;
    }

    if (results.length > 0) {
      // User has already liked the post, so unlike it
      connection.query('DELETE FROM likes WHERE postId = ? AND patientID = ?', [postId, patientID], (error, results) => {
        if (error) {
          console.error('Error unliking forum post:', error);
          res.status(500).json({ error: 'Failed to toggle like for forum post' });
          return;
        }

        // Decrement likes count in forumposts table
        connection.query('UPDATE forumposts SET likes = likes - 1 WHERE postID = ?', [postId], (error, results) => {
          if (error) {
            console.error('Error updating likes count for forum post:', error);
            res.status(500).json({ error: 'Failed to toggle like for forum post' });
            return;
          }
          res.json({ message: 'Forum post unliked successfully' });
        });
      });
    } else {
      // User hasn't liked the post yet, so like it
      connection.query('INSERT INTO likes (postId, patientID) VALUES (?, ?)', [postId, patientID], (error, results) => {
        if (error) {
          console.error('Error liking forum post:', error);
          res.status(500).json({ error: 'Failed to toggle like for forum post' });
          return;
        }

        // Increment likes count in forumposts table
        connection.query('UPDATE forumposts SET likes = likes + 1 WHERE postID = ?', [postId], (error, results) => {
          if (error) {
            console.error('Error updating likes count for forum post:', error);
            res.status(500).json({ error: 'Failed to toggle like for forum post' });
            return;
          }
          res.json({ message: 'Forum post liked successfully' });
        });
      });
    }
  });
});

// Edit forum
app.put('/editforumpost/:postId', verifyToken, (req, res) => {
  const { postId } = req.params;
  const { forumTitle, postContent } = req.body;
  const { patientID } = req;

  // Check if the post exists and belongs to the authenticated user
  connection.query('SELECT * FROM forumposts WHERE postID = ? AND patientID = ?', [postId, patientID], (error, results) => {
    if (error) {
      console.error('Error finding post:', error);
      return res.status(500).json({ error: 'Failed to find post' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Update the post
    connection.query('UPDATE forumposts SET forumTitle = ?, postContent = ? WHERE postID = ?', [forumTitle, postContent, postId], (error) => {
      if (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ error: 'Failed to update post' });
      }

      res.json({ message: 'Post updated successfully' });
    });
  });
});

// Delete forum post
app.delete('/deleteforumpost/:postId', verifyToken, (req, res) => {
  const { postId } = req.params;
  const { patientID } = req;

  console.log(postId);
  
  // Check if the post exists and belongs to the authenticated user
  connection.query('SELECT * FROM forumposts WHERE postID = ? AND patientID = ?', [postId, patientID], (error, results) => {
    if (error) {
      console.error('Error finding post:', error);
      return res.status(500).json({ error: 'Failed to find post' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Delete the post and associated comments
    connection.query('DELETE FROM forumposts WHERE postID = ?', [postId], (error) => {
      if (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
      }

      res.json({ message: 'Post deleted successfully' });
    });
  });
});

// Get interactions for forum posts
app.get('/interactions', verifyToken, (req, res) => {
  const { patientID } = req;

  // SQL to fetch likes and comments for posts by patientID
  const sql = `
    SELECT p.postID, 'like' as interactionType
    FROM likes l
    JOIN forumposts p ON l.postID = p.postID
    WHERE l.patientID = ?
    UNION ALL
    SELECT p.postID, 'comment' as interactionType
    FROM comments c
    JOIN forumposts p ON c.postID = p.postID
    WHERE c.patientID = ?
    ORDER BY postID ASC;
  `;

  connection.query(sql, [patientID, patientID], (error, results) => {
    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: 'Failed to fetch interactions' });
    }

    res.json(results);
  });
});



//################################ COMMENTS ############################################

// Add comment
app.post('/addcomment', verifyToken, (req, res) => {
  const { postId, comment } = req.body;
  const { patientID, username } = req;
  const timestamp = new Date();

  connection.query('INSERT INTO comments (postId, patientID, commentContent, timestamp, patient_username) VALUES (?, ?, ?, ?, ?)', [postId, patientID, comment, timestamp, username], (error, results) => {
    if (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
      return;
    }

    // Sending back the newly created comment details
    const newComment = {
      commentID: results.insertId,
      postId,
      patientID,
      commentContent: comment,
      timestamp,
      patient_username: username
    };

    res.json(newComment);
  });  
});

// Display comment
app.get('/comments/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('SELECT * FROM comments WHERE postId = ?', [postId], (error, results) => {
    if (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
      return;
    }

    res.json(results);
  });
});


// Delete comment
app.delete('/deletecomment/:commentID', verifyToken, (req, res) => {
  const { commentID } = req.params;
  const { patientID } = req;

  // Check if the comment belongs to the user
  connection.query('SELECT * FROM comments WHERE commentID = ? AND patientID = ?', [commentID, patientID], (error, results) => {
    if (error) {
      console.error('Error checking comment ownership:', error);
      res.status(500).json({ error: 'Failed to verify ownership' });
      return;
    }

    if (results.length === 0) {
      res.status(403).json({ error: 'You are not authorized to delete this comment' });
      return;
    }

    // Proceed to delete the comment
    connection.query('DELETE FROM comments WHERE commentID = ?', [commentID], (error, results) => {
      if (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
        return;
      }

      res.json({ success: true, message: 'Comment deleted successfully' });
    });
  });
});

// Add current user endpoint
app.get('/currentuser', verifyToken, (req, res) => {
  const { patientID } = req;

  connection.query('SELECT patientID, username FROM patient WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ error: 'Failed to fetch current user' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = results[0];
    res.json(user);
  });
});


//################################ SYMPTOMS ############################################

// Save symptom record
app.post('/saveSymptoms', verifyToken, (req, res) => {
  const { symptoms, measurement_date, health_status } = req.body; // Extract health status from request body
  const { patientID } = req;

  connection.query('INSERT INTO SymptomHistory (patientID, symptomDate, fatigue, weakness, breathShortness, paleSkin, jaundice, healthStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
  [patientID, measurement_date, symptoms.fatigue, symptoms.weakness, symptoms.breathShortness, symptoms.paleSkin, symptoms.jaundice, health_status], // Include health status in the query
  (error, results) => {
    if (error) {
      console.error('Error saving symptom record:', error);
      res.status(500).json({ error: 'Failed to save symptom record' });
      return;
    }

    res.json({ success: true, message: 'Symptom record saved successfully' });
  });
});

//display record
app.get('/symptomRecords', verifyToken, (req, res) => {
  const { patientID } = req;

  connection.query('SELECT historyID, symptomDate AS date, healthStatus AS health_status FROM SymptomHistory WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching symptom records:', error);
      res.status(500).json({ error: 'Failed to fetch symptom records' });
      return;
    }

    res.json(results); // Return fetched symptom records
  });
});

// Delete symptom record
app.delete('/symptomRecords/:historyID', verifyToken, (req, res) => {
  const { patientID } = req;
  const { historyID } = req.params;

  connection.query('DELETE FROM SymptomHistory WHERE patientID = ? AND historyID = ?', [patientID, historyID], (error, results) => {
    if (error) {
      console.error('Error deleting symptom record:', error);
      res.status(500).json({ error: 'Failed to delete symptom record' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Symptom record not found' });
      return;
    }

    res.json({ success: true, message: 'Symptom record deleted successfully' });
  });
});


//######################APPOINTMENT########################################### 

// Save appointment
app.post('/appointments', verifyToken, (req, res) => {
  const { title, appointmentDate, appointmentType, notes } = req.body;
  const patientID = req.patientID; // Make sure verifyToken middleware sets req.patientID correctly

  if (!patientID) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  connection.query('INSERT INTO appointment (patientID, title, appointmentDate, appointmentType, notes) VALUES (?, ?, ?, ?, ?)', 
  [patientID, title, appointmentDate, appointmentType, notes],
  (error, results) => {
    if (error) {
      console.error('Error saving appointment:', error);
      return res.status(500).json({ error: 'Failed to save appointment' });
    }
    res.json({ success: true, message: 'Appointment saved successfully' });
  });
});

// Fetch appointments
app.get('/appointments', verifyToken, (req, res) => {
  const patientID = req.patientID; // Make sure verifyToken middleware sets req.patientID correctly

  if (!patientID) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  connection.query('SELECT * FROM appointment WHERE patientID = ?', [patientID], (error, results) => {
    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.json(results);
  });
});

// Delete appointment
app.delete('/appointments/:id', verifyToken, (req, res) => {
  const appointmentID = req.params.id;
  const patientID = req.patientID; // Make sure verifyToken middleware sets req.patientID correctly

  if (!patientID) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  connection.query('DELETE FROM appointment WHERE appointmentID = ? AND patientID = ?', [appointmentID, patientID], (error, results) => {
    if (error) {
      console.error('Error deleting appointment:', error);
      return res.status(500).json({ error: 'Failed to delete appointment' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }

    res.json({ success: true, message: 'Appointment deleted successfully' });
  });
});

// Update appointment
app.put('/appointments/:id', verifyToken, (req, res) => {
  const appointmentID = req.params.id;
  const { title, appointmentDate, appointmentType, notes } = req.body;
  const patientID = req.patientID; // Make sure verifyToken middleware sets req.patientID correctly

  if (!patientID) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  connection.query('UPDATE appointment SET title = ?, appointmentDate = ?, appointmentType = ?, notes = ? WHERE appointmentID = ? AND patientID = ?', 
    [title, appointmentDate, appointmentType, notes, appointmentID, patientID],
    (error, results) => {
      if (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ error: 'Failed to update appointment' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Appointment not found or unauthorized' });
      }

      res.json({ success: true, message: 'Appointment updated successfully' });
    });
});

//#################### ADMINNNNNNNNNNNNN ########################################################

// ############################### USER MANAGEMENT ENDPOINTS #############################################################

// Get all users
app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM patient', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});


// Edit a user
app.put('/api/users/:patientID', (req, res) => {
  const { patientID } = req.params;
  const { email, username } = req.body;

  connection.query('UPDATE patient SET email = ?, username = ? WHERE patientID = ?', [email, username, patientID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.sendStatus(200);
  });
});


// Delete a user
app.delete('/api/users/:patientID', (req, res) => {
  const { patientID } = req.params;

  // Check if there are dependent rows in bloodtransfusions table
  connection.query('SELECT * FROM bloodtransfusions WHERE patientID = ?', [patientID], (err, results) => {
    if (err) {
      console.error('Error fetching dependent rows:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      // If there are dependent rows, delete them first
      connection.query('DELETE FROM bloodtransfusions WHERE patientID = ?', [patientID], (err, results) => {
        if (err) {
          console.error('Error deleting dependent rows:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Now delete the patient record
        connection.query('DELETE FROM patient WHERE patientID = ?', [patientID], (err, results) => {
          if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.sendStatus(200);
        });
      });
    } else {
      // If there are no dependent rows, directly delete the patient record
      connection.query('DELETE FROM patient WHERE patientID = ?', [patientID], (err, results) => {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.sendStatus(200);
      });
    }
  });
});

// Get user details by patientID
app.get('/api/users/:patientID', (req, res) => {
  const { patientID } = req.params;

  connection.query('SELECT * FROM patient WHERE patientID = ?', [patientID], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    res.json(user);
  });
});


// ############################# FORUM ADMIN ###############################################

// Admin-specific forum management endpoints

// Get all forum posts
app.get('/admin/forumpostlist', (req, res) => {
  connection.query('SELECT * FROM forumposts ORDER BY timestamp DESC', (err, results) => {
    if (err) {
      console.error('Error fetching forum posts:', err);
      return res.status(500).json({ message: 'Error fetching forum posts' });
    }
    res.json(results);
  });
});

// Delete a forum post
app.delete('/admin/deleteforumpost/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('DELETE FROM forumposts WHERE postID = ?', [postId], (error) => {
    if (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    res.json({ message: 'Post deleted successfully' });
  });
});


// Lock a thread
app.put('/admin/lockthread/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('UPDATE forumposts SET locked = 1 WHERE postID = ?', [postId], (error) => {
    if (error) {
      console.error('Error locking thread:', error);
      return res.status(500).json({ error: 'Failed to lock thread' });
    }

    res.json({ message: 'Thread locked successfully' });
  });
});

// Unlock a thread
app.put('/admin/unlockthread/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('UPDATE forumposts SET locked = 0 WHERE postID = ?', [postId], (error) => {
    if (error) {
      console.error('Error unlocking thread:', error);
      return res.status(500).json({ error: 'Failed to unlock thread' });
    }

    res.json({ message: 'Thread unlocked successfully' });
  });
});


// Endpoint to fetch a specific post's details
app.get('/admin/post/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('SELECT * FROM forumposts WHERE postID = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error fetching post details:', err);
      return res.status(500).json({ message: 'Error fetching post details' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(results[0]);
  });
});

// Existing endpoint to fetch comments
app.get('/admin/comments/:postId', (req, res) => {
  const { postId } = req.params;

  connection.query('SELECT * FROM comments WHERE postID = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Error fetching comments' });
    }
    res.json(results);
  });
});

// endpoint to delete a comment
app.delete('/admin/comment/:commentId', (req, res) => {
  const { commentId } = req.params;

  connection.query('DELETE FROM comments WHERE commentID = ?', [commentId], (err, results) => {
    if (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).json({ message: 'Error deleting comment' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  });
});


// ############################# Emergo ADMIN ###############################################

// Endpoint to fetch all Emergo entries
app.get('/admin/emergo', (req, res) => {
  const sqlQuery = 'SELECT * FROM edu_emergo';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching emergo data:', error);
      return res.status(500).json({ error: 'Failed to fetch emergo data' });
    }
    res.json(results);
  });
});

// Endpoint to create a new Emergo entry
app.post('/admin/emergo', (req, res) => {
  const { emergoTitle, emergoContent, type } = req.body;
  const sqlQuery = 'INSERT INTO edu_emergo (emergoTitle, emergoContent, type) VALUES (?, ?, ?)';
  
  connection.query(sqlQuery, [emergoTitle, emergoContent, type], (error, results) => {
    if (error) {
      console.error('Error adding new emergo:', error);
      return res.status(500).json({ error: 'Failed to add new emergo' });
    }
    res.status(201).json({ message: 'Emergo added successfully', emergoID: results.insertId });
  });
});

// Endpoint to update an existing Emergo entry
app.put('/admin/emergo/:emergoID', (req, res) => {
  const { emergoID } = req.params;
  const { emergoTitle, emergoContent, type } = req.body;
  const sqlQuery = 'UPDATE edu_emergo SET emergoTitle = ?, emergoContent = ?, type = ? WHERE emergoID = ?';
  
  connection.query(sqlQuery, [emergoTitle, emergoContent, type, emergoID], (error, results) => {
    if (error) {
      console.error('Error updating emergo:', error);
      return res.status(500).json({ error: 'Failed to update emergo' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Emergo not found' });
    }
    res.json({ message: 'Emergo updated successfully' });
  });
});

// Endpoint to delete an Emergo entry
app.delete('/admin/emergo/:emergoID', (req, res) => {
  const { emergoID } = req.params;
  const sqlQuery = 'DELETE FROM edu_emergo WHERE emergoID = ?';
  
  connection.query(sqlQuery, [emergoID], (error, results) => {
    if (error) {
      console.error('Error deleting emergo:', error);
      return res.status(500).json({ error: 'Failed to delete emergo' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Emergo not found' });
    }
    res.json({ message: 'Emergo deleted successfully' });
  });
});


// ############################# User Stats ###############################################
app.get('/admin/users/stats', (req, res) => {
  const sqlQuery = 'SELECT COUNT(*) AS total FROM patient';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }
    res.json({ total: results[0].total });
  });
});

// ############################# Article Stats ###############################################
app.get('/admin/articles/stats', (req, res) => {
  const sqlQuery = 'SELECT COUNT(*) AS total FROM articles';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching article stats:', error);
      return res.status(500).json({ error: 'Failed to fetch article stats' });
    }
    res.json({ total: results[0].total });
  });
});

// ############################# Forum Stats ###############################################
app.get('/admin/forum/stats', (req, res) => {
  const sqlQuery = 'SELECT COUNT(*) AS total FROM forumposts';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching forum stats:', error);
      return res.status(500).json({ error: 'Failed to fetch forum stats' });
    }
    res.json({ total: results[0].total });
  });
});

// ############################# Emergo Stats ###############################################
app.get('/admin/emergo/stats', (req, res) => {
  const sqlQuery = 'SELECT COUNT(*) AS total FROM edu_emergo';
  
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error fetching emergo stats:', error);
      return res.status(500).json({ error: 'Failed to fetch emergo stats' });
    }
    res.json({ total: results[0].total });
  });
});


//############################################################################
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
