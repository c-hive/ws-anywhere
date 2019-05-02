const elementIds = {
  perRequest: {
    successImg: "perRequestSuccessImg",
    errorImg: "perRequestErrorImg",
    errorSpan: "perRequestErrorSpan"
  },
  periodic: {
    successImg: "periodicSuccessImg",
    errorImg: "periodicErrorImg",
    errorSpan: "periodicErrorSpan"
  }
};

window.onload = function() {
  const getUrl = "settings/current";

  fetch(getUrl)
    .then(res => res.json())
    .then(parsedResponse => {
      setInputValues(parsedResponse);
    });

  createSubmitBarElements();
};

function createSubmitBarElements() {
  const perRequestSubmitBar = document.getElementById("perRequestSubmitBar");
  const periodicSubmitBar = document.getElementById("periodicSubmitBar");

  const perRequestElements = getPreparedHTMLElements(elementIds.perRequest);
  const periodicElements = getPreparedHTMLElements(elementIds.periodic);

  perRequestSubmitBar.appendChild(perRequestElements.successImg);
  perRequestSubmitBar.appendChild(perRequestElements.errorImg);
  perRequestSubmitBar.appendChild(perRequestElements.errorSpan);

  periodicSubmitBar.appendChild(periodicElements.successImg);
  periodicSubmitBar.appendChild(periodicElements.errorImg);
  periodicSubmitBar.appendChild(periodicElements.errorSpan);
}

function getPreparedHTMLElements(elementIdsGroup) {
  const successImg = getSuccessImgElement(elementIdsGroup.successImg);
  const errorImg = getErrorImgElement(elementIdsGroup.errorImg);
  const errorSpan = getErrorSpanElement(elementIdsGroup.errorSpan);

  return {
    successImg,
    errorImg,
    errorSpan
  };
}

function getSuccessImgElement(successImgId) {
  const successImg = document.createElement("IMG");

  successImg.id = successImgId;
  successImg.alt = "Success";
  successImg.src = "/assets/success.png";
  successImg.classList.add("statusImg");

  return successImg;
}

function getErrorImgElement(errorImgId) {
  const errorImg = document.createElement("IMG");

  errorImg.id = errorImgId;
  errorImg.alt = "Error";
  errorImg.src = "/assets/error.png";
  errorImg.classList.add("statusImg");

  return errorImg;
}

function getErrorSpanElement(errorSpanId) {
  const errorSpan = document.createElement("SPAN");

  errorSpan.id = errorSpanId;
  errorSpan.classList.add("errorMsg");

  return errorSpan;
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function objectIsNotEmpty(object) {
  return Object.keys(object).length !== 0;
}

function isInputDataValid(data) {
  try {
    // Because <textarea /> returns a string by default.
    const parsedData = JSON.parse(data);

    if (isObject(parsedData)) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

function getElementsGroup(elementIdsGroup) {
  const successImg = document.getElementById(elementIdsGroup.successImg);
  const errorImg = document.getElementById(elementIdsGroup.errorImg);
  const errorSpan = document.getElementById(elementIdsGroup.errorSpan);

  return {
    successImg,
    errorImg,
    errorSpan
  };
}

function hideElementAfterMsElapsed(el, delayInMs) {
  setTimeout(() => {
    el.style.display = "none";
  }, delayInMs);
}

function hideElements(elements) {
  elements.forEach(element => {
    element.style.display = "none";
  });
}

function displaySuccessImg(elementIdsGroup) {
  const elementsGroup = getElementsGroup(elementIdsGroup);

  elementsGroup.successImg.style.display = "block";

  hideElements([elementsGroup.errorImg, elementsGroup.errorSpan]);
  hideElementAfterMsElapsed(elementsGroup.successImg, 2500);
}

function displayErrorElements(elementIdsGroup, errorMessage) {
  const elementsGroup = getElementsGroup(elementIdsGroup);

  elementsGroup.errorImg.style.display = "block";

  hideElements([elementsGroup.successImg]);
  hideElementAfterMsElapsed(elementsGroup.errorImg, 2500);

  if (errorMessage) {
    elementsGroup.errorSpan.style.display = "block";
    elementsGroup.errorSpan.innerText = errorMessage;

    hideElementAfterMsElapsed(elementsGroup.errorSpan, 2500);
  }
}

function setInputValues(data) {
  if (objectIsNotEmpty(data.currentSettings.perRequest.dummyData)) {
    document.getElementById("perRequestData").value = JSON.stringify(
      data.currentSettings.perRequest.dummyData,
      undefined,
      2
    );
  }

  if (objectIsNotEmpty(data.currentSettings.periodic.dummyData)) {
    const oneSecondInMilliseconds = 1000;

    document.getElementById("periodicData").value =
      data.currentSettings.periodic.dummyData;
    document.getElementById("periodInSeconds").value =
      data.currentSettings.periodic.intervalInMilliseconds /
      oneSecondInMilliseconds;
  }
}

// eslint-disable-next-line no-unused-vars
function postPerRequestSettings() {
  const dummyData = document.getElementById("perRequestData").value;

  if (isInputDataValid(dummyData)) {
    const postUrl = "settings/perrequestdata";

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: dummyData
    })
      .then(res => res.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(elementIds.perRequest);

          setInputValues(parsedResponse);
        }
      })
      .catch(() => {
        displayErrorElements(elementIds.perRequest);
      });
  } else {
    const errorMessage = "Invalid JSON format.";

    displayErrorElements(elementIds.perRequest, errorMessage);
  }
}

// eslint-disable-next-line no-unused-vars
function postPeriodicSettings() {
  const dummyData = document.getElementById("periodicData").value;
  const periodInSeconds = document.getElementById("periodInSeconds").value;

  if (isInputDataValid(dummyData)) {
    const postUrl = "settings/periodicdata";

    const data = {
      dummyData,
      periodInSeconds
    };

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(elementIds.periodic);

          setInputValues(parsedResponse);
        }
      })
      .catch(() => {
        displayErrorElements(elementIds.periodic);
      });
  } else {
    const errorMessage = "Invalid JSON format.";

    displayErrorElements(elementIds.periodic, errorMessage);
  }
}
