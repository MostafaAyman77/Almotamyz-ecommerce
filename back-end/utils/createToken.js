const jwt = require("jsonwebtoken");
const { userRole } = require("../enum.js");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });


const genrateToken = ({ data = {}, key = {}, options = {} }) => {
  // console.log({ data, key, options })
  return jwt.sign(data, key, options)
}

const verify = ({ token = {}, key = {} }) => {
  return jwt.verify(token, key)
}


const getTokenSignature = (role, tokenType = 'access') => {
  const signatures = {
    [userRole.admin]: {
      access: process.env.ADMIN_ACCESS_TOKEN_SIGNATURE,
      refresh: process.env.ADMIN_REFRESH_TOKEN_SIGNATURE
    },
    [userRole.manager]: {
      access: process.env.MANAGER_ACCESS_TOKEN_SIGNATURE,
      refresh: process.env.MANAGER_REFRESH_TOKEN_SIGNATURE
    },
    [userRole.user]: {
      access: process.env.USER_ACCESS_TOKEN_SIGNATURE,
      refresh: process.env.USER_REFRESH_TOKEN_SIGNATURE
    }
  };
  
  return signatures[role]?.[tokenType] || process.env.JWT_SECRET_KEY;
};


const generateAuthTokens = (user) => {
  const accessToken = genrateToken({
    data: { 
      userId: user._id, 
      role: user.role,
      email: user.email 
    },
    key: getTokenSignature(user.role, 'access'),
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN || '15m' }
  });

  const refreshToken = genrateToken({
    data: { 
      userId: user._id, 
      role: user.role 
    },
    key: getTokenSignature(user.role, 'refresh'),
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN || '7d' }
  });

  return { accessToken, refreshToken };
};



const extractRoleAndToken = (bearerToken) => {
  if (!bearerToken) return null;
  
  const parts = bearerToken.split(' ');
  if (parts.length !== 2) return null;
  
  const [role, token] = parts;
  
  // Validate role
  if (!Object.values(userRole).includes(role)) {
    return null;
  }
  
  return { role, token };
};
module.exports = {genrateToken , createToken , verify , generateAuthTokens , getTokenSignature , extractRoleAndToken};
