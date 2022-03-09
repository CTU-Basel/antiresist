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

        // watch the form for changes
        window.dkf.watchForChanges();

    };

    // TODO: implement function to watch for changes
    // watchForChanges will watch all relevant fields in the form for changes
    // and alert the user of possible problems with the generated id
    window.dkf.watchForChanges = function () {

        // TODO: implement this function

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
        var idFields = $('[name^=ff_episode_uniqid_]');

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
                // send the id of the current sample to a separate window
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
            var answer = prompt('Attention: An episode ID is already specified, ' +
                'please type OVERWRITE to overwrite the current episode ID');

            if (!answer || answer.toLowerCase() != 'overwrite') {
                alert("ID has NOT been changed");
                return;
            }
        }

        // define a list of required fields
        var vars = {
            mainGroup: { baseName: 'ff_episode_maingrp', scope: 'form', value: '' },
            episodeNo: { baseName: 'ff_episode_nmb', scope: 'form', value: '' },
            episodeClass: { baseName: 'ff_episode_class', scope: 'form', value: '' },
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

        // set the sample id into the given field (might optionally require
        // confirmation from the user)
        window.dkf.setSampleId(idField, result.vars.episodeId);

    };

    // handlePopupClick will display the current id in a separate window
    window.dkf.handlePopupClick = function (idField) {
        var patID = $('#status_add-id').text().trim();
        if (!patID || patID == '') patID = '[NOT FOUND]';

        // get the current value from the id field
        var id = $(idField).val();
        if (!id) id = '[EMPTY]';

        // open the information about the patient and sample id in a separate window
        var popup = window.open("", "antiresist-ids", "width=600,height=200,popup=yes");
        popup.document.write("<p><b>Patient ID: </b>" + patID + "</p><p><b>Episode ID: </b>" + id + "</p>");
    }

    // setSampleId will set the sample id for the given field
    window.dkf.setSampleId = function (idField, episodeId) {
        // set the value of the input field
        idField.val(episodeId);
    }

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
        if (isEmpty(dta.mainGroup) || isEmpty(dta.episodeNo) || isEmpty(dta.episodeClass)) {

            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            result._errors.push('Episode ID could not be generated. Some input is missing:\n\n' +
                (isEmpty(dta.mainGroup) ? '!! Missing: ' : 'OK: ') + 'Main anatomic group\n' +
                (isEmpty(dta.episodeNo) ? '!! Missing: ' : 'OK: ') + 'Episode number\n' +
                (isEmpty(dta.episodeClass) ? '!! Missing: ' : 'OK: ') + 'Episode class\n');
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
        dta.episodeId = ''
        dta.episodeId += encoding.mainGroup[dta.mainGroup];
        dta.episodeId += episodeNo;
        dta.episodeId += encoding.episodeClass[dta.episodeClass];

        result.vars = dta;
        return result;
    };

})();


var episodeIdDeepInitialized = false;

// // TODO: I tried something here, but it did not work (I'm sure you know how to do it :))
// // // make episode ID fields readonly from the beginning
// // var idFields = document.querySelectorAll('[name^=ff_episode_uniqidsit]');

// // idFields.forEach(function (item) {
// //     item.prop('readonly', true)
// // });

