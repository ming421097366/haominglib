(function() {
	if (!window.library) {
		window['library'] = {};
	}


	var node = { //Node 类中nodeType值在IE中无法使用宏，所以在此提供兼容版本
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10
	};
	window['library']['node'] = node;



	function $() {
		var elements = [];
		var i = 0;
		var len = arguments.length;
		var ele = null;
		for (i = 0; i < len; i++) {
			ele = arguments[i];
			if (typeof ele === 'string') {
				ele = document.getElementById(ele);
			}
			if (len === 1) {
				return ele;
			}
			elements.push(ele);
		}
		return elements;
	}
	window['library']['$'] = $;

	function addEvent(obj, type, fn) {
		if (obj.addEventListener) {
			obj.addEventListener(type, fn, false);
		} else {
			var iden = 'e' + type + fn;
			obj[iden] = fn;
			obj.attachEvent('on' + type, function() {
				obj[iden](window.event);
			});
			// 这中做法解决了IE浏览器中，事件监听器函数内部this值的引用问题
		}
	}
	window['library']['addEvent'] = addEvent;

	// 
	// 这个函数类似与jquery的$(document).ready(),可以添加DOM树载入完成的事件监听器
	// 
	function addLoadEvent(fn) {
		var init = function() {
			if (arguments.callee.done) {
				return;
			}
			arguments.callee.done = true;
			fn.call(document, arguments);
		};

		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', init, false); //兼容IE9 和其它现代浏览器
		}
		(function() {
			try {
				document.documentElement.doScroll('left');
			} catch (e) {
				setTimeout(arguments.callee, 50);
				return;
			}
			init();
		})(); //兼容IE8及以下		
	}
	window['library']['addLoadEvent'] = addLoadEvent;

	//获得事件对象
	function getEventObject(W3CEvent) {
		return W3CEvent || window.event;
	}
	window['library']['getEventObject'] = getEventObject;

	//获得事件的目标对象
	function getTarget(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		return W3CEvent.target || W3CEvent.srcElement;
	}
	window['library']['getTarget'] = getTarget;

	function getMouseButton(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var button = {
			'left': false,
			'middle': false,
			'right': false
		};
		if (W3CEvent.toString && W3CEvent.toString().indexOf('MouseEvent') !== -1) {
			switch (W3CEvent.button) {
				case 0:
					button.left = true;
					break;
				case 1:
					button.middle = true;
					break;
				case 2:
					button.right = true;
					break;
				default:
					break;
			}
		} else if (W3CEvent.button >= 0) {
			switch (W3CEvent.button) {
				case 0:
					button.left = true;
					break; //---------------测试中发现，无论按那个键都显示为0
				case 1:
					button.left = true;
					break;
				case 2:
					button.right = true;
					break;
				case 3:
					button.left = true;
					button.right = true;
					break;
				case 4:
					button.middle = true;
					break;
				case 5:
					button.left = true;
					button.middle = true;
					break;
				case 6:
					button.middle = true;
					button.right = true;
					break;
				case 7:
					button.left = true;
					button.right = true;
					button.middle = true;
					break;
				default:
					break;


			}
		} else {
			return false;
		}
		return button;
	}
	window['library']['getMouseButton'] = getMouseButton;

	function getPointerPositionInDocument(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var x = 0;
		var y = 0;
		x = W3CEvent.pageX || (W3CEvent.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
		y = W3CEvent.pageY || (W3CEvent.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
		return {
			x: x,
			y: y
		};
	}
	window['library']['getPointerPositionInDocument'] = getPointerPositionInDocument;

	function getKeyPressed(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var code = W3CEvent.keyCode;
		var value = String.fromCharCode(code);
		return {
			code: code,
			value: value
		}
	}
	window['library']['getKeyPressed'] = getKeyPressed;

	function camelize(s) {
		var reg = /-(\w)/g;
		return s.replace(reg, function(strMatch, p1) {
			return p1.toUpperCase();
		});
	} //将一个中划线连接的字符串换成驼峰形式
	window['library']['camelize'] = camelize;

	function uncamelize(s) {
		var reg = /([A-Z])/g;
		return s.replace(reg, function(strMatch, p1) {
			return '-' + p1.toLowerCase();
		});
	} //将驼峰形式的字符串转化为中划线连接的字符串	
	window['library']['uncamelize'] = uncamelize;


	function walkTheDOMRecursive(func, node, depth, returnedFromParent) { //对dom树进行深度递归遍历
		var root = node || document;
		returnedFromParent = func.call(root, depth, returnedFromParent);
		depth++;
		node = root.firstChild;
		while (node) {
			walkTheDOMRecursive(func, node, depth, returnedFromParent);
			node = node.nextSibling;
		}
	}
	window['library']['walkTheDOMRecursive'] = walkTheDOMRecursive;

	/*
		在节点前面插入节点
	 */
	function insertAfter(node, referenceNode) {
		if (!(node = $(node))) {
			return false;
		}
		if (!(referenceNode = $(referenceNode))) {
			return false;
		}
		return referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
	}
	window['library']['insertAfter'] = insertAfter;

	/*
		删除一个节点的所有小孩
	 */
	function removeChildren(parent) {
		if (!(parent = $(parent))) {
			return false;
		}
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
		return parent;
	}
	window['library']['removeChildren'] = removeChildren;

	/*
		在父节点最前面插入节点
	 */
	function prependChild(parent, newChild) {
		if (!(parent = $(parent))) {
			return false;
		}
		if (!(newChild = $(newChild))) {
			return false;
		}
		if (parent.firstChild) {
			parent.insertBefore(newChild, parent.firstChild);
		} else {
			parent.appendChild(newChild);
		}
		return parent;
	}
	window['library']['prependChild'] = prependChild;


	/*
		利用对象字面量设置HTMLElement对象的style特征
	 */
	function setStyleById(element, style) {
		if (!(element = $(element))) {
			return false;
		}
		for (var pro in style) {
			if (!style.hasOwnProperty(pro)) {
				continue;
			}
			if (element.style.setProperty) {
				element.style.setProperty(uncamelize(pro), style[pro], null); //标准方法
			} else {
				element.style[camelize(pro)] = style[pro]; //兼容IE方法,标准也支持这种方法
			}
		}
		return true;
	}
	window['library']['setStyleById'] = setStyleById;

	/*
		根据类名设置样式
	 */
	function setStylesByClassName(parent, tag, className, style) {
		if (!(parent = $(parent))) {
			return false;
		}
		var elements = parent.getElementsByClassName("rec"); //这个函数不兼容ie6,7,8
		elements = Array.prototype.filter.call(elements, function(element) {
			return element.nodeName === tag.toUpperCase();
		});
		elements.forEach(function(ele) {
			setStyleById(ele, style);
		});
	}
	window['library']['setStylesByClassName'] = setStylesByClassName;

	/*
		根据标签名设置样式
	 */
	function setStylesByTagName(tag, parent, style) {
		if (!(parent = $(parent))) {
			return false;
		}
		var elements = parent.getElementsByTagName(tag);
		Array.prototype.forEach.call(elements, function(ele) {
			setStyleById(ele, style);
		});
	}
	window['library']['setStylesByTagName'] = setStylesByTagName;

	/*
		取得包含元素类名的数组
	 */
	function getClassNames(element) {
		if (!(element = $(element))) {
			return false;
		}
		return element.className.split(/\s+/);
	}
	window['library']['getClassNames'] = getClassNames;

	/*
		检查元素是否包含某个类
	 */
	function hasClassName(element, className) {
		if (!(element = $(element))) {
			return false;
		}
		var classes = getClassNames(element);
		var i = 0;

		for (i = 0; i < classes.length; i++) {
			if (classes[i] === className) {
				return true;
			}
		}
		return false;
	}
	window['library']['hasClassName'] = hasClassName;

	/*
		为元素添加类
	 */
	function addClassName(element, className) {
		if (!(element = $(element))) {
			return false;
		}
		element.className += (element.className ? ' ' : '') + className;
		return true;
	}
	window['library']['addClassName'] = addClassName;

	/*
		从元素中删除类
	 */
	function removeClassName(element, className) {
		if (!(element = $(element))) {
			return false;
		}
		var classes = getClassNames(element);
		var i = classes.length - 1;
		for (i; i >= 0; i--) {
			if (classes[i] === className) {
				delete classes[i];
			}
		}
		element.className = classes.join(' ');
		return (length === classes.length);
	}
	window['library']['removeClassName'] = removeClassName;


	/*
		往文档中添加样式表
	 */
	function addStyleSheet(url, media) {
		media = media || 'screen';
		var link = document.createElement('LINK');
		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('type', 'text/css');
		link.setAttribute('href', url);
		link.setAttribute('media', media);
		document.getElementsByTagName('head')[0].appendChild(link);
	}
	window['library']['addStyleSheet'] = addStyleSheet;
	/*
		查找指定的样式表
	 */
	function getStyleSheets(url, media) {
		var sheets = [];
		var i = 0;
		var len = document.styleSheets.length; //document.styleSheets并不是标准，但是浏览器实现了它
		for (i = 0; i < len; i++) {
			if (url && document.styleSheets[i].href.indexOf(url) === -1) {
				continue;
			}
			if (media) {
				media = media.replace(/,\s*/g, ',');
				var sheetMedia;
				if (document.styleSheets[i].media.mediaText) { //标准中media是一个类数组对象
					sheetMedia = document.styleSheets[i].media.mediaText.replace(/,\s*/g, ',');
				} else { //ie 6,7,8中 media直接就是一个字符串
					sheetMedia = document.styleSheets[i].media.replace(/,\s*/g, ',');
				}
				if (sheetMedia !== media) {
					continue;
				}
			}
			sheets.push(document.styleSheets[i]);
		}
		return sheets;
	}
	window['library']['getStyleSheets'] = getStyleSheets;
	/*
		删除样式表
	 */
	function removeStyle(url, media) {
		var styles = getStyleSheets(url, media);
		var i, a;
		for (i = 0; a = styles[i]; i++) {
			var node = a.ownerNode || a.owningElement; //得到包含样式表的节点，link或style,ownerNode是标准，owningElement是IE<=8的兼容
			a.disabled = true;
			node.parentNode.removeChild(node);
		}
	}
	window['library']['removeStyle'] = removeStyle;
	/*
		编辑一条规则
	 */
	function editCSSRule(selector, styles, url, media) {
		var styleSheets = (typeof url === 'array' ? url : getStyleSheets(url, media));
		var i = 0;
		var sheet = null;
		for (i = 0; sheet = styleSheets[i]; i++) {
			var rules = sheet.cssRules || sheet.rules; //cssRules是标准，rules是IE<=8兼容
			if (!rules) {
				continue;
			}
			selector = selector.toUpperCase(); //ie的选择器默认大写，所以统一使用大写
			var j = 0;
			var rule = null;
			for (j = 0; rule = rules[j]; j++) {
				if (rule.selectorText.toUpperCase() === selector) {
					for (var pro in styles) {
						if (!styles.hasOwnProperty(pro)) {
							continue;
						}
						rule.style[camelize(pro)] = styles[pro]; //style用属性的方式而不用setProperty
					}
				}
			}
		}
	}
	window['library']['editCSSRule'] = editCSSRule;

	/*
		添加一条CSS规则
	 */
	function addCSSRule(selector, styles, index, url, media) {
		var declaration = '';
		for (var pro in styles) {
			if (!styles.hasOwnProperty(pro)) {
				continue;
			}
			declaration += pro + ':' + styles[pro] + '; ';
		}
		var styleSheets = (typeof url === 'array' ? url : getStyleSheets(url, media));
		var i = 0;
		var sheet = null;
		var newIndex = 0;
		for (i = 0; sheet = styleSheets[i]; i++) {
			if (sheet.insertRule) { //标准
				newIndex = (index >= 0 ? index : rule.cssRules.length);
				sheet.insertRule(selector + '{' + declaration + '}', newIndex);
			} else if (sheet.addRule) { //IE<=8
				newIndex = (index >= 0 ? index : -1);
				sheet.addRule(selector + '{' + declaration + '}', newIndex);
			}
		}
	}
	window['library']['addCSSRule'] = addCSSRule;



	/*
		得到计算后的style
	 */
	function getStyle(element, property) {
		if (!(element = $(element)) || !property) {
			return false;
		}
		var value = element.style[property];
		if (!value) {
			if (document.defaultView && document.defaultView.getComputedStyle) {
				var css = document.defaultView.getComputedStyle(element);
				value = css ? css.getPropertyValue(property) : false;
			} else if (element.currentStyle) {
				value = element.currentStyle[camelize(property)];
			}
		}
		return value === 'auto' ? '' : value;
	}
	window['library']['getStyle'] = getStyle;


	/*
		属性渐变效果实现
	 */

	function transitionStyle(from, to, duration, framesPerSecond, callback) {

		var totalFrames = framesPerSecond * duration; //计算总的帧数
		var step = function(curStyle, frame) {
			var time = (frame / totalFrames) * duration * 1000;
			setTimeout(function() {
				callback(curStyle);
			}, time);
		}; //设置每一帧的动作

		var frame = 1;
		from = parseInt(from);
		to = parseInt(to);
		var stepLen = (to - from) / totalFrames;
		while (frame < totalFrames) {
			var curStyle = Math.ceil(from + stepLen * frame);
			step(curStyle, frame);
			frame++;
		} //设置中间帧
		step(from, 0); //设置第一帧
		step(to, totalFrames); //设置最后一帧
	}
	window['library']['transitionStyle'] = transitionStyle;

	/*
		ajax 封装
	 */
	function getRequestObject(url, options) {
		var req = false;
		if ('XMLHttpRequest' in window) {
			var req = new XMLHttpRequest();
		} else if ('ActiveXObject' in window) {
			var req = new ActiveXObject('Microsoft.XMLHTTP');
		}
		if (!req) {
			return false;
		}
		options = options || {};
		options.method = options.method || 'GET';
		options.send = options.send || null;

		req.onreadystatechange = function() {
			switch (req.readyState) {
				case 1:
					if (options.loadListener) {
						options.loadListener.apply(req, arguments);
					}
					break;
				case 2:
					if (options.loadedListener) {
						options.loadedListener.apply(req, arguments);
					}
					break;
				case 3:
					if (options.interactiveListener) {
						options.interactiveListener.apply(req, arguments);
					}
					break;
				case 4:
					try {
						if (req.status && req.status === 200) {
							var contentType = req.getResponseHeader('Content-Type');
							var mime = contentType.match(/\s*([^;]+)\s*(;|$)/i)[1];
							switch (mime) {
								case 'text/javascript':
								case 'application/javascript':
									if (options.jsResponseListener) {
										options.jsResponseListener.call(req, req.responseText);
									}
									break;
								case 'application/json':
									if (options.jsonResponseListener) {
										try {
											var json = JSON.parse(req.responseText);
										} catch (e) {
											var json = false;
										}
										options.jsonResponseListener.call(req, json);
									}
									break;
								case 'text/xml':
								case 'application/xml':
								case 'application/xhtml+xml':
									if (options.xmlResponseListener) {
										options.xmlResponseListener.call(req, req.responseXML);
									}
									break;
								case 'text/html':
									if (options.htmlResponseListener) {
										options.htmlResponseListener.call(req, req.responseText);
									}
									break;
							}
							if (options.completeListener) {
								options.completeListener.apply(req, arguments);
							}
						} else {
							if (options.errorListener) {
								options.errorListener.apply(req, arguments); //响应完成请求不成功错误
							}
						}

					} catch (e) {

					}
					break;
			}
		};
		req.open(options.method, url, true);
		req.setRequestHeader('Ajax-Request', 'true');
		return req;
	}
	/*
		options = {
			method : 'GET',
			send : null,//POST 参数
			loadListener: null,//载入数据
			loadedListener: null,//载入完成
			interactiveListener: null,//处理数据
			jsResponseListener: null,//
			jsonResponseListener: null,//处理完成,处理Content-Type : application/json
			xmlResponseListener: null,
			htmlResponseListener: null,
			completeListener: null,
			errorListener: null
		}



	 */
	function ajax(url, options) {
		var req = getRequestObject(url, options);
		return req.send(options.send);
	}

	window['library']['ajax'] = ajax;

	/*
		xss http request	
	 */
	var XssHttpRequestCount = 0;

	var XssHttpRequest = function() {
		this.requestID = 'XSS_HTTP_REQUEST_' + (++XssHttpRequestCount);
		this.url = null;
		this.scriptObject = null;
		this.status = 0;
		this.readyState = 0;
		this.timeOut = 0;
	};

	XssHttpRequest.callbackKey = 'XSS_HTTP_REQUEST_CALLBACK';


	XssHttpRequest.prototype = {
		setReadyState: function(newReadyState) {
			if (this.readyState < newReadyState || newReadyState === 0) {
				this.readyState = newReadyState;
				this.onreadystatechange();
			}
		},

		open: function(url, timeOut) {
			this.timeOut = timeOut || 30000;
			this.url = url + (url.indexOf('?') !== -1 ? '&' : '?') + XssHttpRequest.callbackKey + '=' + this.requestID + '_CALLBACK';
			this.setReadyState(0);
		},

		send: function() {
			var requestObject = this;

			this.scriptObject = document.createElement('SCRIPT');
			this.scriptObject.setAttribute('id', this.requestID);
			this.scriptObject.setAttribute('type', 'text/javascript');

			//超时回调函数
			var timeOutWatcher = setTimeout(function() {
				window[requestObject.requestID + '_CALLBACK'] = function() {};
				requestObject.scriptObject.parentNode.removeChild(requestObject.scriptObject);

				requestObject.status = 2;
				requestObject.statusText = 'Timeout after' + requestObject.timeOut + 'milliseconds';

				requestObject.setReadyState(2);
				requestObject.setReadyState(3);
				requestObject.setReadyState(4);

			}, this.timeOut);

			//成功回调函数
			window[this.requestID + '_CALLBACK'] = function(json) {
				clearTimeout(timeOutWatcher);

				requestObject.setReadyState(2); //传送数据完成
				requestObject.setReadyState(3);
				requestObject.responseJSON = json;
				requestObject.status = 1;
				requestObject.statusText = 'loaded';

				requestObject.setReadyState(4);
			}
			this.setReadyState(1);
			this.scriptObject.setAttribute('src', this.url);
			document.getElementsByTagName('head')[0].appendChild(this.scriptObject);
		}
	};

	function getXssRequestObject(url, options) {
		var req = new XssHttpRequest();
		options = options || {};
		options.timeOut = options.timeOut || 30000;
		req.onreadystatechange = function() {
			switch (req.readyState) {
				case 1:
					if (options.loadListener) {
						options.loadListener.apply(req, arguments);
					}
					break;
				case 2:
					if (options.loadedListener) {
						options.loadedListener.apply(req, arguments);
					}
					break;
				case 3:
					if (options.interactiveListener) {
						options.interactiveListener.apply(req, arguments);
					}
					break;
				case 4:
					if (req.status === 1) {
						if (options.completeListener) {
							options.completeListener.apply(req, arguments);
						} else if (options.errorListener) {
							options.errorListener.apply(req, arguments);
						}
					}
					break;
			};

		}
		req.open(url, options.timeOut);
		return req;
	}


	function xssRequest(url, options) {
		var req = getXssRequestObject(url, options);
		return req.send();
	}
	window['library']['xssRequest'] = xssRequest;



	/*
		深度复制对象
	 */
	function clone(myObj) {
		if(typeof myObj !== 'object') {
			return myObj;//不处理函数对象
		}
		if(myObj === null) {
			return myObj;//处理null, 因为 typeof null === 'object'
		}
		var myNewObj = {};
		for(var key in myObj) {
			myNewObj[key] = clone(myObj[key]);
		}
		return myNewObj;

	}

	/*
		排队异步请求
	 */
	 var requestQueue = [];//请求队列

	function ajaxQueue(url, options, queue) {
		queue = queue || 'default';

		options = clone(options) || {};//确保options唯一，避免重写的compleListener覆盖了旧的compleListener的值，导致递归调用
		if (!requestQueue[queue]) {
			requestQueue[queue] = [];
		}

		var oldCompleListener = options.completeListener;
		options.completeListener = function() {
			if(oldCompleListener) {
				oldCompleListener.apply(this, arguments);
			}
			requestQueue[queue].shift();
			if(requestQueue[queue][0]) {
				requestQueue[queue][0].req.send(requestQueue[queue][0].send);
			}
		};

		var oldErrorListener = options.errorListener;
		options.errorListener = function() {
			if(oldErrorListener) {
				oldErrorListener.apply(this, arguments);
			}
			requestQueue[queue].shift();
			if(requestQueue[queue].length) {
				var q = requestQueue[queue].shift();
				q.req.abort();
				var fakeRequest = {};
				fakeRequest.status = 0;
				fakeRequest.statusText = 'a request in the queue received an error';
				fakeRequest.readyState = 4;
				fakeRequest.responseText = null;
				fakeRequest.responseXML = null;
				q.error.apply(fakeRequest);
			}
		};

		requestQueue[queue].push({
			req: getRequestObject(url,options),
			send: options.send,
			error: options.errorListener
		});

		if(requestQueue[queue].length === 1) {
			ajax(url,options);
		}

	}
	window['libaray']['ajaxQueue'] = ajaxQueue;

	/*
		路由
	 */
		var $ = library;
		function ActionPager(options) {
			options = options || {};
			this.lastHash = '';
			this.callbacks = [];
			this.ajaxifyClassName = options.ajaxifyClassName || '';			
			this.init();
		}

		ActionPager.prototype = {
			constructor: ActionPager,

			init: function() {
				this.ajaxifyLinks();
				window.setInterval(this.watchLocationForChange.bind(this), 200);
			},

			ajaxifyLinks: function() {
				var me = this;
				var links = document.getElementsByClassName(this.ajaxifyClassName);
				var i = 0;
				var len = links.length;
				for (i = 0; i < len; i++) {
					if(hasClassName(links[i],'ActionPagerModified')) {
						continue;
					}
					links[i].setAttribute('href', this.convertURLToHash(links[i].getAttribute('href')));
					addClassName(links[i],'ActionPagerModified');

					addEvent(links[i],'click',function(){
						//将前一个地址加入history,将地址栏的地址改为当前地址
						if(this.href && this.href.indexOf('#') > -1){
							me.addHash(me.getDataFromHash(this.href));
						}
						
					});
				}
			},



			convertURLToHash: function(url) {
				if(!url) {
					return '#';
				} else {
					return '#' + url;
				}
			},

			getDataFromHash: function(url) {
				if(!url || url.indexOf('#') === -1) {
					return '';
				}
				return url.split('#')[1];//返回hash内的内容
			},

			addHash: function(hash) {
				if(!hash) {
					return false;
				}
				if(this.getDataFromHash(window.location.hash) !== hash) {
					window.location.assign(window.location.origin + window.location.pathname + '#' + hash);
					return true;
				}
			},

			watchLocationForChange: function() {
				// console.log('watch');
				var newHash = this.getDataFromHash(location.hash);
				// console.log(newHash);
				if(newHash && newHash != this.lastHash) {
					try {
						this.executeListener(newHash);//新的hash值
						this.ajaxifyLinks();
					} catch(e) {
						console.log(e);
					}
					this.lastHash = newHash;
				}
			},

			executeListener: function(hash) {
				for(var i in this.callbacks) {				
					var res = hash.match(this.callbacks[i].regex);
					// console.log(this.callbacks[i].regex);
					if(res) {
						this.callbacks[i].callback(res);
					}
				}
			},

			register: function(regex, method, context) {
				var obj = {
					'regex' : regex
				};
				if(context) {
					obj.callback = method.bind(context);
				} else {
					obj.callback = method.bind(window);
				}
				this.callbacks.push(obj);
			}

		};
		window['library']['ActionPager'] = ActionPager;

		







})();

if (!String.prototype.repeat) {
	String.prototype.repeat = function(l) {
		return new Array(l + 1).join(this); //重复字符生成字符串
	}
}
if (!String.prototype.trim) {
	String.prototype.trim = function() {
		var reg = /^\s+|\s*$/g; //清除字符串开头和结尾的空格
		return this.replace(reg, '');
	}
}