The goal of this project is to extend [Eclipse Orion](http://www.eclipse.org/orion) for [Openshift](http://www.openshift.com) and beyond.
## Configuration
To enable authentication with Openshift:
- Add `orion.auth.name = openshift`  to the server configuration

## Get the code

The easiest way to get started with the code is to [create your own fork](http://help.github.com/forking/), and then clone your fork:

    $ git clone git@github.com:<you>/orion-openshift.git
    $ cd orion-openshift
    $ git remote add upstream git@github.com:gorkem/orion-openshift.git
  
At any time, you can pull changes from the upstream and merge them onto your master:

    $ git checkout master               # switches to the 'master' branch
    $ git pull upstream master          # fetches all 'upstream' changes and merges 'upstream/master' onto your 'master' branch
    $ git push origin                   # pushes all the updates to your fork, which should be in-sync with 'upstream'

The general idea is to keep your 'master' branch in-sync with the 'upstream/master'.

## Building
Build requires Maven (3.1+). 

Install Maven:
- install Maven from http://maven.apache.org/download.cgi
- follow http://maven.apache.org/settings.html to configure Maven settings.xml
 
Run Maven build
- `cd orion-openshift/`
- `mvn clean verify`


## Eclipse Setup

Set target platform:
- import target-platform into your workspace
- in Eclipse open the target definition `target-platform/org.jboss.orion.target.target`
- Upon opening, the target content will be downloaded
- When complete click "Set as Target Platform"

## Make contributions

* Create a topic branch based on master, Please avoid working directly on the master
````
   $ git checkout -b my_contribution
````
* Make changes for a bug or feature.
* Make sure you have added the necessary tests for your changes.
* Make sure that a full build (with unit tests) runs successfully. 
* You can then push your topic branch and its changes into your public fork repository:
````
	$ git push origin my_contribution         # pushes your topic branch into your fork
````
And then [generate a pull-request](http://help.github.com/pull-requests/) where we can review the proposed changes, comment on them, discuss them with you, and if everything is good merge the changes to the repository.
