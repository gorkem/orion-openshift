/*global define*/
/*jslint browser:true*/
define(['orion/webui/dialog'], function(dialog) {

function OpenshiftCredentialsDialog(options){
	this._init(options);
}

OpenshiftCredentialsDialog.prototype = new dialog.Dialog();

OpenshiftCredentialsDialog.prototype.TEMPLATE =
		'<div style="padding: 5px;" id="userIdRow">'+
			'<div style="float: left; width: 150px;"><label id="userIdLabel" for="userId"></label></div>'+
			'<input id="userId" style="width: 200px;" value="">'+
		'</div>'+
		'<div style="padding: 5px;" id="passwordRow">'+
			'<div style="float: left; width: 150px;"><label id="passwordLabel" for="password"></label></div>'+
			'<input type="password" id="password" style="width: 200px;" value="">'+
		'</div>';

	OpenshiftCredentialsDialog.prototype._init = function(options) {
		this.options = options || {};
		this.title = this.options.title || "Openshift Credentials";
		this.modal = true;
		this.buttons = [{text: 'Validate', isDefault: true, callback: this.validate.bind(this)}];
		this._initialize();
	};
	OpenshiftCredentialsDialog.prototype._bindToDom = function() {
		this.$userIdLabel.appendChild(document.createTextNode("User ID:"));
		this.$passwordLabel.appendChild(document.createTextNode("Password:"));
	};
	
	OpenshiftCredentialsDialog.prototype.validate = function() {
	    console.log('validating');
	    var user = this.$userId.value
	    var password = this.$password.value
	    var that = this
	    if( this.options.service){
		  this.options.service.getUser(user, password).then(function(data){
		      console.log(data);
		      if(data){
		          that.options.service.updateServiceCredentials(user,password);
		          that.hide(false);
		          that.options.func();
		       }
		  },function(error){
		      console.log(error);
		  });
	    }
	};
	
	OpenshiftCredentialsDialog.prototype.constructor = OpenshiftCredentialsDialog;
	
	return  OpenshiftCredentialsDialog;
});