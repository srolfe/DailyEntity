now.ready(function(){
	now.getPopularTags();
	now.requestActiveUsers();
	if ($('#account_username').html()!='sign in'){
		now.loadNavBar();
	}
	
	setTimeout("ping()",5000);
});

function ping(){
	now.ping();
	setTimeout("ping()",1000*60*5);
}

function modifyPermissionsIndicator(){
	if (window.webkitNotifications.checkPermission()==0){
		$('#notificationsIndicator').attr('class','icon-globe').removeAttr('style');
	}else{
		$('#notificationsIndicator').attr('class','icon-globe').attr('style','opacity: .5;');
	}
}

modifyPermissionsIndicator();

//<a href="#" onMouseOver="var icon=document.getElementById('pIcon');icon.className='icon-pencil icon-white';icon.style.opacity=.5" onMouseOut="var icon=document.getElementById('pIcon');icon.className='icon-pencil';icon.style.opacity=1" onClick="doEditNavBar()"><i id="pIcon" class="icon-pencil"></i></a>

function setBrowserNotify(){
	if (window.webkitNotifications.checkPermission()!=0){
		window.webkitNotifications.requestPermission(modifyPermissionsIndicator);
	}else if(window.webkitNotifications.checkPermission()==0){
		$('#notificationModal').modal();
	}
}

function toggleThumb(e){
	$(e).parents('blockquote').children('ul.thumbnails').toggle(500);
}

function doEditNavBar(){
	// Navlink delete mode
	$('#navlinks li a').not('#navLinkModify a').attr('style','color:#b94a48;');
	$('#navlinks li a').not('#navLinkModify a').attr('href','#');
	$('#navlinks li a').not('#navLinkModify a').attr('onClick','removeNavLink(this);');
	
	$('#navLinkModify').before("<li id='navMod'><input type='text' id='newNavLink' value='"+tagPage+"' style='width:75px;background-color:#000;height:15px;margin-top:6px;margin-bottom:0px;border:1px solid #555;'></li>").slideDown("slow");
	$('#pIcon').attr('class','icon-remove icon-white');
	$('#navLinkModify a').attr('onClick','stopEditingNavBar();');
	$('#navLinkModify a').attr('onMouseOver','');
	$('#navLinkModify a').attr('onMouseOut','');
	$('#newNavLink').keyup(function(e){
		if (e.which==13){
			// Enter pressed. Do things...
			var val=$('#newNavLink').val();
			if (val!=""){
				$('#navMod').before("<li><a href='/tag/"+val+"'>#"+val+"</a></li>");
				$('#newNavLink').val('');
				
				now.saveNavLink(val);
			}
			
			//$('#navMod').remove();
		}
	});
}

function removeNavLink(elem){
	var tag_name=($(elem).html()).replace("#","");
	$(elem).remove();
	
	now.removeNavLink(tag_name);
}

function stopEditingNavBar(){
	// Disable navlink delete mode
	$('#navlinks li a').not('#navLinkModify a').removeAttr('style');
	$('#navlinks li a').not('#navLinkModify a').attr('href','/tag/'+($('#navlinks li a').html()).replace("#",""));
	$('#navlinks li a').not('#navLinkModify a').removeAttr('onClick');
	
	$('#pIcon').attr('class','icon-pencil');
	$('#navLinkModify a').attr('onClick','doEditNavBar();');
	$('#navLinkModify a').attr('onMouseOver',"var icon=document.getElementById('pIcon');icon.className='icon-pencil icon-white';icon.style.opacity=.5");
	$('#navLinkModify a').attr('onMouseOut',"var icon=document.getElementById('pIcon');icon.className='icon-pencil';icon.style.opacity=1");
	
	$('#navMod').remove();
}

function logout(){
	now.logout();
	user={};
	$('#account_username').html("sign in");
	$('#account_menu').html("<form style='padding-left:5px;padding-right:5px;'><div class='control-group' id='logincontrols'><li><input id='loginUsername' type='text' placeholder='username'></li><li><input id='loginPass' type='password' placeholder='password'></li></div><li><button type='button' id='signupButton' onClick='modifyLogin()' class='btn'>sign up</button><button type='button' id='loginSubmit' onClick='loginUser()' class='btn btn-primary pull-right'>login</button></form></li>");
}

function doComment(post_id){
	if (!$('#comments-'+post_id).is(":visible")){
		$('#comments-'+post_id+'-icon').toggleClass('icon-white');
		$('#comments-'+post_id).toggle(500);
	}
	
	this.post_id=post_id;
	$('#reply-'+post_id+'-icon').toggleClass('icon-share-alt').toggleClass('icon-remove').attr('onClick','removeCommentBox('+post_id+')');
	$(commentEditSource).hide().prependTo('#comments-'+post_id).slideDown("slow",function(){
		var $editor=$("#commentEditor").contents();
		var $head=$editor.find("head");
		var $body=$editor.find("body");
		$body.css("background-color","#f5f5f5");
		$head.append('<link href="../includes/bootstrap/css/bootstrap.css" rel="stylesheet">');
		commentEditor.document.designMode='On';
		
		$("#sendCommentButton").attr("onClick","sendComment("+this.post_id+")");
		
		monitor('commentEditor');
	}.bind(this));
}

