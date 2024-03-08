function noDetails() {
  return '';
}

export class ErrorWithDetails extends Error {
  constructor(message: string, details = noDetails) {
    super(message + '\n\n' + details());
  }
}