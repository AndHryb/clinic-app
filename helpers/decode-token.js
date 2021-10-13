import jwt from 'jsonwebtoken';

export default function checkJwtToken(token) {
  const decodedToken = jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      throw err;
    } else {
      return decoded;
    }
  });

  return decodedToken;
}