function sendComment(post_id){
	// Get comment body
	var $editor=$("#commentEditor").contents();
	var $body=$editor.find("body");
	var bc=$body.html();
	
	// Send the post their way
	$('#sendCommentButton').addClass('active');
	now.postComment(post_id,bc,postTags,postAttachments);
}

function removeCommentBox(post_id){
	$('#comments-'+post_id+' #ceditContainer').slideUp("slow", function(){$(this).remove()});
	$('#reply-'+post_id+'-icon').toggleClass('icon-share-alt').toggleClass('icon-remove').attr('onClick','doComment('+post_id+')');
	postTags=[tagPage];
}

function addTag(tagName){
	if (postTags.indexOf(tagName)==-1){
		postTags.push(tagName)
	}
}

function addAttachment(image){
	postAttachments.push(image);
}

function showProfilePage(){
	$('#account_menu').html("<form style='padding-left:5px;padding-right:5px;'><div class='control-group' id='profileControls'><li><input id='profileAvatarUrl' type='text' placeholder='avatar url'></li></div><li><button type='button' id='cancelProfileModBt' onClick='cancelProfileMod()' class='btn'>cancel</button><button type='button' id='saveProfileModBt' onClick='saveProfileMod()' class='btn btn-primary pull-right'>save</button></form></li>");
}

function saveProfileMod(){
	now.modifyProfile($('#profileAvatarUrl').val());
	$('#account_menu').html("<li><a href='#'>Profile</a></li><li class='divider'></li><li><a href='#' onClick='logout()'>Sign out</a></li>");
}

function cancelProfileMod(){
	$('#account_menu').html("<li><a href='#' onClick='showProfilePage()'>Profile</a></li><li class='divider'></li><li><a href='#' onClick='logout()'>Sign out</a></li>");
}

function modifyLogin(){
	$('#logincontrols').append("<li id='signupField'><input id='signupEmail' type='text' placeholder='email'></li>");
	$('#loginSubmit').html("signup");
	$('#loginSubmit').attr('onClick','signupUser();');
	$('#signupButton').html("cancel");
	$('#signupButton').attr('onClick','reModifyLogin();');
}

function reModifyLogin(){
	$('#signupField').remove();
	$('#loginSubmit').html("login");
	$('#loginSubmit').attr('onClick','loginUser();');
	$('#signupButton').html("signup");
	$('#signupButton').attr('onClick','modifyLogin();');
}

function signupUser(){
	now.signup($('#loginUsername').val(),$('#loginPass').val(),$('#signupEmail').val());
}

function loginUser(){
	// Disable login elements
	$('#loginUsername').attr('disabled','');
	$('#loginPass').attr('disabled','');
	$('#loginSubmit').addClass('active');
	
	// Send login command
	now.login($('#loginUsername').val(),$('#loginPass').val());
}

now.pong=function(){
	now.requestActiveUsers();
}

now.doPopularTags=function(tags){
	var tmp="";
	
	for (i in tags){
		tmp+="<a href='/tag/"+tags[i]+"' class='label'>"+tags[i]+"</a> ";
	}
	
	$('#popTagsContainer').html(tmp);
}

now.signupError=function(id){
	$('#logincontrols').addClass('error');
}

now.returnActiveUsers=function(users){
	var tmp="";
	
	for (i in users){
		tmp+="<a href='/user/"+users[i]+"' class='label'>"+users[i]+"</a> ";
	}
	
	$('#activeUsersContainer').html(tmp);
}

now.loadNavBarTags=function(tags){
	for (i in tags){
		$('#navLinkModify').before("<li><a href='/tag/"+tags[i]+"'>#"+tags[i]+"</a></li>");
	}
}

now.tagSaveError=function(id){
	if (id==1){
		$('#accountMenuDrop').addClass('open');
	}
}

now.postResponse=function(id){
	if (id==0){
		$('#accountMenuDrop').addClass('open');
	}else{
		var $editor=$("#editor").contents();
		var $body=$editor.find("body");
		
		$body.html('');
		postTags=[tagPage];
		postAttachments=[];
	}
	
	$('#submitPostBt').removeClass('active');
}

now.commentResponse=function(id,post_id){
	if (id==0){
		$('#accountMenuDrop').addClass('open');
	}else{
		postTags=[tagPage];
		postAttachments=[];
		removeCommentBox(post_id);
	}
}

now.newPost=function(post,tags){
	if (tags.indexOf(tagPage)!=-1){
		$(post).hide().prependTo('#postContainer').slideDown("slow");
		
		$('a.thumbnail').slimbox();
	}
	
	if (window.webkitNotifications.checkPermission()==0){
		window.webkitNotifications.createNotification('/favicon.ico','New post','Someone posted something new... Check it out.').show();
	}
}

