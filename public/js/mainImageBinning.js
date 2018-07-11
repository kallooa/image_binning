data_json = {};
var eventData;
var imgFiles;
var imgFiles_bk;
var current_images;
function navBack() {
    if (current_pt_index > 0) {
        $('#content').find('img').remove();
        $('.dropzone').remove();
        category_counter = 0;
        addFirstDropzone();
        setTimeout(function() {
                current_pt_index -= 1;
                current_pt = categories[current_pt_index];
                console.log(current_pt);
                current_images = imgFiles.filter(function(x){
                    if (x.indexOf(current_pt) != -1) {
                        return x;
                    }
                });
                //console.log(current_images);
                //$('#content').find('img').remove();
                console.log(current_images);

                    $('#nav_indicator')[0].innerText = "Pt: "+categories[current_pt_index];
                    //console.log(current_images[i]);
                    placeImages(current_images);  
            }, 200);
    }
}

function navForward() {
    if (current_pt_index < categories.length) {
        $('#content').find('img').remove();
        $('.dropzone').remove();
        category_counter = 0;
        addFirstDropzone();
        setTimeout(function() {
                current_pt_index += 1;
                current_pt = categories[current_pt_index];
                console.log(current_pt);
                current_images = imgFiles.filter(function(x){
                    if (x.indexOf(current_pt) != -1) {
                        return x;
                    }
                });
                //console.log(current_images);
                //$('#content').find('img').remove();
                console.log(current_images);

                    $('#nav_indicator')[0].innerText = "Pt: "+categories[current_pt_index];
                    //console.log(current_images[i]);
                    placeImages(current_images);
                
            }, 200);
    }
}

function placeImages(imgs) {
    console.log(imgs);
    for (var i=0; i<imgs.length; i++) {
        x = document.createElement('img');
        x.src = '/imgs/' + imgs[i];
        x.id = "yes-drop";
        x.name = imgs[i];
        x.classList.add("draggable");
        if (!x.name.includes(".DS")) {
            $('#content').append(x);
        }
    }
}

function addFirstDropzone() {
	   x = document.createElement('div');
     x.id="category"+(category_counter+1)+"-dropzone";
     x.classList.add('dropzone');
     y = document.createElement('input');
     y.placeholder = "Category "+(category_counter+1);
     y.id = "Category"+(category_counter+1);
     y.className = "categoryName";
     y.addEventListener("change", function(title){
        console.log(title);
        title.target.id = title.target.value;
     })
     x.append(y);
     $('#left').append(x);
     //$(x).insertAfter('#category'+(category_counter)+'-dropzone');
     category_counter+=1;
     var el = document.getElementById("left");
     el.scrollTop = 900000
}


