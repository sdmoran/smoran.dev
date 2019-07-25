function genNavbar(pagename="Default", titleheader=true) {
	//Gets navbar item
	var bar = document.getElementById('navbar');
	//Adds div to bar item
	var navdiv = document.createElement('div');
	navdiv.className = 'nav-wrapper amber darken-2';
	bar.appendChild(navdiv);

	var logoref = document.createElement('a');
	logoref.className = 'white-text brand-logo center';
	logoref.innerHTML = 'smoran.dev';
	logoref.setAttribute('href', 'index.html');
	navdiv.appendChild(logoref);

	var list = document.createElement('ul');
	list.className = 'left hide-on-med-and-down';

	//Home element of list
	var home_elt = document.createElement('li');
	var home = document.createElement('a');
	home.setAttribute('href', 'index.html');
	home.innerHTML = 'Home';
	home_elt.appendChild(home);
	list.appendChild(home_elt);

	//Projects element of list
	var proj_elt = document.createElement('li');
	var proj = document.createElement('a');
	proj.setAttribute('href', 'projects.html');
	proj.innerHTML = 'Projects';
	proj_elt.appendChild(proj);
	list.appendChild(proj_elt);

	//Connect4JS element of list
	var connect_elt = document.createElement('li');
	var connect = document.createElement('a');
	connect.setAttribute('href', 'connect4.html');
	connect.innerHTML = 'Connect4JS';
	connect_elt.appendChild(connect);
	list.appendChild(connect_elt);

	navdiv.appendChild(list);

	if(titleheader) {
	//Generates the page title/header
		var header = document.createElement('div');
		header.className = "row";
		var title = document.createElement('div');
		title.className = "white-text card-panel blue-grey darken-3";
		var title_text = document.createElement('h2');
		title_text.className = "center-align";
		title_text.innerHTML = pagename;
		title.appendChild(title_text);
		header.appendChild(title);
		//Grey line separator
		var greyline = document.createElement('div');
		greyline.className = "grey lighten-1 divider col s6 push-s3"
		header.appendChild(greyline);
		document.body.appendChild(header);
	}
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
  });