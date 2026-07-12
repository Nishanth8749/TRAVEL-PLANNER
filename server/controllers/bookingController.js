const sql = require('../config/sql');
const axios = require("axios");
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const pool = await sql;
    const request = pool.request();
    request.input("userId", sql.Int, req.user.id);
    let query = `
      SELECT
        b.*,
        d.name AS destination_name,
        d.country,
        d.city,
        d.images,
        d.duration
      FROM bookings b
      INNER JOIN destinations d
        ON b.destination_id = d.id
      WHERE b.user_id=@userId
    `;
    if (status) {
      request.input("status", sql.VarChar, status);
      query += ` AND b.status=@status`;
    }
    query += ` ORDER BY b.created_at DESC`;
    const result = await request.query(query);
    const bookings = result.recordset.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const pool = await sql;
    const result = await pool.request()
      .input("bookingId", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT
          b.*,
          d.name AS destination_name,
          d.country,
          d.city,
          d.images,
          d.duration,
          d.description
        FROM bookings b
        INNER JOIN destinations d
        ON b.destination_id=d.id
        WHERE
          b.id=@bookingId
          AND b.user_id=@userId
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    const booking = result.recordset[0];
    booking.images = booking.images
      ? JSON.parse(booking.images)
      : [];
    res.json(booking);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      destination_id,
      travel_date,
      return_date,
      guests,
      total_price,
      notes
    } = req.body;
    const pool = await sql;
    // Get destination price
    const destinationResult = await pool
  .request()
  .input("destinationId", sql.Int, destination_id)
  .query(`
    SELECT
      id,
      name,
      price
    FROM destinations
    WHERE id=@destinationId
  `);
    if (destinationResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }
    const destination = destinationResult.recordset[0];
    const calculatedPrice =
      total_price || (destination.price * (guests || 1));
    // Create booking
    const bookingResult = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("destinationId", sql.Int, destination_id)
      .input("bookingDate", sql.Date, new Date())
      .input("travelDate", sql.Date, travel_date)
      .input("returnDate", sql.Date, return_date)
      .input("guests", sql.Int, guests || 1)
      .input("totalPrice", sql.Decimal(10, 2), calculatedPrice)
      .input("notes", sql.NVarChar(sql.MAX), notes || null)
      .query(`
        INSERT INTO bookings
        (
          user_id,
          destination_id,
          booking_date,
          travel_date,
          return_date,
          guests,
          total_price,
          notes
        )
        OUTPUT INSERTED.id
        VALUES
        (
          @userId,
          @destinationId,
          @bookingDate,
          @travelDate,
          @returnDate,
          @guests,
          @totalPrice,
          @notes
        )
      `);
    const bookingId = bookingResult.recordset[0].id;
    // ===============================
