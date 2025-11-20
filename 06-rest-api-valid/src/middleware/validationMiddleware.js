import { advancedDataValid } from "../validation/advancedValidation.js";

// Middleware to validate request body based on provided rules
const validateBody = (validationRules) => {
  return async (req, res, next) => {
    try {
      const result = await advancedDataValid(validationRules, req.body);
      
      if (result.message.length > 0) {
        return res.status(400).json({
          errors: result.message,
          message: "Validation failed",
          data: null
        });
      }
      
      // Attach sanitized and validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      next(new Error("Validation middleware error: " + error.message));
    }
  };
};

// Middleware to validate request query parameters
const validateQuery = (validationRules) => {
  return async (req, res, next) => {
    try {
      const result = await advancedDataValid(validationRules, req.query);
      
      if (result.message.length > 0) {
        return res.status(400).json({
          errors: result.message,
          message: "Query validation failed",
          data: null
        });
      }
      
      // Attach sanitized and validated query data to request
      req.validatedQuery = result.data;
      next();
    } catch (error) {
      next(new Error("Query validation middleware error: " + error.message));
    }
  };
};

// Middleware to validate request parameters
const validateParams = (validationRules) => {
  return async (req, res, next) => {
    try {
      const result = await advancedDataValid(validationRules, req.params);
      
      if (result.message.length > 0) {
        return res.status(400).json({
          errors: result.message,
          message: "Parameter validation failed",
          data: null
        });
      }
      
      // Attach sanitized and validated params data to request
      req.validatedParams = result.data;
      next();
    } catch (error) {
      next(new Error("Parameter validation middleware error: " + error.message));
    }
  };
};

// Predefined validation rules for common use cases
const commonValidationRules = {
  // User registration validation
  userRegistration: {
    name: "required,isLength:3,50",
    email: "required,isEmail",
    password: "required,isStrongPassword"
  },
  
  // User login validation
  userLogin: {
    email: "required,isEmail",
    password: "required"
  },
  
  // Email validation only
  emailOnly: {
    email: "required,isEmail"
  },
  
  // ID validation
  idValidation: {
    id: "required,isNumeric"
  }
};

export { validateBody, validateQuery, validateParams, commonValidationRules };