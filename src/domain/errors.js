export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message, details = []) {
    super(message);
    this.details = details;
  }
}

export class NotFoundError extends DomainError {}
