const { app } = require('@azure/functions');

app.http('BookingProcessor', {
    methods: ['POST'],
    authLevel: 'anonymous',

    handler: async (request, context) => {

        try {

            const booking = await request.json();

            if (!booking) {
                return {
                    status: 400,
                    jsonBody: {
                        success: false,
                        message: "Booking data is required"
                    }
                };
            }

            // Generate Booking ID
            const bookingId = "BK" + Date.now();

            // Calculate Total Price
            const totalPrice =
                (booking.price || 0) *
                (booking.persons || 1);

            return {
                status: 200,
                jsonBody: {
                    success: true,
                    message: "Booking processed successfully",
                    bookingId,
                    booking: {
                        ...booking,
                        totalPrice,
                        bookingStatus: "Confirmed",
                        bookingTime: new Date().toISOString()
                    }
                }
            };

        } catch (err) {

            context.error(err);

            return {
                status: 500,
                jsonBody: {
                    success: false,
                    message: err.message
                }
            };

        }

    }
});