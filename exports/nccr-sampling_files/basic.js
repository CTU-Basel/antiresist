var secuTrial;
if (secuTrial === undefined) {
  secuTrial = {};
}
// if (document.layers) {
//   document.captureEvents(Event.MOUSEDOWN);
// }
// document.onmousedown = click;
// document.oncontextmenu = click;

function beep() {
  var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
  snd.play();
}
var sessionMillis;
var startTime = new Date().getTime() + 1000;
var oldDisplay;
var timeoutMessage;
var timeleftMessage;
var countDownStarted = false;

function refreshCountDown() {
  if (countDownStarted) {
    startTime = new Date().getTime();
    countDown();
  } else {
    if (parent.frames.length > 1 && window != parent) {
      if (parent.refreshCountDown) {
        parent.refreshCountDown();
      } else {
        if (parent.opener) {
          if (parent.opener.refreshCountDown) {
            parent.opener.refreshCountDown();
          }
        }
      }
    } else {
      if (opener) {
        try {
          if (opener.refreshCountDown) {
            opener.refreshCountDown();
          }
        } catch (error) { }
      }
    }
  }
}

function countDown() {
  var endTime = startTime + sessionMillis,
    timeLeft = endTime - (new Date().getTime()),
    minutes = Math.floor((timeLeft / (1000 * 60))),
    timeSecondsLeft = timeLeft - (minutes * 1000 * 60),
    seconds = Math.floor((timeSecondsLeft / 1000)),
    minutesDisplay, secondsDisplay, display, longDisplay, displayElement, lastNormalTitle, browserTitle = parent.document.title;
  countDownStarted = true;
  minutesDisplay = minutes + ":";
  if (minutes < 10) {
    minutesDisplay = "0" + minutesDisplay;
  }
  secondsDisplay = seconds;
  if (seconds < 10) {
    secondsDisplay = "0" + secondsDisplay;
  }
  display = minutesDisplay + secondsDisplay;
  longDisplay = " " + timeleftMessage + " " + display;
  displayElement = document.getElementsByName("countDownDisplay");
  if (displayElement) {
    for (var i = 0; i < displayElement.length; i++) {
      var element = displayElement[i];
      element.innerHTML = display;
    }
  }
  if (oldDisplay && oldDisplay.length > 0) {
    lastNormalTitle = browserTitle.length - oldDisplay.length;
    title = browserTitle.substring(0, lastNormalTitle);
    browserTitle = title + longDisplay;
  } else {
    browserTitle = browserTitle + longDisplay;
  }
  parent.document.title = browserTitle;
  oldDisplay = longDisplay;
  if (timeLeft > 1000) {
    setTimeout("countDown()", 1000);
  } else {
    if (displayElement) {
      for (var i = 0; i < displayElement.length; i++) {
        var element = displayElement[i];
        element.innerHTML = timeoutMessage;
      }
    }
    if (oldDisplay && oldDisplay.length > 0) {
      lastNormalTitle = browserTitle.length - oldDisplay.length;
      title = browserTitle.substring(0, lastNormalTitle);
      browserTitle = title + " " + timeoutMessage;
      oldDisplay = " " + timeoutMessage;
    } else {
      browserTitle = browserTitle + longDisplay;
    }
    parent.document.title = browserTitle;
    triggerTimeout();
  }
}

// function triggerTimeout() {
//   console.log("triggerTimeout");
//   if (window.onSessionTimedOut) {
//     window.onSessionTimedOut();
//   }
//   if (parent.frames.length > 1) {
//     for (var i = 0; i < parent.frames.length; i++) {
//       if (parent.frames[i].onSessionTimedOut) {
//         parent.frames[i].onSessionTimedOut();
//       }
//     }
//   }
// }
var standardWidth = 700;
var standardHeight = 500;

function openWindowWithSizeUrlNamePosition(width, height, winUrl, winName, mouseX, mouseY) {
  var x = mouseX - (width - (width / 10)),
    y = mouseY + (height / 3),
    options = "width=" + width + ",height=" + height + ",dependent=yes,scrollbars=yes,resizable=yes,left=" + x + ",top=" + y,
    newWindow = window.open(winUrl, winName, options);
  newWindow.focus();
  return newWindow;
}

function openWindowAtPosition(width, height, winName, mouseX, mouseY) {
  options = "width=" + width + ",height=" + height + ",dependent=yes,scrollbars=yes,resizable=yes,left=" + mouseX + ",top=" + mouseY, newWindow = window.open("", winName, options);
  newWindow.focus();
  return newWindow;
}

