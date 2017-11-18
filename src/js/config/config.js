import packageJSON from "../../../package.json";

var config = Object.assign({
  // @@ENV gets replaced by build system
  environment: "@@ENV",
  // If the UI is served through a proxied URL, this can be set here.
  rootUrl: "",
  // Defines the Marathon API URL,
  // leave empty to use the same as the UI is served.
  apiURL: "../",
  // Intervall of API request in ms
  updateInterval: 5000,
  // Local http server URI while tests run
  localTestserverURI: {
    address: "localhost",
    port: 8181
  },
  // The generator building the logs links for applications
  // input: appId
  // output: the link to the logs
  appLogsLinkGenerator: function () {
    return "";
  },
  // The generator building the logs links for tasks
  // input: appId, taskId
  // output: the link to the logs
  taskLogsLinkGenerator: function () {
    return "";
  },
  // The generator build the exec links for tasks debugging
  // input: the taskId
  // output: the to the web terminal
  debugLinkGenerator: function () {
    return "";
  },
  serviceDomain: "",
  version: ("@@TEAMCITY_UI_VERSION".indexOf("@@TEAMCITY") === -1) ?
    "@@TEAMCITY_UI_VERSION" :
    `${packageJSON.version}-SNAPSHOT`
}, runtimeConfig);

export default config;
