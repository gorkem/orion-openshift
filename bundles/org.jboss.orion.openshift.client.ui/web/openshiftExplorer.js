
/*global define window */
/*jslint regexp:false browser:true forin:true*/

define(['i18n!orion/nls/messages', 'require', 'orion/webui/littlelib', 'orion/webui/treetable', 'orion/commands', 'orion/section', 'orion/Deferred',
'openshift/widgets/OpenshiftCredentialsDialog'], 
function(messages, require, lib, mTreeTable, mCommands, Section, Deferred, OpenshiftCredentialsDialog){

var exports = {};

exports.OpenshiftExplorer = (function() {
    
    function OpenshiftExplorer(serviceRegistry, commandRegistry){
        this.registry = serviceRegistry;
        this.commandService = commandRegistry;
        
    }
    
    OpenshiftExplorer.prototype=
    {
        _handleOpenshiftServiceError : function(error, openshift, callback){
            if(!error.code) return;
            switch (error.code) {
                case 601:
                   console.log(error);
                    var credDialog = new OpenshiftCredentialsDialog({
                        service:openshift,
                        func:callback
                         });
                    credDialog.show();
                    break;
                default:
                    
            }
            
        },
        displayDomains: function(){
            var that = this;
            var func= arguments.callee;
            var openshiftService = this.registry.getService('orion.openshift.service');
            this.registry.getService('orion.page.progress').progress(openshiftService.listDomains(),
            "Retrieving Openshift information").then(
                function(resp){
                    console.log(resp);
                    for(var i = 0; i<resp.length; i++){
                            that.displayApps(resp[i].name).then(
                            function(){
                              console.log('done');
                            },
                            function(error){
                              console.log(error);
                            }
                      
                        );
                   }
            },
            function(error){
                console.log(error);
                var callback = function() { that.displayDomains.call(that);}
                that._handleOpenshiftServiceError(error, openshiftService,callback);
            });
		    },
        displayApps: function(domain){
            var that = this;
            var deferred = deferred ||  new Deferred();
            
            this.registry.getService('orion.page.progress').progress(this.registry.getService('orion.openshift.service').listApplications(domain),
                'Receiving application information').then(
                function(resp){
                  for(var i =0; i< resp.length; i++){
                    var tableNode = lib.node('table');
                    var appTitle = resp[i].app_url.replace(/^http:\/\//,"").replace(/\/+$/, "");;

                    var section = new Section.Section(tableNode, {
			                 id: 'appSection_'+resp[i].id,
			                 title: appTitle,
			                 slideout: true,
			                 content: '<div id="appsNode_'+resp[i].id+'"></div>', //$NON-NLS-0$
        			         canHide: true,
			                 preferenceService: that.registry.getService("orion.core.preference") //$NON-NLS-0$
			               });
                     that.renderApp(resp[i]);
                 }
                 deferred.resolve();
                },
                function(error){
                  console.log(error);
                  deferred.reject(error);
                }

            );
            return deferred;

        },
        renderApp: function(appData){
            
                    var appsContainer = lib.node('appsNode_'+appData.id);
                   
                    var sectionItem = document.createElement("div");
					sectionItem.className = "sectionTableItem lightTreeTableRow";
						        appsContainer.appendChild(sectionItem);
						        
						        var actionsArea = document.createElement("div");
						        actionsArea.className = "layoutRight sectionActions";
						        actionsArea.id = "applicationActionsArea";
						        sectionItem.appendChild(actionsArea);
						        this.commandService.renderCommands("applicationLevelCommands", actionsArea, appData, this, "tool"); //$NON-NLS-0$
	

						        var horizontalBox = document.createElement("div");
						        horizontalBox.style.overflow = "hidden";
						        sectionItem.appendChild(horizontalBox);
						
						        var detailsView = document.createElement("div");
						        detailsView.className = "stretch";
						        horizontalBox.appendChild(detailsView);
						
						        var title = document.createElement("div");
						        title.textContent = appData.app_url;
						        detailsView.appendChild(title);

                    var framework = document.createElement("span");
                    framework.textContent = appData.framework;
                    detailsView.appendChild(framework);
        
        }

	  }	
    return OpenshiftExplorer;
  }());
  return exports;
});
