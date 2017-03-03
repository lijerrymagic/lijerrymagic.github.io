/*jshint esversion: 6 */
var model = (function(){
    "use strict";

    var model = {};
    //once data received, notify the controller to insert view
    model.createComment = function(data){
        var name = data.username;
        var content  = data.content;
        var date = data.date;
        var url = data.url;
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var index = image_list.indexOf(url);
        var single_comment = [];

        single_comment.push(name);
        single_comment.push(content);
        single_comment.push(date);
        var all_comments_list = localStorage.getItem('allcommentslist') ?
        JSON.parse(localStorage.getItem('allcommentslist')) :
        [];
        var comments_list = all_comments_list[index];
        var list = comments_list;
        list.push(single_comment);
        var cut_comments = cutlist(comments_list);
        var page;
        if (comments_list.length % 10 !== 0){ //check if its the last one of that page
        	page = parseInt(comments_list.length / 10);
        }
        else{
        	page = parseInt(comments_list.length / 10) - 1;
        }
        localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
        document.dispatchEvent(new CustomEvent('onNewComment',{
			detail: {list:cut_comments[page], page:page}
		}));
    };

    model.addImage = function(url,title,author){
        var image_list = localStorage.getItem('imagelist') ?
              JSON.parse(localStorage.getItem('imagelist')) :
              [];
        var author_list = localStorage.getItem('authorlist') ?
              JSON.parse(localStorage.getItem('authorlist')) :
              [];
        var title_list = localStorage.getItem('titlelist') ?
              JSON.parse(localStorage.getItem('titlelist')) :
              [];
        var all_comments_list = localStorage.getItem('allcommentslist') ?
              JSON.parse(localStorage.getItem('allcommentslist')) :
              [];
        var id_list = localStorage.getItem('idlist') ?
              JSON.parse(localStorage.getItem('idlist')) :
              [];
        if (image_list.indexOf(url) >= 0){
             alert("U have already upload this image!");
        }
        else{
            var empty_comments = [];
            image_list.push(url);
            title_list.push(title);
            author_list.push(author);
            id_list.push(true);
            all_comments_list.push(empty_comments);
            localStorage.setItem("imagelist", JSON.stringify(image_list));
            localStorage.setItem("titlelist", JSON.stringify(title_list));
            localStorage.setItem("authorlist", JSON.stringify(author_list));
            localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
            document.dispatchEvent(new CustomEvent('storeImageSuccess',{
                detail:{url:url, title:title, author:author}
            }));
        }
    };
    model.addImageFile = function(file,title,author){
        var image_list = localStorage.getItem('imagelist') ?
              JSON.parse(localStorage.getItem('imagelist')) :
              [];
        var author_list = localStorage.getItem('authorlist') ?
              JSON.parse(localStorage.getItem('authorlist')) :
              [];
        var title_list = localStorage.getItem('titlelist') ?
              JSON.parse(localStorage.getItem('titlelist')) :
              [];
        var all_comments_list = localStorage.getItem('allcommentslist') ?
              JSON.parse(localStorage.getItem('allcommentslist')) :
              [];
        var id_list = localStorage.getItem('idlist') ?
              JSON.parse(localStorage.getItem('idlist')) :
              [];
        var reader = new FileReader();

        reader.onload = function(){
            var fileurl = reader.result;
            if (image_list.indexOf(fileurl) > 0){
                  alert("U have already upload this image!");
            }
            else{
                var empty_comments = [];
                var idlength = id_list.length;
                image_list.push(fileurl);
                author_list.push(title);
                title_list.push(author);
                id_list.push(true);
                all_comments_list.push(empty_comments);
                localStorage.setItem("imagelist", JSON.stringify(image_list));
                localStorage.setItem("titlelist", JSON.stringify(title_list));
                localStorage.setItem("authorlist", JSON.stringify(author_list));
                localStorage.setItem("idlist", JSON.stringify(id_list));
                localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
                document.dispatchEvent(new CustomEvent('storeImageSuccess',{
                    detail:{url:fileurl, title:title, author:author}
                }));
            }
        };
        reader.readAsDataURL(file);
        
    };
    model.getNextImage = function(url){
        var all_comments_list = JSON.parse(localStorage.getItem('allcommentslist'));
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var title_list = JSON.parse(localStorage.getItem('titlelist'));
        var author_list = JSON.parse(localStorage.getItem('authorlist'));
        var index = image_list.indexOf(url);
        var length = image_list.length; 
        var newindex = index + 1;
        var id;


        if (newindex >= length){
            alert("No more images!");
        }
        else{
            var newurl = image_list[newindex];
            var newtitle = title_list[newindex];
            var newauthor = author_list[newindex];
            var new_comments_list = all_comments_list[newindex];
            var cut_comments = cutlist(new_comments_list);
            id = getimageid(newurl);
            if (cut_comments.length === 0){
            	document.dispatchEvent(new CustomEvent('getImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments, id:id}
            }));
            }
            else{
            document.dispatchEvent(new CustomEvent('getImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments[0], id:id}
            }));
        }
        }
    };
    model.getPreviousImage = function(url){
        var all_comments_list = JSON.parse(localStorage.getItem('allcommentslist'));
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var title_list = JSON.parse(localStorage.getItem('titlelist'));
        var author_list = JSON.parse(localStorage.getItem('authorlist'));
        var index = image_list.indexOf(url);
        var newindex = index - 1;
        var id;

        if (newindex < 0){
            alert("No more images!");
        }
        else{
            var newurl = image_list[newindex];
            var newtitle = title_list[newindex];
            var newauthor = author_list[newindex];
            var new_comments_list = all_comments_list[newindex];
            var cut_comments = cutlist(new_comments_list);
            id = getimageid(newurl);
            if (cut_comments.length === 0){
            	document.dispatchEvent(new CustomEvent('getImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments, id:id}
            }));
            }
            else{
            document.dispatchEvent(new CustomEvent('getImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments[0], id:id}
            }));
            }
        }
    };
    model.checkStorage = function(data){
        var image_list = localStorage.getItem('imagelist') ?
              JSON.parse(localStorage.getItem('imagelist')) :
              [];
        if (image_list.length !== 0){
        	var url = image_list[0];
        	document.dispatchEvent(new CustomEvent('imageInList',{
                detail:url
            }));
        }
        else{
        	alert("No image in the library!");
        }
    };
    model.searchImage = function(id){
    	var all_comments_list = JSON.parse(localStorage.getItem('allcommentslist'));
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var id_list = JSON.parse(localStorage.getItem("idlist"));
        var title_list = JSON.parse(localStorage.getItem('titlelist'));
        var author_list = JSON.parse(localStorage.getItem('authorlist'));
        if (id_list[id] === false){
        	alert("404 not found!")
        }
        else{
        	var n = 0;
	        for (var i = 0;i < id;i++){
	        	if (id_list[i] === true){
	        		n += 1;
	        	}
	        }
	        var newurl = image_list[n];
	        var newtitle = title_list[n];
	        var newauthor = author_list[n];
	        var new_comments_list = all_comments_list[n];
	        var cut_comments = cutlist(new_comments_list); //cut the list into pieces of 10
	        if (cut_comments.length === 0){
	        	document.dispatchEvent(new CustomEvent('changeUrlSuccess',{
	            detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments}
	        }));
	        }
	        else{
	        document.dispatchEvent(new CustomEvent('changeUrlSuccess',{
	            detail:{url:newurl, title:newtitle, author:newauthor, list: cut_comments[0]}
	        }));
	        }
        }   
    };
    model.deleteImage = function(url){
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var title_list = JSON.parse(localStorage.getItem('titlelist'));
        var author_list = JSON.parse(localStorage.getItem('authorlist'));
        var id_list = JSON.parse(localStorage.getItem("idlist"));
        var all_comments_list = localStorage.getItem('allcommentslist') ?
              JSON.parse(localStorage.getItem('allcommentslist')) :
              [];

        var index = image_list.indexOf(url);
        var id = getimageid(url);
        image_list.splice(index,1);
        author_list.splice(index,1);
        title_list.splice(index,1);
        id_list[id] = false;
        all_comments_list.splice(index,1);
        var newurl;
        var newtitle;
        var newauthor;
        var list;
        if (image_list.length === 0){ //empty list
            alert("Delete last image!");
            localStorage.setItem("imagelist", JSON.stringify(image_list));
            localStorage.setItem("titlelist", JSON.stringify(title_list));
            localStorage.setItem("authorlist", JSON.stringify(author_list));
            localStorage.setItem("idlist", JSON.stringify(id_list));
            localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
            newurl = "";
            newtitle = "";
            newauthor = "";
            document.dispatchEvent(new CustomEvent('deleteLastImage',{
                detail:{url:newurl, title:newtitle, author:newauthor}
            }));
        }
        else if (index == image_list.length){ //delete last image
            index -= 1;
            localStorage.setItem("imagelist", JSON.stringify(image_list));
            localStorage.setItem("titlelist", JSON.stringify(title_list));
            localStorage.setItem("authorlist", JSON.stringify(author_list));
            localStorage.setItem("idlist", JSON.stringify(id_list));
            localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
            newurl = image_list[index];
            newtitle = title_list[index];
            newauthor = author_list[index];
            list = all_comments_list[index];
            document.dispatchEvent(new CustomEvent('deleteImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list:list}
            }));
        }
        else{
            localStorage.setItem("imagelist", JSON.stringify(image_list));
            localStorage.setItem("titlelist", JSON.stringify(title_list));
            localStorage.setItem("authorlist", JSON.stringify(author_list));
            localStorage.setItem("idlist", JSON.stringify(id_list));
            localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
            newurl = image_list[index];
            newtitle = title_list[index];
            newauthor = author_list[index];
            list = all_comments_list[index];
            document.dispatchEvent(new CustomEvent('deleteImageSuccess',{
                detail:{url:newurl, title:newtitle, author:newauthor, list:list}
            }));
        }
        
    };

    model.getPreviousComments = function(url, number){
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var index = image_list.indexOf(url);
        var all_comments_list = JSON.parse(localStorage.getItem('allcommentslist'));
        var current_comments = all_comments_list[index];
        
        var cut_comments = cutlist(current_comments);

        if (number !== 0){
        	var newnumber = number - 1;
        	document.dispatchEvent(new CustomEvent('getPreviousCommentsSuccess',{
                detail:{list:cut_comments[newnumber],page:newnumber}
            }));
        }
        else{
        	document.dispatchEvent(new CustomEvent('getPreviousCommentsSuccess',{
                detail:{list:cut_comments[number],page:number}
            }));
        }
    };
    model.getNextComments = function(url, number){
        var image_list = JSON.parse(localStorage.getItem('imagelist'));
        var index = image_list.indexOf(url);
        var all_comments_list = JSON.parse(localStorage.getItem('allcommentslist'));
        var current_comments = all_comments_list[index];
        var page;
        if (current_comments.length % 10 === 0){
        	page = parseInt(current_comments.length / 10) - 1;
        }
        else{page = parseInt(current_comments.length / 10);}
        
        var cut_comments = cutlist(current_comments);
        if (number !== page){
        	var newnumber = number + 1;
        	document.dispatchEvent(new CustomEvent('getNextCommentsSuccess',{
                detail:{list:cut_comments[newnumber],page:newnumber}
            }));
        }
        else{
        	document.dispatchEvent(new CustomEvent('getNextCommentsSuccess',{
                detail:{list:cut_comments[number],page:number}
            }));
        }
    };
    model.deleteComment = function(data){
        var image_list = JSON.parse(localStorage.getItem('imagelist'));

        var all_comments_list = localStorage.getItem('allcommentslist') ?
              JSON.parse(localStorage.getItem('allcommentslist')) :
              [];
        var url = data.url;
        var id = data.id;
        var page_number = data.number;
        var index = image_list.indexOf(url);
        var newlist = all_comments_list[index];
        if (newlist.length % 10 === 1 && page_number === cutlist(newlist).length - 1){
        	page_number -= 1;
        }
        newlist.splice(id,1);
        var newcutlist = cutlist(newlist);
        localStorage.setItem("allcommentslist", JSON.stringify(all_comments_list));
        var showlist = newcutlist[page_number];
        if (newcutlist.length!==0){
        	 document.dispatchEvent(new CustomEvent('deleteCommentSuccess',{
                detail:{list:showlist, page:page_number}
            }));
        }

        if (newcutlist.length === 0){
        	 document.dispatchEvent(new CustomEvent('deleteCommentSuccess',{
                detail:{list:newcutlist, page:page_number}
            }));
        }

    };

    function cutlist(list){
    	var len = list.length;
        var page_number = parseInt(len / 10);
        var result = [];
        if (len === 0){
        	return result;
        }
        for (var i = 0 ;i < page_number; i++){
            var one_page = [];
            for (var a = 0; a < 10; a++){
            	one_page.push(list[a + 10*i]);
            }
            result.push(one_page);
        }
        if (list.slice(page_number * 10, len).length !== 0){
        	result.push(list.slice(page_number * 10, len));
        }

        return result;
    }

    function getimageid(url){
    	var image_list = JSON.parse(localStorage.getItem('imagelist'));
    	var index = image_list.indexOf(url);
    	var id_list = JSON.parse(localStorage.getItem('idlist'));
        var n = 0;
    	for (var i = 0;i < id_list.length && n < index + 1;i++){
    		if (id_list[i] === true){
                n = n + 1;
    		}
    	}
        return i - 1;
    }
    return model;
}());