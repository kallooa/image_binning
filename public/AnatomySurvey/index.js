function checkUser() {
    f = $.getJSON("/api/1a2f164967f55325", function(data) {
        if (data.hasOwnProperty('username')) {
            u69614 = data.username;
            console.log('Username: ' + u69614);
            return u69614;
        }
    });
    return f;
}

function printList(items) {
    switch ($.type(items)) {
        case "object":
            getChildren(items);
            break;
        case "string":
            array.push("<li>" + items + "</li>");
            //console.log(items);
            break;
        case "array":
            printArray(items);
            break;
    }
}

function getChildren(parent) {
    for (var child in parent) {
        //console.log(child);
        //console.log(parent[child], Object.keys(parent[child]).length);
        if (Object.keys(parent[child]).length > 0) {
            array.push("<li><a class='toggle' href='javascript:void(0);'><span style='float:left' id=" + child.replace(/ /g, '') + "_text>" + child + "</span><img src='../img/arrow-down.png' style='float:right'></a><ul class='inner'>");
        } else {
            array.push("<li><a class='toggle' href='javascript:void(0);'><span style='float:left' id=" + child.replace(/ /g, '') + "_text>" + child + "</span></a><ul class='inner'>"); //<input id='checkBoxYes' type='checkbox' style='margin-left:2.5em'>Yes<input id='checkBoxNo' type='checkbox' style='margin-left:2.5em'>No
        }
        printList(parent[child]);
        array.push("</ul></li>");
    }
}

function printArray(myArray) {
    for (var i = 0; i < myArray.length; i++) {
        //console.log(myArray[i]);
        //console.log('yoyo1');
        array.push("<li><div class='inner' href='javascript:void(0);>'" + myArray[i] + "</div></li>");
    }
}

function drawRadio(chidren) {
    children.each(function(index) {
        //console.log(this.id);
        this_width = $(this).width();
        text_width = $(this).children('[id$=_text]').width();
        anatomic_id = $(this).attr('id').replace('_node', '');
        //console.log(anatomic_id);
        if ($('#' + this.id).find("[id$=_span]").length < 1) {
            var radio_options = [{
                "Id": anatomic_id + "_Yes",
                "Name": "Yes",
                "Value": 'yes'
            }, {
                "Id": anatomic_id + "_No",
                "Name": "No",
                "Value": 'no'
            }];
            var sp = $("<span>").attr('style', 'float:left; position:absolute; margin-left: ' + (this_width - 400 - text_width) + 'px')
                .attr('id', anatomic_id + '_span');
            //console.log(sp);
            //.attr('onClick', 'function(e){e.stopPropagation(); activateNodeBox(this); applyToggle(this);}');
            //$(sp).attr('onClick', 'function(e){e.stopPropagation(); activateNodeBox(this); applyToggle(this);}');
            sp.append('<form id=' + anatomic_id + '>');

            $.each(radio_options, function() {
                sp[0].childNodes[0].append(
                    $("<label />", {
                        'text': this.Name
                    }).append(
                        $("<input />", {
                            type: 'radio',
                            name: anatomic_id + 'Options',
                            id: 'inputOptions' + this.Id,
                            value: this.Value
                        })
                    )[0]
                );
            });
            this.append(sp[0]);

            $(this).find('[id$=_span]').click(function(e) {
                //console.log(this.parentElement);
                e.stopPropagation();
                //applyToggle(this);
                activateNodeBox(this);
                var prevAgreementValue = UserDataObj[0].agreement;
                var prevAnatomicValue = UserDataObj[0].anatomic;
                var anatomic_id = this.id.replace('_span', '');
                var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val()
                if (agreement == 'no') {
                    console.log('agreement', agreement);
                    console.log('olen', $(anatomic_id + '_node').find('[id*=commentSpan]'));
                    if ($('#' + anatomic_id + '_node').find('[id*=commentSpan]').length == 0) {
                        addCommentBox(this);
                        //e.stopImmediatePropagation();
                    }
                } else {
                    if ($('#' + anatomic_id + '_node').find('[id*=commentSpan]').length > 0) {
                        $('#' + anatomic_id + '_node').find('[id*=commentSpan]').remove();
                    }
                }
                if (agreement != undefined) {
                    UserDataObj[0].agreement = agreement;
                    UserDataObj[0].anatomic = anatomic_id;
                    UserDataObj[0].level = $(this.parentElement).attr('level');

                    //socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
                    //UserDataObj = [{}];
                }
            }).dblclick(function(e) {

                /**
                 * Prevent double-click in case of fast animation or sloppy browser.
                 */
                console.log("double-clicked but did nothing");

                e.stopPropagation();
                e.preventDefault();
                return false;
            }).mouseout(function(e) {
        //console.log('inputs', $("input[type=radio][id*=" + anatomic_id + "]"));
        var agreement = [$('form#' + this.id.replace('_span', ''))[0].elements[0].checked, $('form#' + this.id.replace('_span', ''))[0].elements[1].checked].indexOf(true) ? 'no':'yes';
        console.log('agreement', agreement);
        //console.log('olen', UserDataObj[0].length);
        if (agreement != undefined && Object.keys(UserDataObj[0]).length != 0) {
            UserDataObj[0].timestamp = Date();
            UserDataObj[0].timeInt = Date.now();
            console.log(anatomic_id);
            if (agreement == 'yes') {
                console.log('emit');
                socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
            }

            UserDataObj = [{}];
        }
    });

        }
    });
    //addClick();
}

