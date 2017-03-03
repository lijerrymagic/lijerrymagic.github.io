/*jshint esversion: 6 */
var view = (function(){
    "use strict";
    
    var view = {};
    
    var url_radio = document.getElementById("urlradio");
    var file_radio = document.getElementById("fileradio");
    var upload_button = document.getElementById("upload_button");

    url_radio.addEventListener('click', changeurlradio);
    file_radio.addEventListener('click', changefileradio);
    upload_button.addEventListener("click", hideform);
        // get data from the view
    var showError = function(message){
        var e = document.getElementById("mainerror");
        e.innerHTML = `<span class="alert">${(message)}</span>`;
        e.style.display = "block";
    };

    view.displayleft = function(pagenum){

        var comments = document.getElementsByClassName("comment");
        var count = 0;
        if (comments.children){
            var numofcomments = comments.children.length;
        }
        if (pagenum === 0){
            pagenum = 1;
        }
        Array.prototype.forEach.call(comments, function(e){ 
            if (count < ((pagenum - 1) * 10) || count >= (pagenum * 10)){
                e.style.display = "none";
            }
            else{
                e.style.display = "block";
            }
            count = count + 1;
        });
        document.getElementById("page_number").innerHTML = `Page ${pagenum - 1}`;
    };
    view.displayright = function(pagenum){
        var comments = document.getElementsByClassName("comment");
        var count = 0;
        var numofcomments = comments.length;
        if (pagenum === parseInt(numofcomments / 10)){
            pagenum = parseInt(numofcomments / 10)-1;
        }
        Array.prototype.forEach.call(comments, function(e){
            if (count < ((pagenum + 1) * 10) || count >= ((pagenum + 2) * 10)){
                e.style.display = "none";
            }
            else{
                e.style.display = "block";
            }
            count = count + 1;
        });
        document.getElementById("page_number").innerHTML = `Page ${pagenum + 1}`;
    };
    document.getElementById("create_comment_form").onsubmit = function(e){
    	e.preventDefault();
    	var content = document.getElementById("create_comment_content").value;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        var whole_url = document.getElementById("picture_current").style.backgroundImage;
        var current_url = whole_url.substring(5, whole_url.length-2);
        var id = document.getElementById("picture_current").parentNode.id;
        var page_string = document.getElementById("page_number").innerHTML;
        var page = page_string.substring(5, page_string.length);
        var pagenum = parseInt(page);
        if(dd<10) {
            dd='0'+dd;
        } 

        if(mm<10) {
            mm='0'+mm;
        } 

        today = mm+'/'+dd+'/'+yyyy;
		 // get the elements from the form
		 // dispatch event
        document.getElementById("create_comment_form").reset();
		document.dispatchEvent(new CustomEvent('onFormSubmit',{
			detail: {
				content : content,
                date : today,
                url:current_url,
                id : id,
                pagenum : pagenum
			}
		}));
 	};
    document.getElementById("upload_form_id").onsubmit = function(e){
        e.preventDefault();
        
        var url = document.getElementById("urlupload").value;
        var title = document.getElementById("image_title").value;
        var file = document.getElementById("fileupload").files[0];
        
        if (url_radio.checked === true){
            document.getElementById("upload_form_id").reset();
            document.dispatchEvent(new CustomEvent('onImageSubmit',{
            detail:{url:url, title:title}
        }));
        }
        else{
            if (file.type.match("image.*")){
                var urlradio = document.getElementById("urlradio");
                var fileradio = document.getElementById("fileradio");
                document.getElementById("upload_form_id").reset();
                fileradio.checked = true;
                urlradio.checked = false;
                document.dispatchEvent(new CustomEvent('onFileSubmit',{
                    detail:{file:file, title:title}
                }));
            }
            else{
                alert("Not a image file!");
            }
        }
    };

    document.getElementById("picture_button_left").onclick = function(){
        var id = document.getElementById("picture_current").parentNode.id;
        var author = document.getElementById("picture_information_author").innerHTML;
        if (id === ""){
        	document.dispatchEvent(new CustomEvent('checkStorage',{
            	detail:{id:id, author:author}
        	}));
        }
        else{
	        document.dispatchEvent(new CustomEvent('onPreviousImage',{
	            detail:{id:id, author:author}
	        }));
        }

    };
    document.getElementById("picture_button_right").onclick = function(){
        var id = document.getElementById("picture_current").parentNode.id;
        var author = document.getElementById("picture_information_author").innerHTML;
        if (id === ""){
        	document.dispatchEvent(new CustomEvent('checkStorage',{
            	detail:{id:id, author:author}
        	}));
        }
        else{
            document.dispatchEvent(new CustomEvent('onNextImage',{
                detail:{id:id, author:author}
            }));
        }

    };
    document.getElementById("delete_image_button").onclick = function(){
        var id = document.getElementById("picture_current").parentNode.id;
        var author = document.getElementById("picture_information_author").innerHTML;
        if (id === ""){
            document.dispatchEvent(new CustomEvent('checkStorage',{
                detail:{id:id, author:author}
            }));
        }
        else{
            document.dispatchEvent(new CustomEvent('onDeleteImage',{
                detail:{id:id, author:author}
            }));
        }
    };

    document.getElementById("comments_button_left").onclick = function(){
        var page_string = document.getElementById("page_number").innerHTML;
        var page = page_string.substring(5, page_string.length);
        var page_number = parseInt(page);
        var id = document.getElementById("picture_current").parentNode.id;
        view.displayleft(page_number);
    };
    document.getElementById("comments_button_right").onclick = function(){
        var page_string = document.getElementById("page_number").innerHTML;
        var page = page_string.substring(5, page_string.length);
        var page_number = parseInt(page);
        var id = document.getElementById("picture_current").parentNode.id;
        view.displayright(page_number);
    };

    function deleteComment(e){
        var id = document.getElementById("picture_current").parentNode.id;
        var current = document.getElementById("current_user").innerHTML;
        var comment_id = e.target.id;
        var author = e.target.parentNode.children[0].children[0].innerHTML;
        console.log(author);
        var page_string = document.getElementById("page_number").innerHTML;
        var page = page_string.substring(5, page_string.length);
        var page_number = parseInt(page);
        document.dispatchEvent(new CustomEvent('onDeleteComment',{
            detail:{author:author, id:id, comment_id:comment_id, current:current}
        }));
    }
    
    document.getElementById("signoutbtn").onclick = function (e){
        model.signOut(function(err){
            if (err) return showError(err);
            view.displayLogIn();
        })
    };

    document.getElementById("choose_gallery_button").onclick = function (e){
        var list = document.getElementById("browse_list");
        if (list.style.display == "block"){
            list.style.display = "none";
        }
        else{
            list.style.display = "block";
        }
    };

 	view.insertComment = function(comment){
        //insert the view to innerHTML
 		var e = document.createElement('div');
 		var username = comment.username;
 		var content = comment.content;
        var date = comment.date;
        var id = comment.id;
        var comment_id = comment.comment_id;
        e.className = "comment";
        e.innerHTML = `
                    <div class="comment_header">
                        <p class="user_name">${username}</p>
                        <p class="current_date">${date}</p>
                    </div>
                    <div class="comment_content">${content}</div></div>`;
        // add this element to the document
        var delete_button = document.createElement("div");
        delete_button.className = "delete_comment_button";
        delete_button.addEventListener('click', deleteComment);
        delete_button.id = comment_id;
        e.append(delete_button);
        e.style.display = 'flex';
        var first_child = document.getElementById("comments").children[0];
        document.getElementById("comments").insertBefore(e, first_child);
        var delete_button =  document.getElementById(comment_id);
     };

    function changeurlradio(){
        var fileradio = document.getElementById("fileradio");
        var urlupload = document.getElementById("urlupload");
        var fileupload = document.getElementById("fileupload");

        fileradio.checked = false;
        fileupload.style.display = 'none';
        urlupload.style.display = 'flex';
    }
    function changefileradio(){
        var urlradio = document.getElementById("urlradio");
        var urlupload = document.getElementById("urlupload");
        var fileupload = document.getElementById("fileupload");

        urlradio.checked = false;
        fileupload.style.display = 'flex';
        urlupload.style.display = 'none';
    }
    function hideform(){
        var upload_form = document.getElementById("upload_form_id");
        var upload_button = document.getElementById("upload_button");
        if (upload_form.style.display == "flex"){
            upload_form.style.display = "none";
            upload_button.innerHTML = "Upload";
        }
        else{
            upload_form.style.display="flex";
            upload_button.innerHTML = "Hide";
        }
    }

    view.changeimage = function(url, id){
        var current_image = document.getElementById("picture_current");
        var urlstring = "url('" + url + "')" ;
        current_image.parentNode.id = id;
        current_image.style.backgroundImage = urlstring;
    };
    view.changetitle = function(title){
        var current_title = document.getElementById("picture_information_name");
        current_title.innerHTML = title;
    };
    view.changeauthor = function(author){
        var current_author = document.getElementById("picture_information_author");
        current_author.innerHTML = author;
    };
    view.changecomments = function(list){
        var arraylength = list.length;
        document.getElementById("comments").innerHTML = "";
        if (list.length === 0){
            document.getElementById("comments").innerHTML = "";
        var page_btn =  document.getElementById("page_number");
        page_btn.innerHTML = `Page 0`;
        }
        else{
            view.emptycomments();
	        for (var i = 0; i < arraylength; i++) {
	            var e = document.createElement('div');
	            var username = list[i].username;
	            var content = list[i].content;
	            var date = list[i].date;
	            var comment_id = list[i].comment_id;
	            
	            e.className = "comment";
                e.innerHTML = `
                    <div class="comment_header">
                        <p class="user_name">${username}</p>
                        <p class="current_date">${date}</p>
                    </div>
                    <div class="comment_content">${content}</div></div>`;
                // add this element to the document
                var delete_button = document.createElement("div");
                delete_button.className = "delete_comment_button";
                delete_button.addEventListener('click', deleteComment);
                delete_button.id = comment_id;
                e.append(delete_button);
                e.style.display = 'block';
                var first_child = document.getElementById("comments").children[0];
                document.getElementById("comments").insertBefore(e, first_child);
                var delete_button =  document.getElementById(comment_id);
        	}
        }
    };
    view.emptycomments = function(){
        document.getElementById("comments").innerHTML = "";
        var page_btn =  document.getElementById("page_number");
        page_btn.innerHTML = `Page 0`;
    };
    view.changeurl = function(id){
        var currenturl = window.location.href;
        var index = currenturl.indexOf("?");
        var newurl;
        if (index > 0){
        	newurl = currenturl.substring(0,index) + `?id=${id}`;
       		window.history.pushState("", "", newurl);
        }
        else{
        	window.location.href += `?id=${id}`;
        }

    };

    view.displayLogOut = function(){
        document.getElementById("signoutbtn").style.display = "block";
        document.getElementById("welcomewords").style.display = "none";
        document.getElementById("signinbtn").style.display = "none";
        document.getElementById("signupbtn").style.display = "none";
    };
    view.displayLogIn = function(){
        document.getElementById("signoutbtn").style.display = "none";
        document.getElementById("welcomewords").style.display = "block";
        document.getElementById("signinbtn").style.display = "block";
        document.getElementById("signupbtn").style.display = "block";
    };
    view.displayUsers = function(data){
        var container = document.getElementById("browse_list");
        var length = data.length;
        for (var i = 0; i < length; i++) {
            var e = document.createElement("li");
            var username = data[i].username;
            e.innerHTML = `<a>${username}</a>`
            e.addEventListener('click', findUser);
            console.log("111");
            container.append(e);
        }

    function findUser(e){
            var username = e.target.innerHTML;
            var current = document.getElementById('current_user');
            current.innerHTML = username;
            document.dispatchEvent(new CustomEvent('onFindUser',{
                detail:{username:username}
            }));
        }
    }
    window.onload = function(){
    	//    var currenturl = window.location.href;
    	// var index = currenturl.indexOf("=")	;
    	// if (index > 0){
    	// 	var id = parseInt(currenturl.substring(index + 1, currenturl.length));
    	// 	document.dispatchEvent(new CustomEvent('onSearchImage',{
	    //         detail:id
	    //     }));
    	// }
        document.dispatchEvent(new CustomEvent('onCheckLogIn',{
            detail:{}
        }));
        document.dispatchEvent(new CustomEvent('onCheckUsers',{
            detail:{}
        }));
    }
    return view;	
}());