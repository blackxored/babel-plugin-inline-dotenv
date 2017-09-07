"use strict";

var dotenv;

module.exports = function (options) {
  var t = options.types;

  return {
    visitor: {
      MemberExpression: function MemberExpression(path, state) {
        if(t.isAssignmentExpression(path.parent) && path.parent.left == path.node) return;
        if (path.get("object").matchesPattern("process.env")) {
          if (!dotenv) {
            if (state.opts.path && state.opts.path.indexOf('..') !== -1) {
              state.opts.path = require('path').resolve(__dirname, state.opts.path);
            }
            dotenv = require('dotenv').config(state.opts);
          }
          var key = path.toComputedKey();
          if (t.isStringLiteral(key)) {
            var name = key.value;
            var value = state.opts.env && name in state.opts.env ? state.opts.env[name] : process.env[name];
            var me = t.memberExpression;
            var i = t.identifier;
            var le = t.logicalExpression;

            path.replaceWith(
              le('||', 
                le('&&', 
                  le('&&', i('process'), me(i('process'), i('env'))),
                  me(i('process.env'), i(name))
                ), 
                t.valueToNode(value)
              )
            );
          }
        }
      }
    }
  };
};
