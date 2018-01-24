const BASE_SCHEME_LABEL = "MARATHON_SERVICE_SCHEME";
const DEFAULT_SCHEME = "http";

var ServiceSchemeUtil = {
  /*
   * Returns service scheme of the n-th port.
   *
   * Given N a port index, if `MARATHON_SERVICE_SCHEME_<N>` is
   * in the set of labels, then the function returns the value
   * of this label.
   *
   * Given N a port index, if `MARATHON_SERVICE_SCHEME_<N>` is
   * not in the set of labels, then the value associated with
   * `MARATHON_SERVICE_SCHEME` is returned.
   *
   * Given N a port index, if `MARATHON_SERVICE_SCHEME_<N>` and
   * `MARATHON_SERVICE_SCHEME` are not in the set of labels, the
   * function returns the `http` as the default scheme.
   */
  getServiceSchemeFromLabels(labels, n) {
    function getScheme(labelValue) {
      return (labelValue === "http" || labelValue === "https")
        ? labelValue
        : DEFAULT_SCHEME;
    }

    const labelKey = ("" + BASE_SCHEME_LABEL + "_" + n);
    if (labels && labelKey in labels)
      return getScheme(labels[labelKey]);
    else if (labels && BASE_SCHEME_LABEL in labels)
      return getScheme(labels[BASE_SCHEME_LABEL]);

    return DEFAULT_SCHEME;
  }
};

export default ServiceSchemeUtil;