import validator from "validator";

const sanitization = async (data) => {
  let obj = {};
  
  // Process each entry in the data object
  for (const [key, value] of Object.entries(data)) {
    // Handle different data types
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      obj[key] = await sanitization(value);
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      obj[key] = [];
      for (const item of value) {
        if (typeof item === 'string') {
          obj[key].push(key === "password" ? validator.trim(item) : validator.escape(validator.trim(item)));
        } else {
          obj[key].push(item);
        }
      }
    } else if (typeof value === 'string') {
      // Sanitize string values
      if (key === "password") {
        obj[key] = validator.trim(value);
      } else {
        obj[key] = validator.escape(validator.trim(value));
      }
    } else if (typeof value === 'boolean') {
      // Convert boolean values to strings for consistency
      obj[key] = value.toString();
    } else if (typeof value === 'number') {
      // Convert numbers to strings for consistency
      obj[key] = value.toString();
    } else {
      // Handle other data types
      obj[key] = value;
    }
  }
  
  return obj;
};

const isExists = (variable) => {
  if (typeof variable == "undefined") {
    return false;
  }
  return true;
};

export { sanitization, isExists };
