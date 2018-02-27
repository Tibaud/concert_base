// Comme on a des ballllllsss en cette fin de formation, on va faire un plug in slider OOP
;(function(factory){

  if (typeof define === 'function' && define.amd) {
      define(['jquery'], factory);
  } else if (typeof exports !== 'undefined') {
      module.exports = factory(require('jquery'));
  } else {
      factory(jQuery);
  }

})(function($){
  // On utilise une fonction anonyme pour garantir que la fonction s'execute immédiatement
  // On définit Carou comme une variable de type ‘function’.
  var Carou = (function(element, settings){
    var instanceUid = 0;
    //* On détermine et fixe les valeurs par défaut pour Carou
    function _Carou(element, settings){
      this.defaults = {
        slideDuration: '3000',
        speed: 500,
        arrowRight: '.arrow-right',
        arrowLeft: '.arrow-left'
      };
      // On créé une nouvelle propriété qui conserve les réglages par defaut après
      // fusion avec les paramètres de l'utilisateur

      this.settings = $.extend({},this,this.defaults,settings);

      // Cet objet conserve les valeurs qui changeront pendant que le plug in fonctionne

      this.initials = {
        currSlide : 0,
        $currSlide: null,
        totalSlides : false,
        csstransitions: false
      };

      // on lie les propriété de this.initials comme propriétés de Carou
      $.extend(this,this.initials);
      this.$el = $(element);
      this.changeSlide = $.proxy(this.changeSlide,this);
      this.init();
      this.instanceUid = instanceUid++;
    }

    return _Carou;

  })();

   Carou.prototype.init = function(){
    //Teste si animation en css possibles
    this.csstransitionsTest();
    // Ajout de classe pour pouvoir styler
    this.$el.addClass('Carou-carousel');
    // commande de build des DOM nécessaires au plugin
    // par exemple créer un bullet pour chaque slide
    this.build();
    // idem pour les event comme les clicks
    this.events();
    // ordre d'activation
    this.activate();
    // loop de temps pour contrôler la progression entre 2 slides
    this.initTimer();
  };

	/* Appropriated out of Modernizr v2.8.3
	 * On créé un nouvel élément DOM et on test l'existance de propriété
	 * pour voir si les transitions CSS existent
	 */
	Carou.prototype.csstransitionsTest = function(){
		var elem = document.createElement('modernizr');
		//A list of properties to test for
		var props = ["transition","WebkitTransition","MozTransition","OTransition","msTransition"];
		//Iterate through our new element's Style property to see if these properties exist
		for ( var i in props ) {
			var prop = props[i];
			var result = elem.style[prop] !== undefined ? prop : false;
			if (result){
				this.csstransitions = result;
				break;
			}
		}
	};

	/**
	 * On ajoute la durée de transition CSS au DOM
	 * juste avant que le slide ne s'anime
	 */
	Carou.prototype.addCSSDuration = function(){
		var _ = this;
		this.$el.find('.slide').each(function(){
			this.style[_.csstransitions+'Duration'] = _.settings.speed+'ms';
		});
	}

	/**
   * On retire la durée de transition css au DOM
   * juste après que le slide ait été animé
   */
	Carou.prototype.removeCSSDuration = function(){
		var _ = this;
		this.$el.find('.slide').each(function(){
			this.style[_.csstransitions+'Duration'] = '';
		});
	}

	/**On créé les indicators (les bullets de navigation)*/
	Carou.prototype.build = function(){
		var $indicators = this.$el.append('<ul class="indicators" >').find('.indicators');
		this.totalSlides = this.$el.find('.slide').length;
		for(var i = 0; i < this.totalSlides; i++) $indicators.append('<li data-index='+i+'>');
	};

	/**
	 * On active le premier slide
	 *
	 */
	Carou.prototype.activate = function(){
		this.$currSlide = this.$el.find('.slide').eq(0);
		this.$el.find('.indicators li').eq(0).addClass('active');
	};

	/**
   * On associe les déclencheurs d'événement aux événements
   */
	Carou.prototype.events = function(){
		$('body')
			.on('click',this.settings.arrowRight,{direction:'right'},this.changeSlide)
			.on('click',this.settings.arrowLeft,{direction:'left'},this.changeSlide)
			.on('click','.indicators li',this.changeSlide);
	};

	/**
	 * On détermine le reset de timer
	 */
	Carou.prototype.clearTimer = function(){
		if (this.timer) clearInterval(this.timer);
	};

	/**
	 * On détemrine l'initialisation du timer
	 */
	Carou.prototype.initTimer = function(){
		this.timer = setInterval(this.changeSlide, this.settings.slideDuration);
	};

	/**
	 * On détermine le début du timer
	 */
	Carou.prototype.startTimer = function(){
		this.initTimer();
		this.throttle = false;
	};

	/**
	 * On détermine la logique des déclencheur et leur impact sur le timer
	 */
	Carou.prototype.changeSlide = function(e){
		//on vérifie que les animations se déclenches une par une
		if (this.throttle) return;
		this.throttle = true;

		//on stope le timer quand l'animation se déclenche
		this.clearTimer();

		// on donne la direction de l'animation (gauche ou droite)
		var direction = this._direction(e);

		// Sélection de la slide suivante
		var animate = this._next(e,direction);
		if (!animate) return;

		//on déclenche l'animation de la slide suivante
		var $nextSlide = this.$el.find('.slide').eq(this.currSlide).addClass(direction + ' active');

    if (!this.csstransitions){
			this._jsAnimation($nextSlide,direction);
		} else {
			this._cssAnimation($nextSlide,direction);
		}
	};

	/**
	 * renvoit de la direction de l'animation
	 */
	Carou.prototype._direction = function(e){
		var direction;

		// mouvement retour par défaut
		if (typeof e !== 'undefined'){
			direction = (typeof e.data === 'undefined' ? 'right' : e.data.direction);
		} else {
			direction = 'right';
		}
		return direction;
	};

	/**
	 * On met à jour le plug in avec le numéro de la slide suivante
	 * @params	object	event
	 * @params	string	animation direction
	 * @returns boolean continue to animate?
	 *
	 */
	Carou.prototype._next = function(e,direction){

    // si déclenché par un bullet, on conservel e numéro de la bullet en stock
		var index = (typeof e !== 'undefined' ? $(e.currentTarget).data('index') : undefined);

		//logique pour déterminer le slide suivant
		switch(true){
			//Si déclenché par bullet, on règle le slide suivant par rapport à l'index
       case( typeof index !== 'undefined'):
				if (this.currSlide == index){
					this.startTimer();
					return false;
				}
				this.currSlide = index;
			break;
			case(direction == 'right' && this.currSlide < (this.totalSlides - 1)):
				this.currSlide++;
			break;
			case(direction == 'right'):
				this.currSlide = 0;
			break;
			case(direction == 'left' && this.currSlide === 0):
				this.currSlide = (this.totalSlides - 1);
			break;
			case(direction == 'left'):
				this.currSlide--;
			break;
		}
		return true;
	};

	/**
	 * Execution de l'animation par transition CSS
	 * @params	object	Jquery object the next slide to slide into view
	 * @params	string	animation direction
	 * @returns void
	 *
	 */
	Carou.prototype._cssAnimation = function($nextSlide,direction){
    //Initilisation de la transition CSS
		setTimeout(function(){
			this.$el.addClass('transition');
			this.addCSSDuration();
			this.$currSlide.addClass('shift-'+direction);
		}.bind(this),100);

		//CSS Animation Callback
		//After the animation has played out, remove CSS transitions
		//Remove unnecessary classes
		//Start timer
		setTimeout(function(){
			this.$el.removeClass('transition');
			this.removeCSSDuration();
			this.$currSlide.removeClass('active shift-left shift-right');
			this.$currSlide = $nextSlide.removeClass(direction);
			this._updateIndicators();
			this.startTimer();
		}.bind(this),100 + this.settings.speed);
	};

	/**
	 * Execution des animation par transition JS
   * @params	object	Jquery object the next slide to slide into view
	 * @params	string	animation direction
	 * @returns void
	 *
	 */
	Carou.prototype._jsAnimation = function($nextSlide,direction){
		//Cache this reference for use inside animate functions
		var _ = this;

     // See CSS for explanation of .js-reset-left
		if(direction == 'right') _.$currSlide.addClass('js-reset-left');

     var animation = {};
		animation[direction] = '0%';

		var animationPrev = {};
		animationPrev[direction] = '100%';

		//Animation: slide en cours
		this.$currSlide.animate(animationPrev,this.settings.speed);

		//Animation: slide suivante
		$nextSlide.animate(animation,this.settings.speed,'swing',function(){
			//Get rid of any JS animation residue
			_.$currSlide.removeClass('active js-reset-left').attr('style','');
			//Cache the next slide after classes and inline styles have been removed
			_.$currSlide = $nextSlide.removeClass(direction).attr('style','');
			_._updateIndicators();
			_.startTimer();
		});
	};

  /**
	 * on vérifie que le bullet pointe bien vers le slide en cours
	 * @params	void
	 * @returns	void
	 *
	 */
	Carou.prototype._updateIndicators = function(){
		this.$el.find('.indicators li').removeClass('active').eq(this.currSlide).addClass('active');
	};

	/**
	 * Initialize the plugin once for each DOM object passed to jQuery
	 * @params	object	options object
	 * @returns void
	 *
	 */
	$.fn.Carou = function(options){

    return this.each(function(index,el){

      el.Carou = new Carou(el,options);

    });

  };


});

// Custom options for the carousel
var args = {
	arrowRight : '.arrow-right', //A jQuery reference to the right arrow
	arrowLeft : '.arrow-left', //A jQuery reference to the left arrow
	speed : 1000, //The speed of the animation (milliseconds)
	slideDuration : 4000 //The amount of time between animations (milliseconds)
};

$('.carousel').Carou(args);
