package org.jboss.orion.cordovasim.internal.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.orion.internal.server.servlets.IFileStoreModificationListener;
import org.eclipse.orion.internal.server.servlets.ServletResourceHandler;
import org.eclipse.orion.internal.server.servlets.file.ServletFileStoreHandler;
import org.eclipse.orion.internal.server.servlets.workspace.authorization.AuthorizationService;
import org.eclipse.orion.server.core.OrionConfiguration;
import org.eclipse.orion.server.core.metastore.ProjectInfo;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.eclipse.osgi.util.NLS;

public class RippleServeServlet extends OrionServlet{


	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private ServletResourceHandler<IFileStore> fileHandler;
	
	public void init() throws ServletException {
		super.init();
		fileHandler = new ServletFileStoreHandler(getStatusHandler(), getServletContext());
		
	};

	@Override
	protected void service(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
	
		final String pathInfoString = req.getPathInfo();
		System.out.println("Path Info: "+pathInfoString);
		final IPath pathInfo = new Path(null, pathInfoString==null? "":pathInfoString);
		if(pathInfo.segmentCount()>1){
			String filename = pathInfo.lastSegment();
			if(filename.equals("cordova.js")){
				serveCordovaJS(req,resp);
			}if(filename.equals("cordova_plugins.js")){
				serveCordovaPluginJS(req,resp);
			}
			else{
				serveFile(req, resp, pathInfo);
			}
		}
		else{
			//Handle no file on URI to serve
		}
	}

	private void serveCordovaPluginJS(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.sendRedirect("/ripple/assets/cordova/cordova_plugins.js");
	}

	private void serveCordovaJS(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.sendRedirect("/ripple/assets/cordova/cordova-3.5.0.js");
	}

	private void serveFile(HttpServletRequest req, HttpServletResponse resp, IPath path) throws ServletException, IOException {
		if(path.segment(0).equals("file")){
			path = path.removeFirstSegments(1);
		}
		String fileURI = "/file/" + path.toString();
		try {
			final boolean authorized = AuthorizationService.checkRights((String)req.getSession().getAttribute("user"), fileURI, "GET");
			if(!authorized){
				resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			}
			else{
				IFileStore fs = getFileStore(path);
				if(fs == null || !fs.fetchInfo().exists() ){
					resp.sendError(HttpServletResponse.SC_NOT_FOUND);
					return;
				}
				fileHandler.handleRequest(req, resp, fs);
				resp.setHeader("Cache-Control", "no-cache");
				addContentTypeHeader(resp, fs.getName());
			}
			
			
		} catch (CoreException e) {
			throw new ServletException(e);
		}
	}
	
	private void addContentTypeHeader(HttpServletResponse resp, String filename) {
		if (filename != null) {
			String mimeType = getServletContext().getMimeType(filename);
			if (mimeType != null)
				resp.addHeader("Content-Type", mimeType);
		}
	}

	private IFileStore getFileStore(final IPath path) {
		//path format is /workspaceId/projectName/[suffix]
		if (path.segmentCount() <= 1)
			return null;
		try {
			ProjectInfo project = OrionConfiguration.getMetaStore().readProject(path.segment(0), path.segment(1));
			if (project == null)
				return null;
			return project.getProjectStore().getFileStore(path.removeFirstSegments(2));
		} catch (CoreException e) {
			//TODO: log the error
		}
		return null;
	}

}
