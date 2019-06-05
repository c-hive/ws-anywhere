const buttonRowIds = {
  ON_EVENT: "onEvent",
  PERIODIC: "periodic",
  PERIODIC_ACTIONS: "periodicActions",
  DISCONNECT: "disconnect"
};

const suffixes = {
  SUCCESS_IMG: "SuccessImg",
  ERROR_IMG: "ErrorImg",
  ERROR_SPAN: "ErrorSpan"
};

window.onload = function() {
  const getUrl = "/settings/current";

  fetch(getUrl)
    .then(responseData => responseData.json())
    .then(parsedResponseData => {
      if (parsedResponseData.success) {
        setInputValues(parsedResponseData.currentSettings);
      }
    })
    .catch(() => {
      displayErrorMsgBox("Server error");
    });

  createButtonRowElements();
};

function createButtonRowElements() {
  Object.keys(buttonRowIds).map(id => {
    const currentRowId = buttonRowIds[id];

    const styledRowElements = getStyledRowElements(currentRowId);

    appendStyledRowElementsToRow(currentRowId, styledRowElements);
  });
}

function appendStyledRowElementsToRow(rowId, styledRowElements) {
  const item = document.getElementById(rowId);

  item.appendChild(styledRowElements.successImg);
  item.appendChild(styledRowElements.errorImg);
  item.appendChild(styledRowElements.errorSpan);
}

function getStyledRowElements(rowId) {
  const successImg = getSuccessImgElement(rowId + suffixes.SUCCESS_IMG);
  const errorImg = getErrorImgElement(rowId + suffixes.ERROR_IMG);
  const errorSpan = getErrorSpanElement(rowId + suffixes.ERROR_SPAN);

  return {
    successImg,
    errorImg,
    errorSpan
  };
}

function getSuccessImgElement(imgId) {
  const successImg = document.createElement("IMG");

  successImg.id = imgId;
  successImg.alt = "Success";
  successImg.src = "/assets/success.png";
  successImg.classList.add("statusImg");

  return successImg;
}

function getErrorImgElement(imgId) {
  const errorImg = document.createElement("IMG");

  errorImg.id = imgId;
  errorImg.alt = "Error";
  errorImg.src = "/assets/error.png";
  errorImg.classList.add("statusImg");

  return errorImg;
}

function getErrorSpanElement(spanId) {
  const errorSpan = document.createElement("SPAN");

  errorSpan.id = spanId;
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

function getButtonRowElements(rowId) {
  const successImg = document.getElementById(rowId + suffixes.SUCCESS_IMG);
  const errorImg = document.getElementById(rowId + suffixes.ERROR_IMG);
  const errorSpan = document.getElementById(rowId + suffixes.ERROR_SPAN);

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

function hideElements(buttonRowElements) {
  buttonRowElements.forEach(rowElement => {
    rowElement.style.display = "none";
  });
}

function displaySuccessImg(rowId) {
  const buttonRowElements = getButtonRowElements(rowId);

  buttonRowElements.successImg.style.display = "block";

  hideElements([buttonRowElements.errorImg, buttonRowElements.errorSpan]);

  hideElementAfterMsElapsed(buttonRowElements.successImg, 2500);
}

function displayErrorElements(rowId, errorMessage) {
  const buttonRowElements = getButtonRowElements(rowId);

  buttonRowElements.errorImg.style.display = "block";

  hideElements([buttonRowElements.successImg]);

  if (errorMessage) {
    buttonRowElements.errorSpan.style.display = "block";
    buttonRowElements.errorSpan.innerText = errorMessage;
  }
}

function displayErrorMsgBox(errorMessage) {
  const errorMsgBoxElement = document.getElementById("errorMsgBox");

  const errorMsgBoxTextElement = getErrorMessageBoxTextElement(errorMessage);

  errorMsgBoxElement.appendChild(errorMsgBoxTextElement);

  errorMsgBoxElement.style.display = "flex";
}

function getErrorMessageBoxTextElement(errorMessage) {
  const errorMsgTextElement = document.createElement("P");

  errorMsgTextElement.innerText = errorMessage;

  return errorMsgTextElement;
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
  if (isDefined(data.onEventMessage)) {
    document.getElementById("onEventResponseMessage").value =
      data.onEventMessage;
  }

  if (isDefined(data.periodicMessage)) {
    document.getElementById("periodicResponseMessage").value =
      data.periodicMessage;
    document.getElementById("interval").value = data.interval;

    updatePeriodicActionButtonsDisabledProperty({
      start: data.isPeriodicMessageSendingActive,
      stop: !data.isPeriodicMessageSendingActive
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
          displaySuccessImg(buttonRowIds.DISCONNECT);
        }
      })
      .catch(() => {
        displayErrorElements(buttonRowIds.DISCONNECT);
      });
  }
}

function getPeriodicMessageSettings() {
  const periodicMessage = document.getElementById("periodicResponseMessage")
    .value;

  const interval = document.getElementById("interval").value;

  return {
    periodicMessage,
    interval
  };
}

function getOnEventMessageSettings() {
  const onEventMessage = document.getElementById("onEventResponseMessage")
    .value;

  return {
    onEventMessage
  };
}

function checkIfOnEventMessageIsValid() {
  const settings = getOnEventMessageSettings();

  return isJson(settings.onEventMessage);
}

function checkIfPeriodicMessageIsValid() {
  const settings = getPeriodicMessageSettings();

  return isJson(settings.periodicMessage);
}

// eslint-disable-next-line no-unused-vars
function submitOnEventMessage() {
  if (checkIfOnEventMessageIsValid()) {
    const onEventMessageSettings = getOnEventMessageSettings();

    const postUrl = "/settings/onevent/save";

    fetch(postUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(onEventMessageSettings)
    })
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.success) {
          displaySuccessImg(buttonRowIds.ON_EVENT);
        }
      })
      .catch(() => {
        displayErrorElements(buttonRowIds.ON_EVENT);
      });
  } else {
    const errorMessage = "Invalid JSON format.";

    displayErrorElements(buttonRowIds.ON_EVENT, errorMessage);
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
          displaySuccessImg(buttonRowIds.PERIODIC);

          if (peridocActionButtonsAreDisabled()) {
            updatePeriodicActionButtonsDisabledProperty({
              start: false
            });
          }
        }
      })
      .catch(() => {
        displayErrorElements(buttonRowIds.PERIODIC);
      });
  } else {
    const errorMessage = "Invalid JSON format.";

    displayErrorElements(buttonRowIds.PERIODIC, errorMessage);
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

        displaySuccessImg(buttonRowIds.PERIODIC_ACTIONS);
      }
    })
    .catch(() => {
      updatePeriodicActionButtonsDisabledProperty({
        start: false,
        stop: true
      });

      displayErrorElements(buttonRowIds.PERIODIC_ACTIONS);
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

        displaySuccessImg(buttonRowIds.PERIODIC_ACTIONS);
      }
    })
    .catch(() => {
      updatePeriodicActionButtonsDisabledProperty({
        start: true,
        stop: false
      });

      displayErrorElements(buttonRowIds.PERIODIC_ACTIONS);
    });
}
