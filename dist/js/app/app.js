/*!
 * @name			app.js
 *
 * @client			CLIENT NAME
 * @description	Main frontend application w/ UI features for responsive websites
 * @libs			   jquery, gsap, bootstrap
 * @copyright 		(c) 2016 Ansgar Hiller (www.weigelstein.de)
*/
// vars viewport
var w, h, viewportSize,

// breakpoints (BP) should match $breakpoints defined for CSS-Framework
/* twbs default */
BP = {
	xs: 0,
	sm: 544,
	md: 768,
	lg: 992,
	xl: 1200
},

/* foundation default */
/*
BP = {
	xs: 0,
	sm: 640,
	md: 1024,
	lg: 1200,
	xl: 1440
},
*/

// should match $grid-float-breakpoint defined for CSS-Framework
GRID_FLOAT_BREAKPOINT = BP.sm,

// namespace
APP = APP || {};

if (typeof Modernizr === 'object')
{
	Modernizr.addTest('ios', function () {
		'use strict';
		return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
	});
   var iOS 		    = (Modernizr.ios),
   	 svg 		    = (Modernizr.svg),
   	 isIphone  	 = (/iphone/gi).test(navigator.appVersion),
   	 isIpad 	 	 = (/ipad/gi).test(navigator.appVersion),
       isIOS        = (iOS !== null),
   	 isAndroid 	 = (/android/gi).test(navigator.appVersion);
}

// set on runtime
var pointer 	 			   = false, // 'touch', 'mouse' or 'pointer'
    isFrontpage 			   = false,
    smallScreenBehavior 	= false,
    scrollTop 				   = 0,
    lastScrollTop 			= 0;

