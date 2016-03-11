/* jshint -W033 */
ServiceConfiguration.configurations.update(
  { "service": "spotify" },
  {
    $set: {
      "clientId": "d12a078de127492693230ee1b9a1380e",
      "secret": "051ec17063a54e4e8cc5056b6b7398b1"
    }
  },
  { upsert: true }
)
