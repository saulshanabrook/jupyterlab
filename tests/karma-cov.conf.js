var path = require('path');
var baseConf = require('./karma.conf');

module.exports = function(config) {
  baseConf(config);
  config.reporters.push('coverage-istanbul');
  config.webpack.module.rules.push(
    // instrument only testing sources with Istanbul
    {
      test: /\.js$/,
      use: { loader: 'istanbul-instrumenter-loader' },
      include: process.env.KARMA_COVER_FOLDER
    }
  );
  config.coverageIstanbulReporter = {
    reports: ['html', 'text-summary'],
    dir: path.join('.', 'coverage'),
    fixWebpackSourcePaths: true
  };
};
