const jwt = require("jsonwebtoken");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });


const genrateToken = ({ data = {}, key = {}, options = {} }) => {
  console.log({ data, key, options })
  return jwt.sign(data, key, options)
}

const verify = ({ token = {}, key = {} }) => {
  return jwt.verify(token, key)
}

module.exports = {genrateToken , createToken , verify};
