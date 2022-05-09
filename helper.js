const getUserByEmail = function(email, database) {
  for (let key in database) {
    let user = database[key];
    if (user.email === email)
      return user;
  }
  return false;
};

// const users = {
//   '7hvcwq': {
//     id: '7hvcwq',
//     email: 'khan_zahra4424@hotmail.com',
//     password: 'abc'
//   },
//   gsqxl6: {
//     id: 'gsqxl6',
//     email: 'khan.zahra3@gmail.com',
//     password: 'abc' }
// };

// console.log(getUserByEmail('khan.zahra3@gmail.com', users));

module.exports = getUserByEmail;