// Azure Function Booking Processor
// ===============================
try {
  await axios.post(
    "http://localhost:7071/api/BookingProcessor",
    {
      bookingId,
      userId: req.user.id,
      destinationId: destination_id,
      destination: destination.name || "Destination",
      amount: calculatedPrice,
      totalPrice: calculatedPrice,
      bookingStatus: "Confirmed",
      bookingTime: new Date().toISOString()
    }
  );

  console.log("✅ Azure Function executed successfully");
} catch (err) {
  console.error(
    "❌ Azure Function Error:",
    err.response?.data || err.message
  );
}
    // Notification
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("title", sql.NVarChar(100), "Booking Confirmation")
      .input(
        "message",
        sql.NVarChar(sql.MAX),
        `Your booking has been received and is pending confirmation. Booking ID: #${bookingId}`
      )
      .input("type", sql.VarChar(20), "booking")
      .query(`
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          type
        )
        VALUES
        (
          @userId,
          @title,
          @message,
          @type
        )
      `);
    // Fetch booking
    const booking = await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT
          b.*,
          d.name AS destination_name,
          d.country,
          d.city,
          d.images
        FROM bookings b
        INNER JOIN destinations d
          ON b.destination_id=d.id
        WHERE b.id=@bookingId
      `);
    const bookingData = booking.recordset[0];
    bookingData.images = bookingData.images
      ? JSON.parse(bookingData.images)
      : [];
    res.status(201).json({
      message: "Booking created successfully",
      booking: bookingData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, notes } = req.body;
    const pool = await sql;
    // Check booking exists
    const bookingResult = await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT *
        FROM bookings
        WHERE id=@bookingId
          AND user_id=@userId
      `);
    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    const booking = bookingResult.recordset[0];
    // Update booking
    await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("status", sql.VarChar(30), status || booking.status)
      .input(
        "paymentStatus",
        sql.VarChar(30),
        payment_status || booking.payment_status
      )
      .input(
        "notes",
        sql.NVarChar(sql.MAX),
        notes || booking.notes
      )
      .query(`
        UPDATE bookings
        SET
          status=@status,
          payment_status=@paymentStatus,
          notes=@notes
        WHERE id=@bookingId
      `);
    // Notification when cancelled
    if (status === "cancelled") {
      await pool
        .request()
        .input("userId", sql.Int, req.user.id)
        .input(
          "title",
          sql.NVarChar(100),
          "Booking Cancelled"
        )
        .input(
          "message",
          sql.NVarChar(sql.MAX),
          `Your booking #${id} has been cancelled.`
        )
        .input(
          "type",
          sql.VarChar(20),
          "booking"
        )
        .query(`
          INSERT INTO notifications
          (
            user_id,
            title,
            message,
            type
          )
          VALUES
          (
            @userId,
            @title,
            @message,
            @type
          )
        `);
    }
    res.json({
      message: "Booking updated successfully"
    });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql;
    // Check booking exists
    const bookingResult = await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT *
        FROM bookings
        WHERE id=@bookingId
        AND user_id=@userId
      `);
    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    // Update booking status
    await pool
      .request()
      .input("bookingId", sql.Int, id)
      .query(`
        UPDATE bookings
        SET status='cancelled'
        WHERE id=@bookingId
      `);
    // Create notification
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("title", sql.NVarChar(100), "Booking Cancelled")
      .input(
        "message",
        sql.NVarChar(sql.MAX),
        `Your booking #${id} has been cancelled. Refund will be processed within 5-7 business days.`
      )
      .input("type", sql.VarChar(20), "booking")
      .query(`
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          type
        )
        VALUES
        (
          @userId,
          @title,
          @message,
          @type
        )
      `);
    res.json({
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql;
    // Check booking exists
    const bookingResult = await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT id
        FROM bookings
        WHERE id=@bookingId
        AND user_id=@userId
      `);
    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    // Delete booking
    await pool
      .request()
      .input("bookingId", sql.Int, id)
      .query(`
        DELETE FROM bookings
        WHERE id=@bookingId
      `);

    res.json({
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message
    });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_number, card_name, expiry, cvv } = req.body;
    if (!card_number || !card_name || !expiry || !cvv) {
      return res.status(400).json({
        message: "All payment fields are required"
      });
    }
    const pool = await sql;
    // Get Booking
    const bookingResult = await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT *
        FROM bookings
        WHERE id=@bookingId
        AND user_id=@userId
      `);
    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    const booking = bookingResult.recordset[0];
    const maskedCard =
      "**** **** **** " + card_number.slice(-4);
    const transactionId =
      "TXN" + Date.now();
    // Update Payment
    await pool
      .request()
      .input("bookingId", sql.Int, id)
      .query(`
        UPDATE bookings
        SET
            payment_status='paid',
            status='confirmed'
        WHERE id=@bookingId
      `);
    // Notification
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("title", sql.NVarChar(100), "Payment Successful")
      .input(
        "message",
        sql.NVarChar(sql.MAX),
        `Payment of ₹${booking.total_price} received for Booking #${id}. Card: ${maskedCard}`
      )
      .input("type", sql.VarChar(20), "booking")
      .query(`
        INSERT INTO notifications
        (
            user_id,
            title,
            message,
            type
        )
        VALUES
        (
            @userId,
            @title,
            @message,
            @type
        )
      `);
    res.json({
      message: "Payment processed successfully",
      transaction_id: transactionId,
      amount: booking.total_price,
      currency: "INR",
      card_used: maskedCard,
      payment_status: "Paid",
      booking_status: "Confirmed"
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({
      message: "Payment processing failed",
      error: error.message
    });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql;
    const result = await pool
      .request()
      .input("bookingId", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT
            b.*,
            d.name AS destination_name,
            d.country,
            d.city,
            d.description,
            d.duration,
            u.name AS user_name,
            u.email AS user_email
        FROM bookings b
        INNER JOIN destinations d
            ON b.destination_id=d.id
        INNER JOIN users u
            ON b.user_id=u.id
        WHERE
            b.id=@bookingId
            AND b.user_id=@userId
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    const booking = result.recordset[0];
    const invoice = {
      invoice_number:
        `INV-${booking.id.toString().padStart(6, "0")}`,
      issue_date:
        new Date().toISOString().split("T")[0],
      booking_id:
        booking.id,
      customer: {
        name:
          booking.user_name,
        email:
          booking.user_email
      },
      destination: {
        name:
          booking.destination_name,
        country:
          booking.country,
        city:
          booking.city,
        duration:
          booking.duration
      },
      travel_dates: {
        departure:
          booking.travel_date,
        return:
          booking.return_date

      },
      guests:
        booking.guests,
      pricing: {
        subtotal:
          booking.total_price,
        tax:
          Number(booking.total_price) * 0.10,
        total:
          Number(booking.total_price) * 1.10,
        currency:
          "INR"
      },
      payment_status:
        booking.payment_status,
      booking_status:
        booking.status
    };
    res.json(invoice);
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({
      message: "Failed to generate invoice",
      error: error.message

    });
  }
};