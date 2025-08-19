const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port} (${env.nodeEnv})`);
});
