const sql = require('../config/sql');

exports.getAllDestinations = async (req, res) => {
    try {

        const {
            search,
            country,
            category,
            minPrice,
            maxPrice,
            minDuration,
            maxDuration,
            minRating,
            sort
        } = req.query;

        const pool = await sql;

        const request = pool.request();

        let query = `
        SELECT *
        FROM destinations
        WHERE 1=1
        `;

        if (search) {
            request.input("search", sql.NVarChar, `%${search}%`);
            query += `
            AND (
                name LIKE @search OR
                country LIKE @search OR
                city LIKE @search OR
                description LIKE @search
            )
            `;
        }

        if (country) {
            request.input("country", sql.NVarChar, country);
            query += ` AND country=@country`;
        }

        if (category) {
            request.input("category", sql.NVarChar, category);
            query += ` AND category=@category`;
        }

        if (minPrice) {
            request.input("minPrice", sql.Decimal(10,2), minPrice);
            query += ` AND price>=@minPrice`;
        }

        if (maxPrice) {
            request.input("maxPrice", sql.Decimal(10,2), maxPrice);
            query += ` AND price<=@maxPrice`;
        }

        if (minDuration) {
            request.input("minDuration", sql.Int, minDuration);
            query += ` AND duration>=@minDuration`;
        }

        if (maxDuration) {
            request.input("maxDuration", sql.Int, maxDuration);
            query += ` AND duration<=@maxDuration`;
        }

        if (minRating) {
            request.input("minRating", sql.Decimal(3,1), minRating);
            query += ` AND rating>=@minRating`;
        }

        if (sort) {

            const [field, order] = sort.split(":");

            const allowedFields = [
                "price",
                "rating",
                "duration",
                "name",
                "created_at"
            ];

            const allowedOrders = [
                "ASC",
                "DESC"
            ];

            if (
                allowedFields.includes(field) &&
                allowedOrders.includes(order.toUpperCase())
            ) {

                query += ` ORDER BY ${field} ${order.toUpperCase()}`;

            }

        } else {

            query += `
            ORDER BY
                featured DESC,
                popular DESC,
                rating DESC
            `;

        }

        const result = await request.query(query);

        const destinations = result.recordset.map(item => ({

            ...item,

            images: item.images
                ? JSON.parse(item.images)
                : [],

            gallery: item.gallery
                ? JSON.parse(item.gallery)
                : [],

            activities: item.activities
                ? JSON.parse(item.activities)
                : []

        }));

        res.json(destinations);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch destinations",

            error: error.message

        });

    }

};

