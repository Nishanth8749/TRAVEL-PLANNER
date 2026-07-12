const sql = require('../config/sql');

exports.getNotifications = async (req, res) => {
    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT TOP 50 *
                FROM notifications
                WHERE user_id=@userId
                ORDER BY created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error("Get Notifications Error:", error);

        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });

    }
};

exports.markAsRead = async (req, res) => {
    try {

        const pool = await sql;

        await pool.request()

            .input("id", sql.Int, req.params.id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                UPDATE notifications
                SET [read]=1
                WHERE id=@id
                AND user_id=@userId
            `);

        res.json({
            message: "Notification marked as read"
        });

    } catch (error) {

        console.error("Mark Read Error:", error);

        res.status(500).json({
            message: "Failed to mark notification as read",
            error: error.message
        });

    }
};

exports.markAllAsRead = async (req, res) => {
    try {

        const pool = await sql;

        await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                UPDATE notifications
                SET [read]=1
                WHERE user_id=@userId
            `);

        res.json({
            message: "All notifications marked as read"
        });

    } catch (error) {

        console.error("Mark All Read Error:", error);

        res.status(500).json({
            message: "Failed to mark notifications as read",
            error: error.message
        });

    }
};

exports.getUnreadCount = async (req, res) => {
    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT COUNT(*) AS count
                FROM notifications
                WHERE user_id=@userId
                AND [read]=0
            `);

        res.json(result.recordset[0]);

    } catch (error) {

        console.error("Unread Count Error:", error);

        res.status(500).json({
            message: "Failed to get unread count",
            error: error.message
        });

    }
};

exports.deleteNotification = async (req, res) => {
    try {

        const pool = await sql;

        await pool.request()

            .input("id", sql.Int, req.params.id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                DELETE FROM notifications
                WHERE id=@id
                AND user_id=@userId
            `);

        res.json({
            message: "Notification deleted"
        });

    } catch (error) {

        console.error("Delete Notification Error:", error);

        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message
        });

    }
};