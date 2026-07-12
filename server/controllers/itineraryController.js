const sql = require('../config/sql');

exports.getItineraries = async (req, res) => {
    try {

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT *
                FROM itineraries
                WHERE user_id=@userId
                ORDER BY created_at DESC
            `);

        const itineraries = result.recordset.map(item => ({

            ...item,

            destinations: item.destinations
                ? JSON.parse(item.destinations)
                : [],

            activities: item.activities
                ? JSON.parse(item.activities)
                : []

        }));

        res.json(itineraries);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch itineraries",
            error: error.message
        });

    }
};

exports.getItineraryById = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, req.params.id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT *
                FROM itineraries
                WHERE
                    id=@id
                    AND user_id=@userId
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({

                message: "Itinerary not found"

            });

        }

        const itinerary = result.recordset[0];

        itinerary.destinations = itinerary.destinations
            ? JSON.parse(itinerary.destinations)
            : [];

        itinerary.activities = itinerary.activities
            ? JSON.parse(itinerary.activities)
            : [];

        res.json(itinerary);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch itinerary",

            error: error.message

        });

    }

};

exports.createItinerary = async (req, res) => {

    try {

        const {
            title,
            destinations,
            start_date,
            end_date,
            budget,
            transportation,
            hotels,
            activities,
            notes
        } = req.body;

        const pool = await sql;

        const result = await pool.request()

            .input("userId", sql.Int, req.user.id)
            .input("title", sql.NVarChar(200), title)
            .input("destinations", sql.NVarChar(sql.MAX), JSON.stringify(destinations || []))
            .input("startDate", sql.Date, start_date)
            .input("endDate", sql.Date, end_date)
            .input("budget", sql.Decimal(10,2), budget || 0)
            .input("transportation", sql.NVarChar(200), transportation)
            .input("hotels", sql.NVarChar(sql.MAX), hotels)
            .input("activities", sql.NVarChar(sql.MAX), JSON.stringify(activities || []))
            .input("notes", sql.NVarChar(sql.MAX), notes)

            .query(`
                INSERT INTO itineraries
                (
                    user_id,
                    title,
                    destinations,
                    start_date,
                    end_date,
                    budget,
                    transportation,
                    hotels,
                    activities,
                    notes
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @userId,
                    @title,
                    @destinations,
                    @startDate,
                    @endDate,
                    @budget,
                    @transportation,
                    @hotels,
                    @activities,
                    @notes
                )
            `);

        const itineraryId = result.recordset[0].id;

        const itineraryResult = await pool.request()

            .input("id", sql.Int, itineraryId)

            .query(`
                SELECT *
                FROM itineraries
                WHERE id=@id
            `);

        const itinerary = itineraryResult.recordset[0];

        itinerary.destinations = JSON.parse(itinerary.destinations || "[]");
        itinerary.activities = JSON.parse(itinerary.activities || "[]");

        res.status(201).json({

            message: "Itinerary created successfully",

            itinerary

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to create itinerary",

            error: error.message

        });

    }

};  

exports.updateItinerary = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            title,
            destinations,
            start_date,
            end_date,
            budget,
            transportation,
            hotels,
            activities,
            notes,
            status
        } = req.body;

        const pool = await sql;

        // Check itinerary exists
        const existingResult = await pool.request()
            .input("id", sql.Int, id)
            .input("userId", sql.Int, req.user.id)
            .query(`
                SELECT *
                FROM itineraries
                WHERE id=@id
                AND user_id=@userId
            `);

        if (existingResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Itinerary not found"
            });
        }

        const existing = existingResult.recordset[0];

        await pool.request()

            .input("id", sql.Int, id)
            .input("title", sql.NVarChar(200), title || existing.title)
            .input(
                "destinations",
                sql.NVarChar(sql.MAX),
                JSON.stringify(
                    destinations ||
                    JSON.parse(existing.destinations || "[]")
                )
            )
            .input(
                "startDate",
                sql.Date,
                start_date || existing.start_date
            )
            .input(
                "endDate",
                sql.Date,
                end_date || existing.end_date
            )
            .input(
                "budget",
                sql.Decimal(10,2),
                budget || existing.budget
            )
            .input(
                "transportation",
                sql.NVarChar(200),
                transportation || existing.transportation
            )
            .input(
                "hotels",
                sql.NVarChar(sql.MAX),
                hotels || existing.hotels
            )
            .input(
                "activities",
                sql.NVarChar(sql.MAX),
                JSON.stringify(
                    activities ||
                    JSON.parse(existing.activities || "[]")
                )
            )
            .input(
                "notes",
                sql.NVarChar(sql.MAX),
                notes || existing.notes
            )
            .input(
                "status",
                sql.NVarChar(30),
                status || existing.status
            )

            .query(`
                UPDATE itineraries
                SET
                    title=@title,
                    destinations=@destinations,
                    start_date=@startDate,
                    end_date=@endDate,
                    budget=@budget,
                    transportation=@transportation,
                    hotels=@hotels,
                    activities=@activities,
                    notes=@notes,
                    status=@status
                WHERE id=@id
            `);

        res.json({
            message: "Itinerary updated successfully"
        });

    } catch (error) {

        console.error("Update Itinerary Error:", error);

        res.status(500).json({
            message: "Failed to update itinerary",
            error: error.message
        });

    }
};

exports.deleteItinerary = async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, id)

            .input("userId", sql.Int, req.user.id)

            .query(`
                SELECT id
                FROM itineraries
                WHERE
                    id=@id
                    AND user_id=@userId
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                message: "Itinerary not found"
            });

        }

        await pool.request()

            .input("id", sql.Int, id)

            .query(`
                DELETE FROM itineraries
                WHERE id=@id
            `);

        res.json({
            message: "Itinerary deleted successfully"
        });

    } catch (error) {

        console.error("Delete Itinerary Error:", error);

        res.status(500).json({
            message: "Failed to delete itinerary",
            error: error.message
        });

    }

};