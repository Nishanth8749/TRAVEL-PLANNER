require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'travel_portal_secret_key_2024',
  expiresIn: '7d',
  refreshExpiresIn: '30d'
};
