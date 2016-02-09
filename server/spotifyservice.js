ServiceConfiguration.configurations.update(
  { "service": "spotify" },
  {
    $set: {
      "clientId": "d12a078de127492693230ee1b9a1380e",
      "secret": "b6640c0e28ce4c20b663644853edd391"
    }
  },
  { upsert: true }
)
