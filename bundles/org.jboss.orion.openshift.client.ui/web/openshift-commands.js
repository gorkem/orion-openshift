

/*globals define window*/

define(['require', 'orion/Deferred',  'orion/webui/littlelib', 'orion/commands', 'orion/commandRegistry', 'orion/URITemplate', 
        'orion/git/gitConfigPreference', 'orion/git/util', 'orion/git/widgets/GitCredentialsDialog','orion/git/gitPreferenceStorage' ],
        function(require, Deferred, lib, mCommands, mCommandRegistry, URITemplate, GitConfigPreference, gitUtil, GitCredentialsDialog, GitPreferenceStorage){
/**
  * @namespace The global container for eclipse APIs.
  */
var exports = {};



exports.handleSSHAuthFailure = function (data, serviceRegistry, failedOp){
    var def = new Deferred();
    
    var getCredentials = function(){
        var credentialsDialog = new GitCredentialsDialog.GitCredentialsDialog({
				title: 'Missing Private Key',
				serviceRegistry: serviceRegistry,
				func: function(credentials){
				    if(credentials.gitPrivateKey && credentials.gitPrivateKey !== ''){
				        def.resolve(credentials);
				    }else{
				        def.reject({});
				    }
				},
				errordata: data,
				username: false,
				password: false,
				privatekey: true,
				passphrase: true,
				failedOperation : failedOp
			});
	       	credentialsDialog.show();
	  };
	  
	var gitPreferenceStorage = new GitPreferenceStorage(serviceRegistry);
	gitPreferenceStorage.get(data.Url).then(function(credentials){
	   console.log(credentials);
	   def.resolve(credentials); 
	}, getCredentials);
	return def;
}

exports.handleKnownHostError = function(data, serviceRegistry){
    var def = new Deferred();
    if(data && data.HostKey && confirm('Add '+ data.KeyType + 
    ' for host '+ data.Host + ' for key fingerprint '+ data.HostFingerprint )){
         var sshService = serviceRegistry.getService("orion.net.ssh");
         var hostURL = gitUtil.parseSshGitUrl(data.Url);
         var hostCredentials = {
			host : data.Host,
			keyType : data.KeyType,
			hostKey : data.HostKey,
			port : hostURL.port
		};
		sshService.addKnownHost(hostCredentials).then(function (knownHosts) {
		    def.resolve(knownHosts);
		});		
    }
    return def;
};

exports.gatherAuthParams = function(application, serviceRegistry){
    var sshService = serviceRegistry.getService("orion.net.ssh");
    var repositoryURL = gitUtil.parseSshGitUrl(application.git_url);
    var gitPreferenceStorage = new GitPreferenceStorage(serviceRegistry);
	var gitConfigPreference = new GitConfigPreference(serviceRegistry);
    return Deferred.all([
                    sshService.getKnownHostCredentials(repositoryURL.host, repositoryURL.port),
                    gitPreferenceStorage.get(application.git_url),
                    gitConfigPreference.getConfig() ],
                    function(error){//may fail but we ignore fails here.
                        console.log('Failure while gathering authentication parameters');
                    });
}

    
exports.createApplicationCommands = function(serviceRegistry, commandService, fileClient){
    var editTemplate = new URITemplate("edit/edit.html#{,resource,params*}");
    var checkOutApplicationCodeCommand = new mCommands.Command({
        name:'Edit Application',
        tooltip: 'Clone application code to edit',
        id: 'openshift.editApplication',
        callback: function(data, credentials){
            console.log(credentials);
            var app = data.items;
            if(!app.git_url)
                return;
            var projectName = app.name +"-"+ app.domain_id;
            var func= arguments.callee;
            var gitService = serviceRegistry.getService("orion.git.provider");
			var progress = serviceRegistry.getService("orion.page.progress");
			// check workspace if application is already cloned 
			// correct the project name if it is already used.
			serviceRegistry.getService("orion.page.message").setProgressMessage("Checking existing projects for application " + app.name);
		    fileClient.loadWorkspace().then(function(workspace){
		      var clonepromises= [];
		      for(var i = 0; i< workspace.Children.length; i++){
		            var p = workspace.Children[i];
		            if(p.Git){
		                clonepromises.push(gitService.getGitClone(p.Git.CloneLocation));
		            }
		            if(p.Name === projectName){
		                var d = new Date();
		                projectName = projectName + "_"+d.getTime();
		            }
		      }
		      Deferred.all(clonepromises).then(function(repos){
		          console.log(repos);
		          for(var j = 0; j < repos.length; j++){
		              if (repos[j].Children[0].GitUrl === app.git_url){
    					    window.location = require.toUrl(editTemplate.expand({resource: repos[j].Children[0].ContentLocation}));
				        }
		           }
		      }, function(error){console.log(error)});          
		      
		      // clone and create project.
		     exports.gatherAuthParams(app, serviceRegistry).then(function(params){
		         var knownHosts = params[0];
		         // no credentials, create an empty one so that it falls to auth failure.
		         credentials = credentials || params[1] || {
						knownHosts: "",
						gitSshUsername: "",
						gitSshPassword: "",
						gitPrivateKey: "",
						gitPassphrase: ""};
		         var userInfo = params[2];
		         
                 serviceRegistry.getService("orion.page.message").setProgressMessage("Your project is being set up. This may take a minute...");
		         console.log("calling clone with credentials");
		         console.log(credentials);
		         var deferred = progress.progress(gitService.cloneGitRepository(projectName, app.git_url, null/*path*/,workspace.Location,
		                credentials.gitSshUsername, credentials.gitSshPassword,
		                knownHosts, credentials.gitPrivateKey, credentials.gitPassphrase, userInfo, true ), 
		                  "Cloning repository for application" + app.name);
		     	 deferred.then(function(jsonData) {
		             gitService.getGitClone(jsonData.Location).then(function(repoJson){
									var editLocation = require.toUrl(editTemplate.expand({resource: repoJson.Children[0].ContentLocation}));
									window.location = editLocation;
						});
		         },
		         function(jsonData){
   		              console.log("clone fail");
        		      console.log(jsonData); 
   		              	switch (jsonData.HttpCode) {
   		              	  case 400:
   		              	    if(jsonData.JsonData && jsonData.JsonData.HostKey){
        		               exports.handleKnownHostError(jsonData.JsonData, serviceRegistry).then(function(knownHosts){
        		                 func(data, null);
        		               });
        		             }
        		             return;
        		          case 401:
        		              exports.handleSSHAuthFailure(jsonData.JsonData, serviceRegistry, jsonData.failedOperation).then(function(creds){
        		                  console.log('recall');
        		                  console.log(creds);
        		                  func(data, creds);
        		              },
        		              function(failureObj){
        		                  console.log('failed to add private key');
        		              });
        		              return;
        		          default:
   		              	     console.log(jsonData);
   		              	  } 
		          });
		         
		     },function(error){
		         console.log('failed to get auth params');
		         console.log(error);
		     } );
		    });		    
		    
        },
        visibleWhen:function(item){
            return item.git_url;
        }
    });
    commandService.addCommand(checkOutApplicationCodeCommand);  
    
};

        
return exports;        
        
});
