const Glue = require('glue');
const manifest = require('./config/manifest');

Glue.compose(manifest, { relativeTo: __dirname }).then(async (server) => {
  server.log(['info'], `Installed plugins: ${Object.keys(server.plugins).join(', ')}`);
  
  await server.start();
  
  server.log(['info'],
    `Running Node.js v${process.versions.node} with Hapi.js Framework v${server.version}`,
    `Server is listening on ${server.info.uri.toLowerCase()} in ${process.env.NODE_ENV} mode`
  );
}).catch(err => {
  console.trace(err);
  process.exit(1);
});