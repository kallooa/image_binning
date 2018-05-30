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
            break;
        case "array":
            printArray(items);
            break;
    }
}

function getChildren(parent) {
    for (var child in parent) {
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
        array.push("<li><div class='inner' href='javascript:void(0);>'" + myArray[i] + "</div></li>");
    }
}

function restoreUserProgress(anatomicNodes, user) {
    numNodes = anatomicNodes.length;
    var node_name;
    var infoStr = '';
    for (i = 0; i<numNodes; i++) {
        node_name = anatomicNodes[i];
        node_name = node_name+"_node";
        $('#'+node_name).attr('style', 'background:steelblue');
    }
    node_name = $('*').find('[idx='+numNodes+']')[0].id;
    parents = $('#'+node_name).parents('li').children('a');
    loop_start = parents.length - 1;
    for (i = loop_start; i>=0; i--) {
        this_node = parents[i].id.replace('_node','');
        if (i==loop_start) {
            infoStr = this_node;
        } else {
            infoStr = infoStr+' > '+this_node
        }
    }
    begin_node_parents_ul = $('#'+node_name).parents('ul').not(':last');
    for (i = begin_node_parents_ul.length-1; i >=0; i--) {
        begin_node_parents_ul[i].style.display = "block";
    }
    for (i=0; i<parents.length; i++) {
        $this = $(parents[i])
        level = parseInt($this.attr('level'));
        this_id = $this.attr('id');
        children = $('#' + this_id).parent().find("[level='" + (level + 1) + "']")
        drawRadio(children);
    }
    for (i=0; i<categories.length; i++) {
        anatom = categories[i];
        category_total = $('#'+anatom+'_node').parent().find('a').length;
        num_complete = $('#'+anatom+'_node').parent().find("a[style='background:steelblue']").length;
        document.getElementById(anatom+'_progress').innerText = 'Progress: ' + num_complete + '/' + category_total;
    }
    
    sweetAlert('User '+user+' was found. \n Your last completed node was: '+anatomicNodes[numNodes-1]+'\n Please begin with: \n'+infoStr)
}

function drawRadio(chidren) {
    children.each(function(index) {
        this_width = $(this).width();
        text_width = $(this).children('[id$=_text]').width();
        anatomic_id = $(this).attr('id').replace('_node', '');
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
            var sp = $("<span>").attr('style', 'float:left; position:absolute; margin-left: ' + (this_width - 300 - text_width) + 'px')
                .attr('id', anatomic_id + '_span');
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
                e.stopPropagation();
                activateNodeBox(this);
                var prevAgreementValue = UserDataObj[0].agreement;
                var prevAnatomicValue = UserDataObj[0].anatomic;
                var anatomic_id = this.id.replace('_span', '');
                var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val()
                if (agreement == 'no') {
                    if ($('#' + anatomic_id + '_node').find('[id*=commentSpan]').length == 0) {
                        addCommentBox(this);
                        $('#' + anatomic_id + '_node').find('[id*=commentBox]').first().focus();
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
                }
            }).dblclick(function(e) {
                console.log("double-clicked but did nothing");
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        }
    });
}

