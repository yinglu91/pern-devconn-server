const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('token');
  // standard auth header- key: Authorization, value - Bearer eyJ*.hbG*.ciO*

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authentication denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded:', decoded) // payload of jwt token

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
