const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const poolPromise = require("../config/sql");
const { secret, expiresIn } = require("../config/jwt");

const generateToken = (userId) => {
  return jwt.sign({ userId }, secret, { expiresIn });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const pool = await poolPromise;

    // Check if email already exists
    const existingUser = await pool
      .request()
      .input("email", email)
      .query("SELECT id FROM users WHERE email=@email");

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    await pool
      .request()
      .input("name", name)
      .input("email", email)
      .input("password", hashedPassword)
      .query(`
        INSERT INTO users (name,email,password)
        VALUES (@name,@email,@password)
      `);

    // Get inserted user
    const result = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT id,name,email,role,avatar
        FROM users
        WHERE email=@email
      `);

    const user = result.recordset[0];

    const token = generateToken(user.id);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", email)
      .query("SELECT * FROM users WHERE email=@email");

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.recordset[0];

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    delete user.password;

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;

    const userResult = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT
          id,
          name,
          email,
          avatar,
          phone,
          bio,
          location,
          role,
          created_at
        FROM users
        WHERE id=@id
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.recordset[0];

    const totalTrips = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT COUNT(*) AS count
        FROM bookings
        WHERE user_id=@id
        AND status IN ('confirmed','completed')
      `);

    const wishlist = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT COUNT(*) AS count
        FROM wishlist
        WHERE user_id=@id
      `);

    const reviews = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT COUNT(*) AS count
        FROM reviews
        WHERE user_id=@id
      `);

    const upcoming = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT COUNT(*) AS count
        FROM bookings
        WHERE user_id=@id
        AND status='confirmed'
        AND travel_date > GETDATE()
      `);

    res.json({
      user,
      stats: {
        totalTrips: totalTrips.recordset[0].count,
        wishlistCount: wishlist.recordset[0].count,
        reviewsCount: reviews.recordset[0].count,
        upcomingTrips: upcoming.recordset[0].count,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, location } = req.body;

    const avatar = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const pool = await poolPromise;

    if (avatar) {
      await pool
        .request()
        .input("name", name)
        .input("phone", phone)
        .input("bio", bio)
        .input("location", location)
        .input("avatar", avatar)
        .input("id", req.user.id)
        .query(`
          UPDATE users
          SET
            name=@name,
            phone=@phone,
            bio=@bio,
            location=@location,
            avatar=@avatar,
            updated_at=GETDATE()
          WHERE id=@id
        `);
    } else {
      await pool
        .request()
        .input("name", name)
        .input("phone", phone)
        .input("bio", bio)
        .input("location", location)
        .input("id", req.user.id)
        .query(`
          UPDATE users
          SET
            name=@name,
            phone=@phone,
            bio=@bio,
            location=@location,
            updated_at=GETDATE()
          WHERE id=@id
        `);
    }

    const result = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT
          id,
          name,
          email,
          avatar,
          phone,
          bio,
          location,
          role
        FROM users
        WHERE id=@id
      `);

    res.json({
      message: "Profile updated successfully",
      user: result.recordset[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", req.user.id)
      .query(`
        SELECT password
        FROM users
        WHERE id=@id
      `);

    const user = result.recordset[0];

    const isValid = bcrypt.compareSync(
      currentPassword,
      user.password
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await pool
      .request()
      .input("password", hashedPassword)
      .input("id", req.user.id)
      .query(`
        UPDATE users
        SET password=@password
        WHERE id=@id
      `);

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};