export const queryDatabase = async (queryString: string, queryParams: string[]) => {
  if ( queryParams[0] === "en" ) {
    return Promise.resolve({ rows: [] })
  }
  return Promise.resolve(undefined)
}
