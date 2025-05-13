module.exports = {
  // Vercel output directory config
  outputDirectory: 'dist',
  
  // Vercel hooks
  buildCommand: 'npm run build',
  devCommand: 'npm run dev',
  
  // Headers
  headers: () => [
    {
      source: '/(.*)\\.js',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript',
        },
      ],
    },
    {
      source: '/(.*)\\.css',
      headers: [
        {
          key: 'Content-Type',
          value: 'text/css',
        },
      ],
    },
  ],
};