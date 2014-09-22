/*eslint-env browser, amd */
define(['require', 'orion/xhr', 'orion/Deferred', 'orion/operation'], 
function(require, xhr, Deferred, operation) {
var eclipse = eclipse || {};
var openshiftUser = openshiftUser || {};
var brokerHost = ""; //"https://openshift.redhat.com"; 

eclipse.OpenshiftService = (function(){
   var contentType = "application/json; charset=UTF-8";
   var registry = null;
   function OpenshiftService ( serviceRegistry ) {
        	if (serviceRegistry) {
        	    registry =serviceRegistry;
//				this._serviceRegistry = serviceRegistry;
				this._serviceRegistration = serviceRegistry.registerService(
						"orion.openshift.service", this);
			}       
   }
   OpenshiftService.prototype = 
   {
         
        _authData: function(){
            var deferred = new Deferred();
            var authService = registry.getService("orion.core.auth");
        	if (authService !== null) {
        		 authService.getUser().then(function(userData){
         		       if(userData.openshiftUser && userData.openshiftPassword){
        		          deferred.resolve("Basic " + btoa(userData.openshiftUser+":"+userData.openshiftPassword));
        		       }else if(openshiftUser.user && openshiftUser.password){
        		           deferred.resolve("Basic " + btoa(openshiftUser.user+":"+ openshiftUser.password));
        		       }else{
        		           deferred.reject({code:601, reason: 'openshift auth info is missing'});
        		       }
        		    });
        		}
            return deferred;
        },
        updateServiceCredentials: function(user, password){
            openshiftUser = {
                user:user,
                password:password
            };
        },
       listDomains: function(){
           var deferred = new Deferred();
           this._authData().then(function(authData){
               console.log(authData);
                xhr("GET", brokerHost +"/broker/rest/domains",
                 { headers:{ "Content-Type" : contentType,
                           "Authorization" : authData
                          },
                        responseType: "json"
                }).then(
                function(result){
                    console.log(result);
                    deferred.resolve(result.response.data);
                },function(error){
                    console.log(error);
                    deferred.reject(error);
                });
             },
             function(error){
               deferred.reject(error);
             }
           );
           return deferred;
        },
        listApplications: function(domain){
            var deferred = new Deferred();
            this._authData().then( function(authData ){
                var url = brokerHost+ "/broker/rest/domains/"+domain+"/applications?include=cartridges";
                xhr("GET", url,
                { headers:{ "Content-Type" : contentType,
                           "Authorization" : authData
                          },
                        responseType: "json"
                }).then(function(result){
                        deferred.resolve(result.response.data);
                },function(error){
                    deferred.reject(error);
                });
            },
            function(error){
                deferred.reject(error);
            }
           );
           return deferred;
         },
         getUser: function(user, password){
            var deferred = new Deferred();
            var url = brokerHost +'/broker/rest/user';
            var authString = "Basic " + btoa(user+":"+password);
            xhr("GET", url,
                { headers:{ "Content-Type" : contentType,
                           "Authorization" : authString
                          },
                        responseType: "json"
                }).then(function(result){
                        deferred.resolve(result.response.data);
                },function(error){
                    deferred.reject(error);
                });
            return deferred;
         }
   };
   return OpenshiftService;
}());

return eclipse;
});
            
