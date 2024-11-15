const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'harvest-slack-bot',
  location: 'us-west1'
};
exports.connectorConfig = connectorConfig;

