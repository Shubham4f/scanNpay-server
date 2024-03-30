import jwt from "jsonwebtoken";
export const refreshTokenGenrator = (id, sessionId) => {
  const token = jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

export const accessTokenGenrator = (id, sessionId) => {
  const token = jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
  return token;
};
