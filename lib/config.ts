// lib/config.ts

const config = {
  development: {
    apiUrl: 'https://dev.api.clubhub.com',
    databaseUrl: 'mongodb://localhost:27017/dev',
    // other development specific settings
  },
  production: {
    apiUrl: 'https://api.clubhub.com',
    databaseUrl: 'mongodb://prod-db:27017/prod',
    // other production specific settings
  },
  test: {
    apiUrl: 'https://test.api.clubhub.com',
    databaseUrl: 'mongodb://localhost:27017/test',
    // other test specific settings
  }
};

const getConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  return config[environment];
};

export default getConfig;
