class AuthenticationError extends Error {
  constructor(message) {   
    super(message);
    this.errorCode = 403;
  }
}

class ServerError extends Error {
  constructor(message) {   
    super(message);
    this.errorCode = 500;
  }
}

class ClientError extends Error {
  constructor(message) {
    super(message);
    this.errorCode = 400;
  }
}

class InvalidInputError extends ClientError {
  constructor(message) {
    super(message)
  }
}

module.exports = {
  AuthenticationError: AuthenticationError,
  ServerError: ServerError,
  ClientError: ClientError,
  InvalidInputError: InvalidInputError
}