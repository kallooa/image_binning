
//create box object
function createBox(num) {
	var div = document.createElement("div");
	div.className = "box";
	div.id = "box"+num;
	div.style.width = "300px";
	div.style.height = "auto";
	$('#inner').append(div);
	var div2 = document.createElement('div');
	div2.className = "boxTitle";
	div2.id = "boxTitle"+num;
	$('#box'+num).append(div2);
	var div3 = document.createElement('div');
	div3.className = "boxContent";
	div3.id = "boxContent"+num;
	$('#box'+num).append(div3);
	var div4 = document.createElement('div');
	div4.className = "boxBottom";
	div4.id = "boxBottom"+num;
	$('#box'+num).append(div4);
	var div5 = document.createElement('div');
	div5.className = "acceptButton";
	div5.id = "acceptButton"+num;
	div5.num = toString(num);
	div5.innerText = "Complete";
	$('#boxBottom'+num).append(div5);
}
//fill box with relevant data
function populateBox(num) {
	$('#boxTitle'+num)[0].innerText = data[num]["Group"] + ": " + data[num]["LevelA"] + " - " + data[num]["LevelB"];
	var iters = data[num]["LevelC"].length;
	var contentString = "";
	for (var i=0; i<iters; i++) {
		id_string = data[num]["LevelC"][i];
		id_string = id_string.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
		id_string = id_string.replace(/\s/g, '');
		contentString = contentString + "<p id='"+id_string+"-row' status='agree' comment=' '> - <span id='" + id_string + "-text'>"+ data[num]["LevelC"][i] + "</span><span class='x-tick' id='"+ id_string +"-tick'>  &times; </span>" + "</p>";
	}
	$('#boxContent'+num)[0].innerHTML = contentString;
}
function activateButtons() {
	var tickIds = $('.x-tick');
	var iters = tickIds.length;
	for (var i = 0; i<iters; i++){
		$('#' + tickIds[i].id).click(function(){
			var textId = this.id.replace('-tick', '-text');
			$('#' + textId)[0].style = "text-decoration: line-through; text-decoration-color: red;";
			x = document.createElement('input');
			x.type = 'text';
			x.class = 'userComment';
			x.id = this.id.replace('-tick', '-comment');
			console.log(this.id.replace('-tick', '-row'));
			$('#' + this.id.replace('-tick', '-row'))[0].attributes.status.value = 'disagree';
			$(x).on('input', function(){
				$('#' + this.id.replace('-comment', '-row'))[0].attributes.comment.value = this.value;
				//console.log(this);
			});
			var y = document.createElement('div');
			$(y).append(x);
			$('#' + this.id.replace('-tick', '-row')).append(y);
		});
	}
	var acceptButtons = $('.acceptButton');
	var iters_b = acceptButtons.length;
	for (var i = 0; i < iters_b; i++) {
		$('#'+acceptButtons[i].id).click(function(){
			//console.log(this);
			var boxNum = parseInt($(this).parent().parent()[0].id.replace('box', ''));
			var boxContentChildren = $('#boxContent'+boxNum).children();
			//console.log(boxContentChildren);
			var numChildren = boxContentChildren.length;
			var dataStr = '{ "user": "' + useremail + '", "timestamp": "' + new Date() + '", "boxNum": ' +(boxNum+1) + ',';
			//console.log(dataStr);
			for (var i = 0; i<numChildren; i++) {
				dataStr = dataStr + '"' + boxContentChildren[i].id.replace('-row', '') + '": {"status": "' + boxContentChildren[i].attributes.status.value + '", "comment": "' + boxContentChildren[i].attributes.comment.value + '" } '
				if (i != numChildren-1) { dataStr = dataStr + ","}
			}
			dataStr = dataStr + "}"; //this needs to be sent to database
			console.log(dataStr);
			socket.emit('saveDxSurveyData', dataStr);

			$('#boxTitle'+boxNum)[0].style.background = "lightgreen";
			tmpp = document.createElement('p');
			tmpp.innerText = 'Completed!';
			$('#boxTitle'+boxNum).append(tmpp);
		})
	}
}
$(document).ready(function(){
	socket = io();
	socket.emit("requestDxJSON", "request");
	socket.on("returnDxJSON",  function(jsonData) {
		data = JSON.parse(jsonData);
	
		useremail = prompt("Enter your email address: ");
		socket.emit("requestUserProgressDx", useremail);
		socket.on("returnUserProgressDx",  function(progress) {
	            userProgress = progress[0]['boxNum'] + 1;
	            alert("Please begin with Box " + userProgress);
	    });

		for (var i=0; i<data.length; i++) {
			createBox(i);
			populateBox(i);
			if (i == data.length-1) {
				activateButtons();
			}
		}
	});
})