$(document).ready(function() {
    username = prompt('Enter email address: ');
    num1 = prompt('Enter access code: ');

    var SHA256 =  new Hashes.SHA256;
    id = SHA256.hex(num1);
    if (id != '22167355cff64913077bb69aa8a1ca4d7f80442050d5c18a08598b2f0fa17d93') {
        alert('Access Denied!');
        //window.location.replace("http://isicdataupload.com/imageBinning/");
    }

    $('#category1-dropzone').find('input')[0].addEventListener("change", function(title){
        console.log('target', title.target.id);
        title.target.id = title.target.value;
     })

 category_counter = 1;
current_pt = "";
current_pt_index = 0;
 f = $.get("/imgs/", function(data) {
     console.log('data', data);
     imgFiles = data;//$(data).find('a').map(function() {return $(this).text();}).get();
     console.log('imgfiles', imgFiles);
     imgFiles_bk = imgFiles;
     categories = $(imgFiles).map(function() {
         return this.substr(0, this.indexOf('_')); 
     }).get();
     categories = $.unique(categories);
     removeItems = ["", ".DS"];
    for (var i = 0; i<categories.length; i++) {
        if (categories.indexOf(removeItems[0]) != -1 || categories.indexOf(removeItems[1])!= -1) {
            categories.splice( categories.indexOf(removeItems[0]), 1 );
            categories.splice( categories.indexOf(removeItems[1]), 1 );
        }
    }

    $('#nav_indicator')[0].innerText = "Pt: "+categories[0];

    current_pt = categories[current_pt_index];
    current_images = imgFiles.filter(function(x){
        //console.log('x', x);
        if (x.indexOf(current_pt) != -1) {
            return x;
        }
    });
     console.log('categories', categories);

        placeImages(current_images);

 });




 
 x = document.createElement('div');
 x.id = 'addButton';
 x.innerText = '+ Add Category';
 $('#category1-dropzone').parent().first().prepend(x);
 $('#addButton').click(function() {
     x = document.createElement('div');
     x.id="category"+(category_counter+1)+"-dropzone";
     x.classList.add('dropzone');
     y = document.createElement('input');
     y.placeholder = "Category "+(category_counter+1);
     y.id = "Category"+(category_counter+1);
     y.className = "categoryName";
     y.addEventListener("change", function(title){
        console.log(title);
        title.target.id = title.target.value;
     })
     x.append(y);
     $(x).insertAfter('#category'+(category_counter)+'-dropzone');
     category_counter+=1;
     var el = document.getElementById("left");
     el.scrollTop = 900000
 })

  $("#viewbutton").click(function() {

    if ($("#viewbutton").attr('bypatient') == 'true') {
        $('#nav_panel')[0].style = "visibility: hidden;"
        $("#viewbutton")[0].innerText = "View By Pt";
        $("#viewbutton").attr('bypatient', 'false');
        $('#content').find('img').remove();
        setTimeout(function() {
                    $('#nav_indicator')[0].innerText = "Pt: All";
                    console.log(imgFiles_bk);
                    placeImages(imgFiles_bk);  
            }, 200);
    } else {

        $("#viewbutton")[0].innerText = "View All Images";
        $('#nav_panel')[0].style = "visibility: show;"

        $("#viewbutton").attr('bypatient', 'true');
        $('#content').find('img').remove();
        setTimeout(function() {
                current_pt_index = 0;
                current_pt = categories[current_pt_index];
                console.log(current_pt);
                current_images = imgFiles.filter(function(x){
                    if (x.indexOf(current_pt) != -1) {
                        return x;
                    }
                });
                //console.log(current_images);
                //$('#content').find('img').remove();
                console.log(current_images);

                    $('#nav_indicator')[0].innerText = "Pt: "+categories[current_pt_index];
                    //console.log(current_images[i]);
                    placeImages(current_images);  
            }, 200);
    }
 })

 $(document).keyup(function(e) {
  if (e.keyCode === 27) viewer.hide();   // esc
});

 $("#savebutton").click(function() {
    list_of_dropzones = $('#left').find('.dropzone');
    for (i=0; i<list_of_dropzones.length; i++) {
        images = $(list_of_dropzones[i]).find('img').map(function(){return this.name}).get();//.join(', ');
        cat_name = $('#category'+(i+1)+'-dropzone').find('input')[0].id;
        data_json[cat_name] = images;
    }
    console.log(data_json);
    data_json.PatientID = categories[current_pt_index];
    data_json.user = username;
    ts = new Date();
    data_json.timestamp = ts.toString(); 
    //var blob = new Blob([JSON.stringify(data_json)], {type: "text/plain;charset=utf-8"});
    //saveAs(blob, username+"_data_"+document.getElementById('nav_indicator').innerText+"_"+Date()+".txt");
    dataEmit = JSON.stringify(data_json);
    socket.emit('imageBinningData', dataEmit);
 })

 $(document).keyup(function(e) {
  if (e.keyCode === 27) viewer.hide();   // esc
});

menu = [{
        name: 'delete',
        img: 'public/img/close.png',
        title: 'delete button',
        fun: function (event) {
            
            clickedimg = $(event.trigger[0]);
            console.log(clickedimg[0].name);
            clickedimg.remove();
            x = document.createElement('img');
            x.src = 'imgs/' + clickedimg[0].name;
            x.id = "yes-drop";
            x.name = clickedimg[0].name;
            x.classList.add("draggable");
            if (!x.name.includes(".DS")  && x.name.includes("jpg")) {
                $('#content').append(x);
            }
        }
    }];

 /////////////////////////////
 // target elements with the "draggable" class
 interact('.draggable')
     .on('doubletap', function(event) {
        console.log(event);
        //var categoryImgCounter = 0;
        allImgs = $(event.currentTarget.parentNode).find('img');
        allImgNames = allImgs.map(function(y){return allImgs[y].name});
        allImageNames = Array.from(allImgNames);
        clickedImage = event.currentTarget.name;
        categoryImgCounter = allImageNames.indexOf(clickedImage);
        viewer = ImageViewer(); //options is optional parameter
        viewer.show('imgs/'+clickedImage); //second paramter is optional
         //event.currentTarget.classList.toggle('large');
         event.currentTarget.classList.remove('rotate');
         event.preventDefault();
					window.onkeydown = function(e) {
					   var key = e.keyCode ? e.keyCode : e.which;

					   if (key == 39) {
					       //playerSpriteX += 10;.
					       console.log('right key pressed');
					       
					       if(categoryImgCounter + 1 < allImgNames.length) {categoryImgCounter += 1; $('.iv-close')[0].click(); viewer.show('imgs/'+allImgNames[categoryImgCounter]); console.log(categoryImgCounter,allImgNames[categoryImgCounter]);}
					       
					   }else if (key == 37) {	
					   		console.log('left key pressed');
					       if(categoryImgCounter-1 > -1)  {categoryImgCounter -= 1; $('.iv-close')[0].click(); viewer.show('imgs/'+allImgNames[categoryImgCounter]); console.log(categoryImgCounter,allImgNames[categoryImgCounter]);}
					   }
					}
     })
     .draggable({
         // enable inertial throwing
         inertia: false,
         // keep the element within the area of it's parent
         /*restrict: {
             restriction: "parent",
             endOnly: true,
             elementRect: {
                 top: 0,
                 left: 0,
                 bottom: 1,
                 right: 1
             }
         },*/
         // enable autoScroll
         //autoScroll: true,

         // call this function on every dragmove event
         onmove: dragMoveListener
         // call this function on every dragend event
         /*onend: function(event) {
             var textEl = event.target.querySelector('p');

             textEl && (textEl.textContent =
                 'moved a distance of ' +
                 (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
                     Math.pow(event.pageY - event.y0, 2) | 0))
                 .toFixed(2) + 'px');
         }*/
     });

 function dragMoveListener(event) {
     var target = event.target,
         // keep the dragged position in the data-x/data-y attributes
         x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
         y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

     // translate the element
     target.style.webkitTransform =
         target.style.transform =
         'translate(' + x + 'px, ' + y + 'px)';

     // update the posiion attributes
     target.setAttribute('data-x', x);
     target.setAttribute('data-y', y);
 }

 // this is used later in the resizing and gesture demos
 window.dragMoveListener = dragMoveListener;

 interact('.dropzone').dropzone({
     // only accept elements matching this CSS selector
     //accept: '#yes-drop',
     // Require a 75% element overlap for a drop to be possible
     overlap: 0.75,

     // listen for drop related events:

     ondropactivate: function(event) {
         // add active dropzone feedback
         event.target.classList.add('drop-active');
         
     },
     ondragenter: function(event) {
         var draggableElement = event.relatedTarget,
             dropzoneElement = event.target;

         // feedback the possibility of a drop
         dropzoneElement.classList.add('drop-target');
         draggableElement.classList.add('can-drop');
         draggableElement.textContent = 'Dragged in';
     },
     ondragleave: function(event) {
         // remove the drop feedback style
         //console.log(event.dragEvent.currentTarget.name);
         event.target.classList.remove('drop-target');
         event.relatedTarget.classList.remove('can-drop');
         event.relatedTarget.textContent = 'Dragged out';
     },
     ondrop: function(event) {
         event.relatedTarget.textContent = 'Dropped';
         $('#'+event.target.id).append($("[name='"+event.relatedTarget.name+"']").attr('id', 'droppedimg'))
     },
     ondropdeactivate: function(event) {
         // remove active dropzone feedback
         eventData = event;
         event.target.classList.remove('drop-active');
         event.target.classList.remove('drop-target');
         //console.log(event);
         $('#left img').contextMenu(menu,{triggerOn:'contextmenu'});
         if (event.dragEvent.pageX > 200) {$("[name='"+event.relatedTarget.name+"']").attr('style', 'transform: translate(0px, 0px)').attr('data-x', 0).attr('data-y', '0')}
     		 toSubmit = {'imageName': event.relatedTarget.name, }
     }
 });
});