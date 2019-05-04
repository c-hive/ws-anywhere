const elementIds = {
  onEvent: {
    successImg: "onEventSuccessImg",
    errorImg: "onEventErrorImg",
    errorSpan: "onEventErrorSpan"
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
  const onEventSubmitBar = document.getElementById("onEventSubmitBar");
  const periodicSubmitBar = document.getElementById("periodicSubmitBar");

  const onEventHTMLElements = getPreparedHTMLElements(elementIds.onEvent);
  const periodicHTMLElements = getPreparedHTMLElements(elementIds.periodic);

  onEventSubmitBar.appendChild(onEventHTMLElements.successImg);
  onEventSubmitBar.appendChild(onEventHTMLElements.errorImg);
  onEventSubmitBar.appendChild(onEventHTMLElements.errorSpan);

  periodicSubmitBar.appendChild(periodicHTMLElements.successImg);
  periodicSubmitBar.appendChild(periodicHTMLElements.errorImg);
  periodicSubmitBar.appendChild(periodicHTMLElements.errorSpan);
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

function isDefined(value) {
  return typeof value !== "undefined";
}

// value !== null -> `typeof null` returns "object".
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

function updatePeriodicActionButtonsDisabledProperty(btnStatuses) {
  if (isDefined(btnStatuses.start)) {
    document.getElementById("startBtn").disabled = btnStatuses.start;
  }

  if (isDefined(btnStatuses.stop)) {
    document.getElementById("stopBtn").disabled = btnStatuses.stop;
  }
}

function setInputValues(data) {
  if (objectIsNotEmpty(data.currentSettings.onEvent.message)) {
    document.getElementById("onEventResponseMessage").value = JSON.stringify(
      data.currentSettings.onEvent.message,
      undefined,
      2
    );
  }

  if (objectIsNotEmpty(data.currentSettings.periodic.message)) {
    const oneSecondInMilliseconds = 1000;

    document.getElementById("periodicResponseMessage").value =
      data.currentSettings.periodic.message;
    document.getElementById("periodInSeconds").value =
      data.currentSettings.periodic.intervalInMilliseconds /
      oneSecondInMilliseconds;
  } else {
    updatePeriodicActionButtonsDisabledProperty({
      start: true,
      stop: true
    });
  }
}

// eslint-disable-next-line no-unused-vars
function submitOnEventSettings() {
  const onEventResponseMessage = document.getElementById(
    "onEventResponseMessage"
  ).value;

  if (isInputDataValid(onEventResponseMessage)) {
    const postUrl = "/settings/onevent/save";

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: onEventResponseMessage
    })
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(elementIds.onEvent);

          setInputValues(parsedResponse);
        }
      })
      .catch(() => {
        displayErrorElements(elementIds.onEvent);
      });
  } else {
    const errorMessage = "Invalid JSON format.";

    displayErrorElements(elementIds.onEvent, errorMessage);
  }
}

// eslint-disable-next-line no-unused-vars
function submitPeriodicSettings() {
  const periodicResponseMessage = document.getElementById(
    "periodicResponseMessage"
  ).value;
  const periodInSeconds = document.getElementById("periodInSeconds").value;

  if (isInputDataValid(periodicResponseMessage)) {
    updatePeriodicActionButtonsDisabledProperty({
      start: true,
      stop: false
    });

    const postUrl = "/settings/periodic/save";

    const data = {
      responseMessage: periodicResponseMessage,
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
      .then(response => response.json())
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

// eslint-disable-next-line no-unused-vars
function disconnectAllClients() {
  if (confirm("Disconnect all the clients?")) {
    const postUrl = "/disconnect";

    fetch(postUrl)
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          // eslint-disable-next-line no-console
          console.log("[Successfully disconnected all the clients.]");
        }
      });
  }
}

// eslint-disable-next-line no-unused-vars
function startSendingPeriodicMessage() {
  updatePeriodicActionButtonsDisabledProperty({
    start: true
  });

  fetch("/settings/periodic/start")
    .then(response => response.json())
    .then(parsedResponse => {
      if (parsedResponse.success) {
        updatePeriodicActionButtonsDisabledProperty({
          stop: false
        });
      }
    });
}

// eslint-disable-next-line no-unused-vars
function stopSendingPeriodicMessage() {
  updatePeriodicActionButtonsDisabledProperty({
    stop: true
  });

  fetch("/settings/periodic/stop")
    .then(response => response.json())
    .then(parsedResponse => {
      if (parsedResponse.success) {
        updatePeriodicActionButtonsDisabledProperty({
          start: false
        });
      }
    });
}
