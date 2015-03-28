package org.jboss.orion.cordovasim.internal.servlets;

import java.io.IOException;
import java.net.HttpRetryException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RewriteRippleFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {

	}

	@Override
	public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException,
			ServletException {
		if(request.getParameter("enableripple") != null){
			chain.doFilter(request, response);
		}
		else{
			String file = request.getParameter("file");
			StringBuilder redirectUrl = new StringBuilder();
			redirectUrl.append("/cordovaserve");
			if(file != null && !file.startsWith("/")){
				redirectUrl.append("/");
			}
			if(file != null){
				redirectUrl.append(file);
			}
			
			HttpServletResponse httpr = (HttpServletResponse) response;
			httpr.sendRedirect(redirectUrl.toString());
		}
	}

	@Override
	public void destroy() {

	}

}