jQuery(document).ready(function ($) {
   'use strict';

   // Check if Foundation-Framework is loaded (no!)
   if (typeof $().foundation === 'function'){
      $(document).foundation();
   }

   var BODY     = $('body'),
		 HTML 	 = $('html'),
		 PAGE	    = $('#page'),
		 HEADER   = $('#header'),
		 MAIN 	 = $('#main'),
		 FOOTER   = $('#footer');

   if (window.isMobile) $('body').addClass('mobile');
   if (isIphone)  $('body').addClass('iPhone');
   if (isIpad)    $('body').addClass('iPad');
   if (isIOS)     $('body').addClass('iOS');
   if (isAndroid) $('body').addClass('android');

   if (typeof PointerManager === 'object') {
		PointerManager.init();
		$(window).on('mouse-detected touch-detected', function() {
			pointer = PointerManager.getPointer();
			BODY.addClass(pointer);
			console.log(pointer);
		});
	}

   APP = {

      ready: false,

      /**
		 * Determines if small screen behavior should be used.
		 */
      useSmallScreenBehavior: function() {
			return Modernizr.mq("screen and (max-width:" + (GRID_FLOAT_BREAKPOINT - 1) + "px)");
		},

      /**
       * Caches element sizes for reuse
      */
      cacheSizes: function(){
			w = Waypoint.viewportWidth();
			h = Waypoint.viewportHeight();
			scrollTop = $(window).scrollTop();
      },

      /**
       * to determine a scrollanimations @duration for an element with height @_h
      */
      getWindowHeight: function(_h) {
			this.cacheSizes();
         if (_h){
             return h + _h;
         } else {
             return h;
         }
      },

      init: function() {

         $(window).on('images-loaded',function(){
				if ( !APP.ready )
				{
					APP.start();
				}
			});

         this.cacheSizes();
         enquire.register('(min-width: ' + ( BP.xl ) + 'px)', {
            match: function () { viewportSize = 'xl'; $(window).trigger('breakpointchange'); }
         });
			enquire.register('(min-width: ' + ( BP.lg ) + 'px) and (max-width: ' + ( BP.xl - 1) + 'px)', {
            match: function () { viewportSize = 'lg'; $(window).trigger('breakpointchange'); }
         });
			enquire.register('(min-width: ' + ( BP.md ) + 'px) and (max-width: ' + ( BP.lg - 1) + 'px)', {
            match: function () { viewportSize = 'md'; $(window).trigger('breakpointchange'); }
         });
			enquire.register('(min-width: ' + ( BP.sm ) + 'px) and (max-width: ' + ( BP.md - 1) + 'px)', {
            match: function () { viewportSize = 'sm'; $(window).trigger('breakpointchange'); }
         });
			enquire.register('(max-width: ' + ( BP.sm - 1) + 'px)', {
            match: function () { viewportSize = 'xs'; $(window).trigger('breakpointchange'); }
         });

         $(window).on('scroll-start', function()
			{
				BODY.addClass('scrolling');
				lastScrollTop = scrollTop;
            // do something ...
			});

			$(window).on('scroll-end', function()
			{
				BODY.removeClass('scrolling');
				scrollTop = $(window).scrollTop();
            // do something ...
			});

			$(window).on('resize', function()
			{
				APP.cacheSizes();
            // do something ...
				MAIN.css({minHeight: (h - MAIN.position().top - FOOTER.outerHeight()) + 'px' });

			}).trigger('resize');

			$(window).on('orientationchange', function()
         {
				APP.cacheSizes();
            // do something ...
         }).trigger('orientationchange');


			$(window).on('breakpointchange',function()
			{
				console.log(viewportSize);
				BODY.removeClass('xs sm md lg xl').addClass(viewportSize);

            APP.Images.swapImagesByBreakpoint( $('img') );
            // do something ...
			}).trigger('breakpointchange');

         // console.log(typeof $().chosen);

         /* JQUERY.CHOSEN */
         if ($(".chosenize").length)
         {
            // console.log('OK: chosen.jquery.js');
            if (typeof $().chosen === 'function') {

               $(".chosenize").chosen({
                  width: '100%',
						allow_single_deselect: true,
                  inherit_select_classes: true,
                  disable_search_threshold: 10
               })
					.on('change',
                  function(e) {
                     console.log($(this).val());
                  }
               );

               // Autsubmit form on change
   			   $('.chosenize.auto-submit').on('change',
                  function() {
                     $(this)
                        .closest('form')
   						   .submit();
                  }
               );
            } else {
               console.log('REQUIRED: chosen.jquery.js & chosen.min.css');
            }
         }

			/* DROPDOWNS TO REFINE JQUERY.CHOSEN-BASED SEARCH- & FILTER-TOOLS */
			$('.js-select-optgroup')
				.each(function(i,el) {
					var _that = $(el),
						 _val;
					_that
						.find('.dropdown-item')
						.on('click', function(e) {

								var _this 	= $(e.target),
									 _target = _that.data('target'),
									 _val 	= _this.data('value');

								_that.trigger('change',[
									{
										target: _target,
											val: _val,
										  item: _this
									}
								]);
							});
				});

			$('.js-select-optgroup')
				.on('change', function(e,data) {
					var _this = $(e.target),
						 _toggler = _this.find('.dropdown-toggle'),
						 _item = data.item,
						 _icon = _item.find('.icn').clone(),
						 _target = $(data.target),
						 _target_czn = $(data.target + '_chosen');

					_this.find('.dropdown-item.active').removeClass('active');
					_item.addClass('active');
					if (_item.hasClass('js-reset')) {
						console.log('reset');
					} else {
						console.log(data.val);
						/*
						_target.on('chosen:showing_dropdown', function(evt, params) {
							console.log(params);
							_target.off('chosen:showing_dropdown');
  						}).trigger('chosen:open');
						*/

					}

				});

			if ($(".js-checkbox-indeterminated").length)
         {
				$(".js-checkbox-indeterminated").prop('indeterminate', true);
			}

         // INIT HOOK
         $(window).trigger('APP-INIT',[APP]);

         APP.Images.load(PAGE); // -> APP.start()
      },

      start: function() {

         // FAQ-List Module
         if ($('.faq-list').length) {
            // check for framework
            if (typeof $().collapse !== 'function' ) {
               console.log('REQUIRED: lib/plugins/collapse.js || lib/bootstrap.min.js');
               return false;
            }
            $('.faq-list').each(function(i,el){
               $(el).find('.collapse')
                  .on('show.bs.collapse',   function(e){
                     // console.log('show');
                     $(this)
                        .closest('.faq-list')
                        .find('.list-item.open')
                        .removeClass('open');

                     $(this)
                        .closest('.list-item')
                        .addClass('open');
                  })
                  .on('shown.bs.collapse',  function(e){
                     console.log('shown');
                  })
                  .on('hide.bs.collapse',   function(e){
                     // console.log('hide');
                     $(this)
                        .closest('.list-item')
                        .removeClass('open');
                  })
                  .on('hidden.bs.collapse', function(e){
                     console.log('hidden');
                  });

               // make entire list-item clickable
               $(el).find('.card-block')
                  .on('click', function(e){
                     $(this).parent().collapse('hide');
                  });
            });

         }

         // START HOOK
			$(window).trigger('APP-START',[APP]);

         BODY.removeClass('no-js'); // obviously
		}
   };

   /* ============================================================================== */
	/* IMAGES
	/*
	/* @descr:	Manage Imagesloaded events and starts APP when all images are loaded
	/* @plgin:	ImagesLoaded.js
	/* ============================================================================== */

	APP.Images = {

		ready: false,

		IMAGES: Array(),

		ERRORS: Array(),

      PLACEHOLDER_DEFAULT: 'img/jpg/image-1-color-3x2_xs.jpg',

		data: {},

		load: function ($TARGET, options) {

			if ($TARGET === undefined) { $TARGET = $BODY; }

			options = options || {};
			var opt = {
					// callbacks
					bg: 		   options.bg 			   || false,
					onAlways:	options.onAlways  	|| null,
					onSuccess: 	options.onSuccess  	|| null,
					onFail:    	options.onFail		   || null,
					onProgress:	options.onProgress	|| null
				};
			$.extend( opt, options );

			/**
	 		 * This manages the callback functions
	 		 */
			var _events = $.Callbacks(),
				_dispatch = function ( fn, params, string ) {
					if ( typeof fn === 'function' ) {
						_events
							.add(fn)
							.fire( params, string )
							.remove(fn);
					}
				};

			var _that = this;

			this.imagesReady = false;

			/* load all images and then start application */
			$TARGET.imagesLoaded({background: opt.bg}
				).always (
					function(obj)
					{
						_that.always(obj);
						_dispatch( opt.onAlways,obj);
					}
				).done (
					function(obj)
						{
							_that.success(obj);
							_dispatch( opt.onSucess,obj);
						}
				).fail (
					function(obj)
						{
							_that.fail(obj);
							_dispatch( opt.onFail,obj);
						}
				).progress (
					function(obj,image)
						{
							_that.progress(obj,image);
							_dispatch( opt.onProgress,obj);
						}
				);
		},
		always: function(data) {
			$(window).trigger('images-loaded',data);

			this.ready = true;
			this.data = data;
		},
		success: function(data) {
			$(window).trigger('images-success',data);
         console.log('SUCCESS: ' + this.IMAGES.length + ' images were loaded:');
			if ( this.IMAGES.length ) {
				var _images = '';
				for (var i = 0; i < this.IMAGES.length; i++) {
					_images += (i+1) + ') ' + this.IMAGES[i].img.src + '\n';
				}
				console.log(_images);
			}
		},
		fail: function(data) {
			$(window).trigger('images-fail',data);

			console.log('WARNING: ' + this.ERRORS.length + ' images are broken or missing:');
			if ( this.ERRORS.length ) {
				var _missing = {};
				for (var i = 0; i < this.ERRORS.length; i++) {
					_missing[(i+1)] = this.ERRORS[i].img.src;
				}
				console.log(_missing);
			}
		},
		progress: function(data,image) {

			if (!image.isLoaded) //	mend broken images
			{
				$(image.img).addClass('broken');
				// collect broken images
				this.ERRORS.push(image);
			} else
			{
            if ($(image.img).hasClass('broken')) { $(image.img).removeClass('broken'); }
            // collect good images
				this.IMAGES.push(image);
			}
		},

      lastBp: false,

      swapImagesByBreakpoint: function(elements)
      {
         if (typeof elements !== 'object' )
            { elements = $('img'); }

         var bp = viewportSize;

         // console.log(bp);
         // console.log(this.lastBp);

         elements
   			.each(function(i,el)
   			{
               var _placeholder = $(el).attr('scr') || APP.Images.PLACEHOLDER_DEFAULT,
                   _width = $(el).closest('[class*="col-"]').width();

               // $(el).css({ width: _width });
               // console.log(_width);

               if ($(el).data('default') !== undefined) {

                  if (!$(el).data('original')) {
                     $(el)
                        .data({
                           original : $(el).data('default')
                        });
      				}

                  var _newSrc = ( $(el).data(bp) !== undefined ) ? $(el).data(bp) : $(el).data('original');

                  if ( $(el).attr('src') && $(el).attr('src') !== _placeholder ) {
                     $(el)
                        .removeClass('done')
                        .removeClass('show')
                        .addClass('loading')
                        .attr({
                           src: _newSrc
                        })
                        .imagesLoaded()
                        .progress (
					            function(obj,image)
                              {
                                 $(image.img)
                                    .attr('height',(image.img.naturalHeight > 0) ? image.img.naturalHeight : '100%')
                                    .attr('width',(image.img.naturalWidth > 0) ? image.img.naturalWidth : '100%')
                                    .addClass('done')
                                    .addClass('show')
                                    .removeClass('loading');
                              }
                        )
                        .done (
            					function(obj)
            						{
                                 console.log($(obj.elements));
            						}
            				);
                  } else {
                     $(el).data('default',_newSrc);
                  }
               }
   			});
            this.lastBp = viewportSize;
      },
	};

	/* ============================================================================== */
	/*	EVENT HELPER
	/*
	/*	Generic, efficient window resize and scroll handler
	/*	Using 'setTimeout' since Web-Kit and some other browsers call the resize
	/*	function constantly upon window resizing.
	/* ============================================================================== */

	var resizeTimer;
	$(window).resize(function (e) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			$(window).trigger('delayed-resize',e);
		}, 250);
	});
	var scrollTimer,
	 	scrolling = false;
	$(window).on('scroll', function(e){
		if (!scrolling) {
			scrolling = true;
			$(window).trigger('scroll-start',e);
		}
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(function(e){
			$(window).trigger('scroll-end',e);
			scrolling = false;
		}, 100);
	});

	$(window).load(function(){
		APP.init();
	});
}); //on.ready ENDE

/* HELPER
----------------------------------------------------------------------------------------------------*/
/** @public **/
function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

/** @public **/
function nl2br(str, is_xhtml) {
  //   example 1: nl2br('Kevin\nvan\nZonneveld');
  //   returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
  //   example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
  //   returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
  //   example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
  //   returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '')
    .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

/** @public **/
function openURL ( url, target ) {
	target = target || '_blank';
	window.open(url,target);
}
