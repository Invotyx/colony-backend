class err {
  key: string;
  reason: string;
  description: string;
}
export const error = (err: err[]) => {
  let errors={};
  err.forEach((e) => {
    errors[e.key]={
        [e.reason]: e.description,
      }
  });

  return {
    errors: errors,
  };
};
