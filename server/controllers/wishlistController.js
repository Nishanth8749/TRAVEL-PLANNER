const sql = require('../config/sql');

exports.getWishlist = async (req, res) => {
    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT
                    w.*,
                    d.name,
                    d.country,
                    d.city,
                    d.images,
                    d.price,
                    d.duration,
                    d.rating,
                    d.category
                FROM wishlist w
                INNER JOIN destinations d
                    ON w.destination_id=d.id
                WHERE w.user_id=@userId
                ORDER BY w.created_at DESC
            `);

        const wishlist = result.recordset.map(item => ({

            ...item,

            images: item.images
                ? JSON.parse(item.images)
                : []

        }));

        res.json(wishlist);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch wishlist",

            error: error.message

        });

    }

};

exports.addToWishlist = async (req, res) => {

    try {

        const { destination_id } = req.body;

        const pool = await sql;

        const destination = await pool.request()

            .input("destinationId", sql.Int, destination_id)

            .query(`
                SELECT id
                FROM destinations
                WHERE id=@destinationId
            `);

        if (destination.recordset.length === 0) {

            return res.status(404).json({

                message: "Destination not found"

            });

        }

        const existing = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .input("destinationId", sql.Int, destination_id)

            .query(`
                SELECT id
                FROM wishlist
                WHERE
                    user_id=@userId
                    AND destination_id=@destinationId
            `);

        if (existing.recordset.length > 0) {

            return res.status(400).json({

                message: "Destination already in wishlist"

            });

        }

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .input("destinationId", sql.Int, destination_id)

            .query(`
                INSERT INTO wishlist
                (
                    user_id,
                    destination_id
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @userId,
                    @destinationId
                )
            `);

        res.status(201).json({

            message: "Added to wishlist",

            wishlist_id: result.recordset[0].id

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to add to wishlist",

            error: error.message

        });

    }

};

exports.removeFromWishlist = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, req.params.id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT id
                FROM wishlist
                WHERE
                    id=@id
                    AND user_id=@userId
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({

                message: "Wishlist item not found"

            });

        }

        await pool.request()

            .input("id", sql.Int, req.params.id)

            .query(`
                DELETE FROM wishlist
                WHERE id=@id
            `);

        res.json({

            message: "Removed from wishlist"

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to remove from wishlist",

            error: error.message

        });

    }

};

exports.checkWishlist = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .input("destinationId", sql.Int, req.params.destination_id)

            .query(`
                SELECT id
                FROM wishlist
                WHERE
                    user_id=@userId
                    AND destination_id=@destinationId
            `);

        const item = result.recordset[0];

        res.json({

            isInWishlist: !!item,

            wishlist_id: item ? item.id : null

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to check wishlist",

            error: error.message

        });

    }

};
