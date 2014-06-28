package org.jboss.orion.openshift.server.authentication;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.eclipse.orion.server.authentication.IAuthenticationService;
import org.jboss.orion.openshift.server.core.OpenshiftCore;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Version;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;


public class OpenshiftAuthenticationService implements IAuthenticationService {
	
	private Properties defaultAuthenticationProperties;
	private boolean registered = false;
	
	@Override
	public String getAuthType() {
		return HttpServletRequest.FORM_AUTH;
	}

	@Override
	public void setRegistered(boolean registered) {
		this.registered  =registered;
	}

	@Override
	public boolean getRegistered() {
		return registered;
	}

	@Override
	public void configure(Properties properties) {
		this.defaultAuthenticationProperties = properties;
	}

	@Override
	public String getAuthenticatedUser(HttpServletRequest req,
			HttpServletResponse resp, Properties properties) throws IOException {
		HttpSession s = req.getSession(true);
		return (String) s.getAttribute("user");//$NON-NLS-1$
	}

	@Override
	public String authenticateUser(HttpServletRequest req,
			HttpServletResponse resp, Properties properties) throws IOException {
		String user = getAuthenticatedUser(req, resp, properties);
		if(user == null ){
			notAuthenticated(req, resp, properties);
		}
		return user;
	}
	
	private void notAuthenticated(HttpServletRequest req, HttpServletResponse resp, Properties properties) throws IOException {
		resp.setHeader("WWW-Authenticate", HttpServletRequest.FORM_AUTH); //$NON-NLS-1$
		resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

		// redirection from FormAuthenticationService.setNotAuthenticated
		String versionString = req.getHeader("Orion-Version"); //$NON-NLS-1$
		Version version = versionString == null ? null : new Version(versionString);

		// TODO: This is a workaround for calls
		// that does not include the WebEclipse version header
		String xRequestedWith = req.getHeader("X-Requested-With"); //$NON-NLS-1$

		if (version == null && !"XMLHttpRequest".equals(xRequestedWith)) { //$NON-NLS-1$
			OpenshiftCore.log("Sending redirect to auth form");
			resp.sendRedirect(req.getContextPath() + "/mixloginstatic/LoginWindow.html?redirect=" + req.getRequestURL());
		} 
		else {
			resp.setContentType("application/json; charset=UTF-8");
			JSONObject result = new JSONObject();
			try {
				result.put("SignInLocation", req.getContextPath() +  "/mixloginstatic/LoginWindow.html");
				result.put("label", "Openshift Workspace Server");
				result.put("SignInKey", "openshift");
			} catch (JSONException e) {
				
			}
			resp.getWriter().print(result.toString());
		}
	}
	
	public void setHttpService(HttpService httpService) {
		try {
			//httpService.registerServlet("/mixlogin/manageopenids",  new OpenshiftLoginServlet(this), null, null); // new ManageOpenidsServlet(this), null, null);
			httpService.registerServlet("/login", new OpenshiftLoginServlet(this), null, null); //$NON-NLS-1$
			httpService.registerServlet("/logout", new OpenshiftLogoutServlet(), null, null); //$NON-NLS-1$
		} catch (ServletException e) {
			OpenshiftCore.log(e);
		} catch (NamespaceException e) {
			OpenshiftCore.log(e);
		}
	}

	public void unsetHttpService(HttpService httpService) {
		if (httpService != null) {
			//httpService.unregister("/mixlogin/manageopenids"); //$NON-NLS-1$
			httpService.unregister("/login"); //$NON-NLS-1$
			httpService.unregister("/logout"); //$NON-NLS-1$
			httpService = null;
		}
	}
	

}
