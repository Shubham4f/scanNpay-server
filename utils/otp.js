export const generateOTP = (length) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
    if (otp === "0") {
      otp = "";
      i--;
    }
  }
  return otp;
};
