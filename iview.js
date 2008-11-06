// 
// Copyright (c) KUMAGAI Kentaro ku0522a*gmail.com
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// 
// 
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 

var datauri = 'data:text/html;charset=utf-8,<!DOCTYPE HTML PUBLIC "-%2f%2fW3C%2f%2fDTD HTML 4.01 Transitional%2f%2fEN" "http%3a%2f%2fwww.w3.org%2fTR%2fhtml4%2floose.dtd"><html><head><title>iview for tombloo 0.0.1<%2ftitle><meta http-equiv%3d"content-type" content%3d"text%2fhtml%3b charset%3dutf-8" %2f><style>body {margin-top%3a 25px%3bbackground%3a black%3bcolor%3a white%3b}a {background-color%3a black%3bcolor%3a white%3b}li {list-style-type%3a none%3b}em {font-weight%3a bold%3bfont-style%3a normal%3btext-decoration%3a none%3b}%23imagebox {width%3a 800px%3b%2f%2fborder%3a 1px solid white%3bmargin-left%3a auto%3bmargin-right%3a auto%3b%2f%2fbackground%3a white%3btext-align%3a center%3bdisplay%3a none%3b}%23imageElement {max-width%3a 800px%3bmax-height%3a 700px%3b}%23imagesources {display%3a none%3b}%23imagebox a {color%3a %23444%3b}%23footer {position%3a fixed%3bbottom%3a 0%3bdisplay%3a none%3b}%23sourcename {color%3a %23777%3bmargin%3a 0.1em%3b-moz-border-radius%3a 0.2em%3bbackground%3a black%3bopacity%3a 0.6%3bpadding%3a 10px%3b}%23sourcename a {text-decoration%3a none%3b}%23help {color%3a %23666%3b-moz-border-radius%3a 0.2em%3bbackground%3a black%3bopacity%3a 0.6%3bpadding%3a 10px%3b}%23about {position%3a fixed%3bbottom%3a 0%3bright%3a 5px%3bcolor%3a %23222%3bfont-size%3a small%3b}%23imageno {position%3a fixed%3btop%3a 5px%3bleft%3a 5px%3bfont-size%3a x-large%3bcolor%3a %23444%3b}%23reblogging {position%3a absolute%3bwidth%3a 160px%3bdisplay%3a none%3btext-align%3a center%3b-moz-border-radius%3a 0.2em%3bbackground%3a black%3bopacity%3a 0.75%3bfont-weight%3a bold%3bfont-size%3a large%3b}%23caption {font-size%3a small%3b}<%2fstyle><%2fhead><body><div id%3d"container"><div id%3d"imagebox"><!--img id%3d"imageElement" src%3d"http%3a%2f%2fx818.com%2fnevverimages%2f092308.jpg" %2f--><img id%3d"imageElement" %2f><p><a id%3d"caption" ><%2fa><%2fp><div id%3d"reblogging">Reblogging...<%2fdiv><%2fdiv><%2fdiv><div id%3d"imageno"><%2fdiv><div id%3d"imagesources"><h2>Select an image source.<%2fh2><ul id%3d"imagesourcelist"><%2ful><%2fdiv><div id%3d"footer"><h3 id%3d"sourcename"><%2fh3><div id%3d"help"><em>j<%2fem>%3anext <em>k<%2fem>%3aprevious <em>t<%2fem>%3ashare<%2fdiv><div id%3d"about">iview for tombloo 0.0.2(%2blaunch PicLens by <a href%3d"http%3a%2f%2fcollisions.dotimpac.to%2f">dotimpact<%2fa>)<%2fdiv><%2fdiv><%2fbody><%2fhtml>';

// datauri = 'file:///Users/kotaro/Desktop/iview.html';

var requestopts = {
	//charset: 'utf-8'
};

var requestBroker = {
	queue: [],
	init: function () {
		this.queue = [];
		var self = this;
		var brokertimer = window.setInterval( function () {
			if ( iviewLoader.shouldPrefetch() ) {
				var args = self.queue.shift();

				if ( args ) {
					var u = args[0];
					var opts = args[1];
					var f = args[2];
					request(u, opts).addCallback( f ).addErrback( function (e) {
						log(e);
					} );
				}
			}
		}, 500 );
		return brokertimer;
	},
	add: function (u, opts, callback) {
		this.queue.push(arguments);
	}
}

