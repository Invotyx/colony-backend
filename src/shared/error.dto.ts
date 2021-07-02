export const error = (key: string, reason: string, description: string) => {
  return {
    errors: {
      [key]: {
        [reason]: description,
      },
    },
  };
};
