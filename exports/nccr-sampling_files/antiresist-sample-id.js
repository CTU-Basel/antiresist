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

        // watch the form for changes
        window.dkf.watchForChanges();

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
                window.dkf.handleGenerateIdClick(idField);
            };

            // create a link to open the id in a separate window
            var popupButton = document.createElement('a');
            popupButton.style.marginLeft = '8px';
            popupButton.style.textDecoration = 'underline';
            popupButton.style.cursor = 'pointer';
            popupButton.innerHTML = "To separate window";
            popupButton.onclick = function (event) {
                // prevent the browser from firing the default events
                event.preventDefault();
                event.stopPropagation();
                window.dkf.handlePopupClick(idField);
            };

            // and append the button after the input button
            idField.parent().append(idButton);
            idField.parent().append(popupButton);
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

            if (answer.toLowerCase() != 'overwrite') {
                alert("ID has NOT been changed");
                return;
            }
        }

        // // get the sample group for the storage type
        // TODO: check if we still need this information somehow
        // var sampleGroup = btn.closest('div').prev();

        // // get the current sample repetition group for this id
        // TODO: check if we still need this information somehow
        // var repetitionGroup = btn.closest('div').closest('td');

        // gather the current form data
        var dta = window.dkf.gatherFormData();
        if (window.dkf.hasErrors(dta)) {
            dta._errors.unshift("ERROR: Could not gather form data:")
            // alert(dta._errors.join("\n- "));
            return;
        }

        // generate the id from the form data
        var result = window.dkf.generateId(dta, fieldName);
        if (window.dkf.hasErrors(result)) {
            dta._errors.unshift("ERROR: Could not generate id:")
            // alert(dta._errors.join("\n- "));
            return
        }

        // store the id in the data array
        dta.sampleId = result.id;

        // generate the id for the given id field
        window.dkf.setSampleId(idField, dta);


    };

    // handlePopupClick will display the current id in a separate window
    window.dkf.handlePopupClick = function (idField) {
        // TODO: get the patient id from the page content
        var patID = '';
        if (!patID || patID == '') patID = '[NOT FOUND]';

        // get the current value from the id field
        var id = $(idField).val();
        if (!id) id = '[EMPTY]';

        // TODO: add some styling and allow users to remove the sample from the list
        var popup = window.open("", "sampleids", "width=600,height=200,popup=yes");
        popup.document.write("<p><b>Patient ID: </b>" + patID + "</p><p><b>Sample ID: </b>" + id + "</p>");
    }

    // gatherFormData will serialize the current form. most selections and 
    // radio groups are only stored as numbers, therefore we need to apply
    // some additional processing to get the effective values.
    window.dkf.gatherFormData = function (idField) {

        // parse the sample information into an object for further processing
        var dta = {
            sampleId: null,
            samplingNo: null,
            stType: null,
            sampleNo: null,
            tapa: null,
            mopo: null,
            tapaNg: null,
            ng: null,
            _errors: []
        }

        // serialize the content of the secutrial from
        var form = $('form[name=pageForm]');
        var formData = form.serializeArray();

        // define the fields of interest
        var relevantFields = [
            'ff_nsmpl_smplid',
            'ff_nsmpl_store',
            'ff_nsmpl_store_nb',
            'ff_nsmpl_tapa',
            'ff_nsmpl_mopo',
            'ff_nsmpl_nt_tapa',
            'ff_nsmpl_ng',
            'ff_nsmpl_nccrid'
        ];

        // remove all numbers and underscore from the end of the name
        var trimRegExp = new RegExp("[0-9_]+$");

        // filter out all fields that are not really relevant to us
        var relevantData = formData.reduce(function (agg, item) {

            // get the base name of the field
            var baseName = item.name.replace(trimRegExp, '');

            // nothing to do, if the field is not of interest to us
            if (relevantFields.indexOf(baseName) == -1) {
                return agg
            }

            // add the baseName ot the item
            item.baseName = baseName;

            // get text values from select fields and radio buttons
            item.value = window.dkf.extractTextValue(item);

            // we skip all items, that do not have a value
            // TODO: check if this is a good idea
            if (item.value == '') {
                return agg
            }

            // add the field to the list of relevant items
            agg.push(item);
            return agg;
        }, []);

        // TODO: extract the relevant data from our the form information

        dta._errors.push("not yet implemented");

        return dta;

    };

    // extractTextValue will try to extract the text value of the given field
    window.dkf.extractTextValue = function (item) {

        // no selection string should be handled as empty values
        if (item.value == 'WONoSelectionString') {
            return '';
        }

        // false is used for not selected radio options, maybe it would be
        // good to not keep these anyways. note: radio options will have 
        // multiple items, one for every available option.
        // TODO: return something to indicate that we can remove the item
        if (item.value === 'false') {
            return '';
        }

        var inputField = $('[name=' + item.name + ']');
        var tag = inputField.prop('tagName').toLowerCase();
        var inputType = inputField.prop('type');

        if (tag != 'select' && tag != 'radio') {
            tag = inputType;
        }

        // handle select fields
        if (tag == 'select') {
            var selectedOption = $('option[value=' + item.value + ']', inputField);
            item.value = selectedOption.text();
        }

        // handle radio fields
        if (tag == 'radio') {
            // radio buttons have a strange setup with labels that use underscore
            // and value in the for attribute, to set the corresponding field
            // to the respective value. note: this is not a proper html setup
            // and might be changed by the vendor in the future
            var labelForSelection = $('label[for=' + item.name + '_' + item.value + ']');
            item.value = labelForSelection.text();
        }

        return item.value;
    };


    // generateId will process the given form data to generate an id
    window.dkf.generateId = function (sampleData) {

        // TODO: move code from below into this function

        return {
            id: 'some id',
            _errors: []
        };
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


        // generate the id for an nccr sample
        var generateId = function (event) {

            // samplingNo is an text input field
            var samplingNo = function (parent) {
                var fields = selectField('ff_nsmpl_smplid', parent);
                return fields.val();
            }(repetitionGroup);

            // stType is a select field in the same sample as the button
            var stType = function (parent) {

                var fields = $('[name^=ff_nsmpl_store]', parent);

                // ensure that we have only the store field (not the store_nb field)
                var nameMatcher = new RegExp('^ff_nsmpl_store[0-9]+');
                var selectedItem = fields.filter(function (index) {
                    return nameMatcher.test(this.name);
                });

                return selectedText(selectedItem);

            }(sampleGroup);

            // sampleNo is an input field in the same sample as the button
            var sampleNo = function (parent) {
                var fields = $('[name^=ff_nsmpl_store_nb]', parent);
                return fields.val();
            }(sampleGroup);

            // tapa is a select field
            var tapa = function (parent) {
                var fields = selectField('ff_nsmpl_tapa', parent);
                // return selected option of select field
                return selectedText(fields);
            }(repetitionGroup);

            // mopo is a radio button field
            var mopo = function (parent) {
                var fields = $('input[name^=ff_nsmpl_mopo]', parent);
                var selectedFields = fields.filter(function () {
                    return $(this).prop('checked') === true;
                });

                // return empty string if no checked fields were found
                if (!selectedFields || selectedFields.length == 0) {
                    return '';
                }

                // use the id of the checked field, to find a corresponding label
                // and extract the text content of the label
                var fieldId = selectedFields.attr('id');
                var label = $('label[for=' + fieldId + ']', parent);
                var txt = label.text();

                return txt;
            }(repetitionGroup);

            // tapaNg is a select field
            var tapaNg = function (parent) {
                var fields = selectField('ff_nsmpl_nt_tapa', parent);
                return selectedText(fields);
            }(repetitionGroup);

            // ng is a radio button
            var ng = function (parent) {
                var fields = $('input[name^=ff_nsmpl_ng]', parent);
                var selectedFields = fields.filter(function () {
                    return $(this).prop('checked') === true;
                });

                // return empty string if no checked fields were found
                if (!selectedFields || selectedFields.length == 0) {
                    return '';
                }

                // use the id of the checked field, to find a corresponding label
                // and extract the text content of the label
                var fieldId = selectedFields.attr('id');
                var label = $('label[for=' + fieldId + ']', parent);
                var txt = label.text();

                return txt;
            }(repetitionGroup);


            // --- check if all required values have been provided. If not, throw an alert message ---

            if (isEmpty(samplingNo) || isEmpty(stType) || isEmpty(tapa) || isEmpty(sampleNo) ||
                (tapa != 'No growth' && tapa != 'No data from routine microbiology') && isEmpty(mopo) ||
                (tapa == 'No growth' || tapa == 'No data from routine microbiology') && isEmpty(ng) ||
                (tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') && isEmpty(tapaNg)) {

                // check for each value if it is not empty (or < Please choose > )
                // and inform the user if the value is empty
                alert('ID for NCCR sample could not be generated. Some input is missing:\n\n' + (isEmpty(samplingNo) ? '!! Missing: ' : 'OK: ') + 'ID for sampling event\n' +
                    (isEmpty(tapa) ? '!! Missing: ' : 'OK: ') + 'Main target pathogen\n' +
                    (tapa != 'No growth' && tapa != 'No data from routine microbiology' ? (isEmpty(mopo) ? '!! Missing: ' : 'OK: ') + 'Monomicrobial or polymicrobial growth\n' : '') +
                    (tapa == 'No growth' || tapa == 'No data from routine microbiology' ? (isEmpty(ng) ? '!! Missing: ' : 'OK: ') + 'Sample event control or infection\n' : '') +
                    ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') ? (isEmpty(tapaNg) ? '!! Missing: ' : 'OK: ') + 'Target pathogen responsible for infection\n' : '') +
                    (isEmpty(stType) ? '!! Missing: ' : 'OK: ') + 'Primary storage type\n' +
                    (isEmpty(sampleNo) ? '!! Missing: ' : 'OK: ') + 'Number of sample storage type\n');

                return;

            }

            // check if the sampling number was specified correctly (conforms to Regex)
            var checkSamplingNo = new RegExp('^[D|T|U]{1}-[A-Z]{3}[0-9]{5}$');

            if (checkSamplingNo.test(samplingNo) == false) {

                alert('The entered ID for this sampling event does not comply with the standard. It should start with D, T or U, followed by the center abbreviation (e.g., USB) and a five-digit number.');
                return;

            }

            // --- encode the sample id ---

            // initialize the sample id
            var sampleId = '';

            // start with the sampling number
            sampleId += samplingNo;

            // add the storage type
            var stTypeMap = {
                'Frozen': 'F',
                'Fixed': 'H',
                'Native': 'N',
                'Whole blood': 'B',
                'RNA': 'R',
                'Other': 'O'
            }

            if (Object.keys(stTypeMap).indexOf(stType) == -1) {
                alert('Sample storage type not found');
                return;
            }

            sampleId += stTypeMap[stType];


            // add the sample number
            var checkSampleNo = new RegExp('^[0-9]{2}$');

            if (checkSampleNo.test(sampleNo) == false) {

                alert('The number of the sample storage type is not correct. This needs to be a two-digit number (e.g., 01, 02 ... 10, 11, etc.).');
                return;

            }

            sampleId += sampleNo;

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

            if (Object.keys(tapaMap).indexOf(tapa) == -1) {
                alert('Target pathogen not found');
                return;
            }

            sampleId += tapaMap[tapa];

            // add additional information
            var mopoMap = {
                'Monomicrobial': 'm',
                'Polymicrobial': 'p',
            }

            var tapaNgMap = {
                'S. aureus': 'sa',
                'P. aeruginosa': 'pa',
                'E. coli': 'ec',
                'Klebsiella spp.': 'ks',
                'Other': 'os'
            }

            var ngMap = {
                'control (no infection)': 'co',
                'infection with target pathogen': 'inf'
            }

            if (tapa != 'No growth' && tapa != 'No data from routine microbiology') {

                if (Object.keys(mopoMap).indexOf(mopo) == -1) {
                    alert('Monomicrobial or polymicrobial growth not found');
                    return;
                }

                sampleId += mopoMap[mopo];

            } else if ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection')) {

                if (Object.keys(tapaNgMap).indexOf(tapaNg) == -1) {
                    alert('Target pathogen responsible for infection not found');
                    return;
                }

                sampleId += tapaNgMap[tapaNg];

            } else if ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('control')) {

                if (Object.keys(ngMap).indexOf(ng) == -1) {
                    alert('Sample event control or infection not found');
                    return;
                }

                sampleId += ngMap[ng];

            } else {

                // If needed info is not there (i.e., values could not be matched), throw this alert
                alert('Additional information needed for sample ID is missing!');
                return;

            }

            if (currentFieldContent != '') {
                var answer = prompt('Attention: A sample ID is already specified, please type OVERWRITE to overwrite the current sample ID');


                if (answer.toLowerCase() != 'overwrite') {

                    alert('ID has NOT been changed')
                    return;

                }

            }


            // Check that the sample ID matches a certain regex, if not, throw an alert
            var checkId = new RegExp('^[D|T|U]-[A-Z]{3}[0-9]{5}[F|H|B|N|R|O]{1}[0-9]{2}(SA|PA|EC|KS|OS|NG|ND)([pm]{1}|(sa|pa|ec|ks|os|co))$');

            if (checkId.test(sampleId) == false) {

                alert('The generated ID for this sample does not comply with the standard. Please make sure all variables are specified correctly.');
                return;

            }

            // Check that the sample storage and sample number combination is unique within one sampling event

            // Get all sample IDs in the repetition group
            var sampleIds = function (parent) {

                var selected = $('[name^=ff_nsmpl_nccrid]', parent).map(function () {
                    return $(this).val();
                }).get();

                return selected

            }(repetitionGroup);

            // Check that the current ID is unique (not already used)
            // If it is not: The sample number is not unique within this storage type and needs to be changed

            if (jQuery.inArray(sampleId, sampleIds) == 0) {

                alert('The generated ID for this sample is already used. Please check that the combination of storage type and sample number is unique within this sampling event.');
                return;

            }



        };


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

        // initialize the script to handle changes when the number
        // of samples is changed
        handleSampleChange(addButtons);

        // ensure that buttons are added from the start
        addButtons();

        // watch all changes in sample id related fields
        watchChanges();

    }

    // hasErrors will check if the given element has errors associated with it
    window.dkf.hasErrors = function (element) {
        if (!element._errors) return false;
        return element._errors.length > 0;
    }

})();