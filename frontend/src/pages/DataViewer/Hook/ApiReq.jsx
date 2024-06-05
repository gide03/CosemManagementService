import axios from "axios";

/**
 * fetch project list from server
 * @param {*} setter `hook` setter of project list
 */
function requestProjectList(setter) {
  axios
    .get("http://10.23.40.185/api/project/listproject")
    .then((response) => {
      let respData = response.data;
      console.log(respData);
      console.debug("[requestProjectList] Update meter list");
      setter(respData);
    })
    .catch((error) => {
      console.log(error);
    });
}

function requestVersionList(project, setter) {
  axios
    .get(`http://10.23.40.185/api/project/listversion/${project}`)
    .then((response) => {
      let respData = response.data;
      console.debug("[requestFirwmareList] result", respData);
      console.debug("[requestVersionList] update version list");
      setter(respData);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 *
 * @param {*} project `str` project reference
 * @param {*} version `str` versino reference
 * @param {*} setter `hook` setter of cosem info
 */
function requestCosemList(project, version, setter) {
  axios
    .get(`http://10.23.40.185/api/project/getcosemlist/${project}/${version}`)
    .then((response) => {
      let respData = response.data;
      console.debug("[requestCosemList] result", respData);
      setter(respData);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 *
 * @param {*} project `str` project reference
 * @param {*} version `str` version reference
 * @param {*} objectName `str` cosem object name
 * @param {*} setter `hook` setter of cosem info
 */
function requestCosemInfo(project, version, objectName, setter) {
  axios
    .get(
      `http://10.23.40.185/api/project/get/${project}/${version}/${objectName}`
    )
    .then((response) => {
      let respData = response.data;
      console.debug("[requestCosemInfo] result", respData);
      console.debug("[requestCosemInfo] Update active object data");
      setter(respData);
    })
    .catch((error) => {
      console.log(error);
    });
}

export const ReqApi = {
  getProjectList: requestProjectList,
  getVersionList: requestVersionList,
  getCosemList: requestCosemList,
  getCosemInfo: requestCosemInfo,
};
