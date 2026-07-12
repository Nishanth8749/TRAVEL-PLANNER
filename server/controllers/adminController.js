const poolPromise = require("../config/sql");

exports.getDashboardStats = async (req, res) => {
  try {

    const pool = await poolPromise;

    const totalUsers = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM users
    `);

    const totalDestinations = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM destinations
    `);

    const totalBookings = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM bookings
    `);

    const totalRevenue = await pool.request().query(`
      SELECT ISNULL(SUM(total_price),0) AS total
      FROM bookings
      WHERE payment_status='paid'
    `);

    const totalReviews = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM reviews
    `);

    const totalGuides = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM guides
    `);

    const pendingBookings = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM bookings
      WHERE status='pending'
    `);

    const recentUsers = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM users
      WHERE created_at >= DATEADD(DAY,-7,GETDATE())
    `);

    const bookingsByStatus = await pool.request().query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM bookings
      GROUP BY status
    `);

    const bookingsByMonth = await pool.request().query(`
      SELECT
        FORMAT(created_at,'yyyy-MM') AS month,
        COUNT(*) AS count,
        SUM(total_price) AS revenue
      FROM bookings
      WHERE created_at >= DATEADD(MONTH,-6,GETDATE())
      GROUP BY FORMAT(created_at,'yyyy-MM')
      ORDER BY month
    `);

    const popularDestinations = await pool.request().query(`
      SELECT TOP (5)
        d.name,
        COUNT(b.id) AS bookings,
        SUM(b.total_price) AS revenue
      FROM bookings b
      INNER JOIN destinations d
        ON b.destination_id=d.id
      GROUP BY d.id,d.name
      ORDER BY bookings DESC
    `);

    const recentActivity = await pool.request().query(`
      SELECT TOP (10)
        'booking' AS type,
        b.created_at,
        u.name AS user_name,
        d.name AS item_name,
        b.total_price AS amount
      FROM bookings b
      INNER JOIN users u
        ON b.user_id=u.id
      INNER JOIN destinations d
        ON b.destination_id=d.id
      ORDER BY b.created_at DESC
    `);

    const stats = {
      totalUsers: totalUsers.recordset[0].count,
      totalDestinations: totalDestinations.recordset[0].count,
      totalBookings: totalBookings.recordset[0].count,
      totalRevenue: totalRevenue.recordset[0].total,
      totalReviews: totalReviews.recordset[0].count,
      totalGuides: totalGuides.recordset[0].count,
      pendingBookings: pendingBookings.recordset[0].count,
      recentUsers: recentUsers.recordset[0].count,
      bookingsByStatus: bookingsByStatus.recordset,
      bookingsByMonth: bookingsByMonth.recordset,
      popularDestinations: popularDestinations.recordset,
      recentActivity: recentActivity.recordset
    };

    res.json(stats);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message
    });

  }
};

exports.getAllUsers = async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.avatar,
        u.phone,
        u.role,
        u.location,
        u.created_at,

        (
          SELECT COUNT(*)
          FROM bookings b
          WHERE b.user_id = u.id
        ) AS booking_count,

        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.user_id = u.id
        ) AS review_count

      FROM users u
      ORDER BY u.created_at DESC
    `);

    res.json(result.recordset);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });

  }
};

exports.updateUserRole = async (req, res) => {
  try {

    const { id } = req.params;
    const { role } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("role", role)
      .input("id", id)
      .query(`
        UPDATE users
        SET role = @role
        WHERE id = @id
      `);

    res.json({
      message: "User role updated"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update user role",
      error: error.message
    });

  }
};

exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", id)
      .query(`
        DELETE FROM users
        WHERE id = @id
      `);

    res.json({
      message: "User deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });

  }
};

exports.getAllBookings = async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        b.*,
        d.name AS destination_name,
        d.country,
        d.city,
        u.name AS user_name,
        u.email AS user_email

      FROM bookings b

      INNER JOIN destinations d
        ON b.destination_id = d.id

      INNER JOIN users u
        ON b.user_id = u.id

      ORDER BY b.created_at DESC
    `);

    res.json(result.recordset);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });

  }
};

exports.updateBookingStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status, payment_status } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("status", status)
      .input("payment_status", payment_status)
      .input("id", id)
      .query(`
        UPDATE bookings
        SET
          status = @status,
          payment_status = @payment_status
        WHERE id = @id
      `);

    res.json({
      message: "Booking status updated"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update booking",
      error: error.message
    });

  }
};

exports.getAllReviews = async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        r.*,
        u.name AS user_name,
        u.email AS user_email,
        d.name AS destination_name

      FROM reviews r

      INNER JOIN users u
        ON r.user_id = u.id

      INNER JOIN destinations d
        ON r.destination_id = d.id

      ORDER BY r.created_at DESC
    `);

    res.json(result.recordset);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });

  }
};

exports.getRevenueStats = async (req, res) => {
  try {

    const pool = await poolPromise;

    const daily = await pool.request().query(`
      SELECT
        CAST(created_at AS DATE) AS date,
        SUM(total_price) AS revenue,
        COUNT(*) AS bookings
      FROM bookings
      WHERE payment_status = 'paid'
        AND created_at >= DATEADD(DAY,-30,GETDATE())
      GROUP BY CAST(created_at AS DATE)
      ORDER BY date
    `);

    const monthly = await pool.request().query(`
      SELECT
        FORMAT(created_at,'yyyy-MM') AS month,
        SUM(total_price) AS revenue,
        COUNT(*) AS bookings
      FROM bookings
      WHERE payment_status = 'paid'
        AND created_at >= DATEADD(MONTH,-12,GETDATE())
      GROUP BY FORMAT(created_at,'yyyy-MM')
      ORDER BY month
    `);

    const byCategory = await pool.request().query(`
      SELECT
        d.category,
        SUM(b.total_price) AS revenue,
        COUNT(*) AS bookings

      FROM bookings b

      INNER JOIN destinations d
        ON b.destination_id = d.id

      WHERE b.payment_status = 'paid'

      GROUP BY d.category
    `);

    res.json({
      daily: daily.recordset,
      monthly: monthly.recordset,
      byCategory: byCategory.recordset
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch revenue stats",
      error: error.message
    });

  }
};