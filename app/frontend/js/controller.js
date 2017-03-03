/*jshint esversion: 6 */
(function(){
    "use strict";
    //receive from form
    document.addEventListener('onFormSubmit', function(e){
	 	// get data from the view
		var data = e.detail;
		// forwards it to the model
		model.createComment(data);
	});
    //
	document.addEventListener('onNewComment', function(e){
		// get data from the model
		var data = e.detail;
		// forwards it to the view
		view.insertComment(data);
		view.displayleft(0);
	});
	document.addEventListener('onNextImage', function(e){
		var id = e.detail.id;
		var author = e.detail.author;
		model.getNextImage(id, author);
		model.getNextComments(id, author);
	});
	document.addEventListener('onPreviousImage', function(e){
		var id = e.detail.id;
		var author = e.detail.author;
		model.getPreviousImage(id, author);
		model.getPreviousComments(id, author);
	});
	document.addEventListener('onDeleteImage', function(e){
		var id = e.detail.id;
		var author = e.detail.author;
		model.deleteImage(id, author);
		model.deleteComments(id, author);
	});
	// document.addEventListener('onPreviousPage', function(e){
	// 	var data = e.detail;
	// 	var id = data.id;
	// 	var number = data.number;
	// 	model.getPreviousComments(url, number);
	// });
	// document.addEventListener('onNextPage', function(e){
	// 	var data = e.detail;
	// 	var id = data.id;
	// 	var number = data.number;
	// 	model.getNextComments(url, number);
	// });
	document.addEventListener('checkStorage', function(e){
		var data = e.detail;
		model.checkStorage(data);
		model.checkStorageComments(data);
	});

	document.addEventListener('onDeleteComment', function(e){
		var data = e.detail;
		model.deleteComment(data);
	});

	document.addEventListener('onImageSubmit', function(e){
        model.addImage(e.detail);
        view.changecomments([]);
        view.displayleft(0);
	});
	document.addEventListener('onFileSubmit', function(e){
        model.addImageFile(e.detail);
        view.changecomments([]);
        view.displayleft(0);
	});

	document.addEventListener('getImageSuccess', function(e){
        var data = e.detail;
        if (data != ""){
        	var id = data.id;
	        var url = data.url;
	        var title = data.title;
	        var author = data.author;
        }
        else{
        	var id = data;
	        var url = data;
	        var title = data;
	        var author = data;
        }
        view.changeimage(url,id);
        view.changetitle(title);
        view.changeauthor(author);
	});
	document.addEventListener('deleteLastImage', function(e){
        var list = e.detail;
        view.changeimage(url, id);
        view.changetitle(title);
        view.changeauthor(author);
        view.changecomments(list);
	});
	document.addEventListener('deleteCommentsSuccess', function(e){
        var list = e.detail;
        view.changecomments(list);
        view.displayleft(0);
	});
	document.addEventListener('getPreviousCommentsSuccess', function(e){
        var data = e.detail;
        view.changecomments(data);
        view.displayleft(0);
	});
	document.addEventListener('getNextCommentsSuccess', function(e){
        var data = e.detail;
        view.changecomments(data);
        view.displayleft(0);
	});
	document.addEventListener('deleteCommentSuccess', function(e){
        var data= e.detail;
        view.changecomments(data);
        view.displayleft(0);
	});
    document.addEventListener('imageInList', function(e){
		var url = e.detail;
		view.changeimage(url);
	});
	
    document.addEventListener('onCheckLogIn', function(e){
        model.checkLogIn();
	});
	document.addEventListener('logInSuccess', function(e){
        view.displayLogOut();
	});
	document.addEventListener('logInFailed', function(e){
        view.displayLogIn();
	});
	document.addEventListener('onCheckUsers', function(e){
        model.checkUsers();
	});
	document.addEventListener('getUsersSuccess', function(e){
		console.log("aaa");
		var data = e.detail;
        view.displayUsers(data);
	});
	document.addEventListener('onFindUser', function(e){
		var data = e.detail;
        model.findUser(data);
        model.findComments(data);
	});

	document.addEventListener('findUserSuccess', function(e){
		var data = e.detail;
		if (data != ""){
        	var id = data.id;
	        var url = data.url;
	        var title = data.title;
	        var author = data.author;
        }
        else{
        	var id = data;
	        var url = data;
	        var title = data;
	        var author = data;
        }
        view.changeimage(url,id);
        view.changetitle(title);
        view.changeauthor(author);
	});

	document.addEventListener('findCommentsSuccess', function(e){
		var list = e.detail;
		console.log(list);
        view.changecomments(list);
	});
}());