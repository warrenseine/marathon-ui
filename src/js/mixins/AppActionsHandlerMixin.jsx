import React from "react";// eslint-disable-line no-unused-vars

import config from "../config/config";
import AppsActions from "../actions/AppsActions";
import AppsEvents from "../events/AppsEvents";
import AppsStore from "../stores/AppsStore";
import DialogActions from "../actions/DialogActions";
import DialogStore from "../stores/DialogStore";
import DialogSeverity from "../constants/DialogSeverity";
import GroupsActions from "../actions/GroupsActions";
import GroupsEvents from "../events/GroupsEvents";
import GroupsStore from "../stores/GroupsStore";
import Messages from "../constants/Messages";
import QueueActions from "../actions/QueueActions";
import QueueEvents from "../events/QueueEvents";
import QueueStore from "../stores/QueueStore";
import ExternalLinks from "../constants/ExternalLinks";

var bindOneTimeEvents = function (store, resolverEvents, handlers) {
  var eventHandlers = [];

  resolverEvents.forEach((event, index) => {
    eventHandlers.push(function (...args) {
      if (handlers[index] != null) {
        handlers[index](...args);
      }

      eventHandlers.forEach((eventHandler, i) => {
        store.removeListener(resolverEvents[i], eventHandler);
      });

      eventHandlers = undefined;
    });

    store.on(event, eventHandlers[index]);
  });
};

var callErrorDialog = function (settings) {
  var {statusCode, errorMessage} = settings;
  var message = "Unknown error.";

  if (statusCode != null && Messages[statusCode] != null) {
    message = Messages[statusCode];
  } else if (errorMessage != null) {
    message = errorMessage.message != null
      ? errorMessage.message
      : errorMessage;
  }

  DialogActions.alert({
    message: `${settings.messagePrefix}${message}`,
    severity: DialogSeverity.DANGER,
    title: settings.title
  });
};

var isStatefulApp = function (app) {
  return app.container != null &&
    app.container.volumes != null &&
    app.container.volumes
      .some(volume => volume.persistent != null || volume.external != null);
};