function activateNodeBox(node) {
    node_complete_color = 'steelblue';
    branch_complete_color = 'green';
    if ($(node).parent().attr('status') != 'complete') {
        node.parentElement.style.background = node_complete_color;
        $(node).parent().attr('status', 'complete');
        //console.log($(node).parent()[0].id, $(node).parent()[0].attributes.status.value);
        current_category = $(node).parents().children('a').last();
        current_category_denominator = current_category.parent().find('a').length;
        category_status_id = current_category.attr('id').replace('node', 'progress');
        current_count = parseInt(document.getElementById(category_status_id).innerText.replace('Progress: ', '').replace(current_category_denominator, '').replace(/ \//g, ''));
        document.getElementById(category_status_id).innerText = 'Progress: ' + (current_count + 1) + '/' + current_category_denominator;
        //console.log('category', current_count);
        applyToggle(node);
    }
}

function applyToggle(node) {
    var $this = $(node.parentElement);
    show_class_missing = !($this.next().hasClass('show'));
    if (show_class_missing) {
        $this.next().toggleClass('show');
        $this.parent().parent().find('li .inner').removeClass('show');
        $this.next().slideToggle(250);
        level = parseInt($(node).parent().attr('level'));
        this_id = $(node).parent().attr('id');
        children = $('#' + this_id).parent().find("[level='" + (level + 1) + "']")
        drawRadio(children);
    }
}

function addCommentBox(node) {
    var $this = $(node.parentElement);
    console.log('cb', $this);
    //break

    var anatomic_id = node.parentElement.id.replace('_node', '');
    var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val();
    var tb = $(document.createElement('span')).attr("id", anatomic_id + '_commentSpan').attr("style", "float:right; margin-right:100px; color:black");
    tb.after().html('<input type="text" id="' + anatomic_id + '_commentBox" value="" placeholder="Enter Alternative" onkeypress="return isValidKey(event)">');
    $this.append(tb);
    $('#' + anatomic_id + '_commentBox').click(function(e) {
        e.stopPropagation();
    }).focusout(function() {
        UserDataObj[0].agreement = agreement;
        UserDataObj[0].anatomic = anatomic_id;
        UserDataObj[0].usercomment = $(this).val();
        UserDataObj[0].timestamp = Date();
        UserDataObj[0].timeInt = Date.now();
        socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
    });
    $('#' + anatomic_id + '_span').mouseleave(function(e) {
        console.log('inputs', $("input[type=radio][id*=" + anatomic_id + "]"));
        console.log('agreement', agreement);
        //console.log('olen', UserDataObj[0].length);
        if (agreement != undefined && Object.keys(UserDataObj[0]).length != 0) {
            UserDataObj[0].timestamp = Date();
            UserDataObj[0].timeInt = Date.now();
            console.log(anatomic_id);
            if (agreement == 1) {
                console.log('emit');
                socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
            }

            UserDataObj = [{}];
        }
    });
}

function isValidKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46 || charCode == 33 || charCode == 63 || ((charCode > 47 && charCode < 58) || (charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123))) {
        return true;
    } else {
        return false;
    }
}