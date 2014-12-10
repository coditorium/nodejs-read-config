'use strict';

module.exports.pick = pick;
module.exports.put = put;

function pick(obj, prop) {
	var splitted = prop.split('.'),
	lastProp = splitted.shift(),
	lastObj = obj;

	splitted.forEach(function(item) {
		lastObj = (lastObj) ? lastObj[lastProp] : null;
		lastProp = item;
	});
	return (!lastObj || lastObj[lastProp] === undefined) ? null : {
		obj: lastObj,
		prop: lastProp,
		value: lastObj[lastProp]
	};
}


function put(obj, prop, value) {
	var splitted = prop.split('.'),
	lastProp = splitted.shift(),
	lastObj = obj;

	splitted.forEach(function(item) {
		lastObj[lastProp] = (lastObj[lastProp] === undefined) ? {} : lastObj[lastProp];
		lastObj = lastObj[lastProp];
		lastProp = item;
	});
	lastObj[lastProp] = value;
	return obj;
}
