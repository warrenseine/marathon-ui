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
    return "http://logs-store-like-kibana/?appId=" +
      appId.substring(1) + "&taskId=" + taskId;
  },

  // The generator building the logs links for tasks
  taskMonitoringLinkGenerator: function (appId, task) {
    return "http://logs-store-like-kibana/?appId=" +
      appId.substring(1) + "&taskId=" + task.host ;
  },
  taskSandboxLinkGenerator: function (executorId) {
    return "http://mesos-sandbox-ui/?executorId=" + executorId;
  },

  // The generate build a link to diagnose broken deployments
  // It returns a url on which a GET will be made.
  // the api calls is expected to return a json of the form:
  // {
  //   success: true
  //   hints: [ String, String, [..] ]
  // }
  deploymentDiagnosisUrlGenerate: function() {
    return null;
  },

  // Callback when "troubleshoot" button is clicked
  troubleshootApp: function(appId) {
    var win = window.open("http://troubleshoot/appId/" + appId, '_blank');
    win.focus();
  }

};
