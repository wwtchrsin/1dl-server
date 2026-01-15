export const parseJSON = (str: string): { error: boolean, data: any } => {
  try {
    return {
      error: false,
      data: JSON.parse(str),
    }
  } catch (err) {
    return {
      error: true,
      data: undefined
    }
  }
}