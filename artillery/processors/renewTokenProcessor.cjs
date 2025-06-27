// Generate a random string of specified length
const generateRandomString = (length) =>
  Math.random().toString(36).substr(2, length);

// Function to generate random credentials and store them in the context
const getRandomCredentials = (requestParams, context, ee, next) => {
  const generatedUserId = `user_${generateRandomString(12)}`;
  context.vars.generatedUserId = generatedUserId;
  next(); // Proceed to the next action
};

module.exports = { getRandomCredentials };
