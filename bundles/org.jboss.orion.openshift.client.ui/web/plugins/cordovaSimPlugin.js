/******************************************************************************* 
 * @license
 * Copyright (c) 2014 Red Hat Inc. and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: Red Hat Inc. - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/

define(["orion/plugin", "domReady!"], 
function(PluginProvider) {
	var headers = {
		name: "Cordova Simulator",
		version: "0.1",
		description: "This plugin provides Cordova emulation based on Apache Ripple",
	};
	var provider = new PluginProvider(headers);
	//Move the content type to cordova support plugin.
    provider.registerServiceProvider("orion.core.contenttype",{},{
        contentTypes:[
            {
                id: 'application/cordova-config',
                name: 'Cordova configuration file',
                filename: ['config.xml'],
                'extends': 'application/xml',
                image: "data:image/png;base64,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",
            }
        ]
    });
    
    provider.registerServiceProvider("orion.navigate.command", null, {
        name: "Test with CordovaSim",
        id: "jboss.orion.cordovasim.test",
        forceSingleItem: true,
        tooltip: "Test with CordovaSim",
        uriTemplate: "{+OrionHome}/ripple/assets/CordovaSim.html?enableripple=true&file={+Location}"
    });
	provider.connect();
});
