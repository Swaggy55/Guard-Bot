const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function ts() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function fmt(level, color, msg, ...rest) {
  const line = `${colors.dim}[${ts()}]${colors.reset} ${color}${level}${colors.reset} ${msg}`;
  if (rest.length > 0) console.log(line, ...rest);
  else console.log(line);
}

export const logger = {
  info: (msg, ...rest) => fmt("INFO ", colors.cyan, msg, ...rest),
  warn: (msg, ...rest) => fmt("WARN ", colors.yellow, msg, ...rest),
  error: (msg, ...rest) => fmt("ERROR", colors.red, msg, ...rest),
  success: (msg, ...rest) => fmt("OK   ", colors.green, msg, ...rest),
  debug: (msg, ...rest) => fmt("DEBUG", colors.magenta, msg, ...rest),
  event: (msg, ...rest) => fmt("EVENT", colors.blue, msg, ...rest),
};
