module.exports = {
  webpack: {
    configure: {
      ignoreWarnings: [
        {
          module: /html5-qrcode/,
          message: /Failed to parse source map/,
        },
      ],
    },
  },
}; 