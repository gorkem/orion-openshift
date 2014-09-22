package org.jboss.orion.openshift.server.authentication;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.orion.server.authentication.Activator;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.events.IEventService;
import org.eclipse.orion.server.core.resources.Base64;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.eclipse.orion.server.user.profile.IOrionUserProfileConstants;
import org.eclipse.orion.server.user.profile.IOrionUserProfileNode;
import org.eclipse.orion.server.user.profile.IOrionUserProfileService;
import org.eclipse.orion.server.useradmin.UserServiceHelper;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.Version;


public class OpenshiftLoginServlet extends OrionServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1097859923088517990L;
	private OpenshiftAuthenticationService authenticator;
	private static IEventService eventService;
	
	public OpenshiftLoginServlet(OpenshiftAuthenticationService service) {
		this.authenticator = service;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
//		RequestDispatcher rd = req.getRequestDispatcher("/openshift/auth/LoginWindow.html");
		RequestDispatcher rd = req.getRequestDispatcher("/mixlogin/login");
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
		

		if (pathInfo.startsWith("/form")) {

			String userName = req.getParameter("login");
			String password = req.getParameter("password");
			if (userName == null || password == null) {
				displayError("No username or password specified", req, resp);
				return;
			}

			// Authenticate user credentials
			GetMethod theGet = new GetMethod(
					"https://openshift.redhat.com/broker/rest/user");
			theGet.addRequestHeader(new Header("Accept", "application/json"));
			theGet.addRequestHeader(new Header("Content-Type",
					"application/json"));

			HttpClient client = new HttpClient();
			AuthScope scope = new AuthScope("openshift.redhat.com", 443);
			Credentials credentials = new UsernamePasswordCredentials(userName,
					password);
			client.getState().setCredentials(scope, credentials);
			theGet.setDoAuthentication(true);
			// set default socket timeout for connection
			HttpMethodParams params = theGet.getParams();
			params.setSoTimeout(300000);
			theGet.setParams(params);
			int status = client.executeMethod(theGet);
			if (status == 200 || status == 201) {
				String response = theGet.getResponseBodyAsString();
				try {
					JSONObject user = new JSONObject(response);
					publishLoginEvent(userName);
					
					IOrionUserProfileNode userProfileNode = getUserProfileService().getUserProfileNode(userName, IOrionUserProfileConstants.GENERAL_PROFILE_PART);
					try {
						// try to store the login timestamp in the user profile
						userProfileNode.put(IOrionUserProfileConstants.LAST_LOGIN_TIMESTAMP, new Long(System.currentTimeMillis()).toString(), false);
						userProfileNode.flush();
					} catch (CoreException e) {
						// just log that the login timestamp was not stored
						LogHelper.log(e);
					}

					req.getSession(true).setAttribute("user", userName);
					req.getSession(true).setAttribute("pass", password);
					
					resp.setStatus(HttpServletResponse.SC_OK);
					resp.setContentType("application/json"); //$NON-NLS-1$
					writeUserResponse(req, resp);
					resp.flushBuffer();
				} catch (JSONException e) {
					displayError("Error while parsing openshift response", req, resp);
				}
			} else {
				displayError("Invalid user or password", req, resp);
			}
			return;
		}
		
		String user = req.getRemoteUser();
		if (user == null) {
			user = this.authenticator.getAuthenticatedUser(req, resp);
		}

		if (user != null) {
			resp.setStatus(HttpServletResponse.SC_OK);
			resp.setContentType("application/json"); //$NON-NLS-1$
			try {
				writeUserResponse(req, resp);
			} catch (JSONException e) {
				handleException(resp, "An error occured when creating JSON object for logged in user", e);
			}
			return;
		}
		
		
	}

	private void writeUserResponse(HttpServletRequest req,
			HttpServletResponse resp ) throws IOException, JSONException {
		PrintWriter writer = resp.getWriter();
		String uid = (String) req.getSession().getAttribute("user");
		String password = (String) req.getSession().getAttribute("pass");
		JSONObject userJson = new JSONObject();
		userJson.put("login", uid); //$NON-NLS-1$
		userJson.put("uid", uid);
		userJson.put("openshiftUser", uid);
		userJson.put("openshiftPassword", password);
		writer.print(userJson);
	}
	
	private IOrionUserProfileService getUserProfileService() {
		return UserServiceHelper.getDefault().getUserProfileService();
	}

	private void publishLoginEvent( String userId){
		if (getEventService() != null) {
			JSONObject message = new JSONObject();
			try {
				SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
				Date date = new Date(System.currentTimeMillis());
				message.put("event", "login");
				message.put("published", format.format(date));
				message.put("user", userId);
			} catch (JSONException e1) {
				LogHelper.log(e1);
			}
			getEventService().publish("orion/login", message);
		}
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
//			String url = "/openshift/auth/LoginWindow.html";
			String url = "/mixloginstatic/LoginWindow.html";
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
	
	private static IEventService getEventService() {
		if (eventService == null) {
			BundleContext context = Activator.getBundleContext();
			ServiceReference<IEventService> eventServiceRef = context.getServiceReference(IEventService.class);
			if (eventServiceRef == null) {
				// Event service not available
				return null;
			}
			eventService = context.getService(eventServiceRef);
			if (eventService == null) {
				// Event service not available
				return null;
			}
		}
		return eventService;
	}
	
}
