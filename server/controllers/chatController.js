const sql = require('../config/sql');

exports.getConversations = async (req, res) => {
    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT DISTINCT
                    CASE
                        WHEN m.sender_id=@userId
                        THEN m.receiver_id
                        ELSE m.sender_id
                    END AS contact_id,

                    u.name AS contact_name,
                    u.avatar AS contact_avatar,

                    MAX(m.created_at) AS last_message_time

                FROM messages m

                INNER JOIN users u
                ON (
                    CASE
                        WHEN m.sender_id=@userId
                        THEN m.receiver_id
                        ELSE m.sender_id
                    END
                )=u.id

                WHERE
                    m.sender_id=@userId
                    OR m.receiver_id=@userId

                GROUP BY
                    CASE
                        WHEN m.sender_id=@userId
                        THEN m.receiver_id
                        ELSE m.sender_id
                    END,
                    u.name,
                    u.avatar

                ORDER BY last_message_time DESC
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch conversations",

            error: error.message

        });

    }

};

exports.getMessages = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("senderId", sql.Int, req.user.id)

            .input("receiverId", sql.Int, req.params.userId)

            .query(`
                SELECT
                    m.*,
                    s.name AS sender_name,
                    s.avatar AS sender_avatar,
                    r.name AS receiver_name,
                    r.avatar AS receiver_avatar

                FROM messages m

                INNER JOIN users s
                    ON m.sender_id=s.id

                INNER JOIN users r
                    ON m.receiver_id=r.id

                WHERE
                    (
                        m.sender_id=@senderId
                        AND
                        m.receiver_id=@receiverId
                    )
                    OR
                    (
                        m.sender_id=@receiverId
                        AND
                        m.receiver_id=@senderId
                    )

                ORDER BY m.created_at ASC
            `);

        await pool.request()

            .input("senderId", sql.Int, req.params.userId)

            .input("receiverId", sql.Int, req.user.id)

            .query(`
                UPDATE messages
                SET [read]=1
                WHERE
                    sender_id=@senderId
                    AND receiver_id=@receiverId
                    AND [read]=0
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch messages",

            error: error.message

        });

    }

};

exports.sendMessage = async (req, res) => {

    try {

        const { receiver_id, content } = req.body;

        const pool = await sql;

        const receiver = await pool.request()

            .input("receiverId", sql.Int, receiver_id)

            .query(`
                SELECT id
                FROM users
                WHERE id=@receiverId
            `);

        if (receiver.recordset.length === 0) {

            return res.status(404).json({

                message: "Receiver not found"

            });

        }

        const result = await pool.request()

            .input("senderId", sql.Int, req.user.id)

            .input("receiverId", sql.Int, receiver_id)

            .input("content", sql.NVarChar(sql.MAX), content)

            .query(`
                INSERT INTO messages
                (
                    sender_id,
                    receiver_id,
                    content
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @senderId,
                    @receiverId,
                    @content
                )
            `);

        const messageId = result.recordset[0].id;

        const message = await pool.request()

            .input("id", sql.Int, messageId)

            .query(`
                SELECT
                    m.*,
                    s.name AS sender_name,
                    s.avatar AS sender_avatar
                FROM messages m
                INNER JOIN users s
                    ON m.sender_id=s.id
                WHERE m.id=@id
            `);

        res.status(201).json({

            message: "Message sent",

            data: message.recordset[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to send message",

            error: error.message

        });

    }

};

exports.markAsRead = async (req, res) => {

    try {

        const pool = await sql;

        await pool.request()

            .input("senderId", sql.Int, req.params.userId)

            .input("receiverId", sql.Int, req.user.id)

            .query(`
                UPDATE messages
                SET [read]=1
                WHERE
                    sender_id=@senderId
                    AND receiver_id=@receiverId
            `);

        res.json({

            message: "Messages marked as read"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to mark messages as read",

            error: error.message

        });

    }

};

exports.getUnreadCount = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("receiverId", sql.Int, req.user.id)

            .query(`
                SELECT COUNT(*) AS count
                FROM messages
                WHERE
                    receiver_id=@receiverId
                    AND [read]=0
            `);

        res.json(result.recordset[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to get unread count",

            error: error.message

        });

    }

};