now.newComment=function(post_id,comment){
	$(comment).hide().prependTo('#comments-'+post_id).slideDown("slow");
	var val=$('#comment-'+post_id+'-count').html();
	val++;
	$('#comment-'+post_id+'-count').html(val);
	
	$('a.thumbnail').slimbox();
}

now.loginResponse=function(l,u){
	//window.webkitNotifications.requestPermission(function(){});
	//window.webkitNotifications.createNotification(null,'logged in','Kk logged in');
	
	if (!l){
		$('#loginUsername').removeAttr('disabled');
		$('#loginPass').removeAttr('disabled');
		$('#loginSubmit').removeClass('active');
		
		$('#logincontrols').addClass('error');
	}else{
		user.user_name=u.name;
		user.user_id=u.user_id;
		$('#accountMenuDrop').removeClass('open');
		$('#account_username').html(u.name);
		$('#account_menu').html("<li><a href='#' id='profileLink' onClick='showProfilePage();'>Profile</a></li><li class='divider'></li><li><a href='#' onClick='logout()'>Sign out</a></li>");
		
		now.loadNavBar();
	}
}

function doPost(){
	// Get post body
	var $editor=$("#editor").contents();
	var $body=$editor.find("body");
	var bc=$body.html();
	
	// Send the post their way
	$('#submitPostBt').addClass('active');
	now.postMessage(bc,postTags,postAttachments);
}

// Hashtag parsing
String.prototype.parseHashtag = function() {
	return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		addTag(t.replace("#",""));
		return "<a href='/tag/"+t.replace("#","")+"' class='label'><i class='icon-tag icon-white'></i> "+t.replace("#","")+"</a>";
	});
};

// Mention parsing
String.prototype.parseMention = function() {
	return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(t) {
		return "<a href='/user/"+t.replace("@","")+"' class='label label-info'><i class='icon-user icon-white'></i> "+t.replace("@","")+"</a>";
	});
};

String.prototype.parseImage = function(){
	return this.replace(/(https?:\/\/.*\.(?:png|jpg|gif))/i, function(t){
		addAttachment(t);
		//$('#attach').append("<div class='btn active'><img src='"+t+"' style='width:15px;height:15px;' /></div>");
		return "<a href='#' class='label label-success'><i class='icon-picture icon-white'></i> Attachment</a>";
	});
}

function doBold(button){
	if ($(button).hasClass('active')){
		editor.document.execCommand("bold",false,'');
	}else{
		editor.document.execCommand("bold",false,'');
	}
	
	$(button).toggleClass('active');
	//$('#comments1').toggle(500);
}

// Initialize the editor
function doStuff(){
	//jQuery(function($) {
		var $editor=$("#editor").contents();
		var $head=$editor.find("head");
		var $body=$editor.find("body");
		$body.css("background-color","#f5f5f5");
		$head.append('<link href="../includes/bootstrap/css/bootstrap.css" rel="stylesheet">'); // Load bootstrap stylesheet
//	});
	
	// Start design mode
	editor.document.designMode='On';
	monitor('editor'); // Attach the spacebar hook
}

// Processes editor for hashtags
function tagify(editor){
		var $editor=$('#'+editor).contents();
		var $body=$editor.find("body");
		var bc=$body.html();
		bc=bc.parseHashtag(); // Find tags
		bc=bc.parseMention(); // Find mentions
		bc=bc.parseImage();

		// Insert tags
		insertAtCursor(editor,'<img src="" id="caret" />', 0);
		$body.html(bc);
		resetCaret(editor);
}

// Monitors the editor for a spacebar
function monitor(editor){
	this.editor=editor;
	var f = document.getElementById(editor);
	var fwin = f.contentWindow || f.contentDocument;

	var evt_key = function (e) {
		e = e || fwin.event;
		if (e.which==32 || e.which==46){ tagify(this.editor); }
	}.bind(this);

	if (fwin.document.attachEvent) { fwin.document.attachEvent('onkeypress', evt_key); }
	else if (fwin.document.addEventListener) { fwin.document.addEventListener('keypress', evt_key, false); }
}

// Insert a "tag" before adding a hashtag
function insertAtCursor(iframename, text, replaceContents) {
      if(replaceContents==null){replaceContents=false;}
      if(!replaceContents){//collapse selection:
         var sel=document.getElementById(iframename).contentWindow.getSelection()
         sel.collapseToStart()
      }
      document.getElementById(iframename).contentWindow.document.execCommand('insertHTML', false, text);
};

// Remove the tag after adding the hashtag and fix our insertion point
function resetCaret(iframename){
	var iframe=document.getElementById(iframename).contentWindow
	var referenceNode = iframe.document.getElementById("caret");
	if (referenceNode){
		var sel=document.getElementById(iframename).contentWindow.getSelection()

		if(sel.focusNode){ // FireFox
			var range=sel.getRangeAt(0);
		}else{ // Chrome
			var range=iframe.document.createRange()
		}
		
		range.selectNode(referenceNode);
		range.deleteContents();
	}
}