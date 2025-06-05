/**
 * Tests if given Value is an Object or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is an Object otherwise false
 */
export const isObject = val => {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
}

/*  Function to test if an object is a plain object, i.e. is constructed
**  by the built-in Object constructor and inherits directly from Object.prototype
**  or null. Some built-in objects pass the test, e.g. Math which is a plain object
**  and some host or exotic objects may pass also.
**
**  @param {} obj - value to test
**  @returns {Boolean} true if passes tests, false otherwise
*/
export const isPlainObject = obj => {
	// https://stackoverflow.com/questions/5876332/how-can-i-differentiate-between-an-object-literal-other-javascript-objects

	// Basic check for Type object that's not null
	if (typeof obj == 'object' && obj !== null) {
  
	  // If Object.getPrototypeOf supported, use it
	  if (typeof Object.getPrototypeOf == 'function') {
		var proto = Object.getPrototypeOf(obj);
		return proto === Object.prototype || proto === null;
	  }
	  
	  // Otherwise, use internal class
	  // This should be reliable as if getPrototypeOf not supported, is pre-ES5
	  return Object.prototype.toString.call(obj) == '[object Object]';
	}
	
	// Not an object
	return false;
}

/**
 * Tests if given Value is an Array or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is an Array otherwise false
 */
 export const isArray = val => {
    if (val === null) { return false;}
    return Array.isArray(val);
}

/**
 * Tests if given Value is a function or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is a Function otherwise false
 */
 export const isFunction = val => {
    if (val === null || val === undefined) { return false;}
    return typeof val === 'function';
}

/**
 * Tests if given Value is a Boolean or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is an Object otherwise false
 */
export const isBoolean = val => {
    return (val === true || val === false);
}

/**
 * Tests if given Value is a Numeric value or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is Numeric otherwise false
 */
export const isNumeric = val => {
    return (typeof val === 'number');
}

/**
 * Tests if given Value is a String value or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is String otherwise false
 */
 export const isString = val => {
    return (typeof val === 'string');
}

/**
 * Tests if given Value is a String, Numeric, Boolean value or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is String otherwise false
 */
 export const isPrimitive = val => {
    return (isBoolean(val) || isNumeric(val) || isString(val));
}

/**
 * Tests if given Value is a Date-Object or not
 * 
 * @param {Any} val Value to test
 * @returns {Boolean} True if given Value is an Date Object otherwise false
 */
 export const isDate = val => {
    return val instanceof Date && !isNaN(val.valueOf());
}

/**
 * Will debounce the give function
 * 
 * @param {Function} func callback that will be called after debounce is over
 * @param {Interger} wait Time to wait in ms
 * @param {Boolean} immediate If true the callback will be immediate called
 * @param {Function} directCallback called directly afer invoking
 */
export const debounce = (func, wait, immediate=false, directCallback=null) => {
	var timeout;
	return function() {
		if (directCallback) directCallback();

		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


/**
 * Replaces all regexp reserved chars
 * 
 * @param {String} text Text to escape
 * @returns {String} Escaped text
 */
export const escapeRegExp = text => {
	return text.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Clones the given value (deeply)
 * 
 * @param {Any} o any var to deep clone
 * @returns cloned value
 */
export const deepClone = (o, { transformDate = false, deleteCurrentUser = false } = {}) => {
	if (isPrimitive(o, { transformDate, deleteCurrentUser })) {
		return o;
	} else if (isArray(o)) {
		return o.map( item => deepClone(item, { transformDate, deleteCurrentUser }) );
	} else if (isPlainObject(o)) {
		let n = {};
		Object.keys(o).forEach( k => {
			if (k == 'currentUser' && deleteCurrentUser) {
				// do nothing to delete 
			} else {
				v = o[k];
				n[k] = deepClone(v, { transformDate, deleteCurrentUser });
			}
		});
		return n;
	} else if (isObject(o)) {
		// handle special objects
		if (o.constructor.name == 'Moment' || o._isAMomentObject) {
			return transformDate ? o.toDate() : Object.assign(Object.create(o), o);
		}
	}

	return o;
}