var iviewLoader = {
	siteinfo: null,

	PREFETCHSIZE: 20,

	images: [],
	currentPage: null,
	eventListener: null,
	lastPageDoc: null,
	lastPageURI: null,
	run: function (siteinfo, eventListener) {
		this.siteinfo = siteinfo;
		this.currentPage = null;
		this.lastPageURI = null;
		this.lastPageDoc = null;
		this.images = [];
		
		this.requestNextPage();
		this.eventListener = eventListener;
	},

	requestingNextPage: false,
	largestRequestedImageIndex: -1,
	shouldPrefetch: function () {
		var b = ( this.images.length - this.largestRequestedImageIndex <= this.PREFETCHSIZE ) ;
		return b;
	},
	getAt: function (n) {
		if ( n > this.largestRequestedImageIndex ) {
			this.largestRequestedImageIndex = n;
		}
		if ( this.shouldPrefetch() ) {
			if ( !this.requestingNextPage ) {
				this.requestNextPage();
			}
		}

		return this.images[n];
	},
	requestNextPage: function () {

		if ( this.currentPage ) {
			if ( !this.siteinfo.nextLink ) {
				return;
			}
			var link = $X(this.siteinfo.nextLink, this.lastPageDoc).shift();
			var nextLink = valueOfNode(link);
			this.currentPage = abs(this.lastPageURI, nextLink);
		} else {
			this.currentPage = this.siteinfo.url;
		}

		var nextPage = this.currentPage;

		this.requestingNextPage = true;
		var self = this;
		var d = requestBroker.add(nextPage, requestopts, function(res) {
			self.requestingNextPage = false;
			self.lastPageURI = nextPage;
			self.onPageLoad.apply(self, arguments);
		} );
	},
	onSubrequestLoad: function (res) {
		var siteinfo = this.siteinfo.subRequest;

		var doc = createHTMLDocumentByString(iview.doc, res.responseText, res.channel.contentCharset);
		var paragraphes = $X( siteinfo.paragraph, doc );

		var base = res.channel.URI.asciiSpec;
		this.parseResponse(doc, siteinfo, base, {permalink: base});
	},
	onPageLoad: function (res) {
		var siteinfo = this.siteinfo;

		var doc = this.lastPageDoc = createHTMLDocumentByString(iview.doc, res.responseText, res.channel.contentCharset);

		var base = this.lastPageURI;
		this.parseResponse(doc, siteinfo, base);
	},
	parseResponse: function (doc, siteinfo, baseURI, hashTemplate) {
		var paragraphes = $X( siteinfo.paragraph, doc );

		var self = this;
		paragraphes.map ( function (paragraph, index) {
			if ( siteinfo.subRequest && siteinfo.subRequest.paragraph ) {
				var img = self.parseParagraph(paragraph, siteinfo, baseURI);

				var subpage = img.permalink;

				var d = requestBroker.add(subpage, requestopts, function(res) {
					self.onSubrequestLoad.apply(self, arguments);
				} );

			} else {
				if ( siteinfo.subParagraph && siteinfo.subParagraph.paragraph ) {
					var d = self.parseParagraph(paragraph, siteinfo, baseURI);

					if ( siteinfo.subParagraph.cdata ) {
						try {
							var cdata = $X( siteinfo.subParagraph.cdata, paragraph ).shift().textContent;
							cdata = '<html><body>' + cdata + '</body></html>';
							paragraph = createHTMLDocumentByString(iview.doc, cdata);
						}catch(e){
							log(e);
						}
					}

					var subparagraphes = $X(siteinfo.subParagraph.paragraph, paragraph);
					subparagraphes.map ( function ( subparagraph ) {
						var img = self.parseParagraph(subparagraph, siteinfo.subParagraph, baseURI);
						img = update(img, d);
						img = update(img, hashTemplate);
						self.addToImageList(img);
					} );
				} else {
					var img = self.parseParagraph(paragraph, siteinfo, baseURI);
					img = update(img, hashTemplate);
					self.addToImageList(img);
				}
			}
		} );
		
		var obs = this.eventListener;
		obs && obs.onPageLoad.apply(obs);
	},
	addToImageList: function (img) {
		if ( img.imageSource && img.permalink ) {
			(new window.Image()).src = img.src();
			this.images.push(img);
		}
	},
	parseParagraph: function (paragraph, siteinfo, baseURI) {
		var image = {
			src: function () {
				return this.imageSourceForReblog || this.imageSource;
			}
		};
		
		for ( var k in siteinfo ) {
			var xpath = siteinfo[k];

			if ( k.match(/^url|paragraph|nextLink|cdata$/) )
				continue;

			if ( !xpath || typeof xpath == 'object' ) {
				continue;
			}

			var v;
			var rs = $X(xpath, paragraph);
			if (typeof rs == 'string') {
				v = rs;
				if ( k == 'caption' ) {
					v =  v.textContent.replace(/(^\s*)|(\s*$)/g, '');
				} else {
					v = abs(baseURI, v);
				}
			} else {
				var node = rs.shift();
				if ( k == 'caption' ) {
					v =  node.textContent.replace(/(^\s*)|(\s*$)/g, '');
				} else {
					if ( node == null )
						log(k, "null!");
					v = valueOfNode(node);
					v = abs(baseURI, v);
				}
			}


			image[k] = v;
		}
		return image;
	}
};

