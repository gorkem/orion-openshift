package org.jboss.orion.openshift.server.proxy;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.protocol.Protocol;
import org.apache.commons.httpclient.protocol.SSLProtocolSocketFactory;

import io.fabric8.gateway.model.HttpProxyRuleBase;
import io.fabric8.gateway.servlet.ProxyServlet;
import io.fabric8.gateway.servlet.support.NonBindingSocketFactory;
import io.fabric8.gateway.support.JsonRuleBaseReader;

public class JsonProxyServlet extends ProxyServlet {
	
	private static final long serialVersionUID = 3652872664212441494L;
	private static final String PROXY_CONFIG = "/res/proxy-config.json";

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);
	    Protocol.registerProtocol("https", new Protocol("https", new SSLProtocolSocketFactory(), 443));
	       
	}
	
    @Override
    protected void loadRuleBase(ServletConfig servletConfig, HttpProxyRuleBase ruleBase) throws ServletException {
        ruleBase.setMappingRules(JsonRuleBaseReader.parseJson(servletConfig.getServletContext().getResourceAsStream(PROXY_CONFIG)));
    }
    
    @Override
    public void doGet(HttpServletRequest httpServletRequest,
    		HttpServletResponse httpServletResponse) throws IOException,
    		ServletException {
    	
    	try{
    		super.doGet(httpServletRequest, httpServletResponse);
    	}
    	catch (ServletException e) {
    		e.printStackTrace();
    		throw e;
		}
    	catch ( IOException e) {
    		e.printStackTrace();
    		throw e;
		}
    }

}