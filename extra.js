const retrunURLSForTheUser = (userCookie, targetObject) => {
  let result = [];
  for (let key in targetObject) {
    if (targetObject[key].userID === userCookie) {
      result.push(targetObject[key].longURL);
    }
  }
  return result;
};


// const ifEmailExistsAlready = (sourceEmail, targetObject) => {
//   for (let key in targetObject) {
//     let item = targetObject[key];
//     if (item.email === sourceEmail) {
//       return true;
//     }
//   }
//   return false;
// };
