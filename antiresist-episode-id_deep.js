var episodeIdDeepInitialized = false;

// // TODO: I tried something here, but it did not work (I'm sure you know how to do it :))
// // // make episode ID fields readonly from the beginning
// // var idFields = document.querySelectorAll('[name^=ff_episode_uniqid_2]');

// // idFields.forEach(function (item) {
// //     item.prop('readonly', true)
// // });

// // custom scope to generate sample ids
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

    var alertInfoDeep = 'Attention: You changed a variable that is relevant for the Episode ID PLUS site, but an Episode ID PLUS site was already generated. Please generate the Episode ID PLUS site again by clicking again on the "Generate ID"-Button.';

    var alertOnChange = function(event){
        var triggeredOn = $(this);

        // check if the episode ID is already defined
        var episodeId = $('input[name=ff_episode_uniqid_2]');
        var episodeIdUsed = false;
        var fieldValue = episodeId.val();
        if (isEmpty(fieldValue) === false) {
            episodeIdUsed = true;
        };

        if (episodeIdUsed) {
            alert(alertInfo);
        }
        
    }
    
    var alertOnChangeRepetition = function(event){
        var triggeredOn = $(this);
        
        // get the current sample repetition group for this id
        var repetitionGroup = triggeredOn.closest('div').closest('td');

        // check if any sampleId is defined
        var episodeIdDeepFields = $('input[name^=ff_episode_uniqidsit]', repetitionGroup);
        var episodeIdDeepUsed = false;
        episodeIdDeepFields.each(function(){
            var fieldValue = $(this).val();
            if (isEmpty(fieldValue) === false) {
                episodeIdDeepUsed = true;
            }
        });

        if (episodeIdDeepUsed) {
            alert(alertInfo);
        }
        
    }

    // watch changes in any fields that have an
    // influence on the Episode Id PLUS site for Deep-seated infections
    var watchChanges = function() {

        var mainGroup = selectField('ff_episode_maingrp', null);
        mainGroup.on('change', alertOnChange);

        var episodeNo = $('[name^=ff_episode_nmb]');
        episodeNo.on('change', alertOnChange);

        var episodeClass = selectField('ff_episode_class', null);
        episodeClass.on('change', alertOnChange);

        var infType = selectField('ff_inf_type', null);
        infType.on('change', alertOnChangeRepetition);

        var bji_loc = selectField('ff_inf_bji_loc', null);
        bji_loc.on('change', alertOnChangeRepetition);

        var bji_side = selectField('ff_inf_bji_side', null);
        bji_side.on('change', alertOnChangeRepetition);

        var infColsite = selectField('ff_inf_d_colsite', null);
        infColsite.on('change', alertOnChangeRepetition);

    }

    // // generate the id for an nccr sample
    // var generateId = function(event) {

    //     // prevent the browser from firing the default events
    //     event.preventDefault();
    //     event.stopPropagation();

    //     // get button as jquery element
    //     var btn = $(event.target);

    //     // get the input field that belongs to the button
    //     var inputField = btn.prev();
    //     var currentFieldContent = inputField.val();

    //     // get the sample group for the storage type
    //     var sampleGroup = btn.closest('div').prev();

    //     // get the current sample repetition group for this id
    //     var repetitionGroup = btn.closest('div').closest('td');

    //     // samplingNo is an text input field
    //     var samplingNo = function (parent) {
    //         var fields = selectField('ff_nsmpl_smplid', parent);
    //         return fields.val();
    //     }(repetitionGroup);

    //     // stType is a select field in the same sample as the button
    //     var stType = function (parent) {

    //         var fields = $('[name^=ff_nsmpl_store]', parent);

    //         // ensure that we have only the store field (not the store_nb field)
    //         var nameMatcher = new RegExp('^ff_nsmpl_store[0-9]+');
    //         var selectedItem = fields.filter(function (index) {
    //             return nameMatcher.test(this.name);
    //         });

    //         return selectedText(selectedItem);

    //     }(sampleGroup);

    //     // sampleNo is an input field in the same sample as the button
    //     var sampleNo = function (parent) {
    //         var fields = $('[name^=ff_nsmpl_store_nb]', parent);
    //         return fields.val();
    //     }(sampleGroup);

    //     // tapa is a select field
    //     var tapa = function (parent) {
    //         var fields = selectField('ff_nsmpl_tapa', parent);
    //         // return selected option of select field
    //         return selectedText(fields);
    //     }(repetitionGroup);

    //     // mopo is a radio button field
    //     var mopo = function (parent) {
    //         var fields = $('input[name^=ff_nsmpl_mopo]', parent);
    //         var selectedFields = fields.filter(function () {
    //             return $(this).prop('checked') === true;
    //         });

    //         // return empty string if no checked fields were found
    //         if (!selectedFields || selectedFields.length == 0) {
    //             return '';
    //         }

    //         // use the id of the checked field, to find a corresponding label
    //         // and extract the text content of the label
    //         var fieldId = selectedFields.attr('id');
    //         var label = $('label[for=' + fieldId + ']', parent);
    //         var txt = label.text();

    //         return txt;
    //     }(repetitionGroup);

    //     // tapaNg is a select field
    //     var tapaNg = function (parent) {
    //         var fields = selectField('ff_nsmpl_nt_tapa', parent);
    //         return selectedText(fields);
    //     }(repetitionGroup);

    //     // ng is a radio button
    //     var ng = function (parent) {
    //         var fields = $('input[name^=ff_nsmpl_ng]', parent);
    //         var selectedFields = fields.filter(function () {
    //             return $(this).prop('checked') === true;
    //         });

    //         // return empty string if no checked fields were found
    //         if (!selectedFields || selectedFields.length == 0) {
    //             return '';
    //         }

    //         // use the id of the checked field, to find a corresponding label
    //         // and extract the text content of the label
    //         var fieldId = selectedFields.attr('id');
    //         var label = $('label[for=' + fieldId + ']', parent);
    //         var txt = label.text();

    //         return txt;
    //     }(repetitionGroup);


    //     // --- check if all required values have been provided. If not, throw an alert message ---

    //     if (isEmpty(samplingNo) || isEmpty(stType) || isEmpty(tapa) || isEmpty(sampleNo) ||
    //         (tapa != 'No growth' && tapa != 'No data from routine microbiology') && isEmpty(mopo) ||
    //         (tapa == 'No growth' || tapa == 'No data from routine microbiology') && isEmpty(ng) ||
    //         (tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') && isEmpty(tapaNg)) {

    //         // check for each value if it is not empty (or < Please choose > )
    //         // and inform the user if the value is empty
    //         alert('ID for NCCR sample could not be generated. Some input is missing:\n\n' + (isEmpty(samplingNo) ? '!! Missing: ' : 'OK: ') + 'ID for sampling event\n' +
    //             (isEmpty(tapa) ? '!! Missing: ' : 'OK: ') + 'Main target pathogen\n' +
    //             (tapa != 'No growth' && tapa != 'No data from routine microbiology' ? (isEmpty(mopo) ? '!! Missing: ' : 'OK: ') + 'Monomicrobial or polymicrobial growth\n' : '') +
    //             (tapa == 'No growth' || tapa == 'No data from routine microbiology' ? (isEmpty(ng) ? '!! Missing: ' : 'OK: ') + 'Sample event control or infection\n' : '') +
    //             ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') ? (isEmpty(tapaNg) ? '!! Missing: ' : 'OK: ') + 'Target pathogen responsible for infection\n' : '') +
    //             (isEmpty(stType) ? '!! Missing: ' : 'OK: ') + 'Primary storage type\n' +
    //             (isEmpty(sampleNo) ? '!! Missing: ' : 'OK: ') + 'Number of sample storage type\n');

    //         return;

    //     }

    //     // check if the sampling number was specified correctly (conforms to Regex)
    //     var checkSamplingNo = new RegExp('^[D|T|U]{1}-[A-Z]{3}[0-9]{5}$');

    //     if (checkSamplingNo.test(samplingNo) == false) {

    //         alert('The entered ID for this sampling event does not comply with the standard. It should start with D, T or U, followed by the center abbreviation (e.g., USB) and a five-digit number.');
    //         return;

    //     }

    //     // --- encode the sample id ---

    //     // initialize the sample id
    //     var sampleId = '';

    //     // start with the sampling number
    //     sampleId += samplingNo;

    //     // add the storage type
    //     var stTypeMap = {
    //         'Frozen': 'F',
    //         'Fixed': 'H',
    //         'Native': 'N',
    //         'Whole blood': 'B',
    //         'RNA': 'R',
    //         'Other': 'O'
    //     }

    //     if (Object.keys(stTypeMap).indexOf(stType) == -1) {
    //         alert('Sample storage type not found');
    //         return;
    //     }

    //     sampleId += stTypeMap[stType];


    //     // add the sample number
    //     var checkSampleNo = new RegExp('^[0-9]{2}$');

    //     if (checkSampleNo.test(sampleNo) == false) {

    //         alert('The number of the sample storage type is not correct. This needs to be a two-digit number (e.g., 01, 02 ... 10, 11, etc.).');
    //         return;

    //     }

    //     sampleId += sampleNo;

    //     // add the target pathogen
    //     var tapaMap = {
    //         'S. aureus': 'SA',
    //         'P. aeruginosa': 'PA',
    //         'E. coli': 'EC',
    //         'Klebsiella spp.': 'KS',
    //         'Other': 'OS',
    //         'No growth': 'NG',
    //         'No data from routine microbiology': 'ND'
    //     }

    //     if (Object.keys(tapaMap).indexOf(tapa) == -1) {
    //         alert('Target pathogen not found');
    //         return;
    //     }

    //     sampleId += tapaMap[tapa];

    //     // add additional information
    //     var mopoMap = {
    //         'Monomicrobial': 'm',
    //         'Polymicrobial': 'p',
    //     }

    //     var tapaNgMap = {
    //         'S. aureus': 'sa',
    //         'P. aeruginosa': 'pa',
    //         'E. coli': 'ec',
    //         'Klebsiella spp.': 'ks',
    //         'Other': 'os'
    //     }

    //     var ngMap = {
    //         'control (no infection)': 'co',
    //         'infection with target pathogen (within prior 3 months or 10 days after sampling)': 'inf'
    //     }

    //     if (tapa != 'No growth' && tapa != 'No data from routine microbiology') {

    //         if (Object.keys(mopoMap).indexOf(mopo) == -1) {
    //             alert('Monomicrobial or polymicrobial growth not found');
    //             return;
    //         }

    //         sampleId += mopoMap[mopo];

    //     } else if ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection')) {

    //         if (Object.keys(tapaNgMap).indexOf(tapaNg) == -1) {
    //             alert('Target pathogen responsible for infection not found');
    //             return;
    //         }

    //         sampleId += tapaNgMap[tapaNg];

    //     } else if ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('control')) {

    //         if (Object.keys(ngMap).indexOf(ng) == -1) {
    //             alert('Sample event control or infection not found');
    //             return;
    //         }

    //         sampleId += ngMap[ng];

    //     } else {

    //         // If needed info is not there (i.e., values could not be matched), throw this alert
    //         alert('Additional information needed for sample ID is missing!');
    //         return;

    //     }

    //     if (currentFieldContent != '') {
    //         var answer = prompt('Attention: A sample ID is already specified, please type OVERWRITE to overwrite the current sample ID');
    //         if (answer.toLowerCase() != 'overwrite') {
    //             return;
    //         }
    //     }


    //     // Check that the sample ID matches a certain regex, if not, throw an alert
    //     var checkId = new RegExp('^[D|T|U]-[A-Z]{3}[0-9]{5}[F|H|B|N|R|O]{1}[0-9]{2}(SA|PA|EC|KS|OS|NG|ND)([pm]{1}|(sa|pa|ec|ks|os|co))$');

    //     if (checkId.test(sampleId) == false) {

    //         alert('The generated ID for this sample does not comply with the standard. Please make sure all variables are specified correctly.');
    //         return;

    //     }

    //     // Check that the sample storage and sample number combination is unique within one sampling event

    //     // Get all sample IDs in the repetition group
    //     var sampleIds = function (parent) {

    //         var selected = $('[name^=ff_nsmpl_nccrid]', parent).map(function(){
    //             return $(this).val();
    //         }).get();

    //         return selected

    //     }(repetitionGroup);

    //     // Check that the current ID is unique (not already used)
    //     // If it is not: The sample number is not unique within this storage type and needs to be changed

    //     if (jQuery.inArray(sampleId, sampleIds) == 0) {

    //         alert('The generated ID for this sample is already used. Please check that the combination of storage type and sample number is unique within this sampling event.');
    //         return;

    //     }

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

    //     // make field editable again
    //     inputField.prop('readonly', false)
        
    //     // set the value of the input field
    //     inputField.val(sampleId);

    //     // make field uneditable again
    //     inputField.prop('readonly', true)

    //};

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

