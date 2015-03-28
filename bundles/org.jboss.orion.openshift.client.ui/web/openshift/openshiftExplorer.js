

/* eslint-env  browser, amd */

define(['i18n!orion/nls/messages', 'require', 'orion/webui/littlelib', 'orion/commands', 'orion/section', 'orion/Deferred',
'jboss/widgets/OpenshiftCredentialsDialog'], 
function(messages, require, lib, mCommands, Section, Deferred, OpenshiftCredentialsDialog){

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
            var openshiftService = this.registry.getService('orion.openshift.service');
            this.registry.getService('orion.page.progress').progress(openshiftService.listDomains(),
            "Retrieving Openshift information").then(
                function(resp){
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
                    var appTitle = resp[i].domain_id +"-"+resp[i].name;

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
			title.innerHTML = 'URL: <a href="' +appData.app_url+ '">'+ appData.app_url+ '</a>';
			detailsView.appendChild(title);

            var framework = document.createElement("span");
            framework.textContent = appData.framework;
            detailsView.appendChild(framework);
            
            var cartridges = appData.cartridges;
            var cartridgeSection = document.createElement("section");
            cartridgeSection.innerHTML = "<h2>Cartridges</h2>";
            detailsView.appendChild(cartridgeSection);
            
            if(!cartridges || cartridges.length < 1 ){
                var noCartridges = document.createElement("span");
                noCartridges.textContent = 'None';
                cartridgeSection.appendChild(noCartridges);
            }else{
                 var cartridgeBlock = document.createElement('div');
                 cartridgeBlock.className = 'cartridge-block';
                  cartridgeSection.appendChild(cartridgeBlock);
                for(var i =0 ; i< cartridges.length; i++ ){
                    this.renderCartridge(cartridgeBlock, cartridges[i]);
                }
                
            }
            
        
        },
        renderCartridge: function(parent, theCartridge){
            
            var cartridgeNode = document.createElement("div");
            cartridgeNode.className = 'cartridge-box';
            
            var nameNode = document.createElement('div');
            nameNode.title = theCartridge.description;
            nameNode.innerHTML = '<h2><a href="'+ theCartridge.website + '">'+theCartridge.display_name + '</a></h2>';
            nameNode.className = 'cartridge-title-block';
            
            var statusNode = document.createElement('div');
            statusNode.className = 'flow-block';
            statusNode.innerHTML = '<ul class="inline top"><li class="top"><h4 class="inline-header">Gears</h4><div>' + theCartridge.current_scale+' '+theCartridge.gear_profile+'</div></li></ul>' +
            '<ul class="inline"><li class="top"><h4 class="inline-header">Storage</h4><div>'+ (parseInt(theCartridge.base_gear_storage) 
            + parseInt(theCartridge.additional_gear_storage)) + ' GB</div></li></ul>' ;
            
            cartridgeNode.appendChild(nameNode);
            cartridgeNode.appendChild(statusNode);
            parent.appendChild(cartridgeNode);
            
        }

	  };	
    return OpenshiftExplorer;
  }());
  return exports;
});
