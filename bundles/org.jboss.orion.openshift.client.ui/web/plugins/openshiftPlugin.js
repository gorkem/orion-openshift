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

define(["orion/plugin", "orion/xhr", "orion/serviceregistry", "orion/git/gitClient", "orion/ssh/sshTools",
 "orion/i18nUtil", "orion/Deferred", "orion/git/util", "orion/URL-shim", "domReady!"], 
function(PluginProvider, xhr, mServiceregistry, mGitClient, mSshTools, i18nUtil, Deferred, mGitUtil) {
	var temp = document.createElement('a');
	temp.href = "../mixloginstatic/LoginWindow.html";
	var serviceRegistry = new mServiceregistry.ServiceRegistry();
	var gitClient = new mGitClient.GitService(serviceRegistry);
	var sshService = new mSshTools.SshService(serviceRegistry);
	var login = temp.href;
	var headers = {
		name: "Openshift support",
		version: "1.0",
		description: "This plugin provides support for Openshift",
		login: login
	};

	var provider = new PluginProvider(headers);
	provider.registerService("orion.page.link.category", null, {
		id: "openshift",
		nameKey: "openshift",
		nls: "openshift/nls/messages",
		imageDataURI: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAASCAYAAAC0EpUuAAAEoklEQVQ4EXWUbUwcRRiAZ3Zmd++O4+CWOzjg+LItaQPSHpimgLRni2jTYNIUam0q1j/6oz+qMdbGmOifxn+tMTWmTRSNmlZbq0JjtVKDabx+UPqZg5ZeDygCd3A9uA9uv3ecJYIN4pvszsw77/vMzr4fEPxX4HeHD1taV1Z5pCMnfHpgoBkqegMBsAQSKhCGUUHORWvb5p7TMHHng3NnpkOhkEIxZAEFFybm6AcAv/LGQe9OmPO8dKKnnUQTdVTtMPeWiAl4xD5RFGCbN357bHqo980zx6eozqAPWYRSb/b1xtbKHSluL7gzupt6eQCkRgiJkMVzdC4D+gKEWImiZgHdsFAABBg+4Lb7j3+ijJ2+PRZJZ4PszAKU2etZXfqRq+Y1LRh+mRoXAhaLqo0dFt3260aFNwR5Nk6vD3VRygeDoyvts6KP1YwiYBj0HHKPebr6LOstkCHi++ahfrfbvh+UtG2MofcJICUQo5Ranh+4UWw59dvMZCDttkQVTaNfCgDieZvrQbywiXFsWiUDn6CTLDwjrjAwhoTDc8Mk9RM2r/De1p1FvvPBNgLSZQBCWcnib9x0wi8+T4XPn7rVnzBhj4lE57Mza+riz7qdA35OqOSUaStZVTJy26YHPrw0OGBCUUN+eVUm3ldrOsqQTPWT5M+fPpzoPRcJJU3dctJYUZpd+3Cu3j4W8eOkVMEY5JcjD+6d705HEvNQqCmrgWrkUmdVRXAilmcdZ7J0DUTMyPybKo/DpVTGLqRVHxub20CDlkUmItWVNiO3vapKR+U06vvWb96mXr37FPVPsBjpK73FqKxmTeRyZjYSj8f1x2H/zAlMiWwDslcLGaMGGIQYiqo8mVfsbbEUZfAIADoq9FxlVnkdMDy5Tmc5TDDH6gYDeZ5fTOilYBGICVAgXCOsVqGMParSRH01F5xooPe6h+ucThunZkIkzyrosksZW1t2uSs9NhgYGAwHg0F1KWxhra1dO5dsrP9DuhPNVaevrzAycjnd0xivMIEPJfNeIF//2opjqRK1xNUXdJFLB7q6R6iBWR3/K729vfotq0C8YdnDy5qTGjL0WiPsgY5R1AlLd4FYqgPIahHkkcHkOUYdvCPjmJ3NsWqSFqWnL0OGr/p8ri0z/Lb8kfhOqOoV1IYwXvfZa02lP0J1x/7n4Pe9R2m65ug8jsmCIxhFWiQxO0fGNfHqhSLuSrK0fDrbKovYbmekyYzFORktbuGFZ9bE9HYUT9XS6NsAx9y3bd9wsOn+n2fxISbd9+7ulsNQUpzy0LigDgw3CwyzRSAM8KKspmrovgmsecOARdNQRAzBoovJZCqt48lapBpltEwtNO9G2I11X3ZGQpf6+/s1Mw+Z9vr6XLuE0Xqro6AtgTvgwPgeqi+gWWoATBsKnm8oZiVRDbEQVTMbinV+jeEwt3XTZ8dI9OTb3V89pDrdhJoyP/ppde3Z91bxS9jdIp280E6mZtbTveVanxnEOFpReMXSUnfq47/u9rzTdZL+fjCf0wtQul4U2NnZye/K9Xiko9+s0wNDLUQyGmmHMvuCRvMwjPKdF7kX/b//ABK3lmvSfwOzzBDozpHuLgAAAABJRU5ErkJggg==",
		order: 20
	});

	provider.registerService("orion.page.link", {}, {
		nameKey: "Openshift",
		id: "orion.openshift apps",
		nls: "openshift/nls/messages",
		category: "openshift",
		order: 210, // Bottom
		"default": true,
		force: true,
		uriTemplate: "{+OrionHome}/openshift/openshift-apps.html#"
	});

	
	provider.connect();
});
