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
  },
  disconnect: {
    successImg: "disconnectSuccessImg",
    errorImg: "disconnectErrorImg",
    errorSpan: "disconnectErrorSpan"
  }
};

window.onload = function() {
  const getUrl = "/settings/current";

  fetch(getUrl)
    .then(currentSettings => currentSettings.json())
    .then(parsedCurrentSettings => {
      setInputValues(parsedCurrentSettings);
    });

  createFeedbackElements();
};

function createFeedbackElements() {
  Object.keys(elementIds).map(itemId => {
    const elementIdsGroup = elementIds[itemId];

    const preparedFeedbackElements = getPreparedFeedbackElements(
      elementIdsGroup
    );

    appendFeedbackElementsToItem(itemId, preparedFeedbackElements);
  });
}

function appendFeedbackElementsToItem(itemId, feedbackElements) {
  const item = document.getElementById(itemId);

  item.appendChild(feedbackElements.successImg);
  item.appendChild(feedbackElements.errorImg);
  item.appendChild(feedbackElements.errorSpan);
}

function getPreparedFeedbackElements(elementIdsGroup) {
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
  return typeof value !== "undefined" && value !== null;
}

// value !== null -> `typeof null` returns "object".
function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isJson(data) {
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

  if (errorMessage) {
    elementsGroup.errorSpan.style.display = "block";
    elementsGroup.errorSpan.innerText = errorMessage;
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

function peridocActionButtonsAreDisabled() {
  return (
    document.getElementById("startBtn").disabled &&
    document.getElementById("stopBtn").disabled
  );
}

function setInputValues(data) {
  if (isDefined(data.currentSettings.onEvent.message)) {
    document.getElementById("onEventResponseMessage").value =
      data.currentSettings.onEvent.message;
  }

  if (isDefined(data.currentSettings.periodic.message)) {
    const oneSecondInMilliseconds = 1000;

    document.getElementById("periodicResponseMessage").value =
      data.currentSettings.periodic.message;
    document.getElementById("periodInSeconds").value =
      data.currentSettings.periodic.intervalInMilliseconds /
      oneSecondInMilliseconds;

    updatePeriodicActionButtonsDisabledProperty({
      start: data.currentSettings.isPeriodicMessageSendingActive,
      stop: !data.currentSettings.isPeriodicMessageSendingActive
    });
  } else {
    updatePeriodicActionButtonsDisabledProperty({
      start: true,
      stop: true
    });
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
          displaySuccessImg(elementIds.disconnect);
        }
      })
      .catch(() => {
        displayErrorElements(elementIds.disconnect);
      });
  }
}

function getPeriodicMessageSettings() {
  const message = document.getElementById("periodicResponseMessage").value;

  const periodInSeconds = document.getElementById("periodInSeconds").value;

  return {
    message,
    periodInSeconds
  };
}

function getOnEventMessageSettings() {
  const message = document.getElementById("onEventResponseMessage").value;

  return {
    message
  };
}

function checkIfOnEventMessageIsValid() {
  const onEventResponseMessage = getOnEventMessageSettings();

  if (isJson(onEventResponseMessage.message)) {
    return true;
  }

  return false;
}

function checkIfPeriodicMessageIsValid() {
  const periodicMessageSettings = getPeriodicMessageSettings();

  if (isJson(periodicMessageSettings.message)) {
    return true;
  }

  return false;
}

// eslint-disable-next-line no-unused-vars
function submitOnEventMessage() {
  if (checkIfOnEventMessageIsValid()) {
    const onEventPostMessageSettings = getOnEventMessageSettings();

    const postUrl = "/settings/onevent/save";

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(onEventPostMessageSettings)
    })
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(elementIds.onEvent);
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
  if (checkIfPeriodicMessageIsValid()) {
    const perodicMessageSettings = getPeriodicMessageSettings();

    const postUrl = "/settings/periodic/save";

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(perodicMessageSettings)
    })
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(elementIds.periodic);

          if (peridocActionButtonsAreDisabled()) {
            updatePeriodicActionButtonsDisabledProperty({
              start: false
            });
          }
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
    })
    .catch(() => {
      updatePeriodicActionButtonsDisabledProperty({
        start: false,
        stop: true
      });
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
    })
    .catch(() => {
      updatePeriodicActionButtonsDisabledProperty({
        start: true,
        stop: false
      });
    });
}
