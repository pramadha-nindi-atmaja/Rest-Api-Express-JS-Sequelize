import validator from "validator";
import { isExists, sanitization } from "./sanitization.js";

// Advanced validation function that supports nested objects and arrays
const advancedDataValid = async (valid, dt) => {
  let pesan = [];
  let data = await sanitization(dt);
  
  const validateField = async (key, value, rules) => {
    let msg = [];
    
    // Handle array validation
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const result = await validateSingleRule(key, value, rule);
        msg.push(...result);
      }
    } else {
      // Handle object validation (nested objects)
      if (typeof rules === 'object' && rules !== null && !Array.isArray(rules)) {
        if (typeof value === 'object' && value !== null) {
          const nestedResult = await advancedDataValid(rules, value);
          msg.push(...nestedResult.message);
          data[key] = nestedResult.data;
        } else if (isExists(rules.required)) {
          msg.push(key + " is required and must be an object");
        }
      } else {
        // Handle simple string validation rules
        const result = await validateSingleRule(key, value, rules);
        msg.push(...result);
      }
    }
    
    return msg;
  };
  
  const validateSingleRule = async (key, value, ruleString) => {
    let msg = [];
    const rules = ruleString.split(",");
    
    for (const rule of rules) {
      switch (rule) {
        case "required":
          if (!isExists(value) || (typeof value === 'string' && validator.isEmpty(value))) {
            msg.push(key + " is required");
          }
          break;
        case "isEmail":
          if (isExists(value) && !validator.isEmail(value)) {
            msg.push(key + " is invalid email");
          }
          break;
        case "isStrongPassword":
          if (isExists(value) && !validator.isStrongPassword(value)) {
            msg.push(key + " must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 symbol");
          }
          break;
        case "isLength":
          const lengthParams = rules.find(p => p.startsWith('isLength:'))?.split(':')[1]?.split(',') || [];
          const minLen = lengthParams[0] ? parseInt(lengthParams[0]) : 0;
          const maxLen = lengthParams[1] ? parseInt(lengthParams[1]) : Infinity;
          
          if (isExists(value) && !validator.isLength(value, { min: minLen, max: maxLen })) {
            msg.push(key + ` must be between ${minLen} and ${maxLen} characters`);
          }
          break;
        case "isNumeric":
          if (isExists(value) && !validator.isNumeric(value.toString())) {
            msg.push(key + " must be a number");
          }
          break;
        case "isAlpha":
          if (isExists(value) && !validator.isAlpha(value.toString())) {
            msg.push(key + " must contain only letters");
          }
          break;
        case "isAlphanumeric":
          if (isExists(value) && !validator.isAlphanumeric(value.toString())) {
            msg.push(key + " must contain only letters and numbers");
          }
          break;
        case "isURL":
          if (isExists(value) && !validator.isURL(value)) {
            msg.push(key + " must be a valid URL");
          }
          break;
        case "isIn":
          const allowedValues = rules.find(p => p.startsWith('isIn:'))?.split(':')[1]?.split('|') || [];
          if (isExists(value) && !allowedValues.includes(value.toString())) {
            msg.push(key + " must be one of: " + allowedValues.join(', '));
          }
          break;
        case "isDate":
          if (isExists(value) && !validator.isDate(value.toString())) {
            msg.push(key + " must be a valid date");
          }
          break;
        case "isBoolean":
          if (isExists(value) && !validator.isBoolean(value.toString())) {
            msg.push(key + " must be a boolean value");
          }
          break;
        case "isArray":
          if (isExists(value) && !Array.isArray(value)) {
            msg.push(key + " must be an array");
          }
          break;
        case "isObject":
          if (isExists(value) && (typeof value !== 'object' || Array.isArray(value) || value === null)) {
            msg.push(key + " must be an object");
          }
          break;
        default:
          // Handle custom validation rules
          if (rule.startsWith('custom:')) {
            const customValidatorName = rule.split(':')[1];
            const customResult = await runCustomValidator(customValidatorName, key, value);
            if (customResult) {
              msg.push(customResult);
            }
          }
          break;
      }
    }
    
    return msg;
  };
  
  // Function to run custom validators
  const runCustomValidator = async (validatorName, key, value) => {
    // This is where you would implement custom validation logic
    // For now, we'll just return null (no error)
    return null;
  };
  
  // Process all fields
  for (const [key, rules] of Object.entries(valid)) {
    const value = data[key];
    const fieldMessages = await validateField(key, value, rules);
    pesan.push(...fieldMessages);
  }
  
  return { message: pesan, data };
};

// Function to validate arrays of objects
const validateArrayOfObjects = async (arrayData, validationRules) => {
  let allMessages = [];
  let validObjects = [];
  
  if (!Array.isArray(arrayData)) {
    return {
      message: ["Expected an array"],
      data: []
    };
  }
  
  for (let i = 0; i < arrayData.length; i++) {
    const result = await advancedDataValid(validationRules, arrayData[i]);
    allMessages.push(...result.message.map(msg => `Item ${i + 1}: ${msg}`));
    
    if (result.message.length === 0) {
      validObjects.push(result.data);
    }
  }
  
  return {
    message: allMessages,
    data: validObjects
  };
};

// Function to validate conditional fields
const validateConditional = async (data, baseValidation, conditionalRules) => {
  // First validate base fields
  const baseResult = await advancedDataValid(baseValidation, data);
  
  if (baseResult.message.length > 0) {
    return baseResult;
  }
  
  // Then validate conditional fields based on base validation results
  let conditionalMessages = [];
  let conditionalData = { ...baseResult.data };
  
  for (const [conditionField, conditions] of Object.entries(conditionalRules)) {
    const fieldValue = data[conditionField];
    
    if (conditions[fieldValue]) {
      const conditionalResult = await advancedDataValid(conditions[fieldValue], data);
      conditionalMessages.push(...conditionalResult.message);
      
      // Merge valid conditional data
      if (conditionalResult.message.length === 0) {
        conditionalData = { ...conditionalData, ...conditionalResult.data };
      }
    }
  }
  
  return {
    message: [...baseResult.message, ...conditionalMessages],
    data: conditionalData
  };
};

export { advancedDataValid, validateArrayOfObjects, validateConditional };