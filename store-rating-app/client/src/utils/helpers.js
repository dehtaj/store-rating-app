/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Default options
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
};

/**
 * Truncate text to a specified length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + "...";
};

/**
 * Format a number as a rating (e.g., 4.5/5)
 * @param {number} rating - The rating value
 * @param {number} maxRating - The maximum possible rating
 * @returns {string} Formatted rating
 */
export const formatRating = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) return "No rating";

  const numericRating = Number(rating);
  if (isNaN(numericRating)) return "Invalid rating";

  return `${numericRating.toFixed(1)}/${maxRating}`;
};

/**
 * Generate star rating component props
 * @param {number} rating - The rating value
 * @param {number} maxRating - The maximum possible rating
 * @returns {object} Object with filled and empty star counts
 */
export const getStarRatingProps = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) {
    return { filled: 0, empty: maxRating };
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    return { filled: 0, empty: maxRating };
  }

  const filled = Math.round(numericRating);
  const empty = maxRating - filled;

  return { filled, empty };
};

/**
 * Format a role string to be more user-friendly
 * @param {string} role - The role string (e.g., "STORE_OWNER")
 * @returns {string} Formatted role string
 */
export const formatRole = (role) => {
  if (!role) return "Unknown";

  // Convert from UPPER_SNAKE_CASE to Title Case
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Check if a user has the required role
 * @param {object} user - The user object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} Whether the user has the required role
 */
export const hasRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }

  return user.role === requiredRoles;
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "N/A";

  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return "Invalid amount";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericAmount);
};

/**
 * Get a color class based on a rating value
 * @param {number} rating - The rating value
 * @returns {string} Tailwind CSS color class
 */
export const getRatingColorClass = (rating) => {
  if (!rating) return "text-gray-400";

  const numericRating = Number(rating);
  if (isNaN(numericRating)) return "text-gray-400";

  if (numericRating >= 4.5) return "text-green-500";
  if (numericRating >= 3.5) return "text-blue-500";
  if (numericRating >= 2.5) return "text-yellow-500";
  if (numericRating >= 1.5) return "text-orange-500";
  return "text-red-500";
};