//     var selectedText = function (selectElement) {
//         var selectedOption = $('option:selected', selectElement);
//         if (selectedOption.length == 0) {
//             return '';
//         }
//         return selectedOption.text()
//     }

//     // add a new button to every nccr id field
//     var addButtons = function () {

//         // find all fields for nccrd id sample ids
//         var idFields = document.querySelectorAll('[name^=ff_nsmpl_nccrid]');

//         // go through all fields and append a button, if there is not already a button
//         idFields.forEach(function (item) {

//             // nothing to do, if there is already a button
//             if (item.nextSibling && item.nextSibling.tagName == 'BUTTON') {
//                 return;
//             }

//             // create a new button and append it after the text input field
//             var btn = document.createElement('button');
//             btn.innerHTML = 'Generate ID';
//             btn.style.marginLeft = '8px';

//             btn.onclick = generateId;

//             item.parentNode.appendChild(btn);
//         })
//     };

//     // handle changes in the value of the select field to specify
//     // the number of samples, since this will result
//     // in new nccr id fields that need to be enhanced
//     var handleSampleChange = function (updateFn) {

//         // find all select fields where the name starts with the given text
//         var fields = document.querySelectorAll('select[name^=ff_nsmpl_amt]');

//         // filter out all items that do not match ^ff_nsmpl_amt_[0-9]+$
//         var nameMatcher = new RegExp('^ff_nsmpl_amt_[0-9]+$');
//         var selectedFields = [];

//         for (var i = 0; i < fields.length; i++) {

//             // nothing to do, if the field name does not match our criteria
//             if (nameMatcher.test(fields[i].name) == false) {
//                 continue;
//             }

//             // react to field changes, as this changes the number of 
//             // available samples and accordingly the available sample id fields
//             fields[i].addEventListener('onchange', function () {
//                 updateFn();
//             });

//             // watch select field for changes
//             selectedFields.push(fields[i]);
//         }

//     }

//     // initialize the script to handle changes when the number
//     // of samples is changed
//     handleSampleChange(addButtons);

//     // ensure that buttons are added from the start
//     addButtons();

    // watch all changes in sample id related fields
    watchChanges();

}

// add custom nccrid functionality as soon as windows is completely loaded
// note: secutrial is using the window load event itself, so we must
// ensure, that this does not overwrite the respective event listener
$(window).load(function () {
    episodeIdDeep();
});