// // custom scope to generate episode ids PLUS site
// // note: jquery must be loaded beforehand
// // which is done already by secutrial
var episodeIdDeep = function () {

    // ensure that function is only initialized once
    if (episodeIdDeepInitialized === true) {
        return;
    }
    episodeIdDeepInitialized = true;

    // check if a field value is empty
    var isEmpty = function (value) {
        if (!value) {
            return true;
        }
        if (value === '< Please choose >') {
            return true;
        }
        if (value === '') {
            return true;
        }
        return false;
    }

    var alertInfoDeep = 'Attention: You changed a variable that is relevant for the Episode ID PLUS site, but an Episode ID PLUS site was already generated. Please generate the Episode ID PLUS site again by clicking again on the "Generate ID"-Button. If you have already copied the ID into other forms, please update the ID there as well.';

    var alertOnChangeRepetitionDeep = function (event) {
        var triggeredOn = $(this);

        // get the current repetition group for this id
        var repetitionGroup = triggeredOn.closest('div').closest('td');

        // check if any episode ID PLUS site is defined
        var episodeIdDeepFields = $('input[name^=ff_episode_uniqidsit]', repetitionGroup);
        var episodeIdDeepUsed = false;
        episodeIdDeepFields.each(function () {
            var fieldValue = $(this).val();
            if (isEmpty(fieldValue) === false) {
                episodeIdDeepUsed = true;
            }
        });

        if (episodeIdDeepUsed) {
            alert(alertInfoDeep);
        }

    }

    // watch changes in any fields that have an
    // influence on the Episode Id PLUS site for Deep-seated infections
    var watchChangesDeep = function () {

        var infType = selectField('ff_inf_type', null);
        infType.on('change', alertOnChangeRepetitionDeep);

        var bji_loc = selectField('ff_inf_bji_loc', null);
        bji_loc.on('change', alertOnChangeRepetitionDeep);

        var bji_ssti_side = selectField('ff_inf_ssti_bji_side', null);
        bji_ssti_side.on('change', alertOnChangeRepetitionDeep);

        var infColsite = selectField('ff_inf_d_colsite', null);
        infColsite.on('change', alertOnChangeRepetitionDeep);

        var ssti_loc = selectField('ff_inf_ssti_loc', null);
        ssti_loc.on('change', alertOnChangeRepetitionDeep);

    }

    // Get patient ID (needed for window later on)
    // The PatID is the second navigationlevellink object
    // Extract only the PatID (with center code)
    // @Ramon: I know this is a bit risky... Do you think this could change, or vary between browsers?
    // It should not, right?
    var patID = document.getElementsByClassName('navigationlevellink')[1].text.replace(/\s+/g, '').replace(/>Patient/, '');

    // generate the id for a deep seated episode PLUS site
    var generateIdDeep = function (event) {

        // prevent the browser from firing the default events
        event.preventDefault();
        event.stopPropagation();

        // get button as jquery element
        var btn = $(event.target);

        // get the input field that belongs to the button
        var inputField = btn.prev();
        var currentFieldContent = inputField.val();

        // get the current repetition group for this id
        var repetitionGroup = btn.closest('div').closest('td');

        // main anatomic group is a select field
        var mainGroup = function (parent) {
            var fields = selectField('ff_episode_maingrp', parent);
            // return selected option of select field
            return selectedText(fields);
        }(null);

        // episode number is an number input field
        var episodeNo = function (parent) {
            var fields = selectField('ff_episode_nmb', parent);
            return fields.val();
        }(null);

        // episode class is a select field
        var episodeClass = function (parent) {
            var fields = selectField('ff_episode_class', parent);
            // return selected option of select field
            return selectedText(fields);
        }(null);

        // infection type is a select field
        var infType = function (parent) {
            var fields = selectField('ff_inf_type', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location is a select field
        var bji_loc = function (parent) {
            var fields = selectField('ff_inf_bji_loc', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location side is a select field
        var bji_ssti_side = function (parent) {
            var fields = selectField('ff_inf_ssti_bji_side', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location is a select field
        var ssti_loc = function (parent) {

            var fields = selectField('ff_inf_ssti_loc', parent);

            // ensure that we have only the store field (not the store_nb field)
            var nameMatcher = new RegExp('^ff_inf_ssti_loc_[0-9]+');
            var selectedItem = fields.filter(function (index) {
                return nameMatcher.test(this.name);
            });

            // return selected option of select field
            return selectedText(selectedItem);

        }(repetitionGroup);

        // infection site a select field
        var infColsite = function (parent) {
            var fields = selectField('ff_inf_d_colsite', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);


        // --- check if all required values have been provided. If not, throw an alert message ---

        if (isEmpty(mainGroup) || isEmpty(episodeNo) || isEmpty(episodeClass) ||
            episodeClass == 'infection' && isEmpty(infType) ||
            episodeClass != 'infection' && isEmpty(infColsite) ||
            ((episodeClass == 'infection' && infType == 'bone and joint infection' || episodeClass != 'infection' && infColsite == 'bone or joint') && (isEmpty(bji_loc) || isEmpty(bji_ssti_side))) ||
            ((episodeClass == 'infection' && infType == 'skin and soft tissue infection without bone or joint involvement' || episodeClass != 'infection' && infColsite == 'skin and soft tissue') && (isEmpty(ssti_loc) || isEmpty(bji_ssti_side)))) {

            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            alert('Episode ID PLUS site could not be generated. Some input is missing:\n\n' +
                (isEmpty(mainGroup) ? '!! Missing: ' : 'OK: ') + 'Main anatomic group\n' +
                (isEmpty(episodeNo) ? '!! Missing: ' : 'OK: ') + 'Episode number\n' +
                (isEmpty(episodeClass) ? '!! Missing: ' : 'OK: ') + 'Episode class\n' +
                (episodeClass == 'infection' ? (isEmpty(infType) ? '!! Missing: ' : 'OK: ') + 'Type of infection\n' : '') +
                (episodeClass != 'infection' ? (isEmpty(infColsite) ? '!! Missing: ' : 'OK: ') + 'Anatomic site of sampling\n' : '') +
                ((episodeClass == 'infection' && infType == 'bone and joint infection') || (episodeClass != 'infection' && infColsite == 'bone or joint') ? (isEmpty(bji_loc) ? '!! Missing: ' : 'OK: ') + 'Anatomic location\n' : '') +
                ((episodeClass == 'infection' && infType == 'bone and joint infection') || (episodeClass != 'infection' && infColsite == 'bone or joint') ? (isEmpty(bji_ssti_side) ? '!! Missing: ' : 'OK: ') + 'Anatomic side\n' : '') +
                ((episodeClass == 'infection' && infType == 'skin and soft tissue infection without bone or joint involvement') || (episodeClass != 'infection' && infColsite == 'skin and soft tissue') ? (isEmpty(ssti_loc) ? '!! Missing: ' : 'OK: ') + 'Anatomic location\n' : '') +
                ((episodeClass == 'infection' && infType == 'skin and soft tissue infection without bone or joint involvement') || (episodeClass != 'infection' && infColsite == 'skin and soft tissue') ? (isEmpty(bji_ssti_side) ? '!! Missing: ' : 'OK: ') + 'Anatomic side\n' : ''));

            return;

        }

        // --- encode the episode id PLUS site---

        // initialize the episode id PLUS site
        var epiIdDeep = '';

        // start with the main group
        var mainGroupMap = {
            'Deep-seated': 'Deep',
            'Urine': 'Urine',
            'Tracheal/pulmonal': 'Tracheal',
        }

        if (Object.keys(mainGroupMap).indexOf(mainGroup) == -1) {
            alert('Main anatomic group not found');
            return;
        }

        epiIdDeep += mainGroupMap[mainGroup];

        // add the episode number
        epiIdDeep += episodeNo;

        // add the episode class
        var episodeClassMap = {
            'infection': '_infection_',
            'colonisation': '_colonisation_',
            'no growth, no infection (control)': '_nogrowth.noinfection_',
        }

        if (Object.keys(episodeClassMap).indexOf(episodeClass) == -1) {
            alert('Episode class not found');
            return;
        }

        epiIdDeep += episodeClassMap[episodeClass];

        // add information on type (if not bone or joint or skin and soft tissue) or location and side (if bone or joint or skin and soft tissue)

        // Take location of bone or joint infection: Replace white spaces with "." and convert to lower case
        var bji_locMod = bji_loc.toLowerCase().replace(/ /g, ".");

        // Take side of bone or joint or skin and soft tissue infection: Replace white spaces with "." and convert to lower case
        var bji_ssti_sideMod = bji_ssti_side.toLowerCase().replace(/ /g, ".");

        // Take location of skin and soft tissue infection: Replace white spaces with "." and convert to lower case
        var ssti_locMod = ssti_loc.toLowerCase().replace(/ /g, ".");

        // Take the first word from infection Type
        var infTypeFirst = infType.replace(/ .*/, '');

        // Take the first word from infection site
        var infColsiteFirst = infColsite.replace(/ .*/, '');

        // Define when to add which var

        if ((episodeClass == 'infection' && infType == 'bone and joint infection') || (episodeClass != 'infection' && infColsite == 'bone or joint')) {

            epiIdDeep += bji_locMod + '_' + bji_ssti_sideMod

        } else if ((episodeClass == 'infection' && infType == 'skin and soft tissue infection without bone or joint involvement') || (episodeClass != 'infection' && infColsite == 'skin and soft tissue')) {

            epiIdDeep += ssti_locMod + '_' + bji_ssti_sideMod

        } else if (episodeClass == 'infection' && infType != 'bone and joint infection' && infType != 'skin and soft tissue infection without bone or joint involvement') {

            epiIdDeep += infTypeFirst

        } else if (episodeClass != 'infection' && infColsite != 'bone or joint' && infColsite != 'skin and soft tissue') {

            epiIdDeep += infColsiteFirst

        } else {

            // If needed info is not there (i.e., values could not be matched), throw this alert
            alert('Additional information needed for Episode ID PLUS site is missing!');
            return;

        }

        // @Ramon: We could do this here as well, but I don't think this is necessary, will ask Richard again
        //     if (currentFieldContent != '') {
        //         var answer = prompt('Attention: An Episode ID PLUS site is already specified, please type OVERWRITE to overwrite the current ID');
        //         if (answer.toLowerCase() != 'overwrite') {

        //              alert('ID has NOT been changed')
        //              return;

        //          } else{

        //              alert('Change of ID successfull')

        //          }
        //     }

        // @Ramon: I think we do not need this, either (Regex would have to be adapted), we already test for empty values, at least, 
        // the number field is restricted to 1 or 2-digit numbers, and the rest is drop-downs.
        //     // Check that the episode ID PLUS site matches a certain regex, if not, throw an alert
        //     var checkId = new RegExp('^[D|T|U]-[A-Z]{3}[0-9]{5}[F|H|B|N|R|O]{1}[0-9]{2}(SA|PA|EC|KS|OS|NG|ND)([pm]{1}|(sa|pa|ec|ks|os|co))$');

        //     if (checkId.test(sampleId) == false) {

        //         alert('The generated ID for this sample does not comply with the standard. Please make sure all variables are specified correctly.');
        //         return;

        //     }



        // Check that the current ID is unique (not already used)

        // Get all IDs
        var epiIdsDeep = $('[name^=ff_episode_uniqidsit]').map(function () {
            return $(this).val();
        }).get();

        if (jQuery.inArray(epiIdDeep, epiIdsDeep) == 0) {

            alert('The generated Episode ID PLUS site is already used. Please check the variables for infection type / anatomic site and (if bone and joint or skin and soft tissue) anatomic location and anatomic side.');
            return;

        }

        // TODO: This was a whish from Richard, but it does not make much sense the way it is implemented here (and it somehow breaks
        // something with the window.open, dont know why...). If anything, we would need to implement this such that the alert
        // appears right from the beginning on. But then, you would get the alert every time the fields do not match, also while you are
        // still entering info... I would not do this (it is not mandatory according to Richard)

        // // Check if the first part of the ID is identical to the episode ID above, if not, throw an alert

        // var epiID = function(parent) {
        //     var fields = selectField('ff_episode_uniqid', parent);
        //     // return selected option of select field
        //     return fields.val();
        // }(null);

        // var epiIdDeepPart = epiIdDeep.substring(epiIdDeep.indexOf("_", 11), "")

        // if(epiIdDeepPart != epiID){

        //     alert('The generated Episode ID PLUS site and the Episode ID do not match. Please generate the Episode ID (and possible further Episode IDs PLUS site) again, too')

        // }

        //@Ramon: I think this is also not needed for this ID (would need to be adapted), I will ask Richard again here
        //     // prompt user to check all values
        //     // return if not entered ok
        //     // --- check if all required values have been provided. If not, throw an alert message ---

        //     var answer = prompt('Before the sample ID is generated, please confirm that the following information is correct:\n\n- ID for sampling event: ' + samplingNo +
        //         '\n- Main target pathogen: ' + tapa +
        //         (tapa != 'No growth' && tapa != 'No data from routine microbiology' ? '\n- Monomicrobial or polymicrobial growth: ' + mopo : '') +
        //         (tapa == 'No growth' || tapa == 'No data from routine microbiology' ? '\n- Sample event control or infection: ' + ng : '') +
        //         ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') ? '\n- Target pathogen responsible for infection: ' + tapaNg : '') +
        //         '\n- Primary storage type: ' + stType +
        //         '\n- Number of sample storage type: ' + sampleNo +
        //         '\n\nATTENTION: By typing "ok", you confirm that the information is correct. With this, the sample ID is generated.');

        //     if (answer.toLowerCase() != 'ok') {
        //         return;
        //     }

        // make field editable again
        inputField.prop('readonly', false)

        // set the value of the input field
        inputField.val(epiIdDeep);

        // make field uneditable again
        inputField.prop('readonly', true)

    };

    var selectField = function (start, parent) {
        // use jquery to select all fields that have a name starting with our expression
        var items = []

        // scope the search to a parent dom element, if specified
        if (parent) {
            items = $('[name^=' + start + ']', parent);
        } else {
            items = $('[name^=' + start + ']');
        }

        // create a regular expression matcher that allows 
        var nameMatcher = new RegExp('^' + start + '(_[0-9]+)?$');
        var selectedItems = items.filter(function (index) {
            return nameMatcher.test(this.name);
        });

        return selectedItems;
    }

    var selectedText = function (selectElement) {
        var selectedOption = $('option:selected', selectElement);
        if (selectedOption.length == 0) {
            return '';
        }
        return selectedOption.text()
    }

    // add a new button to every episode id PLUS site field
    var addButtonsDeep = function () {

        // find all fields for episdoe Ids PLUS site
        var idFields = document.querySelectorAll('[name^=ff_episode_uniqidsit]');

        // go through all fields and append a button, if there is not already a button
        idFields.forEach(function (item) {

            // nothing to do, if there is already a button
            if (item.nextSibling && item.nextSibling.tagName == 'BUTTON') {
                return;
            }

            // create a new button and append it after the text input field
            var btn = document.createElement('button');
            btn.innerHTML = 'Generate ID';
            btn.style.marginLeft = '8px';

            // generate Id on click
            btn.addEventListener("click", generateIdDeep);

            // open window on button click, but only if an id is written in the field
            // TODO @Ramon: right now, the window opens also if the respective ID is empty.
            // I tried several things to open this only when an ID is written in the field
            // (it should not open if generateId ends without a (new) ID being written in the field)
            // how could this best be done? (with item.value, it does not work)
            var openWindowIdDeep = function () {
                var IdDeepWindow = window.open("", "", "width=600,height=200")
                IdDeepWindow.document.write("<p><b>Patient ID: </b>" + patID + "</p><p><b>Episode ID PLUS site: </b>" + item.value + "</p>")
            };

            btn.addEventListener("click", openWindowIdDeep);

            item.parentNode.appendChild(btn);
        })
    };

    // ensure that buttons are added from the start
    addButtonsDeep();

    // watch all changes in episode id PLUS site related fields
    watchChangesDeep();

}

// add custom functionality as soon as window is completely loaded
// note: secutrial is using the window load event itself, so we must
// ensure, that this does not overwrite the respective event listener
$(window).load(function () {
    episodeIdDeep();
});