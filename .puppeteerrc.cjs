const { existsSync } = require('node:fs');

// pa11y-ci pulls in puppeteer, which by default downloads its own ~150MB Chrome
// build on every install. This machine already has a system Chrome, so skip the
// download and point puppeteer at the system binary instead. pa11y reads the
// executablePath from here when launching.
const candidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

module.exports = {
  skipDownload: true,
  executablePath: candidates.find((p) => p && existsSync(p)),
};
