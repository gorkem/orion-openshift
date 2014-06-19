package org.jboss.orion.openshift.server.authentication;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.orion.server.core.resources.Base64;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Version;


public class OpenshiftLoginServlet extends OrionServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1097859923088517990L;
	private OpenshiftAuthenticationService authenticator;
	
	public OpenshiftLoginServlet(OpenshiftAuthenticationService service) {
		this.authenticator = service;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		RequestDispatcher rd = req.getRequestDispatcher("/openshift/auth/LoginWindow.html");//$NON-NLS-1$
		rd.forward(req, resp);

		
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String pathInfo = req.getPathInfo() == null ? "" : req.getPathInfo(); //$NON-NLS-1$

		if (pathInfo.startsWith("/canaddusers")) {
			JSONObject jsonResp = new JSONObject();
			try {
				jsonResp.put("CanAddUsers", Boolean.FALSE.toString());
				jsonResp.put("ForceEmail", Boolean.TRUE.toString());
				jsonResp.put("RegistrationURI", "https://www.openshift.com/app/account/new");
			} catch (JSONException e) {
				
			}
			resp.getWriter().print(jsonResp);
			resp.setContentType("application/json");
			return;
		}
		
		String userName = req.getParameter("login");
		String password = req.getParameter("password");
		if(userName == null || password == null ){
			displayError("No username or password specified", req, resp);
			return;
		}
//		IOpenShiftConnection connection = new OpenShiftConnectionFactory().getConnection("orion_openshift", userName, password, "http://www.openshift.com");
//		IUser user = connection.getUser();
//		req.getSession(true).setAttribute("user", user.getRhLogin());
		req.getSession(true).setAttribute("user", userName);
		resp.setStatus(HttpServletResponse.SC_OK);
		PrintWriter writer = resp.getWriter();
		String uid = (String) req.getSession().getAttribute("user");
		JSONObject userJson = new JSONObject();
		try {
			userJson.put("login", uid); //$NON-NLS-1$
			userJson.put("uid", uid);
			writer.print(userJson);
			resp.setContentType("application/json"); //$NON-NLS-1$
			resp.flushBuffer();
		} catch (JSONException e) {/* ignore */ }
		
	}
	
	private void displayError(String error, HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// redirection from
		// FormAuthenticationService.setNotAuthenticated
		String versionString = req.getHeader("Orion-Version"); //$NON-NLS-1$
		Version version = versionString == null ? null : new Version(versionString);

		// TODO: This is a workaround for calls
		// that does not include the WebEclipse version header
		String xRequestedWith = req.getHeader("X-Requested-With"); //$NON-NLS-1$

		if (version == null && !"XMLHttpRequest".equals(xRequestedWith)) { //$NON-NLS-1$
			String url = "/openshift/auth/LoginWindow.html";
			if (req.getParameter("redirect") != null) {
				url += "?redirect=" + req.getParameter("redirect");
			}

			if (error == null) {
				error = "Invalid login";
			}
			url += url.contains("?") ? "&" : "?";
			url += "error=" + new String(Base64.encode(error.getBytes()));

			resp.sendRedirect(url);

		} else {
			resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			PrintWriter writer = resp.getWriter();
			JSONObject jsonError = new JSONObject();
			try {
				jsonError.put("error", error); //$NON-NLS-1$
				writer.print(jsonError);
				resp.setContentType("application/json"); //$NON-NLS-1$
			} catch (JSONException e) {/* ignore */ }
		}
		resp.flushBuffer();
	}
	
	
}
