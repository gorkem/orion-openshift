/*globals define window*/

var eclipse;

define(['i18n!git/nls/gitmessages', 'require', 'orion/browserCompatibility', 'orion/bootstrap', 'orion/status', 'orion/progress', 'orion/PageUtil', 'orion/keyBinding', 'orion/commandRegistry', 'orion/commands', 'orion/dialogs', 'orion/selection', 
        'orion/fileClient', 'orion/operationsClient', 'orion/searchClient', 'orion/globalCommands',
        'orion/git/gitRepositoryExplorer', 'orion/git/gitCommands', 'orion/git/gitClient', 'orion/ssh/sshTools', 'orion/links','openshift/openshiftClient', 'openshift/openshiftExplorer','openshift/openshift-commands'], 
		function(messages, require, mBrowserCompatibility, mBootstrap, mStatus, mProgress, PageUtil, KeyBinding, mCommandRegistry, mCommands, mDialogs, mSelection, 
				mFileClient, mOperationsClient, mSearchClient, mGlobalCommands, 
				mGitRepositoryExplorer, mGitCommands, mGitClient, mSshTools, mLinks, OpenshiftService, OpenshiftExplorer, OpenshiftCommands) {

mBootstrap.startup().then(function(core) {
	var serviceRegistry = core.serviceRegistry;
	var preferences = core.preferences;
	
	new mDialogs.DialogService(serviceRegistry);
	var selection = new mSelection.Selection(serviceRegistry);
	new mSshTools.SshService(serviceRegistry);
	var commandRegistry = new mCommandRegistry.CommandRegistry({selection: selection});
	var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
	var progress = new mProgress.ProgressService(serviceRegistry, operationsClient, commandRegistry);
	new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	// ...
	var linkService = new mLinks.TextLinkService({serviceRegistry: serviceRegistry});
	var gitClient = new mGitClient.GitService(serviceRegistry);
	var fileClient = new mFileClient.FileClient(serviceRegistry);
	var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandRegistry, fileService: fileClient});
	
	var openshift = new OpenshiftService.OpenshiftService(serviceRegistry);
	var explorer = new OpenshiftExplorer.OpenshiftExplorer(serviceRegistry,commandRegistry);
	explorer.displayDomains();
	
	mGlobalCommands.generateBanner("openshift-apps", serviceRegistry, commandRegistry, preferences, searcher /*,explorer*/); //$NON-NLS-0$	
    
    OpenshiftCommands.createApplicationCommands(serviceRegistry, commandRegistry, fileClient);

    commandRegistry.registerCommandContribution("applicationLevelCommands", "openshift.editApplication", 200); //$NON-NLS-1$ //$NON-NLS-0$
    

		
});

//end of define
});
