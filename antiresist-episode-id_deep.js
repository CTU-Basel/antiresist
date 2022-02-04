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

    var alertOnChangeRepetitionDeep = function(event){
        var triggeredOn = $(this);
        
        // get the current repetition group for this id
        var repetitionGroup = triggeredOn.closest('div').closest('td');

        // check if any episode ID PLUS site is defined
        var episodeIdDeepFields = $('input[name^=ff_episode_uniqidsit]', repetitionGroup);
        var episodeIdDeepUsed = false;
        episodeIdDeepFields.each(function(){
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
    var watchChangesDeep = function() {

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
    var generateIdDeep = function(event) {

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

        // infection type is a select field
        var infType = function(parent) {
            var fields = selectField('ff_inf_type', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location is a select field
        var bji_loc = function(parent) {
            var fields = selectField('ff_inf_bji_loc', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location side is a select field
        var bji_ssti_side = function(parent) {
            var fields = selectField('ff_inf_ssti_bji_side', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // infection location is a select field
        var ssti_loc = function(parent) {

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
        var infColsite = function(parent) {
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
        var bji_locMod = bji_loc.toLowerCase().replace(/ /g,".");
        
        // Take side of bone or joint or skin and soft tissue infection: Replace white spaces with "." and convert to lower case
        var bji_ssti_sideMod = bji_ssti_side.toLowerCase().replace(/ /g,".");

        // Take location of skin and soft tissue infection: Replace white spaces with "." and convert to lower case
        var ssti_locMod = ssti_loc.toLowerCase().replace(/ /g,".");

        // Take the first word from infection Type
        var infTypeFirst = infType.replace(/ .*/,'');

        // Take the first word from infection site
        var infColsiteFirst = infColsite.replace(/ .*/,'');

        // Define when to add which var

        if((episodeClass == 'infection' && infType == 'bone and joint infection') || (episodeClass != 'infection' && infColsite == 'bone or joint')){

            epiIdDeep += bji_locMod + '_' + bji_ssti_sideMod

        } else if((episodeClass == 'infection' && infType == 'skin and soft tissue infection without bone or joint involvement') || (episodeClass != 'infection' && infColsite == 'skin and soft tissue')){

            epiIdDeep += ssti_locMod + '_' + bji_ssti_sideMod

        } else if(episodeClass == 'infection' && infType != 'bone and joint infection' && infType != 'skin and soft tissue infection without bone or joint involvement'){

            epiIdDeep += infTypeFirst

        } else if(episodeClass != 'infection' && infColsite != 'bone or joint' && infColsite != 'skin and soft tissue'){

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
        var epiIdsDeep = $('[name^=ff_episode_uniqidsit]').map(function(){
                return $(this).val();
        }).get();

        if (jQuery.inArray(epiIdDeep, epiIdsDeep) == 0) {

            alert('The generated Episode ID PLUS site is already used. Please check the variables for infection type / anatomic site and (if bone and joint or skin and soft tissue) anatomic location and anatomic side.');
            return;

        }

        // Check if the first part of the ID is identical to the episode ID above, if not, throw an alert
        
        var epiID = function(parent) {
            var fields = selectField('ff_episode_uniqid', parent);
            // return selected option of select field
            return fields.val();
        }(null);

        var epiIdDeepPart = epiIdDeep.substring(epiIdDeep.indexOf("_", 11), "")

        if(epiIdDeepPart != epiID){

            alert('The generated Episode ID PLUS site and the Episode ID do not match. Please generate the Episode ID (and possible further Episode IDs PLUS site) again, too')

        }

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
            var openWindowIdDeep = function(){
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