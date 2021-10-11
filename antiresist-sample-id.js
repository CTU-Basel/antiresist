// custom scope to generate sample ids
// note: jquery must be loaded beforehand
// which is done already by secutrial
var nccrid = function() {

    // check if a field value is empty
    var isEmpty = function(value) {
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

    // generate the id for an nccr sample
    var generateId = function(event) {

        console.log('generate id');

        // prevent the browser from firing the default events
        event.preventDefault();
        event.stopPropagation();

        // get button as jquery element
        var btn = $(event.target);

        // get the input field that belongs to the button
        var inputField = btn.prev();
        inputField.css('background', '#c9c9ff');
  
        // get the sample group for this sample id
        var sampleGroup = btn.closest('div').prev();
        sampleGroup.css('color', '#be29ec');

        // get the current sample repetition group for this id
        var repetitionGroup = btn.closest('div').closest('td');
        repetitionGroup.css('color', '#660066');

        // samplingNo is an text input field
        var samplingNo = function(parent) {
            var fields = selectField('ff_nsmpl_smplid', parent);
            return fields.val();
        }(repetitionGroup);
        
        // stType is a select field in the same sample as the button
        var stType = function(parent){
            var fields = $('[name^=ff_nsmpl_store]', parent);
            return selectedText(fields);
        }(sampleGroup);
        
        // sampleNo is generated as incremeting number partitioned
        // on the storage type and sample
        var sampleNo = function(parent, currentType){
            
            // the current type of the sample storage must be specified
            if (!currentType || currentType == '< Please choose >' || currentType == '') {
                return '';
            }
            
            // get all fields starting with ff_nsmpl_store in the
            // same sampling (repetitionGroup)
            var fields = $('[name^=ff_nsmpl_store]', parent);
            
            // ensure that we have only the store fields (no _oth fields)
            var nameMatcher = new RegExp('^ff_nsmpl_store[0-9]+');
            var selectedItems = fields.filter(function(index) {
                return nameMatcher.test(this.name);
            });
            
            // get the selected text of each field
            var selectedOptions = $.map(selectedItems, function(item, index) {
                return selectedText(item);
            });
            
            // filter for our matching type
            var matchingTypes = selectedOptions.filter(function(item) {
                return item.toLowerCase() == currentType.toLowerCase()
            });
            
            // get the number of samples that are currently specified with
            // the same type
            var count = matchingTypes.length;
            
            // our current sample has the same type, therefore we do not 
            // need to increase the counter
            
            // but we need to add a left padding with zeros
            if (count < 10) {
                return '0' + count;
            }
            
            // return the count as text
            return count + '';
            
        }(repetitionGroup, stType);

        // tapa is a select field
        var tapa = function(parent) {
            var fields = selectField('ff_nsmpl_tapa', parent);
            // return selected option of select field
            return selectedText(fields);
        }(repetitionGroup);

        // mopo is a radio button field
        var mopo = function(parent) {
            var fields = $('input[name^=ff_nsmpl_mopo]', parent);
            var selectedFields = fields.filter(function(){
                return $(this).prop('checked') === true;
            });
            
            // return empty string if no checked fields were found
            if (!selectedFields || selectedFields.length == 0) {
                return '';
            }
            
            // use the id of the checked field, to find a corresponding label
            // and extract the text content of the label
            var fieldId = selectedFields.attr('id');
            var label = $('label[for='+ fieldId +']', parent);
            var txt = label.text();
            
            return txt;
        }(repetitionGroup);

        // tapaNg is a select field
        var tapaNg = function(parent) {
            var fields = selectField('ff_nsmpl_nt_tapa', parent);
            return selectedText(fields);
        }(repetitionGroup);

        // ng is a radio button
        var ng = function(parent){
            var fields = $('input[name^=ff_nsmpl_ng]', parent);
            var selectedFields = fields.filter(function(){
                return $(this).prop('checked') === true;
            });
            
            // return empty string if no checked fields were found
            if (!selectedFields || selectedFields.length == 0) {
                return '';
            }
            
            // use the id of the checked field, to find a corresponding label
            // and extract the text content of the label
            var fieldId = selectedFields.attr('id');
            var label = $('label[for='+ fieldId +']', parent);
            var txt = label.text();
            
            return txt;  
        }(repetitionGroup);
        
        console.log('samplingNo', samplingNo);
        console.log('sampleNo', sampleNo);
        console.log('stType', stType);
        console.log('mopo', mopo);
        console.log('tapa', tapa);
        console.log('tapaNg', tapaNg);
        console.log('ng', ng);

        // --- check if all required values have been provided. If not, throw an alert message ---

        if(isEmpty(samplingNo) || isEmpty(stType) || isEmpty(tapa) ||
        (tapa != 'No growth' && tapa != 'No data from routine microbiology') && isEmpty(mopo) || 
        (tapa == 'No growth' || tapa == 'No data from routine microbiology') && isEmpty(ng) || 
        (tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') && isEmpty(tapaNg)) {

             // check for each value if it is not empty (or < Please choose > )
        // and inform the user if the value is empty
        alert('ID for NCCR sample could not be generated. Some input is missing:\n\n- ID for sampling event: ' + (isEmpty(samplingNo) ? 'missing' : 'ok') + 
        '\n- Main target pathogen: ' + (isEmpty(tapa) ? 'missing' : 'ok') + 
        (tapa != 'No growth' && tapa != 'No data from routine microbiology' ? '\n- Monomicrobial or polymicrobial growth: ' + (isEmpty(mopo) ? 'missing' : 'ok') : '') +
        (tapa == 'No growth' || tapa == 'No data from routine microbiology' ? '\n- Sample event control or infection: ' + (isEmpty(ng) ? 'missing' : 'ok') : '') +
        ((tapa == 'No growth' || tapa == 'No data from routine microbiology') && ng.startsWith('infection') ? '\n- Target pathogen responsible for infection: ' + (isEmpty(tapaNg) ? 'missing' : 'ok') : '') +
        '\n- Primary storage type: ' + (isEmpty(stType) ? 'missing' : 'ok'));

        }

       
        // TODO:--- encode the sample id ---

        // initialize the sample id
        var sampleId = '';

        // start with the sampling number
        sampleId += samplingNo;

        // add the storage type
        var stTypeMap = {
            'Frozen': 'F',
            'Fixed': 'H',
            'Native' : 'N',
            'Whole blood' : 'B',
            'RNA' : 'R',
            'Other' : 'O'
        }

        if (Object.keys(stTypeMap).indexOf(stType) == -1) {
            alert('Sample storage type not found');
            return;
        }

        sampleId += stTypeMap[stType];


        // add the sequential sample number
        sampleId += sampleNo;

        // add the target pathogen
        var tapaMap = {
            'S. aureus': 'SA',
            'P. aeruginosa': 'PA',
            'E. coli' : 'EC',
            'Klebsiella spp.' : 'KS',
            'Other' : 'OS',
            'No growth' : 'NG',
            'No data from routine microbiology' : 'ND'
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
            isEmpty() : ''
        }

        if (Object.keys(tapaMap).indexOf(tapa) == -1) {
            alert('Target pathogen not found');
            return;
        }

        var tapaNgMap = {
            'S. aureus': 'sa',
            'P. aeruginosa': 'pa',
            'E. coli' : 'ec',
            'Klebsiella spp.' : 'ks',
            'Other' : 'os'
        }

        if (Object.keys(tapaMap).indexOf(tapa) == -1) {
            alert('Target pathogen not found');
            return;
        }

        var ngMap = {
            'control (no infection)': 'co',
            'infection with target pathogen (within prior 3 months or 10 days after sampling': 'inf'
        }

        if (Object.keys(tapaMap).indexOf(tapa) == -1) {
            alert('Target pathogen not found');
            return;
        }

        sampleId += tapaMap[tapa];

    };

    console.log('sampleId', sampleId)

    var selectField = function(start, parent) {
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
        var selectedItems = items.filter(function(index) {
            return nameMatcher.test(this.name);
        });

        return selectedItems;
    }

    var selectedText = function(selectElement) {
        var selectedOption = $('option:selected', selectElement);
        if (selectedOption.length == 0) {
            return '';
        }
        return selectedOption.text()
    }

    // add a new button to every nccr id field
    var addButtons = function(){

        // find all fields for nccrd id sample ids
        var idFields = document.querySelectorAll('[name^=ff_nsmpl_nccrid]');

        // go through all fields and append a button, if there is not already a button
        idFields.forEach(function(item){

            // nothing to do, if there is already a button
            if (item.nextSibling && item.nextSibling.tagName == 'BUTTON') {
                return;
            }

            // create a new button and append it after the text input field
            var btn = document.createElement('button');
            btn.innerHTML = 'Generate ID';
            btn.style.marginLeft = '8px';

            btn.onclick = generateId;

            item.parentNode.appendChild(btn);
        })
    };

    // handle changes in the value of the select field to specify
    // the number of samples, since this will result
    // in new nccr id fields that need to be enhanced
    var handleSampleChange = function(updateFn) {

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
            fields[i].onchange = function() {
                updateFn();
            };

            // TODO: remove for production
            // make the sample chooser red for us to see that it works
            fields[i].style.color = 'red';

            // watch select field for changes
            selectedFields.push(fields[i]);
        }

    }

    // initialize the script to handlle changes when the number
    // of samples is changed
    handleSampleChange(addButtons);

    // ensure that buttons are added from the start
    addButtons();

}

// add custom nccrid functionality as soon as windows is completely loaded
// note: secutrial is using the window load event itself, so we must
// ensure, that this does not overwrite the respective event listener
$(window).load(function() {
    nccrid();
});