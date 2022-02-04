var episodeIdInitialized = false;

// // TODO: I tried something here, but it did not work (I'm sure you know how to do it :))
// // // make episode ID fields readonly from the beginning
// // var idFields = document.querySelectorAll('[name^=ff_episode_uniqid_]');

// // idFields.forEach(function (item) {
// //     item.prop('readonly', true)
// // });

// Check if the first part of the ID is identical to the episode ID above, if not, throw an alert

// Get all IDs plus site
var epiIdsDeep = $('[name^=ff_episode_uniqidsit]').map(function(){
            return $(this).val();
}).get();

// Extract the first part of the string that should correspond to the Episode ID
var epiIdsDeepPart = $.map(epiIdsDeep, function(val){

    return val.substring(val.indexOf("_", 11), "");
    
});

// If any of the Episode IDs PLUS site does not match the Episode ID, throw an alert that says to generate them again, too
if(jQuery.inArray(epiId, epiIdsDeepPart) == 0 && epiIdsDeepPart.every((val, i, arr) => val === arr[0])){

    alert('The generated Episode ID does not match with all Episode IDs PLUS site. Please generate the Episode IDs PLUS site again, too')

}

// // custom scope to generate episode ids
// // note: jquery must be loaded beforehand
// // which is done already by secutrial
var episodeId = function () {

    // ensure that function is only initialized once
    if (episodeIdInitialized === true) {
        return;
    }
    episodeIdInitialized = true;

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

    var alertOnChange = function(){

        // check if any episode ID is defined
        var episodeIdFields = $('input[name^=ff_episode_uniqid_]');
        var episodeIdUsed = false;
        episodeIdFields.each(function(){
            var fieldValue = $(this).val();
            if (isEmpty(fieldValue) === false) {
                episodeIdUsed = true;
            }
        });

        var mainGroup = selectField('ff_episode_maingrp', null);

        if(selectedText(mainGroup) == 'Deep-seated'){

            var alertText = 'Attention: You changed a variable that is relevant for the Episode ID and Episode ID PLUS site, but an Episode ID and/or an Episode ID PLUS site was already generated. Please generate the Episode ID and the Episode ID PLUS site again by clicking again on the "Generate ID"-Button. If you have already copied the ID into other forms, please update the ID there as well.';

        } else {

            var alertText = 'Attention: You changed a variable that is relevant for the Episode ID, but an Episode ID was already generated. Please generate the Episode ID again by clicking again on the "Generate ID"-Button. If you have already copied the ID into other forms, please update the ID there as well.';

        }

        if (episodeIdUsed) {

            alert(alertText);
        }
        
    }


    // watch changes in any fields that have an
    // influence on the Episode Id
    var watchChanges = function() {

        var mainGroup = selectField('ff_episode_maingrp', null);
        var episodeNo = $('[name^=ff_episode_nmb]');
        var episodeClass = selectField('ff_episode_class', null);

        mainGroup.on('change', alertOnChange);
        episodeNo.on('change', alertOnChange);
        episodeClass.on('change', alertOnChange);

    }

    // Get patient ID (needed for window later on)
    // The PatID is the second navigationlevellink object
    // Extract only the PatID (with center code)
    // @Ramon: I know this is a bit risky... Do you think this could change, or vary between browsers?
    // It should not, right?
    var patID = document.getElementsByClassName('navigationlevellink')[1].text.replace(/\s+/g, '').replace(/>Patient/, '');

    // generate the general episode id
    var generateId = function(event) {

        // prevent the browser from firing the default events
        event.preventDefault();
        event.stopPropagation();

        // get button as jquery element
        var btn = $(event.target);

        // get the input field that belongs to the button
        var inputField = btn.prev();
        var currentFieldContent = inputField.val();

        // main anatomic group is a select field
        var mainGroup = function(parent) {
            var fields = selectField('ff_episode_maingrp', parent);
            // return selected option of select field
            return selectedText(fields);
        }(null);

        // episode number is an number input field
        var episodeNo = function(parent) {
            var fields = selectField('ff_episode_nmb', parent);
            return fields.val();
        }(null);

        // episode class is a select field
        var episodeClass = function(parent) {
            var fields = selectField('ff_episode_class', parent);
            // return selected option of select field
            return selectedText(fields);
        }(null);

        // --- check if all required values have been provided. If not, throw an alert message ---

        if (isEmpty(mainGroup) || isEmpty(episodeNo) || isEmpty(episodeClass)) {

            // check for each value if it is not empty (or < Please choose > )
            // and inform the user if the value is empty
            alert('Episode ID could not be generated. Some input is missing:\n\n' + 
                (isEmpty(mainGroup) ? '!! Missing: ' : 'OK: ') + 'Main anatomic group\n' +
                (isEmpty(episodeNo) ? '!! Missing: ' : 'OK: ') + 'Episode number\n' +
                (isEmpty(episodeClass) ? '!! Missing: ' : 'OK: ') + 'Episode class\n');

            return;

        }

        // --- encode the episode id---

        // initialize the episode id
        var epiId = '';

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

        epiId += mainGroupMap[mainGroup];

        // add the episode number
        epiId += episodeNo;

        // add the episode class
        var episodeClassMap = {
            'infection': '_infection',
            'colonisation': '_colonisation',
            'no growth, no infection (control)': '_nogrowth.noinfection',
        }

        if (Object.keys(episodeClassMap).indexOf(episodeClass) == -1) {
            alert('Episode class not found');
            return;
        }

        epiId += episodeClassMap[episodeClass];


        // @Ramon: We could do this here as well, but I don't think this is necessary, will ask Richard again
    //     if (currentFieldContent != '') {
    //         var answer = prompt('Attention: An Episode ID is already specified, please type OVERWRITE to overwrite the current ID');
    //         if (answer.toLowerCase() != 'overwrite') {

    //              alert('ID has NOT been changed')
    //              return;

    //          } else{

    //              alert('Change of ID successfull')

    //          }
    //     }

        // @Ramon: I think we do not need this, either (Regex would have to be adapted), we already test for empty values, at least, 
        // the number field is restricted to 1 or 2-digit numbers, and the rest is drop-downs.
    //     // Check that the episode ID matches a certain regex, if not, throw an alert
    //     var checkId = new RegExp('^[D|T|U]-[A-Z]{3}[0-9]{5}[F|H|B|N|R|O]{1}[0-9]{2}(SA|PA|EC|KS|OS|NG|ND)([pm]{1}|(sa|pa|ec|ks|os|co))$');

    //     if (checkId.test(sampleId) == false) {

    //         alert('The generated ID for this sample does not comply with the standard. Please make sure all variables are specified correctly.');
    //         return;

    //     }

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
        inputField.val(epiId);

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

    // add a new button to every episode id field
    var addButtons = function () {

        // find all fields for episode Ids
        var idFields = document.querySelectorAll('[name^=ff_episode_uniqid_]');

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
            btn.addEventListener("click", generateId);

            // open window on button click, but only if an id is written in the field
            // TODO @Ramon: right now, the window opens also if the respective ID is empty.
            // I tried several things to open this only when an ID is written in the field
            // (it should not open if generateId ends without a (new) ID being written in the field)
            // how could this best be done? (with item.value, it does not work)

            var openWindowId = function(){
                var IdWindow = window.open("", "", "width=600,height=200")
                IdWindow.document.write("<p><b>Patient ID: </b>" + patID + "</p><p><b>Episode ID: </b>" + item.value + "</p>")
            };
            
            btn.addEventListener("click", openWindowId);

            item.parentNode.appendChild(btn);

        })
    };

    // ensure that buttons are added from the start
    addButtons();

    // watch all changes in episode id related fields
    watchChanges();

}

// add custom functionality as soon as window is completely loaded
// note: secutrial is using the window load event itself, so we must
// ensure, that this does not overwrite the respective event listener
$(window).load(function () {
    episodeId();
});