exports.getDestinationById = async (req, res) => {
    try {

        const pool = await sql;

        // Get Destination
        const destinationResult = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT *
                FROM destinations
                WHERE id = @id
            `);

        if (destinationResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Destination not found"
            });
        }

        const destination = destinationResult.recordset[0];

        destination.images = destination.images
            ? JSON.parse(destination.images)
            : [];

        destination.gallery = destination.gallery
            ? JSON.parse(destination.gallery)
            : [];

        destination.activities = destination.activities
            ? JSON.parse(destination.activities)
            : [];

        // Get Reviews
        const reviewResult = await pool.request()
            .input("destinationId", sql.Int, req.params.id)
            .query(`
                SELECT
                    r.*,
                    u.name AS user_name,
                    u.avatar AS user_avatar
                FROM reviews r
                INNER JOIN users u
                    ON r.user_id = u.id
                WHERE r.destination_id = @destinationId
                ORDER BY r.created_at DESC
            `);

        res.json({
            ...destination,
            reviews: reviewResult.recordset
        });

    } catch (error) {

        console.error("Get Destination Error:", error);

        res.status(500).json({
            message: "Failed to fetch destination",
            error: error.message
        });

    }
};

exports.createDestination = async (req, res) => {
    try {

        const {
            name,
            country,
            city,
            description,
            price,
            duration,
            weather,
            category,
            activities,
            latitude,
            longitude,
            featured,
            popular
        } = req.body;

        const pool = await sql;

        let images = "[]";
        let gallery = "[]";

        if (req.files) {

            const mainImages = req.files
                .filter(file => file.fieldname === "images")
                .map(file => `/uploads/${file.filename}`);

            const galleryImages = req.files
                .filter(file => file.fieldname === "gallery")
                .map(file => `/uploads/${file.filename}`);

            if (mainImages.length)
                images = JSON.stringify(mainImages);

            if (galleryImages.length)
                gallery = JSON.stringify(galleryImages);

        }

        const activitiesJson = Array.isArray(activities)
            ? JSON.stringify(activities)
            : (activities || "[]");

        const result = await pool.request()

            .input("name", sql.NVarChar(200), name)
            .input("country", sql.NVarChar(100), country)
            .input("city", sql.NVarChar(100), city)
            .input("description", sql.NVarChar(sql.MAX), description)
            .input("images", sql.NVarChar(sql.MAX), images)
            .input("gallery", sql.NVarChar(sql.MAX), gallery)
            .input("price", sql.Decimal(10,2), price)
            .input("duration", sql.Int, duration)
            .input("weather", sql.NVarChar(100), weather)
            .input("category", sql.NVarChar(100), category)
            .input("activities", sql.NVarChar(sql.MAX), activitiesJson)
            .input("latitude", sql.Float, latitude || null)
            .input("longitude", sql.Float, longitude || null)
            .input("featured", sql.Bit, featured || 0)
            .input("popular", sql.Bit, popular || 0)

            .query(`
                INSERT INTO destinations
                (
                    name,
                    country,
                    city,
                    description,
                    images,
                    gallery,
                    price,
                    duration,
                    weather,
                    category,
                    activities,
                    latitude,
                    longitude,
                    featured,
                    popular
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @name,
                    @country,
                    @city,
                    @description,
                    @images,
                    @gallery,
                    @price,
                    @duration,
                    @weather,
                    @category,
                    @activities,
                    @latitude,
                    @longitude,
                    @featured,
                    @popular
                )
            `);

        const destinationId = result.recordset[0].id;

        const destinationResult = await pool.request()

            .input("id", sql.Int, destinationId)

            .query(`
                SELECT *
                FROM destinations
                WHERE id=@id
            `);

        const destination = destinationResult.recordset[0];

        destination.images = destination.images
            ? JSON.parse(destination.images)
            : [];

        destination.gallery = destination.gallery
            ? JSON.parse(destination.gallery)
            : [];

        destination.activities = destination.activities
            ? JSON.parse(destination.activities)
            : [];

        res.status(201).json({

            message: "Destination created successfully",

            destination

        });

    } catch (error) {

        console.error("Create Destination Error:", error);

        res.status(500).json({

            message: "Failed to create destination",

            error: error.message

        });

    }
};

exports.updateDestination = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            name,
            country,
            city,
            description,
            price,
            duration,
            weather,
            category,
            activities,
            latitude,
            longitude,
            featured,
            popular
        } = req.body;

        const pool = await sql;

        // Check if destination exists
        const existingResult = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT *
                FROM destinations
                WHERE id=@id
            `);

        if (existingResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Destination not found"
            });
        }

        const existing = existingResult.recordset[0];

        let images = existing.images;
        let gallery = existing.gallery;

        if (req.files) {

            const mainImages = req.files
                .filter(file => file.fieldname === "images")
                .map(file => `/uploads/${file.filename}`);

            const galleryImages = req.files
                .filter(file => file.fieldname === "gallery")
                .map(file => `/uploads/${file.filename}`);

            if (mainImages.length)
                images = JSON.stringify(mainImages);

            if (galleryImages.length)
                gallery = JSON.stringify(galleryImages);

        }

        const activitiesJson = Array.isArray(activities)
            ? JSON.stringify(activities)
            : (activities || existing.activities);

        await pool.request()

            .input("id", sql.Int, id)
            .input("name", sql.NVarChar(200), name || existing.name)
            .input("country", sql.NVarChar(100), country || existing.country)
            .input("city", sql.NVarChar(100), city || existing.city)
            .input("description", sql.NVarChar(sql.MAX), description || existing.description)
            .input("images", sql.NVarChar(sql.MAX), images)
            .input("gallery", sql.NVarChar(sql.MAX), gallery)
            .input("price", sql.Decimal(10,2), price || existing.price)
            .input("duration", sql.Int, duration || existing.duration)
            .input("weather", sql.NVarChar(100), weather || existing.weather)
            .input("category", sql.NVarChar(100), category || existing.category)
            .input("activities", sql.NVarChar(sql.MAX), activitiesJson)
            .input("latitude", sql.Float, latitude ?? existing.latitude)
            .input("longitude", sql.Float, longitude ?? existing.longitude)
            .input("featured", sql.Bit, featured !== undefined ? featured : existing.featured)
            .input("popular", sql.Bit, popular !== undefined ? popular : existing.popular)

            .query(`
                UPDATE destinations
                SET
                    name=@name,
                    country=@country,
                    city=@city,
                    description=@description,
                    images=@images,
                    gallery=@gallery,
                    price=@price,
                    duration=@duration,
                    weather=@weather,
                    category=@category,
                    activities=@activities,
                    latitude=@latitude,
                    longitude=@longitude,
                    featured=@featured,
                    popular=@popular
                WHERE id=@id
            `);

        const updatedResult = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT *
                FROM destinations
                WHERE id=@id
            `);

        const destination = updatedResult.recordset[0];

        destination.images = destination.images
            ? JSON.parse(destination.images)
            : [];

        destination.gallery = destination.gallery
            ? JSON.parse(destination.gallery)
            : [];

        destination.activities = destination.activities
            ? JSON.parse(destination.activities)
            : [];

        res.json({
            message: "Destination updated successfully",
            destination
        });

    } catch (error) {

        console.error("Update Destination Error:", error);

        res.status(500).json({
            message: "Failed to update destination",
            error: error.message
        });

    }
};

exports.deleteDestination = async (req, res) => {
    try {

        const { id } = req.params;

        const pool = await sql;

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT id
                FROM destinations
                WHERE id=@id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Destination not found"
            });
        }

        await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM destinations
                WHERE id=@id
            `);

        res.json({
            message: "Destination deleted successfully"
        });

    } catch (error) {

        console.error("Delete Destination Error:", error);

        res.status(500).json({
            message: "Failed to delete destination",
            error: error.message
        });

    }
};

