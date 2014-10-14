# Use latest Fedora image as the base
FROM fedora:latest


# Update base image
#RUN yum -y update && yum clean all

#install java 
RUN yum -y install java-1.7.0-openjdk-devel && yum clean all

ADD /target/products/org.jboss.orion/linux/gtk/x86_64/eclipse /opt/jbossorion/eclipse

VOLUME ["/workspace"]

EXPOSE 8080

CMD  ["/opt/jbossorion/eclipse/jbossorion","-data","/workspace"]
