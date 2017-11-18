// This runtime configuration will be fetched during loading of the main page
// and merged with the static configuration
var runtimeConfig = {
  // The domain used to compute the service endpoint
  serviceDomain: "marathon.service.domain",

  // The generator building the logs links for applications
  appLogsLinkGenerator: function (appId) {
    return "http://logs-store-like-kibana/?appId=" + appId.substring(1);
  },

  // The generator building the logs links for tasks
  taskLogsLinkGenerator: function (appId, taskId) {
    return "http://logs-store-like-kibana/?appId=" + appId.substring(1) + "&taskId=" + taskId;
  },

  // The generator building the web terminal link for debugging tasks
  debugLinkGenerator: function (taskId) {
    return "http://webterminal/?taskId=" + taskId;
  }
};