exports.getFeaturedDestinations = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request().query(`
            SELECT TOP 6 *
            FROM destinations
            WHERE featured = 1
            ORDER BY rating DESC
        `);

        const destinations = result.recordset.map(item => ({

            ...item,

            images: item.images ? JSON.parse(item.images) : [],

            gallery: item.gallery ? JSON.parse(item.gallery) : [],

            activities: item.activities ? JSON.parse(item.activities) : []

        }));

        res.json(destinations);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch featured destinations",

            error: error.message

        });

    }

};

exports.getPopularDestinations = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request().query(`
            SELECT TOP 8 *
            FROM destinations
            WHERE popular = 1
            ORDER BY rating DESC
        `);

        const destinations = result.recordset.map(item => ({

            ...item,

            images: item.images ? JSON.parse(item.images) : [],

            gallery: item.gallery ? JSON.parse(item.gallery) : [],

            activities: item.activities ? JSON.parse(item.activities) : []

        }));

        res.json(destinations);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch popular destinations",

            error: error.message

        });

    }

};

exports.getDestinationsByCategory = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("category", sql.NVarChar(100), req.params.category)

            .query(`
                SELECT *
                FROM destinations
                WHERE category=@category
                ORDER BY rating DESC
            `);

        const destinations = result.recordset.map(item => ({

            ...item,

            images: item.images
                ? JSON.parse(item.images)
                : [],

            gallery: item.gallery
                ? JSON.parse(item.gallery)
                : [],

            activities: item.activities
                ? JSON.parse(item.activities)
                : []
        }));
        res.json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch destinations",
            error: error.message
        });
    }
};