function openWindowWithUrlNamePosition(winUrl, winName, mouseX, mouseY) {
  return openWindowWithSizeUrlNamePosition(standardWidth, standardHeight, winUrl, winName, mouseX, mouseY);
}

function openWindowWithUrlName(winUrl, winName) {
  return openWindowWithSizeUrlName(standardWidth, standardHeight, winUrl, winName);
}

function openWindowWithSizeUrlName(width, height, winUrl, winName) {
  var xpos = screen.availWidth / 2 - width / 2,
    ypos = screen.availHeight / 2 - height / 2,
    options = "width=" + width + ",height=" + height + ",dependent=yes,resizable=yes,scrollbars=yes,left=" + xpos + ",top=" + ypos,
    newWin = window.open(winUrl, winName, options);
  if (newWin) {
    newWin.focus();
  }
  return newWin;
}

function openWindowWithSizeName(width, height, winName) {
  return openWindowWithSizeUrlName(width, height, "", winName);
}

function openWindowWithSizeUrl(width, height, winUrl) {
  return openWindowWithSizeUrlName(width, height, winUrl, "");
}

function openSdvPopupWithNamePosition(winName, mouseX, mouseY) {
  var x = mouseX + 50,
    y = mouseY - 50,
    options = "width=500,height=350,dependent=yes,scrollbars=yes,resizable=yes,left=" + x + ",top=" + y,
    newWin = window.open("", winName, options);
  newWin.focus();
  return newWin;
}
var waitingImages = [];

function addToWaitingImages(image) {
  waitingImages.push(image);
}

function runWaitingImages() {
  var lastImg = waitingImages.pop();
  if (lastImg) {
    lastImg.onmouseover();
  }
}
var mouseX = 200;
var mouseY = 200;
document.onmouseup = storePosition;

function storePosition(pos) {
  var tmpSaveNotice = document.getElementById("tmpSaveNotice");
  var tmpSaveNotice1 = document.getElementById("tmpSaveNotice1");
  if (!pos) {
    pos = window.event;
  }
  if (pos.clientX) {
    mouseX = pos.clientX;
    mouseY = pos.clientY;
  } else {
    if (pos.screenX) {
      mouseX = pos.screenX;
      mouseY = pos.screenY;
    }
  }
  sessionStorage.mouseX = mouseX;
  sessionStorage.mouseY = mouseY;
  if (tmpSaveNotice) {
    tmpSaveNotice.style.visibility = "collapse";
  }
  if (tmpSaveNotice1) {
    tmpSaveNotice1.style.visibility = "collapse";
  }
  setUserAction();
}
var isUserAction = false;

function setUserAction() {
  isUserAction = true;
}

function getYPosition() {
  var pos = 0;
  if (navigator.appVersion.indexOf("MSIE") < 0) {
    pos = window.pageYOffset;
  } else {
    pos = document.body.scrollTop;
    if (pos === 0) {
      pos = document.documentElement.scrollTop;
    }
  }
  if (document.forms[0]) {
    if (document.forms[0].pageYOffset) {
      document.forms[0].pageYOffset.value = pos;
    }
  }
}

function getPosition() {
  getPositionWithName(0);
}

function submitForm() {
  getPosition();
  if (document.forms[0]) {
    if (typeof (jQuery) !== "undefined") {
      $("form").first().trigger("submit");
    } else {
      document.forms[0].submit();
    }
  }
}

function getYPositionWithName(myFormName) {
  var pos = 0;
  if (navigator.appVersion.indexOf("MSIE") < 0) {
    pos = window.pageYOffset;
  } else {
    pos = document.body.scrollTop;
    if (pos === 0) {
      pos = document.documentElement.scrollTop;
    }
  }
  if (document.forms[myFormName]) {
    if (document.forms[myFormName].pageYOffset) {
      document.forms[myFormName].pageYOffset.value = pos;
    }
  }
}

function getPositionWithName(myFormName) {
  var posY = 0;
  var posX = 0;
  if (navigator.appVersion.indexOf("MSIE") < 0) {
    posY = window.pageYOffset;
    posX = window.pageXOffset;
  } else {
    posY = document.body.scrollTop;
    posX = document.body.scrollLeft;
    if (posY === 0) {
      posY = document.documentElement.scrollTop;
    }
    if (posX === 0) {
      posX = document.documentElement.scrollLeft;
    }
  }
  if (document.forms[myFormName]) {
    if (document.forms[myFormName].pageYOffset) {
      document.forms[myFormName].pageYOffset.value = posY;
    }
    if (document.forms[myFormName].pageXOffset) {
      document.forms[myFormName].pageXOffset.value = posX;
    }
  }
}

