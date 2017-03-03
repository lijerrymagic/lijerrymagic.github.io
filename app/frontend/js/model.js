var model = (function(){
    "use strict";
    
    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                    if (this.status === 200) {
                        if (json) return callback(null, JSON.parse(this.responseText));
                        return callback(null, this.responseText);
                    }else{
                        return callback(this.responseText, null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json && body){
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.send(JSON.stringify(body));
        }else{
            xhttp.send(body);
        }
    };
    
    var model = {};
    
    // init
    model.addImage = function(data){
         doAjax('POST', '/api/images/', data, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
        });
    }
    model.addImageFile = function(data){
        var file = data.file;
        var reader = new FileReader();
        reader.onload = function(){
            var fileurl = reader.result;
                   data.url = fileurl;
            doAjax('POST', '/api/images/', data, true, function(err, data){
                if (err) console.error(err);
                else document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
            });
        };
        reader.readAsDataURL(file);
 
    }
    
    // create

    model.createComment = function (data){
        doAjax('POST', '/api/comments/', data, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("onNewComment", {'detail': data}));
        });
    };

    model.createUser = function (data, callback){
        doAjax('PUT', '/api/users/', data, true, callback);
    };
    
    model.signIn = function(data, callback){
    doAjax('POST', '/api/signin/', data, true, function(err, user){
        if (err) return callback(err, user);
        callback(null, user);
        });
    };
    // read
    
    model.getNextImage = function (id, author){
        doAjax("GET", "/api/images/" + author + "/"+ id + "/next", null, true, function(err, data){
            if (err) {console.error(err)}
            else {
                console.log(data);
                document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
            }
        });
    };

    model.getPreviousImage = function (id, author){
        console.log(id);
        doAjax("GET", "/api/images/" + author + "/" + id + "/previous", null, true, function(err, data){
            if (err) {console.error(err)}
            else {
                console.log(data);
                document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
            }
        });
    };

    model.getPreviousComments= function (id, author){
        doAjax("GET", "/api/comments/" + author + "/" + id + "/previous", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("getPreviousCommentsSuccess", {'detail': data}));
        });
    };

    model.getNextComments = function (id, author){
        doAjax("GET", "/api/comments/" + author + "/" + id + "/next", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("getNextCommentsSuccess", {'detail': data}));
        });
    };

    model.checkUsers = function (){
        doAjax("GET", "/api/users/", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("getUsersSuccess", {'detail': data}));
        });
    };

    // model.getPreviousComments = function (id, pagenum){
    //     doAjax("GET", "/api/comments/" + id + "/"+ pagenum + "/previous", null, true, function(err, data){
    //         if (err) console.error(err);
    //         else document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
    //     });
    // };

    // model.getPreviousImage = function (id, pagenum){
    //     doAjax("GET", "/api/comments/" + id + "/"+ pagenum + "/previous", null, true, function(err, data){
    //         if (err) console.error(err);
    //         else document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data}));
    //     });
    // };

    model.checkStorage = function (id){
        doAjax("GET", "/api/images/", null, true, function(err, data){
            if (err) console.error(err);
            else{
                document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data }))
            }
        });
    };
    
    model.checkLogIn = function (id){
        doAjax("GET", "/api/signin", null, true, function(err, data){
            if (err) console.error(err);
            else{
                if (data){
                    console.log("aaa");
                    document.dispatchEvent(new CustomEvent("logInSuccess", {'detail': {} }))
                }
                else{
                    document.dispatchEvent(new CustomEvent("logInFailed", {'detail': {} }))
                }
            }
        });
    };

    model.checkStorageComments = function (id){
        doAjax("GET", "/api/comments/", null, true, function(err, data){
            if (err) console.error(err);
            else{
                document.dispatchEvent(new CustomEvent("getNextCommentsSuccess", {'detail': data}))
            }
        });
    };
    // update
    
    model.updateUser = function (data){
        document.dispatchEvent(new CustomEvent("userUpdated", {'detail': data}));
    };
   

    // delete
    
    model.deleteImage = function (id, author){
        doAjax("GET", "/api/session/", null, true, function(err, user){
            if (user.username === author){
                doAjax("DELETE", "/api/images/" + author + "/" + id + "/", null, true, function(err, data){
                if (err) console.error(err);
                else{
                    document.dispatchEvent(new CustomEvent("getImageSuccess", {'detail': data }))}
               });
            }
        }); 
    };

    model.deleteComments = function (id,author){
        doAjax("GET", "/api/session/", null, true, function(err, user){
            if (user.username === author){
            doAjax("DELETE", "/api/comments/" + author + "/" + id + "/", null, true, function(err, data){
                if (err) console.error(err);
                else {
                    document.dispatchEvent(new CustomEvent("deleteCommentsSuccess", {'detail': data }))}
                });
            }
        });
    };

     model.deleteComment = function (data){
        var id = data.id;
        var author = data.author;
        var current = data.current;
        console.log(current);
        var comment_id = data.comment_id;
        doAjax("GET", "/api/session/", null, true, function(err, user){
            if (user.username === author || user.username === current){
            doAjax("DELETE", "/api/comments/" + author + "/" + id + "/" + comment_id, null, true, function(err, data){
                if (err) console.error(err);
                else {
                    document.dispatchEvent(new CustomEvent("deleteCommentSuccess", {'detail': data }))
                }
                });
            }
        });
    };

    model.signOut = function (callback){
         doAjax('DELETE', '/api/signout/', null, false, callback);
    };

    model.findUser = function (data){
        var username = data.username;
        doAjax('GET', '/api/images/' + username + "/", null, true,  function(err, data){
            if (err) console.error(err);
            else {
                document.dispatchEvent(new CustomEvent("findUserSuccess", {'detail': data }))
                }
            });
    }

    model.findComments = function (data){
        var username = data.username;
        console.log(username);
        doAjax('GET', '/api/comments/' + username + "/", null, true,  function(err, data){
            if (err) console.error(err);
            else {
                document.dispatchEvent(new CustomEvent("findCommentsSuccess", {'detail': data }))
                }
            });
    }
    return model;
}())

