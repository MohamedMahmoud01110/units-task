const log =
  (level) =>
  (message, meta = {}) =>
    console.log(
      JSON.stringify({
        time: new Date().toISOString(),
        level,
        message,
        ...meta,
      }),
    );

export const logger = {
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};
