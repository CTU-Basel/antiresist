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

        // define a list of required fields for episode plus ids
        var idVars = [
            { id: "samplingNo", baseName: 'ff_nsmpl_smplid', scope: 'repetition' },
            { id: "tapa", baseName: 'ff_nsmpl_tapa', scope: 'repetition' },
            { id: "mopo", baseName: 'ff_nsmpl_mopo', scope: 'repetition' },
            { id: "tapaNg", baseName: 'ff_nsmpl_nt_tapa', scope: 'repetition' },
            { id: "ng", baseName: 'ff_nsmpl_ng', scope: 'repetition' },
            { id: "sampleNo", baseName: 'ff_nsmpl_store_nb', scope: 'sample' },
            { id: "stType", baseName: 'ff_nsmpl_store', scope: 'sample' },
            { id: "sampleId", baseName: 'ff_nsmpl_nccrid', scope: 'sample' },
        ]

        var result = _serializeForm('form#dataForm', idVars);
        if (_hasErrors(result)) {
            alert('Could not initiliaze custom id functionality:\n' + result._errors.join('\n'));
            return;
        }

        var fields = result.fields;

        // initialize variables to hold references to episode ids, which are used
        // to warn users if they change a value that affects an episode id
        var samplingIdFields = [];
        var currentIdField = null;

        // field is used to capture the current field in the loop
        var field = null

        // loop through all variables from the end to construct the necessary
        // information to generate ids
        for (var i = fields.length - 1; i >= 0; i--) {

            field = fields[i];

            if (field.scope == 'sample') {

            }

            // // automatically update the value of the field in memory, if
            // // the user is changing the value in the form. note: we need a closure
            // // here to ensure that the value is not updated as part of the for
            // // loop
            (function (_field, _samplingIdFields, _currentIdField) {
                var current = _field;

                _field.input.on('change', function (event) {

                    // NOTE: maybe add debouncing or use blur event for text fields
                    current.value = _extractTextValue(current.input, current.fieldType);

                    // warn users for episode plus ids
                    if (current.scope == 'sample' && _currentIdField.value != '') {
                        _showChangeWarning(_field.input);
                        return;
                    }

                    // warn users for form ids
                    if (current.scope == 'repetition') {
                        var errors = [];
                        _samplingIdFields.forEach(function (item) {
                            if (item.value != '') {
                                errors.push(item.id + ": " + item.value);
                            }
                        });
                        if (errors.length > 0) {
                            var message = '<strong style="display:block;margin-top:12px">Affected sample IDs:</strong>' +
                                '<ul style="margin-top: 8px;margin-bottom:16px;padding-left:14px">' +
                                errors.map(function (text) {
                                    return "<li>" + text + "</li>"
                                }).join('') + '</ul>'

                            _showChangeWarning(_field.input, message);
                        }
                    }
                });

            })(field, samplingIdFields, currentIdField);

            // episodeID field should only be present once
            if (field.id == 'sampleId') {
                // add a button to generate a sample id
                _addButton(field, _handleSampleId(fields, i));
                // store the field to enable alerts when related fields are changed
                samplingIdFields.unshift(field);
                currentIdField = field;
            }

            if (field.id == 'samplingNo') {
                // clear all previous samplingIdFields if we arrive at a samplingNo
                // which indicates that this is the beginning of a repetition group
                samplingIdFields = [];
            }

        }

    };

    var _showChangeWarning = function (input, message) {

        // define the default change warning
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

        // add a link to remove the warning
        var clearWarning = '<span style="display:block;text-decoration:underline;cursor:pointer;font-style:italic;margin-top:8px" onclick="$(event.target).parent().remove()">Clear warning</span>'

        // remove any existing warning
        $('.dkf-warning', input.parent()).remove();

        // append a new warning
        input.parent().append('<div class="dkf-warning" style="color:#ee0000;margin-top: 8px;font-weight:bold">' + changeWarning + message + clearWarning + '</div>')

    };

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

    // handleSampleId will generate an episode id
    var _handleSampleId = function (fields, currentIdFieldIndex) {

        // get the id field from our field list
        var idField = fields[currentIdFieldIndex];

        return function () {

            // ensure that we have the latest form data
            _updateFormData(fields);

            // extract the variables required to generate the sample id
            var vars = {};

            // go through all variables from the end and find the variables that
            // belong to this repetitiongroup or sample group
            // note: special care is required for radio buttons, which are 
            // comprised of multiple input fields.
            var nameIndex = {};

            // traverse the fields from the current id field upward to find the 
            // closest representation of the variable 
            for (var i = currentIdFieldIndex; i >= 0; i--) {
                var item = fields[i];

                // nothing to do, if this item was already extracted, unless
                // it is a radio item with the same name and no value set yet
                if (vars.hasOwnProperty(item.id)
                    && nameIndex.hasOwnProperty(item.name) == false) {
                    continue;

                } else if (vars.hasOwnProperty(item.id)
                    && nameIndex.hasOwnProperty(item.name)
                    && vars[item.id] != '') {
                    continue;
                }

                // save the name of the item in the index, to later check if
                // we have an input with the same name again (required for 
                // radio buttons).
                nameIndex[item.name] = item.id;

                // extract the value content of the variable
                vars[item.id] = item.value;

                // no need to look any further if we have found the
                // sampling number (last item required for id)
                if (item.id == 'samplingNo') break;
            }

            // generate a sample id from the form data
            result = _generateSampleId(vars);
            if (_hasErrors(result)) {
                alert(result._errors.join("\n- "));
                return
            }


            // user must confirm the sample id
            var sampleId = _confirmSampleId(result.vars);
            if (!sampleId || sampleId == '') return;

            // inform the user, that it might be dangerous to overwrite this id
            // and require them to explictely demand and overwrite.
            if (idField.value != '') {
                var answer = prompt(
                    'This id is already specified, ' +
                    'please type OVERWRITE to regenerate the current id. ' +
                    '\n\nAttention: This might have serious consequences.'
                );
                if (!answer || answer == null || answer.toLowerCase() != 'overwrite') {
                    return;
                }
            }

            // set the sample id into the given field. note: this also works if the 
            // field is set to readonly. attention: no change event is fired for this
            idField.value = sampleId;
            idField.input.val(sampleId);
        };

    };

    // generateSampleId will process the given form data to generate an episode id
    var _generateSampleId = function (dta) {

        // initialize the result information, this allows us to pass errors
        // along to the caller
        var result = {
            _errors: [],
        };

        // --- check if all required values have been provided
        if (_isEmpty(dta.samplingNo) || _isEmpty(dta.stType) || _isEmpty(dta.tapa) || _isEmpty(dta.sampleNo) ||
            (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology') && _isEmpty(dta.mopo) ||
            (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && _isEmpty(dta.ng) ||
            (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && dta.ng.startsWith('infection') && _isEmpty(dta.tapaNg)) {

            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            var info = 'ID for NCCR sample could not be generated. Some input is missing:\n\n' +
                (_isEmpty(dta.samplingNo) ? '!! Missing: ' : 'OK: ') + 'ID for sampling event\n' +
                (_isEmpty(dta.tapa) ? '!! Missing: ' : 'OK: ') + 'Main target pathogen\n' +
                (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology' ? (_isEmpty(dta.mopo) ? '!! Missing: ' : 'OK: ') + 'Monomicrobial or polymicrobial growth\n' : '') +
                (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology' ? (_isEmpty(dta.ng) ? '!! Missing: ' : 'OK: ') + 'Sample event control or infection\n' : '') +
                ((dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && dta.ng.startsWith('infection') ? (_isEmpty(dta.tapaNg) ? '!! Missing: ' : 'OK: ') + 'Target pathogen responsible for infection\n' : '') +
                (_isEmpty(dta.stType) ? '!! Missing: ' : 'OK: ') + 'Primary storage type\n' +
                (_isEmpty(dta.sampleNo) ? '!! Missing: ' : 'OK: ') + 'Number of sample storage type\n';

            result._errors.push(info);
            // stop further processing here
            return result;
        }

        // check if the sampling number was specified correctly (conforms to Regex)
        var checkSamplingNo = new RegExp('^[D|T|U]{1}-[A-Z]{3}[0-9]{5}$');
        if (checkSamplingNo.test(dta.samplingNo) == false) {
            result._errors.push('The entered ID for this sampling event does not comply with the standard. It should start with D, T or U, followed by the center abbreviation (e.g., USB) and a five-digit number.');
        }

        // start the sample id with the sampling number
        dta.sampleId = dta.samplingNo;

        // add the storage sample
        var stTypeMap = {
            'Frozen': 'F',
            'Fixed': 'H',
            'Native': 'N',
            'Whole blood': 'B',
            'RNA': 'R',
            'Other': 'O'
        }

        if (stTypeMap.hasOwnProperty(dta.stType) == false) {
            result._errors.push('Sample storage type not found');
        }
        dta.sampleId += stTypeMap[dta.stType];

        // add the sample number
        var checkSampleNo = new RegExp('^[0-9]{2}$');
        if (checkSampleNo.test(dta.sampleNo) == false) {
            result._errors.push('The number of the sample storage type is not correct. This needs to be a two-digit number (e.g., 01, 02 ... 10, 11, etc.).');
        }

        dta.sampleId += dta.sampleNo;

        // add the target pathogen
        var tapaMap = {
            'S. aureus': 'SA',
            'P. aeruginosa': 'PA',
            'E. coli': 'EC',
            'Klebsiella spp.': 'KS',
            'Other': 'OS',
            'No growth': 'NG',
            'No data from routine microbiology': 'ND'
        }
        if (tapaMap.hasOwnProperty(dta.tapa) == false) {
            result._errors.push('Target pathogen not found');
        }

        dta.sampleId += tapaMap[dta.tapa];

        // add additional information
        var mopoMap = {
            'Monomicrobial': 'm',
            'Polymicrobial': 'p',
        };

        var tapaNgMap = {
            'S. aureus': 'sa',
            'P. aeruginosa': 'pa',
            'E. coli': 'ec',
            'Klebsiella spp.': 'ks',
            'Other': 'os'
        };

        var ngMap = {
            'control (no infection)': 'co',
            'infection with target pathogen': 'inf'
        };

        if (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology') {
            if (mopoMap.hasOwnProperty(dta.mopo) == false) {
                result._errors.push('Monomicrobial or polymicrobial growth not found');
            }
            dta.sampleId += mopoMap[dta.mopo];

        } else if ((dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') &&
            dta.ng.startsWith('infection')) {
            if (tapaNgMap.hasOwnProperty(dta.tapaNg) == false) {
                result._errors.push('Target pathogen responsible for infection not found');
            }
            dta.sampleId += tapaNgMap[dta.tapaNg];

        } else if ((dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') &&
            dta.ng.startsWith('control')) {
            if (ngMap.hasOwnProperty(dta.ng) == -1) {
                result._errors.push('Sample event control or infection not found');
            }
            dta.sampleId += ngMap[dta.ng];

        } else {
            // If info is not there (i.e., values could not be matched), throw this alert
            result._errors.push('Additional information needed for sample ID is missing!');
        }

        // Check that the sample ID matches a certain regex, if not, throw an alert
        var checkId = new RegExp('^[D|T|U]-[A-Z]{3}[0-9]{5}[F|H|B|N|R|O]{1}[0-9]{2}(SA|PA|EC|KS|OS|NG|ND)([pm]{1}|(sa|pa|ec|ks|os|co))$');

        if (checkId.test(dta.sampleId) == false) {
            result._errors.push('The generated ID for this sample does not comply with the standard. Please make sure all variables are specified correctly.');
        }

        // stop processing if there are any errors
        if (result._errors.length > 0) {
            return result;
        }

        // ensure that the generated id is unique
        var existingSampleIds = $('[name^=ff_nsmpl_nccrid]').map(function () {
            return $(this).val()
        }).get();

        if (existingSampleIds.indexOf(dta.sampleId) > -1) {
            result._errors.push('The generated ID for this sample is already used. Please check that the combination of storage type and sample number is unique within this sampling event.')
            return result;
        }

        result.vars = dta;
        return result;
    };

    var _confirmSampleId = function (dta) {

        // prompt user to check all values used to generate the id
        var answer = prompt(
            'Before the sample ID is generated,' +
            ' please confirm that the following information is correct:\n' +
            '\n- ID for sampling event: ' + dta.samplingNo +
            '\n- Main target pathogen: ' + dta.tapa +

            (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology' ?
                '\n- Monomicrobial or polymicrobial growth: ' + dta.mopo : '') +

            (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology' ?
                '\n- Sample event control or infection: ' + dta.ng : '') +

            ((dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology')
                && dta.ng.startsWith('infection') ?

                '\n- Target pathogen responsible for infection: ' + dta.tapaNg : '') +
            '\n- Primary storage type: ' + dta.stType +
            '\n- Number of sample storage type: ' + dta.sampleNo +
            '\n\n' +
            'ATTENTION: By typing "ok", you confirm that the information is correct.' +
            'With this, the sample ID is generated.');

        // abort if the user does not want to generate the id
        if (!answer || answer == null || answer.toLowerCase() != 'ok') {
            return '';
        }

        return dta.sampleId
    }

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

            // store the reference to the field to access it later
            info.input = field;

            // add the information to our list of fields
            fields.push(info);

        });

        dta.fields = fields;
        return dta;

    };

    var _getFieldType = function (field) {

        field = $(field);

        // get the type of the field
        var fieldType = field.prop('type');

        var tag = field.prop('tagName').toLowerCase();
        if (tag == 'select' || tag == 'radio') {
            fieldType = tag;
        }

        return fieldType;
    };

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
            // note: checkboxes are not yet supported
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
    };

    // hasErrors will check if the given element has errors associated with it
    var _hasErrors = function (element) {
        if (!element._errors) return false;
        return element._errors.length > 0;
    };

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
    };

    // initialize custom functionality as soon as the window is completely loaded
    // note: secutrial is using the window load event itself, so we must
    // ensure, that this does not overwrite the respective event listener
    // note: jquery must be loaded beforehand, (loaded by secutrial)
    $(window).load(function () {
        _initialize();
    });

})();
