package org.jboss.orion.openshift.server.authentication;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.eclipse.orion.server.servlets.OrionServlet;

public class OpenshiftLogoutServlet extends OrionServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5360377003014110451L;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession s = req.getSession(true);
		if (s.getAttribute("user") != null) { //$NON-NLS-1$
			s.removeAttribute("user"); //$NON-NLS-1$
		}
	}
	
}
