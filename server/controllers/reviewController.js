const sql = require('../config/sql');

exports.getReviews = async (req, res) => {
    try {

        const { destination_id, user_id } = req.query;

        const pool = await sql;

        const request = pool.request();

        let query = `
            SELECT
                r.*,
                u.name AS user_name,
                u.avatar AS user_avatar,
                d.name AS destination_name
            FROM reviews r
            INNER JOIN users u
                ON r.user_id=u.id
            INNER JOIN destinations d
                ON r.destination_id=d.id
            WHERE 1=1
        `;

        if (destination_id) {
            request.input("destinationId", sql.Int, destination_id);
            query += ` AND r.destination_id=@destinationId`;
        }

        if (user_id) {
            request.input("userId", sql.Int, user_id);
            query += ` AND r.user_id=@userId`;
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await request.query(query);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });

    }
};

exports.createReview = async (req, res) => {

    try {

        const { destination_id, rating, comment } = req.body;

        const pool = await sql;

        const destinationResult = await pool.request()
            .input("destinationId", sql.Int, destination_id)
            .query(`
                SELECT id
                FROM destinations
                WHERE id=@destinationId
            `);

        if (destinationResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Destination not found"
            });
        }

        const existingReview = await pool.request()
            .input("userId", sql.Int, req.user.id)
            .input("destinationId", sql.Int, destination_id)
            .query(`
                SELECT id
                FROM reviews
                WHERE
                    user_id=@userId
                    AND destination_id=@destinationId
            `);

        if (existingReview.recordset.length > 0) {
            return res.status(400).json({
                message: "You have already reviewed this destination"
            });
        }

        const insertResult = await pool.request()

            .input("userId", sql.Int, req.user.id)
            .input("destinationId", sql.Int, destination_id)
            .input("rating", sql.Int, rating)
            .input("comment", sql.NVarChar(sql.MAX), comment)

            .query(`
                INSERT INTO reviews
                (
                    user_id,
                    destination_id,
                    rating,
                    comment
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @userId,
                    @destinationId,
                    @rating,
                    @comment
                )
            `);

        const reviewId = insertResult.recordset[0].id;

        const average = await pool.request()

            .input("destinationId", sql.Int, destination_id)

            .query(`
                SELECT
                    AVG(CAST(rating AS FLOAT)) AS avgRating,
                    COUNT(*) AS reviewCount
                FROM reviews
                WHERE destination_id=@destinationId
            `);

        await pool.request()

            .input("rating", sql.Decimal(3,1),
                Number(average.recordset[0].avgRating || 0).toFixed(1))

            .input("count", sql.Int,
                average.recordset[0].reviewCount)

            .input("destinationId", sql.Int, destination_id)

            .query(`
                UPDATE destinations
                SET
                    rating=@rating,
                    review_count=@count
                WHERE id=@destinationId
            `);

        const review = await pool.request()

            .input("reviewId", sql.Int, reviewId)

            .query(`
                SELECT
                    r.*,
                    u.name AS user_name,
                    u.avatar AS user_avatar
                FROM reviews r
                INNER JOIN users u
                    ON r.user_id=u.id
                WHERE r.id=@reviewId
            `);

        res.status(201).json({

            message: "Review added successfully",

            review: review.recordset[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to add review",

            error: error.message

        });

    }

};

exports.updateReview = async (req, res) => {

    try {

        const { id } = req.params;

        const { rating, comment } = req.body;

        const pool = await sql;

        const existing = await pool.request()

            .input("id", sql.Int, id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT *
                FROM reviews
                WHERE
                    id=@id
                    AND user_id=@userId
            `);

        if (existing.recordset.length === 0) {

            return res.status(404).json({
                message: "Review not found"
            });

        }

        const review = existing.recordset[0];

        await pool.request()

            .input("id", sql.Int, id)

            .input("rating", sql.Int, rating)

            .input("comment", sql.NVarChar(sql.MAX), comment)

            .query(`
                UPDATE reviews
                SET
                    rating=@rating,
                    comment=@comment,
                    updated_at=GETDATE()
                WHERE id=@id
            `);

        const avg = await pool.request()

            .input("destinationId", sql.Int, review.destination_id)

            .query(`
                SELECT
                    AVG(CAST(rating AS FLOAT)) AS avgRating
                FROM reviews
                WHERE destination_id=@destinationId
            `);

        await pool.request()

            .input("rating", sql.Decimal(3,1),
                Number(avg.recordset[0].avgRating || 0).toFixed(1))

            .input("destinationId", sql.Int, review.destination_id)

            .query(`
                UPDATE destinations
                SET rating=@rating
                WHERE id=@destinationId
            `);

        res.json({

            message: "Review updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to update review",

            error: error.message

        });

    }

};

exports.deleteReview = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, req.params.id)

            .query(`
                SELECT *
                FROM reviews
                WHERE id=@id
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                message: "Review not found"
            });

        }

        const review = result.recordset[0];

        if (
            review.user_id !== req.user.id &&
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                message: "Not authorized to delete this review"
            });

        }

        await pool.request()

            .input("id", sql.Int, req.params.id)

            .query(`
                DELETE FROM reviews
                WHERE id=@id
            `);

        const stats = await pool.request()

            .input("destinationId", sql.Int, review.destination_id)

            .query(`
                SELECT
                    AVG(CAST(rating AS FLOAT)) AS avgRating,
                    COUNT(*) AS reviewCount
                FROM reviews
                WHERE destination_id=@destinationId
            `);

        await pool.request()

            .input("rating", sql.Decimal(3,1),
                Number(stats.recordset[0].avgRating || 0).toFixed(1))

            .input("count", sql.Int,
                stats.recordset[0].reviewCount)

            .input("destinationId", sql.Int, review.destination_id)

            .query(`
                UPDATE destinations
                SET
                    rating=@rating,
                    review_count=@count
                WHERE id=@destinationId
            `);

        res.json({
            message: "Review deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete review",
            error: error.message
        });

    }

};