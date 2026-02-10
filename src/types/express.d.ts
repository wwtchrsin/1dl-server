declare global {
  namespace Express {
    interface Request {
      sessionid?: string,
    }
  }
}

export {}