function submitFormWithName(myFormName) {
  getPositionWithName(myFormName);
  if (document.forms[myFormName]) {
    document.forms[myFormName].submit();
  }
}

function openRuleMessage() {
  var x = mouseX + 10,
    y = mouseY + 50,
    options = "width=200,height=120,dependent=yes,scrollbars=yes,resizable=yes,left=" + x + ",top=" + y;
  ruleWindow = window.open("", "ruleWin", options);
  ruleWindow.focus();
}

function openIconHelp(pWidth, pHeight) {
  var margin = 50,
    x = mouseX + 10,
    y = mouseY - 50;
  if (pWidth === undefined) {
    pWidth = 200;
  }
  if (pHeight === undefined) {
    pHeight = 200;
  }
  if ((x + pWidth + margin) > screen.width) {
    x = (screen.width - pWidth + margin);
  } else {
    if (x < 0) {
      x = margin;
    }
  }
  if ((y + pHeight + margin) > screen.height) {
    y = (screen.height - pWidth + margin);
  } else {
    if (y < 0) {
      y = margin;
    }
  }
  var options = "width=" + pWidth + ",height=" + pHeight + ",dependent=yes,scrollbars=yes,resizable=yes,left=" + x + ",top=" + y;
  helpWindow = window.open("", "help", options);
  helpWindow.focus();
}
var windowIsOpen;
var window2;
var windowBigger;
var windowSmall;
var windowHelp;
var uploadPopup;
var reportPopupWindow;

function closeSRTPopup() {
  if (windowIsOpen !== undefined && windowIsOpen !== null) {
    windowIsOpen.close();
    windowIsOpen = null;
  }
  if (top.windowIsOpen !== undefined && top.windowIsOpen !== null) {
    top.windowIsOpen.close();
    top.windowIsOpen = null;
  }
}

function closePopup(windowName) {
  if (windowName !== undefined && windowName !== null) {
    windowName.close();
    windowName = null;
  }
}

