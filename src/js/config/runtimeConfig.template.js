// This runtime configuration will be fetched during loading of the main page
// and merged with the static configuration
var runtimeConfig = {
  // The domain used to compute the service endpoint
  serviceDomain: "marathon.service.domain",

  // The pattern to build the links to the logs
  appLogsLinkTemplate: "http://logs-store-like-kibana/?appId={{appId}}",
};