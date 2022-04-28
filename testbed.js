const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

console.log(generateRandomString());