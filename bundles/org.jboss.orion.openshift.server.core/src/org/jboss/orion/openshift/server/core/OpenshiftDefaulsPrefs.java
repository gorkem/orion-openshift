package org.jboss.orion.openshift.server.core;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
/**
 * Overwrites the defaults.pref that is shipped with Orion with the openshift version. 
 * 
 * @author Gorkem Ercan
 *
 */
public class OpenshiftDefaulsPrefs implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		request.getRequestDispatcher("/openshift/defaults-openshift.pref").forward(request, response);

	}

	@Override
	public void destroy() {

	}

}
