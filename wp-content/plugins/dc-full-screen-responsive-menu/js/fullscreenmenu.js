/*Full screen mobile menu By Dynamic Drive
* Created: Dec 14th', 2014 by DynamicDrive.com. This notice must stay intact for usage 
* Author: Dynamic Drive at http://www.dynamicdrive.com/
* Visit http://www.dynamicdrive.com/ for full source code
* Updated: Jan 30th, 2015 for links not activating in mobile browsers when menu is dragged
*/

(function(w, $){

	var defaults = {
		animatediconclass: 'animateddrawer' // class of designated main toggle menu icon on the page (will receive ".open" class while menu is open
	}

	w.fullscreenmenu = function(options){	
		var s = $.extend({}, defaults, options)
		
		var $body = $(document.body)
		var $menu = null
		var $navcontent = null
		var $toggler = null
		var state = 'closed'
		var mousemoveevtstr = 'mousemove.dragstart' + s.menuid + ' touchmove.dragstart' + s.menuid
		var mouseupevtstr= 'mouseup.dragend' + s.menuid + ' touchend.dragend' + s.menuid
		var dragdist

		if (s.source.charAt(0) == '#'){ // inline menu (id)?
			init( $(s.source) )
		}
		else{ // ajax content
			loadfile(s.source, init)
		}

		function loadfile(url, callback){
			$.ajax({
				url: url,
				dataType: 'html',
				error:function(ajaxrequest){
					alert('Error fetching content.<br />Server Response: '+ajaxrequest.responseText + '\n\n'
									+ 'In Chrome and IE, page has to be run online in order for Ajax file to be fetched properly'
							)
				},
				success:function(content){
					var $content = $(content)
					$content.prependTo(document.body)
					callback( $content )
				}
			})
		}

		this.togglemenu = function(action){
			
			if ($navcontent === null)
				return
			if (action == 'open' || (typeof action == 'undefined' && state == 'closed')){
				/*$body.css({overflow: 'hidden'})*/
				$navcontent.css({top:0})
				$menu.addClass('open')
				$toggler.addClass('open')
				state = 'open'
			}
			else if (action == 'close' || (typeof action == 'undefined' && state == 'open')){
				$body.css({overflow: 'auto'})
				$menu.removeClass('open')
				$toggler.removeClass('open')
				state = 'closed'
			}
		}

		function init(menuref){
			$menu = (typeof menuref == 'string')? $('#' + s.menuref) : menuref
			$menu.prependTo(document.body)
			$navcontent = $menu.find('.navcontent:eq(0)').css({top:0})
			$toggler = $('.' + s.animatediconclass)

	  	$menu.on('mousedown touchstart', function(e){ // set up swipe/ mouse drag behavior
				var menuheight = $menu.height()
				var navcontentheight = $navcontent.get(0).scrollHeight
				var heightdiff = navcontentheight - menuheight
				if (heightdiff <= 0) // if nav content height <= parent manu's height, no need to enable vertical dragging
					return
	  		var e = (e.type.indexOf('touch') != -1)? e.originalEvent.changedTouches[0] : e
				var mousey = e.pageY
				var contenttop = parseInt( $navcontent.css('top') )
				var clicktime = new Date().getTime()
				dragdist = 0
	  		$menu.on(mousemoveevtstr, function(e){
					var fingerstouched = e.originalEvent.changedTouches? e.originalEvent.changedTouches.length : 0
	  			var e = (e.type.indexOf('touch') != '-1')? e.originalEvent.changedTouches[0] : e
	  			dragdist=e.pageY-mousey //distance moved vertically
					var newtopvalue = contenttop + dragdist
					newtopvalue = (newtopvalue > 0)? 0 : (newtopvalue < -heightdiff)? -heightdiff : newtopvalue // set upper and lower boundaries for new top value
					$navcontent.css({top: newtopvalue})
					if (e.type == "mousemove" && fingerstouched <=1)
	  				return false //cancel default drag action
	  		})
		  	$menu.on('mouseup touchend', function(e){
		  		$menu.unbind(mousemoveevtstr)
					if (e.type == "mouseup")
						return false
		  	})
				if (e.type == "mousedown")
	  			return false //cancel default drag action
	  	})
	
			$menu.on('click', function(e){
				if (Math.abs(dragdist) > 0 && e.target.tagName == 'A') // cancel click on link if dragdist is greater than 0
					return false
			})

		}
	}
	menu1 = new fullscreenmenu({   source: '#dc-menu' });
}) (window, jQuery)
