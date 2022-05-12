const bcrypt = require('bcryptjs');

const getUserByEmail = function(email, database) {
  for (let key in database) {
    let user = database[key];
    if (user.email === email)
      return user;
  }
  return false;
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const ifCredentialsMatchedReturnUser = (sourceEmail, sourcePassword, targetObject) => {
  for (let key in targetObject) {
    let user = targetObject[key];
    if (user.email === sourceEmail) {
      let hashedPassword = user.password;
      if (bcrypt.compareSync(sourcePassword, hashedPassword)) {
        return user;
      }
    }
  }
  return { error : 'email/password doesn\'t match'}; //'Cannot find user with these credentials';
};

const returnURLSforAUser = (userCookie, targetObject) => {
  let newDatabase = {};
  for (let key in targetObject) {
    let user = targetObject[key];

    if (user.userID === userCookie) {
      newDatabase[key] = user.longURL;
    }
  }
  return newDatabase;
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

module.exports = {
  getUserByEmail,
  generateRandomString,
  ifCredentialsMatchedReturnUser,
  returnURLSforAUser,
};