function activateNodeBox(node) {
    node_complete_color = 'steelblue';
    branch_complete_color = 'green';
    if ($(node).parent().attr('status') != 'complete') {
        node.parentElement.style.background = node_complete_color;
        $(node).parent().attr('status', 'complete');
        current_category = $(node).parents().children('a').last();
        current_category_denominator = current_category.parent().find('a').length;
        category_status_id = current_category.attr('id').replace('node', 'progress');
        current_count = parseInt(document.getElementById(category_status_id).innerText.replace('Progress: ', '').replace(current_category_denominator, '').replace(/ \//g, ''));
        document.getElementById(category_status_id).innerText = 'Progress: ' + (current_count + 1) + '/' + current_category_denominator;
        applyToggle(node);
    }
}

function applyToggle(node, close = false) {
    this_tag = $(node)[0].tagName;
    if (this_tag == 'SPAN') {
        var $this = $(node.parentElement);
    } else {
        var $this = $(node);
    }
    first_child_node = $this.siblings().children('li').children('a').first()[0];
    if (first_child_node != undefined) {
        toggle_status = first_child_node.style.display;
        if (toggle_status == '') {
            $this.siblings().children('li').children('a').first()[0].style.display = 'block';
            $this.next().toggleClass('show');
            $this.parent().parent().find('li .inner').removeClass('show');
            $this.next().slideToggle(250);
            level = parseInt($this.attr('level'));
            this_id = $this.attr('id');
            children = $('#' + this_id).parent().find("[level='" + (level + 1) + "']")
            drawRadio(children);
        } else if ((toggle_status == 'block' && this_tag == 'A') || close == true) {
            $this.parent().parent().find('li .inner').removeClass('show');
            $this.next().slideToggle(250);
        }
    }
}

function addCommentBox(node) {
    var $this = $(node.parentElement);
    var anatomic_id = node.parentElement.id.replace('_node', '');
    var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val();
    var tb = $(document.createElement('span')).attr("id", anatomic_id + '_commentSpan').attr("style", "float:right; margin-right:10px; color:black");
    tb.after().html('<input type="text" id="' + anatomic_id + '_commentBox" value="" placeholder="Enter Alternative">');
    $this.append(tb);
    $('#' + anatomic_id + '_commentBox').click(function(e) {
        e.stopPropagation();
    }).focusout(function() {
        UserDataObj[0].agreement = agreement;
        UserDataObj[0].anatomic = anatomic_id;
        UserDataObj[0].usercomment = $(this).val();
        UserDataObj[0].timestamp = Date();
        UserDataObj[0].timeInt = Date.now();
        UserDataObj[0].user_name = $('#container1').attr('user_name');
        UserDataObj[0].user_institution = $('#container1').attr('user_institution');
        UserDataObj[0].user_email = $('#container1').attr('user_email');
        socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
        UserDataObj = [{}];
    });
    $('#' + anatomic_id + '_span').mouseleave(function(e) {
        if (agreement != undefined && Object.keys(UserDataObj[0]).length != 0) {
            UserDataObj[0].timestamp = Date();
            UserDataObj[0].timeInt = Date.now();
            if (agreement == 1) {
                UserDataObj[0].user_name = $('#container1').attr('user_name');
                UserDataObj[0].user_institution = $('#container1').attr('user_institution');
                UserDataObj[0].user_email = $('#container1').attr('user_email');
                socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
                UserDataObj = [{}];
            }
        }
    });
}

function isValidKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 123 || charCode == 125 || charCode == 58 || charCode == 36) {
        return false;
    } else {
        return true;
    }
}

