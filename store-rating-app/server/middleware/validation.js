// Validation middleware for user input

// Validate user registration/creation
const validateUser = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = [];

  // Name validation: Min 20 characters, Max 60 characters
  if (!name || name.length < 6 || name.length > 60) {
    errors.push("Name must be between 6 and 60 characters");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email address");
  }

  // Password validation: 8-16 characters, at least one uppercase letter and one special character
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push(
      "Password must be 8-16 characters with at least one uppercase letter and one special character"
    );
  }

  // Address validation: Max 400 characters
  if (!address || address.length > 400) {
    errors.push("Address must not exceed 400 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate store creation
const validateStore = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  // Name validation: Min 20 characters, Max 60 characters
  if (!name || name.length < 20 || name.length > 60) {
    errors.push("Store name must be between 20 and 60 characters");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email address");
  }

  // Address validation: Max 400 characters
  if (!address || address.length > 400) {
    errors.push("Address must not exceed 400 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate rating
const validateRating = (req, res, next) => {
  const { value } = req.body;

  if (!value || value < 1 || value > 5 || !Number.isInteger(Number(value))) {
    return res.status(400).json({
      errors: ["Rating must be an integer between 1 and 5"],
    });
  }

  next();
};

// Validate password update
const validatePasswordUpdate = (req, res, next) => {
  const { password } = req.body;

  // Password validation: 8-16 characters, at least one uppercase letter and one special character
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      errors: [
        "Password must be 8-16 characters with at least one uppercase letter and one special character",
      ],
    });
  }

  next();
};

module.exports = {
  validateUser,
  validateStore,
  validateRating,
  validatePasswordUpdate,
};