function closeAllWindowPopup() {
  closeSRTPopup();
  closePopup(window2);
  closePopup(windowBigger);
  closePopup(windowSmall);
  closePopup(windowHelp);
  closePopup(uploadPopup);
  closePopup(reportPopupWindow);
}
String.prototype.getFuncBody = function () {
  var str = this.toString();
  str = str.replace(/[^{]+{/, "");
  str = str.substring(0, str.length - 1);
  str = str.replace(/\n/gi, "");
  if (!str.match(/\(.*\)/gi)) {
    str += ")";
  }
  return str;
};

function disableLinksWithMessage(message) {
  var objLinks = document.links;
  for (var i = 0; i < objLinks.length; i++) {
    objLinks[i].disabled = true;
    if (objLinks[i].onclick) {
      objLinks[i].onclick = new Function("if (confirm('" + message + "')) { " + objLinks[i].onclick.toString().getFuncBody() + ";disableUploadWaitPage();} else {return false;}");
    } else {
      objLinks[i].onclick = new Function("if (confirm('" + message + "')) {disableUploadWaitPage();} else {return false;}");
    }
  }
}

function setFocus() {
  if (document.forms[0]) {
    if (document.forms[0].elements) {
      for (var i = 0; i < document.forms[0].elements.length; i++) {
        var element = document.forms[0].elements[i];
        if (element.type != "hidden" && !element.disabled) {
          element.focus();
          if (element.type == "text" || element.type == "password") {
            element.select();
          }
          break;
        }
      }
    }
  }
}

function setFocusInForm(formName) {
  if (document.forms[formName]) {
    if (document.forms[formName].elements) {
      for (var i = 0; i < document.forms[formName].elements.length; i++) {
        var element = document.forms[formName].elements[i];
        if (element.type != "hidden" && !element.disabled) {
          element.focus();
          if (element.type == "text" || element.type == "password") {
            element.select();
          }
          break;
        }
      }
    }
  }
}

function setFocusInFormOnFirstEmptyTextfield(formName) {
  if (document.forms[formName]) {
    if (document.forms[formName].elements) {
      for (var i = 0; i < document.forms[formName].elements.length; i++) {
        var element = document.forms[formName].elements[i];
        if (element.type === "text" && !element.disabled && element.value === "") {
          element.focus();
          element.select();
          break;
        }
      }
    }
  }
}

function revealElement(elementID) {
  var element = document.getElementById(elementID);
  if (element !== null) {
    element.style.visibility = "visible";
  }
}

function concealElement(elementID) {
  var element = document.getElementById(elementID);
  if (element !== null) {
    element.style.visibility = "hidden";
  }
}

function showElement(elementID) {
  var element = document.getElementById(elementID);
  if (element !== null) {
    element.style.display = "block";
  }
}

function hideElement(elementID) {
  var element = document.getElementById(elementID);
  if (element !== null) {
    element.style.display = "none";
  }
}

function click(e) {
  if (!e) {
    e = window.event;
  }
  if ((e.type && e.type === "contextmenu") || (e.button && e.button === 2) || (e.which && e.which === 3)) {
    if (window.opera) {
      window.alert("Sorry: function disabled.");
    }
    return false;
  }
}
secuTrial.CVP = function () {
  var _wrapper = document.getElementById("navigationMatrix"),
    _ffn = document.getElementById("formFamilyNames"),
    _cvp = document.getElementById("casevisitplan");

  function _init() {
    _resize();
    if (window.addEventListener) {
      window.addEventListener("resize", _resize, false);
    } else {
      window.onresize = function (pEvent) {
        _resize();
      };
    }
  }

  function _resize(evt) {
    var wrapperWidth = _wrapper.offsetWidth,
      ffnWidth = _ffn.offsetWidth,
      cvpWidth = _cvp.offsetWidth,
      cvpTop = _cvp.offsetTop,
      ffnTop = _ffn.offsetTop,
      cvpOffset = 95;
    if (navigator.appVersion.indexOf("MSIE") !== -1) {
      _cvp.style.padding = "0 0 10px 0";
    }
    var _cvpTable = document.getElementById("cvptable");
    _cvp.style.width = ($(window).width() - ffnWidth - cvpOffset + 65) + "px";
    if (cvpTop !== ffnTop) {
      _resize(evt);
    }
    var slValue = getCookieByName("st_sl");
    if (slValue !== null && slValue !== undefined) {
      document.querySelector("#casevisitplan").scrollLeft = slValue;
    }
  }

  function handleDisplay() {
    _init();
  }
  return {
    handleDisplay: handleDisplay
  };
};
secuTrial.Input = {};
secuTrial.Input.moveFocus = function (pEvent, pElement) {
  var $element, $nextElement, $inputs, inputValue, maxlength, nextIndex, keyCode = pEvent.which || pEvent.keyCode;
  if (keyCode === 9 || keyCode === 16) {
    return;
  }
  $element = $(pElement);
  $inputs = $element.closest("tr").find("input:not(:hidden)");
  maxlength = $element.prop("maxlength");
  inputValue = $element.val();
  if (inputValue && inputValue.length >= maxlength) {
    nextIndex = $inputs.index($element) + 1;
    if (nextIndex < $inputs.size()) {
      $nextElement = $inputs.get(nextIndex);
      $nextElement.focus();
      $nextElement.select();
    }
  }
};
secuTrial.Input.completeDate = function (pEvent, pElement) {
  var $element = $(pElement),
    inputValue = $element.val();
  if (inputValue && inputValue.length === 1) {
    $element.val("0" + inputValue);
  }
};
secuTrial.FormExitConfirmation = function (pMessageString, pFormIdString) {
  var defaultFormId = "dataForm",
    formId = pFormIdString || defaultFormId,
    $form = $("#" + formId),
    doShowDialog = true;
  $form.on("submit", function () {
    doShowDialog = false;
  });
  if (isEventSupported("beforeunload", window)) {
    window.onbeforeunload = function () {
      if (!doShowDialog) {
        return;
      }
      return pMessageString;
    };
  } else {
    window.onunload = function () {
      alert(pMessageString);
    };
  }
};
secuTrial.ui = {};
secuTrial.ui.MakeSortableTables = function () {
  $("table.st-sortable").each(function () {
    var $tbody, element, fnMouseOut, toggleBackground;
    $tbody = $(this).children("tbody");
    if ($tbody.length < 1) {
      $tbody = $("<tbody/>");
      $(this).children().wrapAll($tbody);
    }
    if ($tbody.children().length > 1) {
      toggleBackground = $tbody.children(".generalbgcolor").length > 0 || $tbody.children(".whitebgcolor").length > 0;
      $tbody.sortable({
        axis: "y",
        containment: $(this),
        cursor: "move",
        handle: ".st-sortable-handle",
        start: function (event, ui) {
          element = ui.item.get(0);
          fnMouseOut = element.onmouseout;
          element.onmouseout = null;
        },
        stop: function (event, ui) {
          $tbody.children().each(function (pIndex) {
            $(this).toggleClass("generalbgcolor", (toggleBackground && pIndex % 2 === 0)).toggleClass("whitebgcolor", (toggleBackground && pIndex % 2 !== 0)).find("input.st-sortable-position").val((pIndex + 1) * 10);
          });
          $(ui.item.get(0)).find(".st-sortable-handle").hide();
          ui.item.get(0).onmouseout = fnMouseOut;
        }
      });
      $tbody.children().each(function () {
        var $self = $(this);
        this.onmouseover = function () {
          $self.find(".st-sortable-handle").css("display", "flex");
        };
        this.onmouseout = function () {
          $self.find(".st-sortable-handle").hide();
        };
        $self.children(":first-child").css("position", "relative").prepend('<div class="st-sortable-handle">&varr;</div>');
      });
    }
  });
};
secuTrial.ui.VAS = {
  MakeInteractive: function (pOptions) {
    var $containerElement = $("#" + pOptions.id),
      $track = $containerElement.find(".st-vas-track"),
      $thumb = $containerElement.find(".st-vas-thumb"),
      $valueField = $containerElement.find("input"),
      min = pOptions.min || 0,
      max = pOptions.max || 100,
      toFixedNumber = function (pNumber) {
        var pow = Math.pow(10, pOptions.precision);
        return Math.round(pNumber * pow) / pow;
      },
      adjustThumb = function (pOffset) {
        var range = max - min,
          width = $track.width(),
          value = toFixedNumber(Math.max(0, Math.min(range, range / width * pOffset))),
          offset = width / range * value;
        value = (value + min).toFixed(pOptions.precision);
        $thumb.css({
          left: offset
        });
        setValue(value);
      },
      setValue = function (pValue) {
        $valueField.val(pValue);
        $containerElement.trigger("change");
      };
    $track.on("click", function (event) {
      $thumb.css({
        visibility: "visible",
        left: event.offsetX
      });
      adjustThumb(event.offsetX);
    }).css("cursor", "pointer");
    $thumb.draggable({
      axis: "x",
      containment: $track,
      stop: function (event, ui) {
        adjustThumb(ui.position.left);
      }
    }).css("cursor", "ew-resize");
    $containerElement.on("dblclick", function (event) {
      $thumb.css({
        visibility: "hidden",
        left: 0
      });
      setValue(null);
    });
  }
};
var isEventSupported = (function (undef) {
  var TAGNAMES = {
    select: "input",
    change: "input",
    submit: "form",
    reset: "form",
    error: "img",
    load: "img",
    abort: "img"
  };

  function isEventSupported(eventName, element) {
    element = element || document.createElement(TAGNAMES[eventName] || "div");
    eventName = "on" + eventName;
    var isSupported = (eventName in element);
    if (!isSupported) {
      if (!element.setAttribute) {
        element = document.createElement("div");
      }
      if (element.setAttribute && element.removeAttribute) {
        element.setAttribute(eventName, "");
        isSupported = typeof element[eventName] == "function";
        if (typeof element[eventName] != "undefined") {
          element[eventName] = undef;
        }
        element.removeAttribute(eventName);
      }
    }
    element = null;
    return isSupported;
  }
  return isEventSupported;
})();
var isEventSupportedWithCache = (function (undef) {
  var TAGNAMES = {
    select: "input",
    change: "input",
    submit: "form",
    reset: "form",
    error: "img",
    load: "img",
    abort: "img"
  },
    cache = {};

  function isEventSupported(eventName, element) {
    var canCache = (arguments.length == 1);
    if (canCache && cache[eventName]) {
      return cache[eventName];
    }
    element = element || document.createElement(TAGNAMES[eventName] || "div");
    eventName = "on" + eventName;
    var isSupported = (eventName in element);
    if (!isSupported) {
      if (!element.setAttribute) {
        element = document.createElement("div");
      }
      if (element.setAttribute && element.removeAttribute) {
        element.setAttribute(eventName, "");
        isSupported = typeof element[eventName] == "function";
        if (typeof element[eventName] != "undefined") {
          element[eventName] = undef;
        }
        element.removeAttribute(eventName);
      }
    }
    element = null;
    return canCache ? (cache[eventName] = isSupported) : isSupported;
  }
  return isEventSupported;
})();