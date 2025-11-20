// Test file to demonstrate the enhanced validation functionality

import { advancedDataValid, validateArrayOfObjects, validateConditional } from "./validation/advancedValidation.js";
import { sanitization } from "./validation/sanitization.js";

async function testValidation() {
  try {
    console.log('Testing enhanced validation functionality...');
    
    // Test basic validation with new rules
    const basicValidationRules = {
      name: "required,isLength:3,50",
      email: "required,isEmail",
      age: "isNumeric",
      website: "isURL",
      role: "isIn:admin|user|guest"
    };
    
    const basicData = {
      name: "John Doe",
      email: "john@example.com",
      age: "25",
      website: "https://example.com",
      role: "user"
    };
    
    const basicResult = await advancedDataValid(basicValidationRules, basicData);
    console.log('Basic validation result:', basicResult.message.length === 0 ? 'PASSED' : 'FAILED', basicResult.message);
    
    // Test validation with errors
    const errorData = {
      name: "Jo", // Too short
      email: "invalid-email", // Invalid email
      age: "not-a-number", // Not numeric
      website: "not-a-url", // Invalid URL
      role: "invalid-role" // Not in allowed values
    };
    
    const errorResult = await advancedDataValid(basicValidationRules, errorData);
    console.log('Error validation result:', errorResult.message.length > 0 ? 'CORRECTLY FAILED' : 'UNEXPECTEDLY PASSED', errorResult.message);
    
    // Test array validation
    const arrayValidationRules = {
      name: "required,isLength:3,50",
      email: "required,isEmail"
    };
    
    const arrayOfObjects = [
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" }
    ];
    
    const arrayResult = await validateArrayOfObjects(arrayOfObjects, arrayValidationRules);
    console.log('Array validation result:', arrayResult.message.length === 0 ? 'PASSED' : 'FAILED', arrayResult.message);
    
    // Test conditional validation
    const baseValidation = {
      userType: "required,isIn:individual|company"
    };
    
    const conditionalRules = {
      userType: {
        individual: {
          firstName: "required,isLength:1,50",
          lastName: "required,isLength:1,50"
        },
        company: {
          companyName: "required,isLength:1,100",
          vatNumber: "required"
        }
      }
    };
    
    const conditionalData = {
      userType: "individual",
      firstName: "John",
      lastName: "Doe"
    };
    
    const conditionalResult = await validateConditional(conditionalData, baseValidation, conditionalRules);
    console.log('Conditional validation result:', conditionalResult.message.length === 0 ? 'PASSED' : 'FAILED', conditionalResult.message);
    
    // Test sanitization
    const dirtyData = {
      name: "  John <script>alert('xss')</script> Doe  ",
      password: "  mypassword123  ",
      description: "  This is a <b>description</b> with <i>HTML</i>  "
    };
    
    const sanitizedData = await sanitization(dirtyData);
    console.log('Sanitization result:', sanitizedData);
    
    console.log('All validation tests completed successfully!');
  } catch (error) {
    console.error('Error during validation tests:', error.message);
  }
}

// Run the tests
testValidation();