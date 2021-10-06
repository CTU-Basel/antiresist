// custom scope to generate sample ids
// note: jquery must be loaded beforehand
// which is done already by secutrial
var nccrid = function() {

    // generate the id for an nccr sample
    var generateId = function(event) {

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

        // var samplingNo = 'ff_nsmpl_smplid_[0-9]+'; // übergeordnet
        // var stType = '...';
        // var sampleNo = '...';
        // var tapa = 'ff_nsmpl_tapa_[0-9]+'; // übergeordnet
        // var mopo = 'ff_nsmpl_mopo_[0-9]+'; // nachschauen, ob korrekt; übergeordnet
        // var tapaNg = 'ff_nsmpl_nt_tapa_[0-9]+';
        // var ng = 'ff_nsmpl_ng_[0-9]+'; // nachschauen, ob korrekt; übergeordnet

    };

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