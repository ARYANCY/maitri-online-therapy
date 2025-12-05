module.exports = {
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  PRIORITY: {
    MIN: 1,
    MAX: 10,
    DEFAULT: 5
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  TIME_FORMAT: {
    REGEX: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    EXAMPLE: '09:00'
  },

  DATE: {
    MIN_YEARS_FUTURE: 0,
    MAX_YEARS_FUTURE: 1
  },

  LIMITS: {
    NAME_MIN: 3,
    NAME_MAX: 100,
    EMAIL_MAX: 255,
    NOTES_MAX: 500,
    EXPERIENCE_MAX: 70,
    SPECIALIZATION_MAX: 100
  }
};
