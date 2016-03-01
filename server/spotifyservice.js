
ServiceConfiguration.configurations.update(
  { "service": "spotify" },
  {
    $set: {
      "clientId": "d9f4b11f0177491797d38ba4f24c84e7",
      "secret": "48906acc63a34de0b88d7c440aa6e107"
    }
  },
  { upsert: true }
)
