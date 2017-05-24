/*!
 * @name			nopo.questions-group.js
 *
 * @client			DGfS-DP Nordpol
 * @description	Manage Anamnesis Questions Interface
 * @libs			   bootstrap.js (Button and Collapse plugin)
 * @copyright 		(c) 2016 Ansgar Hiller (www.weigelstein.de)
*/
// weigelstein namespace
var NOPO = NOPO || {},
	APP;

jQuery(document).ready(function ($) { 'use strict';

   var BODY  = $('body'),
		 HTML  = $('html'),
       PAGE	 = $('.page');

	$(window).on('application-start', function(e,app) {
		APP = app;
      NOPO.QuestionsGroup.init();
   });

   $(window).on('delayed-resize', function(e,app) {


   });

   /* ============================================================================== */
	/* QUESTIONS-GROUP
	/*
	/* @descr:	Manage Anamnesis Questions Interface
	/* @plgin:	bootstrap.js (Button and Collapse plugin)
	/* ============================================================================== */

   NOPO.QuestionsGroup = {

      SELECTOR_DEFAULT: '.questions-group',

      NEXT_TIMER: false,

      TIP_Y_OFFSET: { 'xs': 15, 'sm': 18, 'md': 22, 'lg': 25, 'xl': 28 },

      NEXT_DELAY: 1000, // milliseconds

      init: function ( $GROUP ) {

         if ($GROUP === undefined || typeof $GROUP !== 'object' ) { $GROUP = $(this.SELECTOR_DEFAULT); }

         if ($GROUP.length) {

            $('.radio-group').find('.btn').each(function(i, el)
            {
               var _groupid = $(el).closest('.radio-group').attr('id');
               $(el).on('click', function() {
                  var _input = $(this).find('input');
                  if(_input.prop('checked') === false) {
                     $('#'+_groupid).trigger('ws.changed.radio',[_input.val()]);
                     WS.QuestionsGroup.showNext( $('#'+_groupid) );
                  }
               });
            });

            $GROUP.find('.toggle-btn').on('click', function(e)
            {
               $($(this).data('target')).collapse('toggle');
               return false;
            });
            $GROUP.find('.question-header').on('click', function(e)
            {
               $($(this).data('target')).collapse('toggle');
               return false;
            });

            $('.radio-group').on('ws.changed.radio', function(e, val)
            {
               if($(this).hasClass('ok')) {
                  $(this)
                     .find('.card.active-card')
                     .removeClass('active-card');
                  $(this)
                     .closest('.question-parent')
                     .find('.question-index > .badge-value')
                     .text(val);
               } else {
                  var _badge = $('<span class="badge badge-value badge-info badge-xs align-self-center fade">' + val + '</span>');
                  $(this)
                     .addClass('ok')
                     .closest('.question-parent')
                     .addClass('done')
                     .find('.question-index')
                     .append(_badge);
               }
               $('#' + $(this).attr('id') + '_OPT' + val)
                  .addClass('active-card');
               return true;
            });

            /* RADIO-GROUP (Accordion Behavior) */
            $('.radio-group')
               .on('hide.bs.collapse', function (e) {
                  // do something
                  $('#PARENT_' + e.target.id)
                     .find('[rel="tooltip"]')
                     .tooltip('dispose');
                  $('#PARENT_' + e.target.id)
                     .find('.question-index > .badge-value')
                     .addClass('show');
               })
               .on('hidden.bs.collapse', function (e) {
                  $('#PARENT_' + e.target.id)
                     .removeClass('open');
               })
               .on('show.bs.collapse', function (e)
               {
                  // console.log( 'PARENT_' + e.target.id );
                  var _target = $GROUP.find('.card-group.show'),
                      _parent = $('#PARENT_' + e.target.id);
                  _parent
                     .addClass('open')
                     .find('.question-index > .badge-value')
                     .removeClass('show');

                  if (_target.length) { _target.collapse('hide');}
               })
               .on('shown.bs.collapse', function (e)
               {
                  var tipOffset = WS.QuestionsGroup.TIP_Y_OFFSET[viewportSize];
                  $('#PARENT_' + e.target.id)
                     .find('[rel="tooltip"]')
                     .tooltip({
                        'delay'  : {"show": 500, "hide": 100 },
                        'offset' : '-'+ tipOffset + ' 0'
                     });
               });

            WS.QuestionsGroup.showNext();
         }
      },

      showNext: function ( $CURRENT, $GROUP ) {
         if ($GROUP === undefined || typeof $GROUP !== 'object' ) { $GROUP = $(this.SELECTOR_DEFAULT); }
         if ($GROUP.length) {
            var _next = $GROUP.find('.radio-group:not(.ok)').first();
            clearTimeout(WS.QuestionsGroup.NEXT_TIMER);
	         WS.QuestionsGroup.NEXT_TIMER = setTimeout(function () {
		         if ($CURRENT !== undefined) { $CURRENT.collapse('hide'); }
               if (_next.length) {
                  _next.collapse('show');
               } else {
                  console.log('submit');
               }
            }, WS.QuestionsGroup.NEXT_DELAY );
         }
      }
   }
});
