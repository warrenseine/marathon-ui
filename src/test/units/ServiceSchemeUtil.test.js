import {expect} from "chai";
import ServiceSchemeUtil from "../../js/helpers/ServiceSchemeUtil";

function verifyServiceSchemeWithDefault(serviceScheme, serviceScheme0, 
  expectedSchemePort0, expectedSchemePort1) {
  describe("MARATHON_SERVICE_SCHEME is set to " + serviceScheme, function() {
    describe("MARATHON_SERVICE_SCHEME_0 is set to " + serviceScheme0, function() {
      it("detect scheme of port 0", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SERVICE_SCHEME": serviceScheme,
          "MARATHON_SERVICE_SCHEME_0": serviceScheme0,
        }, 0)).to.eq(expectedSchemePort0);
      });

      it("detect scheme of port 1", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SERVICE_SCHEME": serviceScheme,
          "MARATHON_SERVICE_SCHEME_0": serviceScheme0,
        }, 1)).to.eq(expectedSchemePort1);
      });
    });
  });
}

function verifyServiceSchemeWithoutDefault(serviceScheme0, 
  expectedSchemePort0, expectedSchemePort1) {
  describe("MARATHON_SERVICE_SCHEME is not set", function() {
    describe("MARATHON_SERVICE_SCHEME_0 is set to " + serviceScheme0, function() {
      it("detect scheme of port 0", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SERVICE_SCHEME_0": serviceScheme0,
        }, 0)).to.eq(expectedSchemePort0);
      });

      it("detect scheme of port 1", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SERVICE_SCHEME_0": serviceScheme0,
        }, 1)).to.eq(expectedSchemePort1);
      });
    });
  });
}

describe("ServiceSchemeUtil", function () {
  //                             default scheme        scheme port 0       expected port 0             expected port 1
  verifyServiceSchemeWithDefault("http",               "http",             "http",                     "http");
  verifyServiceSchemeWithDefault("http",               "https",            "https",                    "http");
  verifyServiceSchemeWithDefault("https",              "http",             "http",                     "https");
  verifyServiceSchemeWithDefault("https",              "https",            "https",                    "https");

  //                                scheme port 0       expected port 0             expected port 1
  verifyServiceSchemeWithoutDefault("http",             "http",                     "http");
  verifyServiceSchemeWithoutDefault("https",            "https",                    "http");
  verifyServiceSchemeWithoutDefault("http",             "http",                     "http");
  verifyServiceSchemeWithoutDefault("https",            "https",                    "http");
});
