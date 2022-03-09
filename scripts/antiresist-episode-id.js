// use an immediately invoked function to avoid pollution of the global
// variable namespace
(function () {

    // initialize a namespace for all dkf customizations
    if (!window.dkf) {
        window.dkf = {}
    }

    // nothing further to do, if if the window is already initialized
    if (window.dkf._initialized) {
        return
    } else {
        window.dkf._initalized = true
    }

    // initialize is used to initialize the custom form functionality
    var _initialize = function () {

        // get all episode and episode plus id fields
        var episodeIds = $("input[name^='ff_episode_uniqid_']");
        var episodePlusIds = $('[name^=ff_episode_uniqidsit_]');

        // define a list of required fields
        var episodeIdVars = {
            episodeId: { baseName: 'ff_episode_uniqid', scope: 'form', value: '', isID: true },
            mainGroup: { baseName: 'ff_episode_maingrp', scope: 'form', value: '' },
            episodeNo: { baseName: 'ff_episode_nmb', scope: 'form', value: '' },
            episodeClass: { baseName: 'ff_episode_class', scope: 'form', value: '' },
        }

        // define a list of required fields
        var episodePlusIdVars = {
            episodeId: { baseName: 'ff_episode_uniqid', scope: 'form', value: '', isID: true },
            episodePlusId: { baseName: 'ff_episode_uniqidsit', scope: 'repetition', value: '', isID: true },
            mainGroup: { baseName: 'ff_episode_maingrp', scope: 'form', value: '' },
            episodeNo: { baseName: 'ff_episode_nmb', scope: 'form', value: '' },
            episodeClass: { baseName: 'ff_episode_class', scope: 'form', value: '' },
            infColsite: { baseName: 'ff_inf_d_colsite', scope: 'repetition', value: '' },
            infType: { baseName: 'ff_inf_type', scope: 'repetition', value: '' },
            bji_loc: { baseName: 'ff_inf_bji_loc', scope: 'repetition', value: '' },
            bji_ssti_side: { baseName: 'ff_inf_ssti_bji_side', scope: 'repetition', value: '' },
            ssti_loc: { baseName: 'ff_inf_ssti_loc', scope: 'repetition', value: '' },
        }

        // make some fields readonly
        _makeReadonly(episodeIds, episodePlusIds)

        // add custom buttons to generate ids
        _addButtons(episodeIds, _handleGenerateEpisodeId, episodeIdVars);
        _addPopupLinks(episodeIds, 'Episode ID');

        if (episodePlusIds.length > 0) {
            // resize the episodePlusIds fields
            episodePlusIds.css('max-width', '300px');
        }

        // add custom functionality to generate episode plus ids
        _addButtons(episodePlusIds, _handleGenerateEpisodePlusId, episodePlusIdVars);
        _addPopupLinks(episodePlusIds, 'Episode ID PLUS site');

        // watch the form for changes
        _watchForChanges(episodePlusIdVars);

    };

    var _makeReadonly = function (episodeIDs, episodePlusIds) {
        // define styling for readonly fields
        var readonlyStyle = {
            opacity: 0.7,
            outline: 'none',
        }
        episodeIDs.attr('readonly', 'readonly').css(readonlyStyle);
        episodePlusIds.attr('readonly', 'readonly').css(readonlyStyle);
        $('[name^=ff_episode_nmb]').attr('readonly', 'readonly').css(readonlyStyle);

        // select fields need to be handled differently, we cannot disable the
        // field, since this will exclude it from jquery serializeArray and might
        // lead to problems with the built-in secutrial functionality
        $('[name^=ff_episode_maingrp]').css(readonlyStyle).click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            alert('Do not change this field');
        });

    }

    // _watchForChanges will watch all relevant fields in the form for changes
    // and alert the user of possible problems with the generated id
    var _watchForChanges = function (vars) {

        var episodeAlertMessage = 'Attention: You changed a variable that is relevant for the Episode ID, but an Episode ID was already generated.\n\nPlease generate the Episode ID again by clicking again on the "Generate ID"-Button. If you have already copied the ID into other forms, please update the ID there as well.';

        var episodePlusAlertMessage = 'Attention: You changed a variable that is relevant for the Episode ID and Episode ID PLUS site, but an Episode ID and/or an Episode ID PLUS site was already generated.\n\nPlease generate the Episode ID and the Episode ID PLUS site again by clicking again on the "Generate ID"-Button. If you have already copied the ID into other forms, please update the ID there as well.';

        // select all elements with a name attribute in the main form
        // $(form).serializeArray cannot be used, since this will exclude all
        // disabled items (which there are quite a few of)
        var fields = $('[name]', 'form#dataForm');

        // create an easy to access index for our variables
        let index = Object.values(vars).reduce(function (list, item) {
            list[item.baseName] = { scope: item.scope, isID: item.isID };
            return list;
        }, {});

        // remove all numbers and underscore from the end of the name
        var trimRegExp = new RegExp("[0-9_]+$");

        // define the current socpe and the currently relevant id field
        var scope = null;
        var currentIdField = null;

        // iterate through all fields
        for (var i = fields.length - 1; i >= 0; i--) {

            var field = $(fields[i]);
            var fieldName = field.attr('name');
            var baseName = fieldName.replace(trimRegExp, '');

            var currentVar = index[baseName];

            // nothing to do if the element is not in our base array
            if (!currentVar) continue;

            if (currentVar.isID == true && currentVar.scope == 'repetition') {
                scope = 'episode-plus';
                currentIdField = field;
                continue;
            }

            if (currentVar.isID == true && currentVar.scope == 'form') {
                scope = 'episode';
                currentIdField = field;
                continue;
            }

            // use a new closure to capture the current value of the id field
            // and scope
            var tmp = function (scope, pId) {
                field.bind('change', function (event) {
                    var value = pId.val();

                    // nothing to do, if the associated id field is empty
                    if (value == '') return;

                    switch (scope) {
                        case 'episode':
                            alert(episodeAlertMessage);
                            break;
                        case 'episode-plus':
                            alert(episodePlusAlertMessage);
                            break;
                    }
                });
            }
            tmp(scope, currentIdField);

        }

    };

    // addPopupLink will add a link to all given fields to export the current
    // patient id and respective id to a separate popup window
    var _addPopupLinks = function (fields, label) {

        // return if there are no fields
        if (!fields || fields.length == 0) return;

        // go through all fields and append a button, if there is not already a button
        fields.each(function () {

            var field = $(this);

            // nothing to do, if there is already a respective button
            if ($('a.dkf-popup-window', field.parent()).length > 0) {
                return;
            }

            // create a link to open the id in a separate window
            var popupLink = document.createElement('a');
            popupLink.className = 'dkf-popup-window';
            popupLink.style.marginLeft = '8px';
            popupLink.style.textDecoration = 'underline';
            popupLink.style.cursor = 'pointer';
            popupLink.innerHTML = "To separate window";

            popupLink.onclick = function (event) {
                // prevent the browser from firing the default events
                event.preventDefault();
                event.stopPropagation();
                // send the id of the current sample to a separate window
                _handlePopupClick(field, label);
            };

            // append the popup link to the parent element of the field
            field.parent().append(popupLink);
        })

    }

    // handlePopupClick will display the current id in a separate window
    var _handlePopupClick = function (idField, label) {
        var patID = $('#status_add-id').text().trim();
        if (!patID || patID == '') patID = '[NOT FOUND]';

        // get the current value from the id field
        var id = $(idField).val();
        if (!id) id = '[EMPTY]';

        // open the information about the patient and sample id in a separate window
        var popup = window.open("", "antiresist-ids", "width=600,height=200,popup=yes");
        popup.document.write("<p><b>Patient ID:</b>&nbsp;" + patID + "&nbsp;&nbsp;<b>" + label + ": </b>&nbsp;" + id + "</p>");
    }

    // addButtons will add "generate id" buttons to all given fields
    var _addButtons = function (fields, callbackFunction, variables) {

        // return if there are no fields
        if (!fields || fields.length == 0) return;

        // go through all fields and append a button, if there is not already a button
        fields.each(function () {

            var field = $(this);

            // nothing to do, if there is already a respective button
            if ($('button.dkf-generate-id', field.parent()).length > 0) {
                return;
            }

            // create a new button to generate an id
            var idButton = document.createElement('button');
            idButton.innerHTML = 'Generate ID';
            idButton.className = 'dkf-generate-id';
            idButton.style.marginLeft = '8px';

            idButton.onclick = function (event) {
                // prevent the browser from firing the default events, which could
                // trigger a form submission
                event.preventDefault();
                event.stopPropagation();
                // initiate the given callback function
                callbackFunction(field, variables);
            };

            // append the button to the parent element of the field
            field.parent().append(idButton);

        })
    };

    // handleGenerateEpisodeId will generate an episode id
    var _handleGenerateEpisodeId = function (idField, vars) {

        // fetch the value of the current field
        let sampleId = idField.val();
        if (sampleId && sampleId != '') {
            // inform the user, that it might be dangerous to overwrite this id
            // and require them to explictely demand and overwrite.
            var answer = prompt(
                'This id is already specified, ' +
                'please type OVERWRITE to regenerate the current id. ' +
                '\n\nAttention: This might have serious consequences.'
            );
            if (!answer || answer.toLowerCase() != 'overwrite') {
                return;
            }
        }

        // get a list of all relevant fields (by baseName)
        var relevantFields = Object.keys(vars).map(function (item) {
            return vars[item].baseName;
        });

        // gather the current form data, this will return fields and error
        // information
        var result = _gatherFormData(relevantFields);
        if (_hasErrors(result)) {
            result._errors.unshift("ERROR: Could not gather form data:")
            alert(result._errors.join("\n- "));
            return;
        }

        // generate a sample id from the form data
        result = _generateEpisodeId(vars, result.fields);
        if (_hasErrors(result)) {
            alert(result._errors.join("\n- "));
            return
        }

        // set the sample id into the given field. note: this also works if the 
        // field is set to readonly
        idField.val(result.vars.episodeId);

    };

    // generateEpisodeId will process the given form data to generate an episode id
    var _generateEpisodeId = function (vars, fields) {

        // initialize the result information, this allows us to pass errors
        // along to the caller
        var result = {
            vars: null,
            _errors: [],
        };

        // create an index for the variables
        var varsIndex = Object.keys(vars).reduce(function (list, key) {
            list[vars[key].baseName] = vars[key];
            return list;
        }, {});

        // parse the content of the fields from the end of the form upwards
        for (var i = 0; i < fields.length; i++) {

            var field = fields[i];

            // try to find the variable in our variable list
            let currentVar = varsIndex[field.baseName];

            // check if the base fieldname matches one of those we are looking for
            if (!currentVar) {
                result._errors.push('field not found ' + field.name);
                continue;
            }

            // only extract data if it is still in the same scope as the 
            // currently required id
            if (field.value != '') {
                currentVar.value = field.value;
            }
        }

        // stop processing, if there were errors gathering the data
        if (result._errors.length > 0) {
            return result;
        }

        // reduce the variables only to their values
        dta = Object.keys(vars).reduce(function (list, key) {
            list[key] = vars[key].value;
            return list;
        }, {});

        // --- check if all required values have been provided
        if (_isEmpty(dta.mainGroup) || _isEmpty(dta.episodeNo) || _isEmpty(dta.episodeClass)) {
            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            result._errors.push('Episode ID could not be generated. Some input is missing:\n\n' +
                (_isEmpty(dta.mainGroup) ? '!! Missing: ' : 'OK: ') + 'Main anatomic group\n' +
                (_isEmpty(dta.episodeNo) ? '!! Missing: ' : 'OK: ') + 'Episode number\n' +
                (_isEmpty(dta.episodeClass) ? '!! Missing: ' : 'OK: ') + 'Episode class\n');
            return result;
        }

        // define encondings
        var encoding = {
            mainGroup: {
                'Deep-seated': 'Deep',
                'Urine': 'Urine',
                'Tracheal/pulmonal': 'Tracheal',
            },
            episodeClass: {
                'infection': '_infection',
                'colonisation': '_colonisation',
                'no growth, no infection (control)': '_nogrowth.noinfection',
            }
        };

        // check if the fields match our encoding
        if (encoding.mainGroup.hasOwnProperty(dta.mainGroup) == false) {
            result._errors.push('Main anatomic group not found: ' + dta.mainGroup);
        }
        if (encoding.episodeClass.hasOwnProperty(dta.episodeClass) == false) {
            result._errors.push('Episode class not found: ' + dta.episodeClass);
        }

        if (result._errors.length > 0) {
            return result;
        }

        // generate our episode id
        dta.episodeId = '';
        dta.episodeId += encoding.mainGroup[dta.mainGroup];
        dta.episodeId += dta.episodeNo;
        dta.episodeId += encoding.episodeClass[dta.episodeClass];

        result.vars = dta;
        return result;
    };

    // handleGenerateEpisodePlusId will generate an episode plus id for deep
    // seated infections
    var _handleGenerateEpisodePlusId = function (idField, vars) {

        // fetch the value of the current field
        let sampleId = idField.val();
        if (sampleId && sampleId != '') {
            // inform the user, that it might be dangerous to overwrite this id
            // and require them to explictely demand and overwrite.
            var answer = prompt(
                'This id is already specified, ' +
                'please type OVERWRITE to regenerate the current id. ' +
                '\n\nAttention: This might have serious consequences.'
            );
            if (!answer || answer.toLowerCase() != 'overwrite') {
                alert('Id was NOT regenerated');
                return;
            }
        }

        // get a list of all relevant fields (by baseName)
        var relevantFields = Object.keys(vars).map(function (item) {
            return vars[item].baseName;
        });

        // gather the current form data, this will return fields and error
        // information
        var result = _gatherFormData(relevantFields);
        if (_hasErrors(result)) {
            result._errors.unshift("ERROR: Could not gather form data:")
            alert(result._errors.join("\n- "));
            return;
        }

        // generate a sample id from the form data
        var fieldName = idField.attr('name');
        result = _generateEpisodePlusId(fieldName, vars, result.fields);
        if (_hasErrors(result)) {
            alert(result._errors.join("\n- "));
            return
        }

        // set the sample id into the given field. note: this also works if the 
        // field is set to readonly
        idField.val(result.vars.episodePlusId);

    };

    // generateEpisodePlusId will process the given form data to generate an episode id
    var _generateEpisodePlusId = function (idFieldName, vars, fields) {

        // initialize the result information, this allows us to pass errors
        // along to the caller
        var result = {
            vars: null,
            _errors: [],
        };

        // create an index for the variables
        var varsIndex = Object.keys(vars).reduce(function (list, key) {
            list[vars[key].baseName] = vars[key];
            return list;
        }, {});

        var isRepetitionGroup = false;

        // parse the content of the fields from the end of the form upwards
        for (var i = fields.length - 1; i >= 0; i--) {

            var field = fields[i];

            // if we found our id group, then we are in
            if (field.name == idFieldName) {
                console.log('is in rep group', field.name);
                isRepetitionGroup = true;
            }

            // try to find the variable in our variable list
            let currentVar = varsIndex[field.baseName];

            // check if the base fieldname matches one of those we are looking for
            if (!currentVar) {
                result._errors.push('field not found ' + field.name);
                continue;
            }

            if (currentVar.scope == 'repetition' && isRepetitionGroup == false) {
                continue;
            }

            // check if we are at the end of the repetition group to stop any 
            // further data extraction
            if (field.baseName == "ff_inf_d_colsite" || field.baseName == "ff_inf_type") {
                isRepetitionGroup = false;
            }

            // only extract data if it is still in the same scope as the 
            // currently required id
            if (field.value != '') {
                currentVar.value = field.value;
            }

        }

        // stop processing, if there were errors gathering the data
        if (result._errors.length > 0) {
            return result;
        }

        // reduce the variables only to their values
        dta = Object.keys(vars).reduce(function (list, key) {
            list[key] = vars[key].value;
            return list;
        }, {});

        // TODO: this is really hard to understand. Should be split into
        // multiple statements
        if (_isEmpty(dta.mainGroup) || _isEmpty(dta.episodeNo) ||
            _isEmpty(dta.episodeClass) ||
            dta.episodeClass == 'infection' && _isEmpty(dta.infType) ||
            dta.episodeClass != 'infection' && _isEmpty(dta.infColsite) ||
            ((dta.episodeClass == 'infection' && dta.infType == 'bone and joint infection' ||
                dta.episodeClass != 'infection' && dta.infColsite == 'bone or joint') && (_isEmpty(dta.bji_loc) ||
                    _isEmpty(dta.bji_ssti_side))) ||
            ((dta.episodeClass == 'infection' && dta.infType == 'skin and soft tissue infection without bone or joint involvement' ||
                dta.episodeClass != 'infection' && dta.infColsite == 'skin and soft tissue') && (_isEmpty(dta.ssti_loc) ||
                    _isEmpty(dta.bji_ssti_side)))) {

            // check for each value if it is not empty and inform the user
            var info = 'Episode ID PLUS site could not be generated. Some input is missing:\n\n' +
                (_isEmpty(dta.mainGroup) ? '!! Missing: ' : 'OK: ') + 'Main anatomic group\n' +
                (_isEmpty(dta.episodeNo) ? '!! Missing: ' : 'OK: ') + 'Episode number\n' +
                (_isEmpty(dta.episodeClass) ? '!! Missing: ' : 'OK: ') + 'Episode class\n' +
                (dta.episodeClass == 'infection' ? (_isEmpty(dta.infType) ? '!! Missing: ' : 'OK: ') + 'Type of infection\n' : '') +
                (dta.episodeClass != 'infection' ? (_isEmpty(dta.infColsite) ? '!! Missing: ' : 'OK: ') + 'Anatomic site of sampling\n' : '') +
                ((dta.episodeClass == 'infection' && dta.infType == 'bone and joint infection') || (dta.episodeClass != 'infection' && dta.infColsite == 'bone or joint') ? (_isEmpty(dta.bji_loc) ? '!! Missing: ' : 'OK: ') + 'Anatomical location\n' : '') +
                ((dta.episodeClass == 'infection' && dta.infType == 'bone and joint infection') || (dta.episodeClass != 'infection' && dta.infColsite == 'bone or joint') ? (_isEmpty(dta.bji_ssti_side) ? '!! Missing: ' : 'OK: ') + 'Anatomical side\n' : '') +
                ((dta.episodeClass == 'infection' && dta.infType == 'skin and soft tissue infection without bone or joint involvement') || (dta.episodeClass != 'infection' && dta.infColsite == 'skin and soft tissue') ? (_isEmpty(dta.ssti_loc) ? '!! Missing: ' : 'OK: ') + 'Anatomical location\n' : '') +
                ((dta.episodeClass == 'infection' && dta.infType == 'skin and soft tissue infection without bone or joint involvement') || (dta.episodeClass != 'infection' && dta.infColsite == 'skin and soft tissue') ? (_isEmpty(dta.bji_ssti_side) ? '!! Missing: ' : 'OK: ') + 'Anatomical side\n' : '');
            result._errors.push(info);
            return result;

        }

        // define encodings
        var encoding = {
            mainGroup: {
                'Deep-seated': 'Deep',
                'Urine': 'Urine',
                'Tracheal/pulmonal': 'Tracheal',
            },
            episodeClass: {
                'infection': '_infection_',
                'colonisation': '_colonisation_',
                'no growth, no infection (control)': '_nogrowth.noinfection_',
            }
        }

        // verify that values match our encoding list
        if (encoding.mainGroup.hasOwnProperty(dta.mainGroup) == false) {
            result._errors.push('Main anatomic group not found: ' + dta.mainGroup);
        }
        if (encoding.episodeClass.hasOwnProperty(dta.episodeClass) == false) {
            result._errors.push('Episdoe class not found: ' + dta.episodeClass);
        }

        if (result._errors.length > 0) {
            return result;
        }

        dta.episodePlusId = '';
        dta.episodePlusId += encoding.mainGroup[dta.mainGroup];
        dta.episodePlusId += dta.episodeNo;
        dta.episodePlusId += encoding.episodeClass[dta.episodeClass];

        // add information on type (if not bone or joint or skin and soft tissue) 
        // or location and side (if bone or joint or skin and soft tissue)

        // location of bone or joint infection: 
        // > replace spaces with dot and convert to lower case
        var bji_locMod = dta.bji_loc.toLowerCase().replace(' ', '.');

        // side of bone or joint or skin and soft tissue infection:
        // > replace spaces with dot and convert to lower case
        var bji_ssti_sideMod = dta.bji_ssti_side.toLowerCase().replace(' ', '.');

        // location of skin and soft tissue infection: 
        // > replace spaces with dot and convert to lower case
        var ssti_locMod = dta.ssti_loc.toLowerCase().replace(' ', '.');

        // infection type:
        // > keep only first word from infection Type
        var infTypeFirst = dta.infType.replace(/ .*/, '');

        // infection site:
        // > keep only first word from infection site
        var infColsiteFirst = dta.infColsite.replace(/ .*/, '');

        // add some fruter information based on specific conditions
        dta.episodePlusId += function () {

            if (
                (dta.episodeClass == 'infection' && dta.infType == 'bone and joint infection')
                || (dta.episodeClass != 'infection' && dta.infColsite == 'bone or joint')
            ) {
                return bji_locMod + '_' + bji_ssti_sideMod;
            }

            if (
                (dta.episodeClass == 'infection'
                    && dta.infType == 'skin and soft tissue infection without bone or joint involvement')
                || (dta.episodeClass != 'infection' && dta.infColsite == 'skin and soft tissue')
            ) {
                return ssti_locMod + '_' + bji_ssti_sideMod;
            }

            if (
                dta.episodeClass == 'infection'
                && dta.infType != 'bone and joint infection'
                && dta.infType != 'skin and soft tissue infection without bone or joint involvement'
            ) {
                return infTypeFirst;
            }

            if (
                dta.episodeClass != 'infection'
                && dta.infColsite != 'bone or joint'
                && dta.infColsite != 'skin and soft tissue'
            ) {
                return infColsiteFirst;
            }

            // not all information found (i.e., values could not be matched), throw alert
            result._errors.push('Additional information needed for Episode ID PLUS site is missing!');
            return '';

        }();

        result.vars = dta;
        return result;
    };

    // gatherFormData will serialize the current form. most selections and 
    // radio groups are only stored as numbers, therefore we need to apply
    // some additional processing to get the effective values.
    var _gatherFormData = function (relevantFields) {

        // relevantFields contain the baseName of all fields that are
        // actually relevant to us

        // initialize return values
        var dta = {
            fields: null,
            _errors: []
        };

        // serialize the content of the secutrial from
        var form = $('form#dataForm');
        var formData = form.serializeArray();

        // remove all numbers and underscore from the end of the name
        var trimRegExp = new RegExp("[0-9_]+$");

        // transform all fields that are relevant to us into an associate
        // array with {basename, name, value}
        // for select and radio fields, we will read the text values of 
        // the options instead of the numeric values
        dta.fields = formData.reduce(function (fields, item) {

            // extract the baseName of the field by trimming numbers and 
            // underscore from the end of the name
            // i.e. ff_nsmpl_nccrid14_58 > ff_nsmpl_nccrid
            var baseName = item.name.replace(trimRegExp, '');

            // nothing to do, if the field is not of interest to us
            if (relevantFields.indexOf(baseName) == -1) {
                return fields;
            }

            // add the baseName information to the item
            item.baseName = baseName;

            // get text values for the fields. specifically required for select 
            // and radio fields.
            item.value = _extractTextValue(item);

            // add the item to the return values
            fields.push(item);
            return fields;
        }, []);

        return dta;

    };

    // extractTextValue will extract the text value from the given field
    // this is specifically necesaary for select and radio fields
    var _extractTextValue = function (item) {

        // no selection string should be handled as empty values
        if (item.value == 'WONoSelectionString') {
            return '';
        }

        var inputField = $('[name=' + item.name + ']');
        var tag = inputField.prop('tagName').toLowerCase();
        var inputType = inputField.prop('type');

        if (tag != 'select' && tag != 'radio') {
            tag = inputType;
        }

        // handle select fields
        // note: we use if statements due to variable scope issues in switch
        // clauses
        if (tag == 'select') {
            var selectedOption = $('option[value=' + item.value + ']', inputField);
            item.value = selectedOption.text();
        }

        // handle radio fields
        if (tag == 'radio') {

            // false is used for not selected radio options. note: radio fields
            // have multiple values for each radio option
            if (item.value === 'false') {
                return '';
            }

            // radio buttons have a strange setup with labels that use underscore
            // and value in the for attribute, to set the corresponding field
            // to the respective value. note: this is not a proper html setup
            // and might be changed by the vendor in the future
            var labelForSelection = $('label[for=' + item.name + '_' + item.value + ']');
            item.value = labelForSelection.text();
        }

        return item.value;
    };

    // hasErrors will check if the given element has errors associated with it
    var _hasErrors = function (element) {
        if (!element._errors) return false;
        return element._errors.length > 0;
    }

    // isEmpty will check if the given value is empty
    var _isEmpty = function (value) {
        if (!value) {
            return true;
        }
        if (value === '') {
            return true;
        }
        if (value === '< Please choose >') {
            return true;
        }
        return false;
    }

    // initialize custom functionality as soon as the window is completely loaded
    // note: secutrial is using the window load event itself, so we must
    // ensure, that this does not overwrite the respective event listener
    // note: jquery must be loaded beforehand, (loaded by secutrial)
    $(window).load(function () {
        _initialize();
        console.log('initialized');
    });

})();