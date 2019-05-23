const generateMessage = (text,username) => {
  return {
    message:text,
    createdAt: new Date().getTime(),
    username:username
  }
}


const generateLocationMessage = (text, name) => {
  return {
    username: name,
    url:text,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}
