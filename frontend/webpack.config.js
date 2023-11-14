const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin');
module.exports = {
  externals: ['react-helmet'],
  plugins: [new StatoscopeWebpackPlugin()],
};