function load_data1() {
    socket.emit("requestJSON1", '1');
    socket.on("returnJSON1", function(data) {
        socket.emit("requestJSON2", '2');
        allData = JSON.parse(data)[0];
        socket.on("returnJSON2", function(data) {
            anatomicLevels = JSON.parse(data);
            var anatomic_length = anatomicLevels.length;
            printList(allData);
            array.push("<ul>");
            $("#list").html(array.join(""));
            var idx = 0;
            $('a').each(function(index) {
                anatomic_name = this.text;
                anatomic_id = anatomic_name.replace(/ /g, '');
                $(this).attr('id', anatomic_id + '_node')
                $(this).attr('status', 'incomplete');
                $(this).attr('level', anatomicLevels.filter(function(loc) {
                    return loc.Location == anatomic_name
                })[0].Level);
                $(this).attr('idx', idx);
                idx = idx+1;
                var radio_options = [{
                    "Id": anatomic_id + "_Yes",
                    "Name": "Yes",
                    "Value": 'yes'
                }, {
                    "Id": anatomic_id + "_No",
                    "Name": "No",
                    "Value": 'no'
                }];
                if (categories.indexOf(anatomic_id) > -1) {
                    this_width = $(this).width();
                    text_width = $(this).children('[id$=_text]').width();
                    var sp = $("<span>").attr('style', 'float:left; position:absolute; margin-left: ' + (this_width - 300 - text_width) + 'px').attr('id', anatomic_id + '_span')
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
                    var sp2 = $("<span>").attr('style', 'float:left; left: 30px; position:absolute').attr('id', anatomic_id + '_progress');
                    this.append(sp2[0])
                    document.getElementById(anatomic_id + '_progress').innerText = 'Progress: 0'
                    document.getElementById(anatomic_id + '_text').style.position = 'absolute';
                    document.getElementById(anatomic_id + '_text').style.left = '205px';
                    document.getElementById(anatomic_id + '_span').style.marginLeft = '350px';
                }
                addGranularityButton(this);
                $(this).mouseenter(function() {
                    this_name = this.id.replace('_node', '');
                    im1 = document.createElement('img')
                    $('#the_image').append($('<img>', {
                        src: "../libs/AnatomySurvey/anatomic_processed/" + this_name + ".jpg",
                        width: $('#the_image').parent().width(),
                        //height: $('#the_image').parent().width(),
                        id: this_name
                    }));
                });
                $(this).mouseleave(function() {
                    this_name = this.id.replace('_node', '');
                    $('img#' + this_name).remove();
                    var agreement = [$('form#' + this.id.replace('_node', ''))[0].elements[0].checked, $('form#' + this.id.replace('_node', ''))[0].elements[1].checked].indexOf(true) ? 'no' : 'yes';
                    if (agreement != undefined && Object.keys(UserDataObj[0]).length != 0) {
                        UserDataObj[0].timestamp = Date();
                        UserDataObj[0].timeInt = Date.now();
                        if (agreement == 'yes') {
                            UserDataObj[0].user_name = $('#container1').attr('user_name');
                            UserDataObj[0].user_institution = $('#container1').attr('user_institution');
                            UserDataObj[0].user_email = $('#container1').attr('user_email');
                            socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
                        } else {
                            if ($('#' + this.id.replace('_node', '_commentBox')).val() == '') {
                                alert('Must enter alternative if you disagree');
                            }
                        }
                        UserDataObj = [{}];
                    }
                });
            });
            $('.toggle').click(function(e) {
                level = parseInt($(this).attr('level'));
                this_id = this.id;
                children = $('#' + this_id).parent().find("[level='" + (level + 1) + "']")
                toggle_status = $(this).siblings()[0].style.display;
                var $this = $(this);
                applyToggle(this);
            });
            $("[id$=_span]").click(function(e) {
                e.stopPropagation();
                activateNodeBox(this);
                var prevAgreementValue = UserDataObj[0].agreement;
                var prevAnatomicValue = UserDataObj[0].anatomic;
                var anatomic_id = this.id.replace('_span', '');
                var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val()
                if (agreement == 'no') {
                    if ($('#' + anatomic_id + '_node').find('[id*=commentSpan]').length == 0) {
                        addCommentBox(this);
                        $('#' + anatomic_id + '_node').find('[id*=commentSpan]').first().attr('style', 'float:right; margin-right: 10px; color: black');
                        $('#' + anatomic_id + '_node').find('[id*=commentBox]').first().focus();
                    }
                } else {
                    if ($('#' + anatomic_id + '_node').find('[id*=commentSpan]').length > 0) {
                        $('#' + anatomic_id + '_node').find('[id*=commentSpan]').remove();
                    }
                }
                if (agreement != null && agreement != prevAgreementValue) {
                    UserDataObj[0].agreement = agreement;
                    UserDataObj[0].anatomic = anatomic_id;
                }
            }).dblclick(function(e) {
                console.log("double-clicked but did nothing");
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        });
    });
}

function addGranularityButton(node) {
    var anatomic_id = node.id.replace('_node', '');
    var add_button = $("<span>").attr('style', 'float:left; margin-left: -25px; color:red; font-size: 22px; font-weight: 600;');
    add_button[0].innerText = "+";
    add_button[0].id = anatomic_id + '_addGranularity';
    $(node).prepend(add_button);
    $('#' + anatomic_id + '_addGranularity').click(function(e) {
        e.stopPropagation();
        var anatom_id = this.id.replace('_addGranularity', '');
        var agreement = $("input[type=radio][id*=" + anatomic_id + "]:checked").val();
        subnode_level = $(this).parent().attr('level') + 1;
        var next_node_style = $(this.parentElement).siblings().first()[0].style.display;
        parentId = $(this).parent().attr('id');
        if (agreement != undefined && next_node_style == 'block') {
            addSubNode($(this.parentElement).siblings()[0], parentId);
            user_added_nodes = $(this.parentElement.parentElement).find('[user_added*=true]');
            for (i = 0; i < user_added_nodes.length; i++) {
                $(user_added_nodes[0]).attr('level', subnode_level);
            }
        } else if (agreement != undefined && next_node_style == '') {
            addSubNode($(this).parent().siblings().first(), parentId);
            $(this).parent().siblings().first().attr('style', 'display:block');
        } else {
            alert('Please respond at this level before adding a sub-level node')
        }
    });
}

function addSubNode(node, parentId) {
    newNode_li = document.createElement('li');
    newNode_a = document.createElement('a');
    newNode_input = document.createElement('input');
    $(newNode_input).attr('placeholder', 'Enter Name').attr('style', 'color:black');
    $(newNode_a).attr('class', 'toggle').attr('href', 'javascript:void(0);').attr('style', 'color:white').attr('user_added', 'true');
    $(newNode_a).append(newNode_input);
    $(newNode_li).append(newNode_a);
    $(newNode_input).focusout(function() {
        newNodename = $(this).val();
        this.parentElement.id = newNodename;
        newNodeLevel = $(this).parent().parent().siblings().children().first().attr('level');
        $(this.parentElement).attr('level', newNodeLevel);
        this_name = newNodename;
        if (this_name != "") {
            UserDataObj[0].anatomic = this_name;
            UserDataObj[0].agreement = 'not_applicable';
            UserDataObj[0].user_added = true;
            UserDataObj[0].parent = parentId.replace('_node', '');
            UserDataObj[0].timestamp = Date();
            UserDataObj[0].timeInt = Date.now();
            UserDataObj[0].user_name = $('#container1').attr('user_name');
            UserDataObj[0].user_institution = $('#container1').attr('user_institution');
            UserDataObj[0].user_email = $('#container1').attr('user_email');
            socket.emit("SurveyDataFromUser", JSON.stringify(UserDataObj));
            UserDataObj = [{}];
        } else {
            alert('Must enter a name for subnode');
        }
    });
    $(node).append(newNode_li);
    $(newNode_a).children('input').first().focus();
}

function appendSaveButtons() {
    var $input = $('<input type="button" class="savebtn" id="saveProgressBtn" value="Save Progress" />');
    $input.appendTo($("#list"));
    var $input2 = $('<input type="button" class="savebtn" id="finalizeBtn" value="Finalize and Submit" />');
    $input2.appendTo($("#list"));
    $('#saveProgressBtn').click(function(){
        sweetAlert('Thank you! Progress Saved!')
    })
    $('#finalizeBtn').click(function(){
        num_complete = $('#list').find("[status='complete']").length;
        if (num_complete < 384){
            sweetAlert('Survey incomplete', 'Please complete the other boxes', 'error');
        } else {
            sweetAlert('Thank you! Survey Submitted!');
        }
    })
}

function draw_survey(array) {
    load_data1();
}