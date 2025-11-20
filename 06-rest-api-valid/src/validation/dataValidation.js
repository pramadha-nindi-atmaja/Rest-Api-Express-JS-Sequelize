import validator from "validator";
import { isExists, sanitization } from "./sanitization.js";

const dataValid = async (valid, dt) => {
  let pesan = [];
  let dd = [];
  let data = await sanitization(dt);
  const message = await new Promise((resolve, reject) => {
    Object.entries(data).forEach(async (item) => {
      const [key, value] = item;
      if (isExists(valid[key])) {
        const validate = valid[key].split(",");
        dd = await new Promise((resolve, reject) => {
          let msg = [];
          validate.forEach((v) => {
            switch (v) {
              case "required":
                if (!isExists(data[key]) || validator.isEmpty(data[key])) {
                  msg.push(key + " is required");
                }
                break;
              case "isEmail":
                if (isExists(data[key]) && !validator.isEmail(data[key])) {
                  msg.push(key + " is invalid email");
                }
                break;
              case "isStrongPassword":
                if (
                  isExists(data[key]) &&
                  !validator.isStrongPassword(data[key])
                ) {
                  msg.push(
                    key +
                      " must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 symbol"
                  );
                }
                break;
              case "isLength":
                // Extract min and max from validation rule (e.g., "isLength:3,50")
                const lengthParams = validate.find(p => p.startsWith('isLength:'))?.split(':')[1]?.split(',') || [];
                const minLen = lengthParams[0] ? parseInt(lengthParams[0]) : 0;
                const maxLen = lengthParams[1] ? parseInt(lengthParams[1]) : Infinity;
                
                if (isExists(data[key]) && !validator.isLength(data[key], { min: minLen, max: maxLen })) {
                  msg.push(key + ` must be between ${minLen} and ${maxLen} characters`);
                }
                break;
              case "isNumeric":
                if (isExists(data[key]) && !validator.isNumeric(data[key])) {
                  msg.push(key + " must be a number");
                }
                break;
              case "isAlpha":
                if (isExists(data[key]) && !validator.isAlpha(data[key])) {
                  msg.push(key + " must contain only letters");
                }
                break;
              case "isAlphanumeric":
                if (isExists(data[key]) && !validator.isAlphanumeric(data[key])) {
                  msg.push(key + " must contain only letters and numbers");
                }
                break;
              case "isURL":
                if (isExists(data[key]) && !validator.isURL(data[key])) {
                  msg.push(key + " must be a valid URL");
                }
                break;
              case "isIn":
                // Extract allowed values from validation rule (e.g., "isIn:value1,value2,value3")
                const allowedValues = validate.find(p => p.startsWith('isIn:'))?.split(':')[1]?.split('|') || [];
                if (isExists(data[key]) && !allowedValues.includes(data[key])) {
                  msg.push(key + " must be one of: " + allowedValues.join(', '));
                }
                break;
              case "isDate":
                if (isExists(data[key]) && !validator.isDate(data[key])) {
                  msg.push(key + " must be a valid date");
                }
                break;
              case "isBoolean":
                if (isExists(data[key]) && !validator.isBoolean(data[key].toString())) {
                  msg.push(key + " must be a boolean value");
                }
                break;
              default:
                break;
            }
          });
          resolve(msg);
        });
      }
      pesan.push(...dd);
    });
    resolve(pesan);
  });
  return { message, data };
};

export { dataValid };