var AppActionsHandlerMixin = {
  componentWillMount: function () {
    if (this.props.model == null) {
      throw new Error(
        "The AppActionsHandlerMixin needs a defined model property"
      );
    }
  },

  addScaleAppListener: function () {
    bindOneTimeEvents(AppsStore, [
      AppsEvents.SCALE_APP_ERROR,
      AppsEvents.SCALE_APP
    ], [
      this.onScaleAppError
    ]);
  },

  addScaleGroupListener: function () {
    bindOneTimeEvents(GroupsStore, [
      GroupsEvents.SCALE_ERROR,
      GroupsEvents.SCALE_SUCCESS
    ], [
      this.onScaleGroupError
    ]);
  },

  addRestartAppListener: function () {
    bindOneTimeEvents(AppsStore, [
      AppsEvents.RESTART_APP_ERROR,
      AppsEvents.RESTART_APP
    ], [
      this.onRestartAppError
    ]);
  },

  addDeleteAppListener: function () {
    bindOneTimeEvents(AppsStore, [
      AppsEvents.DELETE_APP_ERROR,
      AppsEvents.DELETE_APP
    ], [
      this.onDeleteAppError
    ]);
  },

  addDeleteGroupListener: function () {
    bindOneTimeEvents(GroupsStore, [
      GroupsEvents.DELETE_ERROR,
      GroupsEvents.DELETE_SUCCESS
    ], [
      this.onDeleteGroupError
    ]);
  },

  addResetDelayListener: function () {
    bindOneTimeEvents(QueueStore, [
      QueueEvents.RESET_DELAY_ERROR,
      QueueEvents.RESET_DELAY
    ], [
      this.onResetDelayError,
      this.onResetDelaySuccess
    ]);
  },

  handleDestroyApp: function (event) {
    event.preventDefault();

    var appId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Destroy Application",
      message: `Are you sure you want to destroy ${appId}? This
        action is irreversible.`,
      severity: DialogSeverity.DANGER,
      title: "Destroy Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addDeleteAppListener();

      AppsActions.deleteApp(appId);
    });
  },

  handleDestroyGroup: function (event) {
    event.preventDefault();

    var groupId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Destroy Group",
      message: `Are you sure you want to destroy ${groupId}, including all its
        applications? This action is irreversible.`,
      severity: DialogSeverity.DANGER,
      title: "Destroy Group"});

    DialogStore.handleUserResponse(dialogId, () => {
      this.addDeleteGroupListener();

      GroupsActions.deleteGroup(groupId);
    });
  },

  handleResetDelay: function () {
    this.addResetDelayListener();

    QueueActions.resetDelay(this.props.model.id);
  },

  handleDeploymentDiagnostic: function () {
    var appId = this.props.model.id;
    var uri = config.deploymentDiagnosisUrlGenerate();
    if (uri == null) {
      /* eslint-disable no-console */
      console.log("config.deploymentDiagnosisUrlGenerate returned null " +
                  "so not doing anything");
      return;
    }
    // first dialog will disappear when second one will appear
    DialogActions.alert({
      actionButtonLabel: "Ack",
      message: "Diagnosis in progress, it will take a few seconds",
      title: `Diagnosis of ${appId}`
    });
    fetch(uri)
      .then(res => res.json())
      .then(
        (result) => {
          var message = "Diagnosis results:\n";
          result["hints"].forEach(function (hint) {
            message += `- ${hint}\n`;
          });
          if (result["hints"].length > 0) {
            message += "hope it helps!";
          } else {
            message += "no hint :(";
          }
          DialogActions.alert({
            actionButtonLabel: "Ack",
            message: message,
            title: `Diagnosis of ${appId}`
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          DialogActions.alert({
            actionButtonLabel: "Ack",
            message: `${error}`,
            title: `Failure to diagnose ${appId}`
          });
        }
      );
  },

  handleTroubleshoot: function () {
    var appId = this.props.model.id;
    config.troubleshootApp(appId);
  },

  handleRestartApp: function () {
    var appId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Restart Application",
      message: `Are you sure you want to restart ${appId}?`,
      title: "Restart Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addRestartAppListener();

      AppsActions.restartApp(appId);
    });
  },

  handleScaleApp: function () {
    var model = this.props.model;

    const dialogId = DialogActions.prompt({
      actionButtonLabel:"Scale Application",
      inputProperties: {
        defaultValue: model.instances.toString(),
        type: "number",
        min: "0"
      },
      message: "How many instances would you like to scale to?",
      title: "Scale Application"
    });

    DialogStore.handleUserResponse(dialogId, instancesString => {
      if (instancesString != null && instancesString !== "") {
        let instances = parseInt(instancesString, 10);

        if (isStatefulApp(model) && model.instances > instances) {
          this.handleScaleDownVolumeApp(instances);
          return;
        }

        this.addScaleAppListener();

        AppsActions.scaleApp(model.id, instances);
      }
    });
  },

  handleScaleDownVolumeApp: function (instances) {
    var appId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Continue Scaling",
      message: (
        <div>
          <div>Scaling down {appId} will cause any existing local volumes to
            be detached from destroyed instances. <a
                href={ExternalLinks.LOCAL_VOLUMES}
                target="_blank"
                className="modal-body-link">
              Read more about persistent local volumes.
            </a>
          </div>
          <div>
            Are you sure you want to continue?
          </div>
        </div>
      ),
      severity: DialogSeverity.WARNING,
      title: "Scale Stateful Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addScaleAppListener();

      AppsActions.scaleApp(appId, instances, true);
    });

    return;
  },

  handleScaleGroup: function () {
    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    const dialogId = DialogActions.prompt({
      actionButtonLabel:"Scale Group",
      inputProperties: {
        defaultValue: "1.0",
        type: "number",
        min: "0"
      },
      message: "By which factor would you like to scale all applications " +
        "within this group?",
      title: "Scale Group"
    });

    DialogStore.handleUserResponse(dialogId, scaleByString => {
      if (scaleByString != null && scaleByString !== "") {
        let scaleBy = parseFloat(scaleByString);

        this.addScaleGroupListener();

        GroupsActions.scaleGroup(model.id, scaleBy);
      }
    });
  },

  handleSuspendApp: function (event) {
    event.preventDefault();

    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    let appId = model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Suspend Application",
      message: `Are you sure you want to suspend ${appId} by scaling to 0
      instances?`,
      title: "Suspend Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      if (isStatefulApp(model) && model.instances > instances) {
        this.handleScaleDownVolumeApp(0);
        return;
      }

      this.addScaleAppListener();

      AppsActions.scaleApp(appId, 0);
    });
  },

  handleSuspendGroup: function (event) {
    event.preventDefault();

    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    let groupId = model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Suspend Group",
      message: `Are you sure you want to suspend all application within
        ${groupId} by scaling to 0 instances?`,
      title: "Suspend Group"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addScaleGroupListener();

      GroupsActions.scaleGroup(groupId, 0);
    });
  },

  onScaleAppError: function (errorMessage, statusCode, instances) {
    var appId = this.props.model.id;

    if (statusCode === 409) {
      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Stop Current Deployment and Scale",
        message: `In order to scale ${appId} to a new number of instances, the
          current deployment will have to be forcefully stopped and a new
          one started. This could result in unwanted
          states.`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Application"
      });

      DialogStore.handleUserResponse(dialogId, () => {
        this.addScaleAppListener();

        AppsActions.scaleApp(appId, instances, true);
      });

      return;
    }

    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error scaling ${appId}: `,
      statusCode: statusCode,
      title: "Error Scaling Application"
    });
  },

  onScaleGroupError: function (errorMessage, statusCode) {
    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error scaling ${this.props.model.id}: `,
      statusCode: statusCode,
      title: "Error Scaling Group"
    });
  },

  onRestartAppError: function (errorMessage, statusCode) {
    var appId = this.props.model.id;

    if (statusCode === 409) {
      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Stop Current Deployment and Restart",
        message: `In order to restart ${appId}, the current deployment will have
          to be forcefully stopped. This could result in
          unwanted states.`,
        severity: DialogSeverity.DANGER,
        title: "Error Restarting Application"
      });

      DialogStore.handleUserResponse(dialogId, () => {
        this.addRestartAppListener();

        AppsActions.restartApp(appId, true);
      });

      return;
    }

    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error restarting ${appId}: `,
      statusCode: statusCode,
      title: "Error Restarting Application"
    });
  },

  onDeleteAppError: function (errorMessage, statusCode) {
    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error destroying ${this.props.model.id}: `,
      statusCode: statusCode,
      title: "Error Destroying Application"
    });
  },

  onDeleteGroupError: function (errorMessage, statusCode) {
    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error destroying ${this.props.model.id}: `,
      statusCode: statusCode,
      title: "Error Destroying Group"
    });
  },

  onResetDelayError: function (errorMessage, statusCode) {
    callErrorDialog({
      errorMessage: errorMessage,
      messagePrefix: `Error resetting ${this.props.model.id} delay: `,
      statusCode: statusCode,
      title: "Error Resetting Delay"
    });
  },

  onResetDelaySuccess: function () {
    DialogActions.alert({
      message:
        `Application Delay for ${this.props.model.id} was reset successfully.`,
      title: "Reset Successful"
    });
  }
};

export default AppActionsHandlerMixin;
