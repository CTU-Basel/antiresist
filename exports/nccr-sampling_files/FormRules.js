var secuTrial;
if (secuTrial === undefined) {
  secuTrial = {};
}
secuTrial.FormRules = {};
secuTrial.FormRules.Utils = {
  calculateNumberFieldValue: function (pElement, pFactor) {
    var $parentElement = $(pElement).closest("tr"),
      $inputLeft = $parentElement.find(".numberField_left"),
      $inputRight = $parentElement.find(".numberField_right"),
      $hiddenValueElement = $parentElement.find("input:hidden"),
      numberValue, factor = pFactor || 1,
      leadingZeroRegex = /^0+(?!$)/g;
    numberValue = $inputLeft.val();
    if ($inputRight !== undefined && $inputRight !== null && $inputRight.length > 0) {
      numberValue += "." + $inputRight.val();
    }
    numberValue = numberValue.replace(leadingZeroRegex, "");
    if (numberValue === "") {
      numberValue = "null";
    } else {
      numberValue = numberValue / factor;
      if (isNaN(numberValue)) {
        numberValue = "null";
      }
    }
    $hiddenValueElement.val(numberValue);
  },
  calculateDateFieldValue: function (pElement) {
    var $parentElement = $(pElement).closest("tr"),
      $inputYear = $parentElement.find(".dateField_yyyy"),
      $inputMonth = $parentElement.find(".dateField_MM"),
      $inputDay = $parentElement.find(".dateField_dd"),
      $inputHour = $parentElement.find(".dateField_HH"),
      $inputMinute = $parentElement.find(".dateField_mm"),
      $inputSecond = $parentElement.find(".dateField_ss"),
      $hiddenValueElement = $parentElement.find("input:hidden"),
      dateInputs = [$inputYear, $inputMonth, $inputDay, $inputHour, $inputMinute, $inputSecond],
      $dateInput, dateInputValue, dateValue = "",
      emptyValue = "    ",
      fillValue = "0000",
      replaceRegex = /[0| ]/g,
      replacedDateValue;
    for (var i = 0; i < dateInputs.length; i++) {
      if (i > 0) {
        fillValue = "00";
      }
      $dateInput = dateInputs[i];
      if ($dateInput !== undefined && $dateInput !== null && $dateInput.length > 0) {
        dateInputValue = $dateInput.val();
        if (dateInputValue.length < fillValue.length) {
          dateInputValue = fillValue.slice(dateInputValue.length) + dateInputValue;
        }
        dateValue += dateInputValue;
      } else {
        dateValue += emptyValue.slice(fillValue.length);
      }
    }
    replacedDateValue = dateValue.replace(replaceRegex, "");
    if (replacedDateValue.length < 1) {
      dateValue = null;
    }
    $hiddenValueElement.val(dateValue);
  }
};
secuTrial.FormRules.Engine = function () {
  var _animated = false,
    _rulesSets = {},
    _conditions = {},
    _actions = {
      show: function (p$Element) {
        p$Element.prop("disabled", false);
        p$Element.find(":input").each(function (index, element) {
          var $element = $(element),
            id = $(element).attr("id"),
            rules = null;
          $element.prop("disabled", false);
          if (id !== undefined && id !== null) {
            rules = _rulesSets[id];
            if (rules !== undefined && rules !== null) {
              $.each(rules, function (index, rule) {
                _evaluateRule($element, rule);
              });
            }
          }
        });
        if (_animated) {
          p$Element.slideDown("fast", function () {
            p$Element.fadeIn("fast");
          });
        } else {
          p$Element.show();
        }
      },
      hide: function (p$Element) {
        var $inputs = p$Element.find(":input").prop("disabled", true),
          animated = _animated;
        p$Element.prop("disabled", true);
        if (animated && p$Element.not(":hidden").length > 0) {
          p$Element.fadeOut("fast", function () {
            p$Element.slideUp("fast");
          });
        } else {
          p$Element.hide();
        }
      },
      emphasize: function (p$Element) {
        p$Element.addClass("emphasized");
      },
      deemphasize: function (p$Element) {
        p$Element.removeClass("emphasized");
      }
    };

  function _init(pRuleSets) {
    var $element, rules;
    _animated = false;
    $.each(pRuleSets, function (pIndex, pRuleSet) {
      _rulesSets[pRuleSet.elementId] = pRuleSet.rules;
    });
    for (var elementId in _rulesSets) {
      $element = $("#" + elementId);
      rules = _rulesSets[elementId];
      _setRules($element, rules);
    }
    _animated = true;
  }

  function _setRules(p$Element, pRules) {
    var ruleEvent;
    $.each(pRules, function (pIndex, pRule) {
      _evaluateRule(p$Element, pRule);
      if (pRule.event !== undefined && pRule.event !== null && pRule.event.length > 0) {
        ruleEvent = pRule.event;
      } else {
        ruleEvent = "change";
      }
      p$Element.on(ruleEvent, function () {
        _evaluateRule($(this), pRule);
      });
    });
  }

  function _evaluateCondition(p$Element, pRule) {
    var condition = pRule.condition,
      orCondition = null,
      andCondition = null,
      andConditionString = null,
      conditionString = "",
      i, j, lhsValue, rhsValue, $valueElement;
    if (typeof condition === "function") {
      return condition(p$Element);
    }
    if (typeof condition === "string") {
      return _conditions[condition](p$Element);
    }
    if (typeof condition === "object") {
      if (condition.length < 1) {
        return true;
      }
      for (i = 0; i < condition.length; i++) {
        orCondition = condition[i];
        andConditionString = "(";
        for (j = 0; j < orCondition.length; j++) {
          andCondition = orCondition[j];
          if (andConditionString !== "(") {
            andConditionString += " && ";
          }
          if (andCondition.lhsValue !== undefined) {
            lhsValue = andCondition.lhsValue;
          } else {
            $valueElement = $(andCondition.lhsSelector);
            if ($valueElement.prop("tagName") === "IMG") {
              lhsValue = $valueElement.length;
            } else {
              if (($valueElement.parent() && $valueElement.parent().attr("class") && $valueElement.parent().attr("class").indexOf("lookup") >= 0) && $valueElement.prop("tagName") === "OPTION" && $valueElement.val() !== "WONoSelectionString") {
                lhsValue = $valueElement.text();
              } else {
                lhsValue = $valueElement.val();
              }
            }
          }
          if (lhsValue === undefined || lhsValue === null || lhsValue === "WONoSelectionString" || lhsValue.length < 1) {
            lhsValue = "null";
          }
          if (andCondition.rhsValue !== undefined) {
            rhsValue = andCondition.rhsValue;
          } else {
            rhsValue = $(andCondition.rhsSelector).val();
          }
          if (rhsValue === undefined || rhsValue === null || rhsValue.length < 1) {
            rhsValue = "null";
          }
          if (andCondition.operator === "contains" || andCondition.operator === "not_contains") {
            if (lhsValue === "null" || rhsValue === "null") {
              andConditionString += "false";
            } else {
              lhsValue = lhsValue.toString().replace(/\n/g, "\\n");
              rhsValue = rhsValue.toString().replace(/([\/()[{*+.$^\\|?])/g, "\\$1");
              andConditionString += (andCondition.operator === "not_contains" ? "!" : "") + (lhsValue.search(new RegExp(rhsValue, "i")) !== -1);
            }
          } else {
            if ((isNaN(lhsValue) && lhsValue !== "null") || (isNaN(rhsValue) && rhsValue !== "null")) {
              lhsValue = '"' + lhsValue.toString().replace(/(\r\n|\n|\r)/gm, "\\n") + '"';
              rhsValue = '"' + rhsValue.toString().replace(/(\r\n|\n|\r)/gm, "\\n") + '"';
            } else {
              if (lhsValue !== "null") {
                lhsValue = Number(lhsValue);
              }
              if (rhsValue !== "null") {
                rhsValue = Number(rhsValue);
              }
            }
            if ((andCondition.operator === "<" || andCondition.operator === "<=" || andCondition.operator === ">" || andCondition.operator === ">=") && (lhsValue === "null" && !isNaN(rhsValue) || rhsValue === "null" && !isNaN(lhsValue))) {
              andConditionString += "false";
            } else {
              andConditionString += "(" + lhsValue + " " + andCondition.operator + " " + rhsValue + ")";
            }
          }
        }
        andConditionString += ")";
        if (conditionString !== "") {
          conditionString += " || ";
        }
        conditionString += (andConditionString);
      }
      return eval(conditionString + ";");
    }
    return pRule.condition;
  }

  function _getAction(pAction) {
    if (pAction !== undefined && pAction !== null) {
      if (typeof pAction === "string") {
        return _actions[pAction];
      }
      return pAction;
    }
    return null;
  }

  function _evaluateRule(p$Element, pRule) {
    var conditionMatch = _evaluateCondition(p$Element, pRule),
      action = null,
      $target;
    if (conditionMatch) {
      if (pRule.matchAction === undefined || pRule.matchAction === null) {
        action = _getAction("hide");
      } else {
        action = _getAction(pRule.matchAction);
      }
    } else {
      if (pRule.failAction === undefined || pRule.failAction === null) {
        action = _getAction("show");
      } else {
        action = _getAction(pRule.failAction);
      }
    }
    if (action !== null) {
      if (pRule.target !== undefined && pRule.target !== null) {
        $target = $("" + pRule.target);
      } else {
        $target = $(this);
      }
      action($target);
    }
  }

  function run(pRuleSets) {
    var ruleSets = pRuleSets || secuTrial.FormRules.RuleSets;
    if (ruleSets !== undefined && ruleSets !== null) {
      $(document).ready(function () {
        _init(ruleSets);
      });
    }
  }
  return {
    run: run
  };
};