var iview = { 
	position: 0,
	doc: null,
	iviewSiteinfoURL: 'http://wedata.net/databases/iview/items.json',
	siteinfo: null,
	init: function (doc) {
		this.doc = doc;

		this.siteinfo = null;
		this.position = 0;

		doc.addEventListener("onIviewFxNext", function () {
			//iviewLoader.onImageSourceSelected.apply(iview, arguments);
		}, false );
		doc.addEventListener("onJSONPLoad", function () {
			iview.onImageSourceSelected.apply(iview, arguments);
		}, false );
		
		doc.addEventListener("keypress", function (ev) {
			var c = String.fromCharCode(ev.charCode).toLowerCase();

			if ( ev.currentTarget != doc )
				return;

			if ( ev.ctrlKey || ev.altKey || ev.shiftKey || ev.metaKey )
				return;

			if ( c == 't' ) {
				iview.share();
			} else if ( c == 'j' ) {
				iview.goRelative(1);
			} else if ( c == 'k' ) {
				iview.goRelative(-1);
			} else if ( c == 'p' ) {
				iview.launchPicLens();
			}

		}, false );
	},
	share: function () {
		var self = this;

		var i = iviewLoader.getAt(this.position );

		var env = Cc['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;

		var title = i.caption || i.permalink;

		var ps = {
			type:		'photo',
			page:		title,
			pageUrl:	i.permalink,
			item:		title,
			itemUrl:	i.src()
		};

		var posters = models.getDefaults(ps);
		i.reblogging = true;
		this.showRebloggingBox(i);
		env.Tombloo.Service.post(ps, posters).addCallback( function () {
			i.reblogging = false;
			self.showRebloggingBox(i);
			log("done", ps);
		} );

	},
	showRebloggingBox: function (i) {
		var r = this.doc.getElementById('reblogging');
		if ( i.reblogging ) {
			var img = this.doc.getElementById('imageElement');
			var box = this.doc.getElementById('imagebox');

			var margin = 10;
			r.style.display = 'block';
			r.style.top  = (img.offsetHeight - img.height + r.clientHeight + margin ) + "px"; 
			r.style.left = img.offsetLeft + margin + "px"; 
			r.style.opacity = 0.75;

		} else {
			var n = 0;
			var timerid = window.setInterval( function () {
				if ( n++ < 10 ) {
					r.style.opacity = 1 - (0.1 * n);
				} else {
					window.clearInterval(timerid);
					r.style.opacity = 1;
					r.style.display = 'none';
				}
			}, 50);
		}
	},
	goRelative: function (diff) {
		var imageInfo = iviewLoader.getAt(this.position + diff );
		if ( imageInfo ) {
			var i = iviewLoader.getAt(this.position);
			if ( i.reblogging ) {
				var r = this.doc.getElementById('reblogging');
				r.style.display = 'none';
			}

			this.position += diff;

			this.show();
		}
	},
	constructTree: function (flatSiteinfo) {
		var siteinfo = {};

		for ( var k in flatSiteinfo ) {
			var pathes = k.split(/\./);
			var leaf = pathes.pop();
			var hash = pathes.reduce( function(stash, name) {
				return (stash[name] || (stash[name] = {}));
			}, siteinfo);
			hash[leaf] = flatSiteinfo[k];
		};
		return siteinfo;
	},

	pageShowing: -1,
	show: function () {
		if ( this.pageShowing == this.position )
			return;

		var imageInfo = iviewLoader.getAt(this.position);
		if ( !imageInfo ) {
			return;
		}

		this.doc.getElementById('imageno').innerHTML = (this.position + 1) + "/" + iviewLoader.images.length;
		this.showRebloggingBox(imageInfo);

		//this.removeAllChildren();
		var box = this.doc.getElementById('imagebox');
		box.style.display = 'block';

		// we need to assign null value once
		// to avoid that old image is shown until new image is loaded.
		var img = this.doc.getElementById('imageElement');
		img.setAttribute('src', null);

		window.setTimeout( function () {
			img.setAttribute('src', imageInfo.src());
		}, 20);

		var a = this.doc.getElementById('caption');
		a.setAttribute('href', imageInfo.permalink);
		a.innerHTML = imageInfo.caption;
	},
	removeAllChildren: function (e) {
		while ( e.firstChild ) {
			e.removeChild( e.firstChild);
		}
	},
	onImageSourceSelected: function (ev) {
/*
		this.glasscaseDiv.style.opacity = 1;
		this.glasscaseDiv.style.position = 'fixed';
		this.glasscaseDiv.style.top = 0;
		this.glasscaseDiv.style.bottom = 0;
*/

		this.doc.getElementById('footer').style.display = 'block';

		var key = (ev.command);
		var siteinfo = this.constructTree(this.siteinfo[key].data);

		this.doc.getElementById('sourcename').innerHTML = 
			<a href={siteinfo.url}>{this.siteinfo[key].name}</a>.toString();

		//this.removeAllChildren();
		//
		this.doc.getElementById('imagesources').style.display = 'none';

		iviewLoader.run(siteinfo, this);
	},
	launchPicLens : function() {
		var items = [];
		iviewLoader.images.forEach(function(photo){
		  var imegeUri = photo.src();
		  items.push('<item>' +
		      '<title>' + photo.caption + '</title>' +
		      '<link>' + photo.permalink + '</link>' + 
		      '<media:thumbnail url="' + imegeUri + '" />' +
		      '<media:content url="' + imegeUri + '" />' +
		    '</item>'
		  );
		});
      
		var file = getTempDir('photos.rss');
		putContents(file, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		  '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss"><channel>' +
		    items.join('') +
		   '</channel></rss>');
      
		this.doc.location = 'javascript:piclens = new PicLensContext();piclens.launch("' + createURI(file).asciiSpec + '", "", "")';
	},
	/*
	setStyle: function (doc) {
		var css = doc.createElement('style');
		css.innerHTML =
			'	a {' + 
			'		background-color: black !important;' +
			'		color: white !important;' +
			'		font-size: small !important;' +
			'	}' ;

		doc.body.appendChild(css);
	},
	*/
	showLoading: function (doc, show) {
		if (show) {
			var d = doc.createElement("div");

			d.style.position = "absolute";
			d.style.fontSize = "30px";
			d.style.background = "black";
			d.style.color = "white";
			d.style.MozBorderRadius = "0.2em";
			d.style.padding = "0.2em";
			d.style.opacity = 0.85;
			d.style.marginLeft = "auto";
			d.style.marginRight = "auto";
			d.style.margin =   "0px auto";
			d.style.right = d.style.top = "0.2em";
			d.style.textAlign = "center"
			d.innerHTML = "Loading Image Sources...";

			doc.body.appendChild(d);

			this.loadingDiv = d;
		} else {
			this.loadingDiv.parentNode.removeChild( this.loadingDiv );
			this.loadingDiv = null;
		}
	},
	glasscaseDiv: null,
	glasscase: function () {
		doc = this.doc;
		var outerbox = this.outerbox = doc.createElement("div");

		outerbox.style.position = "absolute";
		outerbox.style.left = 0;
		outerbox.style.top = 0;
		outerbox.style.right = 0;
		outerbox.style.height = 0;

		var d = this.innerbox = doc.createElement("div");

		d.style.left = 0;
		d.style.right = 0;

		//d.style.position = "absolute";
		d.style.fontSize = "30px";
		d.style.background = "black";
		d.style.color = "white";
		//d.style.MozBorderRadius = "0.2em";
		d.style.padding = "0.2em";
		d.style.opacity = 0.95;
		d.style.marginLeft = "auto";
		d.style.marginRight = "auto";
		d.style.margin =   "0px auto";
		//d.style.right = d.style.top = "0";
		d.style.zIndex = 0x7ffffff;

		outerbox.appendChild(d);
		doc.body.appendChild(outerbox);

		return this.glasscaseDiv = d;
	},

	onPageLoad: function () {
		this.show();
	},
	loadJson: function () {
		var self = this;
		//this.setStyle(this.doc);
		this.showLoading(this.doc, true);

		var d = request(this.iviewSiteinfoURL, requestopts).addCallback( function(res) {

			var nativeJSON = Components.classes["@mozilla.org/dom/json;1"]
								 .createInstance(Components.interfaces.nsIJSON);
			var json = self.siteinfo = nativeJSON.decode( res.responseText);

			self.showLoading(self.doc, false);
			//var glasscase = self.glasscase();
			
			//
			// MochiKit.keys not found in command script scope.
			//
			self.doc.getElementById('imagesources').style.display = 'block';
			var ul = self.doc.getElementById('imagesourcelist');

			var li = [];
			for ( var k in json ) {
				var definitions = json[k];

				// I dont know why but last one is a function not siteinfo.
				// need to check it.
				if ( ! definitions.data )
					continue;
				
				// not supported yet.
				//if ( definitions.data['subRequest.paragraph'] ) {
				//	continue;	
				//}

				//if ( definitions.data.paragraph.match(/x:/) ) {
				//	continue;
				//}

				var jscode = "javascript:void((function(){" +
					"c=document.createEvent('CommandEvent');" + 
					"c.initCommandEvent('onJSONPLoad',true,false," + k + ");" +
					"document.dispatchEvent(c);" +
				"})());";

				li.push( <li><a href={jscode}>{definitions.name}</a></li>.toString() );
			}
			ul.innerHTML = li.join("\n");

		} ).addErrback( function (e) {
			log(e);
		});
	}

};


var cmd = function() {
	try {
		var doc = (window.Application.activeWindow.activeTab.document);

var f = function () {
		var doc = w.document;
		var brokerTimer = requestBroker.init();
		w.addEventListener( 'unload', function () {
			window.clearInterval(brokerTimer);
		}, false);
		iview.init(doc);
		iview.loadJson();
};

if ( 1 ) {
		var w = window.open(datauri, "_iview4tombloo");

// wait some.
		var timerid = window.setInterval( function () {
			if ( w.document.title ) {
				window.clearInterval(timerid);
				f();
			}
		}, 100 );
} else {
	var w = doc.defaultView;
	f();
}

	}catch(e) {
		log(e);
	}
}

Tombloo.Service.actions.register(

shortcutkeys['CTRL + 8'] = {
	name : 'iview',
	description : 'run iview',
	execute : cmd
}

);


// $X
// based on: http://lowreal.net/blog/2007/11/17/1
//
// $X(exp);
// $X(exp, context);
// $X(exp, type);
// $X(exp, {context: context,
//          type: type,
//          namespace: {h:"http://www.w3.org/1999/xhtml"}});
function $X (exp, context) {
	var type, namespace={};
	// console.log(String(exp));
	
//FIXME
	exp = exp.replace(/\bx:/g, 'descendant-or-self::');
//

	if(typeof context == "function"){
		type = context;
		context = null;
	}else if(typeof context != "undefined" && !context['nodeType']){
		type = context['type'];
		namespace = context['namespace'] || context['ns'];
		context = context['context'];
	}

	if (!context) context = document;
	var exp = (context.ownerDocument || context).createExpression(exp, function (prefix) {
		return namespace[prefix] ||
		       document.createNSResolver((context.ownerDocument == null ? context : context.ownerDocument)
		               .documentElement).lookupNamespaceURI(prefix) ||
		       document.documentElement.namespaceURI;
	});

	switch (type) {
		case String:
			return exp.evaluate(
				context,
				XPathResult.STRING_TYPE,
				null
			).stringValue;
		case Number:
			return exp.evaluate(
				context,
				XPathResult.NUMBER_TYPE,
				null
			).numberValue;
		case Boolean:
			return exp.evaluate(
				context,
				XPathResult.BOOLEAN_TYPE,
				null
			).booleanValue;
		case Array:
			var result = exp.evaluate(
				context,
				XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
				null
			);
			var ret = [];
			for (var i = 0, len = result.snapshotLength; i < len; ret.push(result.snapshotItem(i++)));
			return ret;
		case undefined:
			var result = exp.evaluate(context, XPathResult.ANY_TYPE, null);
			switch (result.resultType) {
				case XPathResult.STRING_TYPE : return result.stringValue;
				case XPathResult.NUMBER_TYPE : return result.numberValue;
				case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
				case XPathResult.UNORDERED_NODE_ITERATOR_TYPE: {
					// not ensure the order.
					var ret = [];
					var i = null;
					while (i = result.iterateNext()) {
						ret.push(i);
					}
					return ret;
				}
			}
			return null;
		default:
			throw(TypeError("$X: specified type is not valid type."));
	}
}

function createDocumentFragmentByString(doc, str) {
    var range = doc.createRange()

	var body = (doc.documentElement);
    range.setStartAfter(body);
    return range.createContextualFragment(str)
}
function createHTMLDocumentByString(doc, str, charset) {
		if ( !charset ) {
			var  m = str.match( /<meta.+?>/i );
			if ( m ) {
				var meta = m[0];
				m = meta.match( /content=(?:'(.+?)'|"(.+?)"|(\S+))/i );
				var content = m[2] || m[3] || m[4];
				if ( m = content.match(/charset=(\S+)/i ) ) {
					var charset = m[1];
					//if ( !charset.match(/utf-8/i ) )
						str = str.convertToUnicode(m[1]);
				}
			}
		}

    var html = str.replace(/<!DOCTYPE.*?>/, '').replace(/<html.*?>/, '').replace(/<\/html>.*/, '')

    var htmlDoc  = doc.implementation.createDocument(null, 'html', null)
    var fragment = createDocumentFragmentByString(doc, html)
    try {
        fragment = htmlDoc.adoptNode(fragment)
    } catch(e) {
        fragment = htmlDoc.importNode(fragment, true)
    }
    htmlDoc.documentElement.appendChild(fragment)
   return htmlDoc
}

function abs(base, rel) {
	var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	var nsiuri = ioService.newURI(base, null, null);
	return nsiuri.resolve(rel);
}


function valueOfNode (node) {
		var doc = node.ownerDocument;
		{
			if ( node.nodeType == node.ELEMENT_NODE ) {
				if ( node.tagName.match( /^(a|link)$/i ) ) {
					var u = node.getAttribute('href');
					return u;
				} else if ( node.tagName.match( /img/i ) ) {
					var u = node.getAttribute('src');
					return u;
				} else {
					return node.textContent.replace(/(^\s*)|(\s*$)/g, '');
				}
			} else if ( node.nodeType == node.ATTRIBUTE_NODE ) {
				var u = node.nodeValue;
				return u;
			} else if (node.nodeType == node.TEXT_NODE ) {
				return node.nodeValue;
			}
		}
}

/*
*/
 
