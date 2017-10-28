import {expect} from "chai";
import {render} from "enzyme";

import React from "react/addons";
import AppListItemComponent from "../../js/components/AppListItemComponent";
import config from "../../js/config/config";

config.appLogsLinkTemplate = "http://kibana?appId={{appId}}";
config.serviceDomain = "service.domain";

describe("AppListItemComponent", function () {
  before(function () {
    var model = {
      id: "/app-123",
      deployments: [],
      tasksRunning: 4,
      health: [],
      instances: 5,
      mem: 100,
      totalMem: 1030,
      cpus: 4,
      totalCpus: 20.0000001,
      status: 0,
    };

    this.component = render(
      <AppListItemComponent model={model} currentGroup="/" />
    );
  });

  after(function () {
    this.component = null;
  });

  it("has the correct app id", function () {
    expect(this.component.find(".name-cell").text()).to.equal("app-123");
  });

  it("has the correct amount of total cpus", function () {
    expect(this.component.find(".cpu-cell").text()).to.equal("20.0");
  });

  it("has the correct link to logs", function () {
    expect(this.component.find(".logs-cell").find("a").html())
      .to.equal("<div class=\"icon icon-mini file\"></div>");
    expect(this.component.find(".logs-cell").find("a").attr("href"))
      .to.equal("http://kibana?appId=app-123");
  });

  describe("produces the correct service link", function () {
    it("has an http scheme when no scheme is provided", function () {
      expect(this.component.find(".service-cell").find("a").attr("href"))
        .to.equal("http://app-123.service.domain");
    });

    it("has an https scheme when SERVICE_SCHEME is https", function () {
      var model = {
        id: "/app-123",
        deployments: [],
        tasksRunning: 4,
        health: [],
        instances: 5,
        mem: 100,
        totalMem: 1030,
        cpus: 4,
        totalCpus: 20.0000001,
        status: 0,
        labels: {"SERVICE_SCHEME": "https"},
      };

      var component = render(
        <AppListItemComponent model={model} currentGroup="/" />
      );
      expect(component.find(".service-cell").find("a").attr("href"))
        .to.equal("https://app-123.service.domain");
    });

    it("fallbacks to http scheme when SERVICE_SCHEME is wrong", function () {
      var model = {
        id: "/app-123",
        deployments: [],
        tasksRunning: 4,
        health: [],
        instances: 5,
        mem: 100,
        totalMem: 1030,
        cpus: 4,
        totalCpus: 20.0000001,
        status: 0,
        labels: {"SERVICE_SCHEME": "unknown-scheme"},
      };

      var component = render(
        <AppListItemComponent model={model} currentGroup="/" />
      );
      expect(component.find(".service-cell").find("a").attr("href"))
        .to.equal("http://app-123.service.domain");
    });
  });

  it("has the correct amount of total memory", function () {
    var node = this.component.find(".total.ram > span");
    expect(node.get(0).attribs.title).to.equal("1030 MiB");
  });

  it("displays the correct amount memory", function () {
    expect(this.component.find(".total.ram").text()).to.equal("1 GiB");
  });

  it("has correct number of tasks and instances", function () {
    expect(this.component.find(".instances-cell").text())
      .to.equal("4 of 5");
  });

  describe("entry is a group", function () {
    before(function () {
      var model = {
        id: "/app-123",
        deployments: [],
        tasksRunning: 4,
        health: [],
        instances: 5,
        mem: 100,
        totalMem: 1030,
        cpus: 4,
        totalCpus: 20.0000001,
        status: 0,
        isGroup: true
      };

      this.component = render(
        <AppListItemComponent model={model} currentGroup="/" />
      );
    });

    it("does not display log icon for groups", function () {
      expect(this.component.find(".logs-cell").html())
        .to.be.empty;
    });
  });

  describe("has highlight in the sorted column", function (){
    var testCases = [
      {
        sortKey: "id",
        cssClass: ".name-cell"
      },
      {
        sortKey: "totalMem",
        cssClass: ".ram"
      },
      {
        sortKey: "tasksRunning",
        cssClass: ".instances-cell"
      },
      {
        sortKey: "totalCpus",
        cssClass: ".cpu-cell"
      },
      {
        sortKey: "healthWeight",
        cssClass: ".health-bar-column"
      }
    ];

    var model = {
       id: "/app-123",
       deployments: [],
       tasksRunning: 4,
       health: [],
       instances: 5,
       mem: 100,
       totalMem: 1030,
       cpus: 4,
       totalCpus: 20.0000001,
       status: 0
     };

    testCases.forEach(function (testCase) {
      it(testCase.sortKey, function () {
        var component = render(
          <AppListItemComponent
            model={model}
            currentGroup="/"
            sortKey={testCase.sortKey} />
        );

        expect(component.find(testCase.cssClass).get(0).attribs.class)
          .to.contain("cell-highlighted");
      });
    });
  });
});
