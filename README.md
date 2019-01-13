Official website for UPE @ UC Berkeley.
Website is based of off the Devoll Jekyll template.

You need to have Ruby/Jekyll installed. We are not using bundler, nor do we have a Gemfile.
Here are some instructions to get Ruby and Jekyll (though since we don't use bundler, running ```gem istall jekyll``` after installing Ruby should be enough.
https://jekyllrb.com/docs/installation/

After you Ruby/Jekyll installed, clone the repo. To view the website locally, run ```jekyll serve``` in the root directory. This will usually host the website at ```localhost:4000```, but read the output if that does not work. 

If there are questions regarding the website, please contact <publicity (at) upe.berkeley.edu>.

The website is up at upenu@github.io for testing. If everything is working there, changes can be pushed to the live version.

Once in the OCF hosting machince (only UPE Dev Team), go to the git repo and follow these steps:
```git status``` Make sure there are not any local changes. 
```git pull origin master``` 
```jekyll build -d ~/public_html``` the -d was mentioned in the OCF documentation, not sure what it does. We need to build the website to the ```~/public_html``` directory since that is what is hosted. 

Notes:
The website does not use ```site.url``` (found in ```_config.yml``` for anything other than canonical in the head. The site also does not support any baseurls and as all paths start at the root (ie: begin with "/")  


