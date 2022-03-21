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
        // var episodeIds = $("input[name^=ff_episode_uniqid_]");
        // var episodePlusIds = $("[name^=ff_episode_uniqidsit_]");

        // define a list of required fields for regular episoded ids
        // var episodeIdVars = [
        //     { id: "mainGroup", baseName: 'ff_episode_maingrp', scope: 'form', },
        //     { id: "episodeNo", baseName: 'ff_episode_nmb', scope: 'form', },
        //     { id: "episodeClass", baseName: 'ff_episode_class', scope: 'form', },
        //     { id: "episodeId", baseName: 'ff_episode_uniqid', scope: 'form', value: '', isID: true },
        // ];

        // define a list of required fields for episode plus ids
        var episodePlusIdVars = [
            {
                id: "mainGroup", baseName: 'ff_episode_maingrp',
                scope: 'form', readonly: true
            },
            {
                id: "episodeNo", baseName: 'ff_episode_nmb',
                scope: 'form', readonly: true
            },
            {
                id: "episodeClass", baseName: 'ff_episode_class',
                scope: 'form',
            },
            {
                id: "episodeId", baseName: 'ff_episode_uniqid',
                scope: 'form', isID: true, readonly: true
            },
            {
                id: "infColsite", baseName: 'ff_inf_d_colsite',
                scope: 'repetition',
            },
            {
                id: "infType", baseName: 'ff_inf_type',
                scope: 'repetition'
            },
            {
                id: "bji_loc", baseName: 'ff_inf_bji_loc',
                scope: 'repetition'
            },
            {
                id: "bji_ssti_side", baseName: 'ff_inf_ssti_bji_side',
                scope: 'repetition',
            },
            {
                id: "ssti_loc", baseName: 'ff_inf_ssti_loc',
                scope: 'repetition',
            },
            {
                id: "episodePlusId", baseName: 'ff_episode_uniqidsit',
                scope: 'repetition', isID: true, readonly: true
            },
        ]

        var result = _serializeForm('form#dataForm', episodePlusIdVars);
        if (_hasErrors(result)) {
            alert('Could not initiliaze custom id functionality:\n' + result._errors.join('\n'));
            return;
        }

        var fields = result.fields;

        // initialize variables to hold references to episode ids, which are used
        // to warn users if they change a value that affects an episode id
        var episodeFields = [];
        var closestEpisodePlusId = null;

        var changeWarning = 'Attention: You changed a variable that is relevant for ' +
            'the NCCR Sample ID, but an NCCR Sample ID was already generated. ' +
            'You now have two options:' +
            '<ol style="margin-top:8px;margin-bottom:8px;padding:0px 11px;list-style-position:outside">' +
            '<li>If the NCCR Sample ID is already used (i.e., printed and pasted on ' +
            'the sample), DO NOT generate the NCCR Sample ID again!!!</li>' +
            '<li style="margin-top: 8px">If the NCCR Sample ID is NOT already used (i.e., printed and pasted on ' +
            'the sample), you should generate the NCCR Sample ID again now by ' +
            'clicking again on the "Generate ID" - Button.</li>' +
            '</ol>' +
            'If in doubt about which applies (1 or 2), also DO NOT generate the NCCR Sample ID again.'

        var clearWarning = '<span style="display:block;text-decoration:underline;cursor:pointer;font-style:italic;margin-top:8px" onclick="$(event.target).parent().remove()">Clear warning</span>'

        for (var i = fields.length - 1; i >= 0; i--) {

            var field = fields[i];

            // automatically update the value of the field in memory, if
            // the user is changing the value in the form
            (function (_field, _closestEpisodePlusId) {
                var current = _field;
                _field.input.on('change', function (event) {
                    // TODO: maybe add debouncing or use blur event for text fields
                    current.value = _extractTextValue(current.input, current.fieldType);

                    // warn users for episode plus ids
                    if (current.scope == 'repetition' && _closestEpisodePlusId.value != '') {

                        // remove any existing warning
                        $('.dkf-warning', _field.input.parent()).remove();

                        // append a new warning
                        _field.input.parent().append('<div class="dkf-warning" style="color:#ee0000;margin-top: 8px;font-weight:bold">' + changeWarning + clearWarning + '</div>')
                    }

                    // warn users for form ids
                    if (current.scope == 'form') {
                        var errors = [];
                        episodeFields.forEach(function (item) {
                            if (item.value != '') {
                                errors.push(item.id + ": " + item.value);
                            }
                        });
                        if (errors.length > 0) {

                            // remove any existing warning
                            $('.dkf-warning', _field.input.parent()).remove();

                            // append a new warning
                            _field.input.parent().append(
                                '<div class="dkf-warning" style="color:#ee0000;margin-top: 8px;font-weight:bold">' + changeWarning +
                                '<strong style="display:block;margin-top:12px">Affected IDs:</strong>' +
                                '<ul style="margin-top: 8px;margin-bottom:16px;padding-left:14px">' +
                                errors.map(function (text) {
                                    return "<li>" + text + "</li>"
                                }).join('') + '</ul>' +
                                clearWarning + '</div>')
                        }
                    }
                });
            })(field, closestEpisodePlusId);

            if (field.readonly) {
                _makeReadonly(field);
            }

            if (field.id == 'episodeId') {
                _addButton(field, _handleGenerateEpisodeId(fields, i));
                _addPopupLink(field, 'Episode ID');
                episodeFields.unshift(field);
            }

            if (field.id == 'episodePlusId') {
                field.input.css('max-width', '300px');
                _addButton(field, _handleGenerateEpisodePlusId(fields, i));
                _addPopupLink(field, 'Episode ID PLUS site');
                episodeFields.unshift(field);
                closestEpisodePlusId = field;
            }

        }


        // watch the form for changes
        // _watchForChanges(episodePlusIdVars);

    };

    var _makeReadonly = function (field) {
        // define styling for readonly fields
        var readonlyStyle = {
            opacity: 0.7,
            outline: 'none',
        }

        // ignore all fields that are not set to readonly
        if (!field.readonly) return;

        // make the field readonly and add some custom readonly style
        field.input.attr('readonly', 'readonly').css(readonlyStyle);

        // add a negative tab index to prevent users from navigating to the field 
        // via keyboard. note: exclude id fields from this, to allow users to copy 
        // the field content
        if (!field.isID) {
            field.input.attr('tabindex', '-1');
        }

        // select fields need some special treatment, since the readonly
        // attribute does not work and we cannot just set it to disabled
        // since this might interfere with secutrial functionality
        if (field.fieldType !== 'select') return;

        // add an overlay to prevent all click actions
        field.input.parent().css('position', 'relative');
        field.input.parent().append('<div style="position:absolute;background:transparent;top:0;left:0;right:0;bottom:0"></div>');

        field.input.on('focus', function (event) {
            event.target.blur();
        });

        // inform users that they should not change this field
        field.input.on('change', function (event) {
            alert('Please do not change this field');
        });

    }

    // addPopupLink will add a link to all given fields to export the current
    // patient id and respective id to a separate popup window
    var _addPopupLink = function (field, label) {

        var input = field.input;

        // nothing to do, if there is already a respective button
        if ($('a.dkf-popup-window', input.parent()).length > 0) {
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
            _handlePopupClick(input, label);
        };

        // append the popup link to the parent element of the field
        input.parent().append(popupLink);

    }

    // handlePopupClick will display the current id in a separate window
    var _handlePopupClick = function (field, label) {
        var patID = $('#status_add-id').text().trim();
        if (!patID || patID == '') patID = '[NOT FOUND]';

        // get the current value from the id field
        var id = $(field).val();
        if (!id) id = '[EMPTY]';

        // open the information about the patient and sample id in a separate window
        var popup = window.open("", "antiresist-ids", "width=600,height=200,popup=yes");
        popup.document.write("<p><b>Patient ID:</b>&nbsp;" + patID + "&nbsp;&nbsp;<b>" + label + ": </b>&nbsp;" + id + "</p>");
    }

    // addButton will add "generate id" buttons to the given field
    var _addButton = function (field, callbackFunction) {

        var input = field.input;

        // nothing to do, if there is already a respective button
        if ($('button.dkf-generate-id', input.parent()).length > 0) {
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
            callbackFunction(input);
        };

        // append the button to the parent element of the field
        input.parent().append(idButton);


    };

    // handleGenerateEpisodeId will generate an episode id
    var _handleGenerateEpisodeId = function (fields, episodeFieldIndex) {

        // get the id field from our field list
        var idField = fields[episodeFieldIndex];

        return function () {

            // ensure that we have the latest form data
            _updateFormData(fields);

            // extract the variables required to generate the episode id from
            // our field list
            var vars = fields.reduce(function (list, item) {
                // skip all items that are part of a repetition group
                if (item.scope != 'form') return list;
                // save the value of the item with the variable id
                list[item.id] = item.value;
                return list
            }, {});

            // generate a sample id from the form data
            result = _generateEpisodeId(vars);
            if (_hasErrors(result)) {
                alert(result._errors.join("\n- "));
                return
            }

            // inform the user, that it might be dangerous to overwrite this id
            // and require them to explictely demand and overwrite.
            if (idField.value != '') {
                var answer = prompt(
                    'This id is already specified, ' +
                    'please type OVERWRITE to regenerate the current id. ' +
                    '\n\nAttention: This might have serious consequences.'
                );
                if (!answer || answer.toLowerCase() != 'overwrite') {
                    return;
                }
            }

            // set the sample id into the given field. note: this also works if the 
            // field is set to readonly. attention: no change event is fired for this
            idField.value = result.episodeId;
            idField.input.val(result.episodeId);
        };

    };

    // generateEpisodeId will process the given form data to generate an episode id
    var _generateEpisodeId = function (dta, fields) {

        // initialize the result information, this allows us to pass errors
        // along to the caller
        var result = {
            _errors: [],
        };

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
                'no growth, no infection': '_nogrowth.noinfection',
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
        var episodeId = '';
        episodeId += encoding.mainGroup[dta.mainGroup];
        episodeId += dta.episodeNo;
        episodeId += encoding.episodeClass[dta.episodeClass];

        result.episodeId = episodeId;
        return result;
    };

    // handleGenerateEpisodePlusId will generate an episode plus id for deep
    // seated infections
    var _handleGenerateEpisodePlusId = function (fields, episodeFieldIndex) {

        // get the id field from our field list
        var idField = fields[episodeFieldIndex];

        return function () {



            // ensure that we have the most current form data
            _updateFormData(fields);

            // extract the variables required to generate the episode plus from
            // our field list
            var vars = {};

            // go through all variables from the end and find the variables that
            // belong to this repetitiongroup or the complete form
            for (var i = episodeFieldIndex; i >= 0; i--) {
                var item = fields[i];
                // nothing to do, if this item was already extracted
                if (vars.hasOwnProperty(item.id)) {
                    continue;
                }
                vars[item.id] = item.value;
            }

            // generate an episode plus id from the form data
            result = _generateEpisodePlusId(vars);
            if (_hasErrors(result)) {
                alert(result._errors.join("\n- "));
                return
            }

            // inform the user, that it might be dangerous to overwrite this id
            // and require them to explictely demand and overwrite.
            if (idField.value != '') {
                var answer = prompt(
                    'This id is already specified, ' +
                    'please type OVERWRITE to regenerate the current id. ' +
                    '\n\nAttention: This might have serious consequences.'
                );
                if (!answer || answer.toLowerCase() != 'overwrite') {
                    return;
                }
            }

            // set the sample id into the given field. note: this also works if the 
            // field is set to readonly. attention: no change event is fired for this
            idField.value = result.episodePlusId;
            idField.input.val(result.episodePlusId);

        }

    };

    // generateEpisodePlusId will process the given form data to generate an episode id
    var _generateEpisodePlusId = function (dta) {

        // initialize the result information, this allows us to pass errors
        // along to the caller
        var result = {
            _errors: [],
        };

        // TODO: @Silvia this is really hard to understand. Should be split into
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

        var episodePlusId = '';
        episodePlusId += encoding.mainGroup[dta.mainGroup];
        episodePlusId += dta.episodeNo;
        episodePlusId += encoding.episodeClass[dta.episodeClass];

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
        episodePlusId += function () {

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

        result.episodePlusId = episodePlusId;
        return result;
    };

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
        var index = Object.values(vars).reduce(function (list, item) {
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

    // serializeForm will serialize the current form. most selections and 
    // radio groups are only stored as numbers, therefore we need to apply
    // some additional processing to get the effective values.
    var _serializeForm = function (formID, relevantFields) {

        // relevantFields can be used to serialize only the fields that
        // are actually relevant to us

        // initialize return values
        var dta = {
            fields: null,
            _errors: []
        };

        // create a field index for the baseNames
        var fieldFilter = relevantFields.reduce(function (idx, item) {
            idx[item.baseName] = item;
            return idx;
        }, {});

        // serialize all input select and textarea fields in the given form
        // we cannot use jquery.serializeArray since this will exclude
        // disabled fields
        var htmlFields = $('input,select,textarea', formID);

        // remove all numbers and underscore from the end of the name to 
        // find the base name of the field
        var trimRegExp = new RegExp("[0-9_]+$");

        // initialize array to hold the field data in sorted order
        var fields = [];

        // initialize a map to hold the field values to manage radio buttons
        var fieldValues = {};

        // go through each field
        $(htmlFields).each(function () {

            var field = $(this);

            // define the base info required for every field
            var info = {
                fieldType: null,
                baseName: null,
                name: null,
                value: null,
                input: null
            }

            // get the name of the field
            info.name = field.attr('name');

            // nothing to do if the fiels has no name (special html elements)
            if (!info.name) {
                return;
            }

            // do not parse the field, if it was already extracted with a value.
            // this is mainly required for radio fields.
            if (fieldValues.hasOwnProperty(info.name) && fieldValues[info.name] != '') {
                return;
            }

            // extract the baseName of the field by trimming numbers and 
            // underscore from the end of the name
            // i.e. ff_nsmpl_nccrid14_58 > ff_nsmpl_nccrid
            info.baseName = info.name.replace(trimRegExp, '');

            // nothing to do, if the field is not in the list of relevant fields
            // (if such a list was specified)
            if (fieldFilter) {

                if (fieldFilter.hasOwnProperty(info.baseName) == false) {
                    return;
                }

                // add the variable name to the item
                Object.keys(fieldFilter[info.baseName]).forEach(function (key) {
                    if (info[key]) return;
                    info[key] = fieldFilter[info.baseName][key];
                });

            }

            // get the type of the field
            info.fieldType = _getFieldType(field);

            // get text values for the fields. special functionality is required
            // for select and radio fields
            info.value = _extractTextValue(field, info.fieldType);

            // add the field information to the index, so we can easily check
            // if it was already defined
            fieldValues[info.name] = info.value;

            // store the reference to the field to access it later
            info.input = field;

            // add the information to our list of fields
            fields.push(info);

        });

        dta.fields = fields;
        return dta;

    }

    var _getFieldType = function (field) {

        field = $(field);

        // get the type of the field
        var fieldType = field.prop('type');

        var tag = field.prop('tagName').toLowerCase();
        if (tag == 'select' || tag == 'radio') {
            fieldType = tag;
        }

        return fieldType;
    }

    // extractTextValue will extract the text value from the given field
    // this is specifically necesaary for select and radio fields
    var _extractTextValue = function (field, tag) {

        var fieldValue = '';

        // extract the type of the field if not already defined
        if (!tag) {
            tag = _getFieldType(field);
        }

        // get the tag of regular input and textarea fields
        if (tag == 'text' || tag == 'textarea') {
            fieldValue = field.val();
        }

        // handle select fields. note: we cannot rely on the selected attribute
        // since this is not changed if the value of the select is adapted
        // programmatically (probably a bug in the browser)
        if (tag == 'select') {
            var selectedValue = field.val();
            if (!selectedValue != 'WONoSelectionString') {
                var selectedOption = $('option[value="' + selectedValue + '"]', field);
                fieldValue = selectedOption.text();
            }
        }

        // handle radio fields
        if (tag == 'radio') {

            // radio buttons have a strange setup with labels that use underscore
            // and value in the for attribute, to set the corresponding field
            // to the respective value. note: this is not a proper html setup
            // and might be changed by the vendor in the future

            var radioFieldValue = field.val();
            var radioFieldName = field.attr('name');
            var checked = field.attr('checked');

            if (checked) {
                var labelForSelection = $('label[for=' + radioFieldName + '_' + radioFieldValue + ']');
                fieldValue = labelForSelection.text();
            }

        }

        if (tag == 'checkbox') {
            // note: checkboxes are not yet implemented
        }

        // no selection string should be handled as empty values
        if (fieldValue == 'WONoSelectionString' || fieldValue == '< Please choose >') {
            return '';
        }

        return fieldValue;
    };

    // updateFormData will re-extract all given fields, to ensure that the values
    // are up-to-date
    var _updateFormData = function (fields) {
        for (var i = 0; i < fields.length; i++) {
            fields[i].value = _extractTextValue(fields[i].input, fields[i].fieldType);
        }
    }

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
    });

})();