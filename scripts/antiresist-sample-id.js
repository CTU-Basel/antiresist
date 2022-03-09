// use an immediately invoked function to avoid pollution of the global
// variable namespace
(function () {

    // hasErrors will check if the given element has errors associated with it
    var hasErrors = function (element) {
        if (!element._errors) return false;
        return element._errors.length > 0;
    }

    // isEmpty will check if the given value is empty
    var isEmpty = function (value) {
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

    // add custom nccrid functionality as soon as windows is completely loaded
    // note: secutrial is using the window load event itself, so we must
    // ensure, that this does not overwrite the respective event listener
    // note: jquery must be loaded beforehand, (loaded by secutrial)
    $(window).load(function () {
        window.dkf.initialize();
    });

    // initialize is used to initialize the custom form functionality
    window.dkf.initialize = function () {

        // make all sample id fields readonly
        var idfields = $("input[name^='ff_nsmpl_nccrid']");
        idfields.attr('readonly', 'readonly');

        // add custom buttons to generate ids
        window.dkf.addButtons();

        // TODO: implement watch to inform users when they change something
        // watch the form for changes
        // window.dkf.watchForChanges();

    };

    // watchForChanges will watch all relevant fields in the form for changes
    // and alert the user of possible problems with the generated id
    window.dkf.watchForChanges = function () {

        // define an alert information to display to the user if a value was
        // changed that is relevant when generating ids
        var alertInfo = 'Attention: You changed a variable that is relevant for ' +
            'the NCCR Sample ID, but an NCCR Sample ID was already generated. ' +
            'You now have two options:\n\n' +
            '1) If the NCCR Sample ID is already used (i.e., printed and pasted on ' +
            'the sample), DO NOT generate the NCCR Sample ID again!!!\n\n' +
            '2) If the NCCR Sample ID is NOT already used (i.e., printed and pasted on ' +
            'the sample), you should generate the NCCR Sample ID again now by ' +
            'clicking again on the "Generate ID" - Button.\n\n' +
            'If in doubt about which applies(1 or 2), also DO NOT generate the NCCR Sample ID again.';

        // the main data is in the form pageform
        var form = $('form[name=pageForm]');

        // watch all form inputs for changes. for text elements, this will be
        // triggered when the user leaves the field (blur event). to always
        // trigger the event after each keystroke, use the keyup event. 
        form.on('change paste', 'input, select, radio, textarea', function (event) {

            // TODO: manage changes
            // console.log('something was changed', $(event.target).attr('name'));
            // var formData = form.serializeArray();
            // formData.forEach(function (el) {
            //     for (var i = 0; i < watchFields.length; i++) {
            //         if (el.name.indexOf(watchFields[i]) > -1) {
            //             console.log(el.name, el.value);
            //             return
            //         }
            //     }
            // });

        });

    };

    // add a new button to every nccr id field
    window.dkf.addButtons = function () {

        // find all fields for nccrd id sample ids
        var idFields = $('[name^=ff_nsmpl_nccrid]');

        // go through all fields and append a button, if there is not already a button
        idFields.each(function () {

            var idField = $(this);

            // nothing to do, if there is already a button
            if (idField.next().length > 0 && idField.next().prop('tagName') == 'BUTTON') {
                return;
            }

            // create a new button to generate an id
            var idButton = document.createElement('button');
            idButton.innerHTML = 'Generate ID';
            idButton.style.marginLeft = '8px';

            idButton.onclick = function (event) {
                // prevent the browser from firing the default events, which could
                // trigger a form submission
                event.preventDefault();
                event.stopPropagation();
                // initiate id generation for this sample
                window.dkf.handleGenerateIdClick(idField);
            };

        })
    };

    // handleGenerateIdClick will handle the click of a user on the button
    // to generate an id next to the field "ff_nsmpl_nccrid"
    window.dkf.handleGenerateIdClick = function (idField) {

        // we use the field name to determine the group information
        var fieldName = idField.attr('name');

        // fetch the value of the current field
        let sampleId = idField.val();
        if (sampleId && sampleId != '') {
            var answer = prompt('Attention: A sample ID is already specified, ' +
                'please type OVERWRITE to overwrite the current sample ID');

            if (!answer || answer.toLowerCase() != 'overwrite') {
                alert("ID has NOT been changed");
                return;
            }
        }

        // define a list of required fields
        var vars = {
            samplingNo: { baseName: 'ff_nsmpl_smplid', scope: 'repetition', value: '' },
            tapa: { baseName: 'ff_nsmpl_tapa', scope: 'repetition', value: '' },
            mopo: { baseName: 'ff_nsmpl_mopo', scope: 'repetition', value: '' },
            tapaNg: { baseName: 'ff_nsmpl_nt_tapa', scope: 'repetition', value: '' },
            ng: { baseName: 'ff_nsmpl_ng', scope: 'repetition', value: '' },
            sampleNo: { baseName: 'ff_nsmpl_store_nb', scope: 'sample', value: '' },
            stType: { baseName: 'ff_nsmpl_store', scope: 'sample', value: '' },
            sampleId: { baseName: 'ff_nsmpl_nccrid', scope: 'sample', value: '' },
        }

        // get a list of all relevant fields (by baseName)
        var relevantFields = Object.keys(vars).map(function (item) {
            return vars[item].baseName;
        });

        // gather the current form data, this will return fields and error
        // information
        var result = window.dkf.gatherFormData(relevantFields);
        if (hasErrors(result)) {
            result._errors.unshift("ERROR: Could not gather form data:")
            alert(result._errors.join("\n- "));
            return;
        }

        // generate a sample id from the form data
        result = window.dkf.generateSampleId(fieldName, vars, result.fields);
        if (hasErrors(result)) {
            alert(result._errors.join("\n- "));
            return
        }

        // generate the id for the given id field
        window.dkf.setSampleId(idField, result.vars);


    };

    // gatherFormData will serialize the current form. most selections and 
    // radio groups are only stored as numbers, therefore we need to apply
    // some additional processing to get the effective values.
    window.dkf.gatherFormData = function (relevantFields) {

        // relevantFields contain the baseName of all fields that are
        // actually relevant to us

        // initialize return values
        var dta = {
            fields: null,
            _errors: []
        };

        // serialize the content of the secutrial from
        var form = $('form[name=pageForm]');
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
            item.value = window.dkf.extractTextValue(item);

            // add the item to the return values
            fields.push(item);
            return fields;
        }, []);

        return dta;

    };

    // extractTextValue will try to extract the text value of the given field
    window.dkf.extractTextValue = function (item) {

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

    // generateSampleId will process the given form data to generate a sample id
    window.dkf.generateSampleId = function (fieldName, vars, fields) {

        // initialize the result information, this allows us to pass errors
        // along to the callser
        var result = {
            vars: null,
            _errors: [],
        };

        // create an index for the variables
        var varsIndex = Object.keys(vars).reduce(function (list, key) {
            list[vars[key].baseName] = vars[key];
            return list;
        }, {});

        // find the position of the current sample id field, starting from 
        // the end and get the corresponding other fields by traversing
        // all fields upwards and choosing the closest respective field
        var scope = {
            repetition: false,
            sample: false
        };

        // parse the content of the fields from the end of the form upwards
        for (var i = fields.length - 1; i >= 0; i--) {

            var field = fields[i];

            // start extraction, if the name of the checked field is the same
            // as the name of the id field next to the button
            if (field.name == fieldName) {
                scope.repetition = true;
                scope.sample = true;
            }

            // ignore fields if we are outside of the repetition and sample group
            if (scope.repetition == false && scope.sample == false) {
                continue;
            }

            // try to find the variable in our variable list
            let currentVar = varsIndex[field.baseName];

            // check if the base fieldname matches one of those we are looking for
            if (!currentVar) {
                result._errors.push('field not found ' + field.name);
                continue;
            }

            // only extract data if it is still in the same scope as the 
            // currently required id
            if (field.value != '' &&
                currentVar.scope == 'sample' && scope.sample == true ||
                currentVar.scope == 'repetition' && scope.repetition == true) {
                if (currentVar.value != '') {
                    result._errors.push("multiple values for field " + field.baseName + " / " + field.name);
                }
                currentVar.value = field.value;
            }

            // check if we are at the end of the sample or repetition group
            // scope to stop any further data extraction
            if (field.baseName == "ff_nsmpl_store") {
                scope.sample = false;
            }

            if (field.baseName == "ff_nsmpl_smplid") {
                scope.repetition = false;
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
        if (isEmpty(dta.samplingNo) || isEmpty(dta.stType) || isEmpty(dta.tapa) || isEmpty(dta.sampleNo) ||
            (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology') && isEmpty(dta.mopo) ||
            (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && isEmpty(dta.ng) ||
            (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && ng.startsWith('infection') && isEmpty(dta.tapaNg)) {

            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            var info = 'ID for NCCR sample could not be generated. Some input is missing:\n\n' +
                (isEmpty(dta.samplingNo) ? '!! Missing: ' : 'OK: ') + 'ID for sampling event\n' +
                (isEmpty(dta.tapa) ? '!! Missing: ' : 'OK: ') + 'Main target pathogen\n' +
                (dta.tapa != 'No growth' && dta.tapa != 'No data from routine microbiology' ? (isEmpty(dta.mopo) ? '!! Missing: ' : 'OK: ') + 'Monomicrobial or polymicrobial growth\n' : '') +
                (dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology' ? (isEmpty(dta.ng) ? '!! Missing: ' : 'OK: ') + 'Sample event control or infection\n' : '') +
                ((dta.tapa == 'No growth' || dta.tapa == 'No data from routine microbiology') && dta.ng.startsWith('infection') ? (isEmpty(dta.tapaNg) ? '!! Missing: ' : 'OK: ') + 'Target pathogen responsible for infection\n' : '') +
                (isEmpty(dta.stType) ? '!! Missing: ' : 'OK: ') + 'Primary storage type\n' +
                (isEmpty(dta.sampleNo) ? '!! Missing: ' : 'OK: ') + 'Number of sample storage type\n';

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

    // setSampleId will set the sample id for the given field
    window.dkf.setSampleId = function (idField, dta) {

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
                && ng.startsWith('infection') ?

                '\n- Target pathogen responsible for infection: ' + dta.tapaNg : '') +
            '\n- Primary storage type: ' + dta.stType +
            '\n- Number of sample storage type: ' + dta.sampleNo +
            '\n\n' +
            'ATTENTION: By typing "ok", you confirm that the information is correct.' +
            'With this, the sample ID is generated.');

        // abort if the user does not want to generate the id
        if (!answer || answer.toLowerCase() != 'ok') {
            return;
        }

        // set the value of the input field
        idField.val(dta.sampleId);

    }

    // define our setup function
    window.dkf.__sampleId = function () {

        // information to be displayed to users
        var alertInfo = 'Attention: You changed a variable that is relevant for the NCCR Sample ID, but an NCCR Sample ID was already generated. You now have two options:\n\n 1) If the NCCR Sample ID is already used (i.e., printed and pasted on the sample), DO NOT generate the NCCR Sample ID again!!!\n\n 2) If the NCCR Sample ID is NOT already used (i.e., printed and pasted on the sample), you should generate the NCCR Sample ID again now by clicking again on the "Generate ID"-Button. \n\nIf in doubt about which applies (1 or 2), also DO NOT generate the NCCR Sample ID again.';

        var alertOnChangeRepetition = function (event) {
            var triggeredOn = $(this);

            // get the current sample repetition group for this id
            var repetitionGroup = triggeredOn.closest('div').closest('td');

            // check if any sampleId is defined
            var nccridFields = $('input[name^=ff_nsmpl_nccrid]', repetitionGroup);
            var sampleIdUsed = false;
            nccridFields.each(function () {
                var fieldValue = $(this).val();
                if (isEmpty(fieldValue) === false) {
                    sampleIdUsed = true;
                }
            });

            if (sampleIdUsed) {
                alert(alertInfo);
            }

        }

        var alertOnChangeSampleGroup = function (event) {
            var triggeredOn = $(this);
            // get the sample group for the storage type
            var sampleGroup = triggeredOn.closest('div').next();
            var nccrid = $('input[name^=ff_nsmpl_nccrid]', sampleGroup).val();

            // nothing to do, if nccrid is empty
            if (isEmpty(nccrid)) {
                return;
            }

            alert(alertInfo);
        }


        // TODO: Refactor
        // handle changes in the value of the select field to specify
        // the number of samples, since this will result
        // in new nccr id fields that need to be enhanced
        var handleSampleChange = function (updateFn) {

            // find all select fields where the name starts with the given text
            var fields = document.querySelectorAll('select[name^=ff_nsmpl_amt]');

            // filter out all items that do not match ^ff_nsmpl_amt_[0-9]+$
            var nameMatcher = new RegExp('^ff_nsmpl_amt_[0-9]+$');
            var selectedFields = [];

            for (var i = 0; i < fields.length; i++) {

                // nothing to do, if the field name does not match our criteria
                if (nameMatcher.test(fields[i].name) == false) {
                    continue;
                }

                // react to field changes, as this changes the number of 
                // available samples and accordingly the available sample id fields
                fields[i].addEventListener('onchange', function () {
                    updateFn();
                });

                // watch select field for changes
                selectedFields.push(fields[i]);
            }

        }

    }

})();