'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a};(function(a,b){'object'===('undefined'==typeof exports?'undefined':_typeof(exports))&&'object'===('undefined'==typeof module?'undefined':_typeof(module))?module.exports=b():'function'==typeof define&&define.amd?define(b):'object'===('undefined'==typeof exports?'undefined':_typeof(exports))?exports.nes=b():a.nes=b()})('undefined'==typeof window?global:window,function(){var a=function(){},b=function(a){try{return JSON.parse(a)}catch(a){throw new e(a,'protocol')}},c=function(a){try{return JSON.stringify(a)}catch(a){throw new e(a,'user')}},d=function(a){return function(b){setTimeout(function(){return a(b)},0)}},e=function(a,b){return'string'==typeof a&&(a=new Error(a)),a.type=b,a},f={1000:'Normal closure',1001:'Going away',1002:'Protocol error',1003:'Unsupported data',1004:'Reserved',1005:'No status received',1006:'Abnormal closure',1007:'Invalid frame payload data',1008:'Policy violation',1009:'Message too big',1010:'Mandatory extension',1011:'Internal server error',1015:'TLS handshake'},g=function(b,c){c=c||{},this._url=b,this._settings=c,this._heartbeatTimeout=!1,this._ws=null,this._reconnection=null,this._reconnectionTimer=null,this._ids=0,this._requests={},this._subscriptions={},this._heartbeat=null,this._packets=[],this._disconnectListeners=null,this._disconnectRequested=!1,this.onError=function(a){return console.error(a)},this.onConnect=a,this.onDisconnect=a,this.onUpdate=a,this.id=null};return g.WebSocket='undefined'==typeof WebSocket?null:WebSocket,g.prototype.connect=function(a){var b=this;return(a=a||{},this._reconnection)?Promise.reject(new e('Cannot connect while client attempts to reconnect','user')):this._ws?Promise.reject(new e('Already connected','user')):(this._reconnection=!1===a.reconnect?null:{wait:0,delay:a.delay||1e3,maxDelay:a.maxDelay||5e3,retries:a.retries||Infinity,settings:{auth:a.auth,timeout:a.timeout}},new Promise(function(c,d){b._connect(a,!0,function(a){return a?d(a):c()})}))},g.prototype._connect=function(a,b,c){var h=this,i=new g.WebSocket(this._url,this._settings.ws);this._ws=i,clearTimeout(this._reconnectionTimer),this._reconnectionTimer=null;var j=function(a){if(c){var b=c;return c=null,b(a)}return h.onError(a)},k=a.timeout?setTimeout(function timeoutHandler(){if(h._cleanup(),j(new e('Connection timed out','timeout')),b)return h._reconnect()},a.timeout):null;i.onopen=function(){clearTimeout(k),i.onopen=null,h._hello(a.auth).then(function(){h.onConnect(),j()}).catch(function(a){a.path&&delete h._subscriptions[a.path],h._disconnect(function(){return d(j)(a)},!0)})},i.onerror=function(){clearTimeout(k),h._ws.readyState!==g.WebSocket.CLOSING&&h._cleanup();var a=new e('Socket error','ws');return j(a)},i.onclose=function(a){i.onopen&&j(new e('Connection terminated while waiting to connect','ws'));var b=h._disconnectRequested;h._cleanup();var c={code:a.code,explanation:f[a.code]||'Unknown',reason:a.reason,wasClean:a.wasClean,willReconnect:!!(h._reconnection&&1<=h._reconnection.retries),wasRequested:b};h.onDisconnect(c.willReconnect,c),h._reconnect()},i.onmessage=function(a){return h._onMessage(a)}},g.prototype.overrideReconnectionAuth=function(a){return!!this._reconnection&&(this._reconnection.settings.auth=a,!0)},g.prototype.disconnect=function(){var a=this;return new Promise(function(b){return a._disconnect(b,!1)})},g.prototype._disconnect=function(a,b){clearTimeout(this._reconnectionTimer),this._reconnectionTimer=null,this._reconnection=null;var c=this._disconnectRequested||!b;return this._disconnectListeners?(this._disconnectRequested=c,void this._disconnectListeners.push(a)):this._ws&&(this._ws.readyState===g.WebSocket.OPEN||this._ws.readyState===g.WebSocket.CONNECTING)?void(this._disconnectRequested=c,this._disconnectListeners=[a],this._ws.close()):a()},g.prototype._cleanup=function(){if(this._ws){var j=this._ws;this._ws=null,(j.readyState===g.WebSocket.OPEN||j.readyState===g.WebSocket.CONNECTING)&&j.close(),j.onopen=null,j.onclose=null,j.onerror=a,j.onmessage=null}this._packets=[],this.id=null,clearTimeout(this._heartbeat),this._heartbeat=null;var b=new e('Request failed - server disconnected','disconnect'),c=this._requests;this._requests={};for(var d=Object.keys(c),f=0;f<d.length;++f){var h=d[f],i=c[h];clearTimeout(i.timeout),i.reject(b)}if(this._disconnectListeners){var k=this._disconnectListeners;this._disconnectListeners=null,this._disconnectRequested=!1,k.forEach(function(a){return a()})}},g.prototype._reconnect=function(){var b=this,c=this._reconnection;if(c){if(1>c.retries)return this._disconnect(a,!0);--c.retries,c.wait+=c.delay;var d=Math.min(c.wait,c.maxDelay);this._reconnectionTimer=setTimeout(function(){c&&c.settings&&b._connect(c.settings,!1,function(a){if(a)return b.onError(a),b._reconnect()})},d)}},g.prototype.request=function(a){'string'==typeof a&&(a={method:'GET',path:a});var b={type:'request',method:a.method||'GET',path:a.path,headers:a.headers,payload:a.payload};return this._send(b,!0)},g.prototype.message=function(a){return this._send({type:'message',message:a},!0)},g.prototype._send=function(a,b){if(!this._ws||this._ws.readyState!==g.WebSocket.OPEN)return Promise.reject(new e('Failed to send message - server disconnected','disconnect'));a.id=++this._ids;try{var d=c(a)}catch(a){return Promise.reject(a)}if(!b)try{return this._ws.send(d),Promise.resolve()}catch(a){return Promise.reject(new e(a,'ws'))}var f={resolve:null,reject:null,timeout:null},h=new Promise(function(a,b){f.resolve=a,f.reject=b});this._settings.timeout&&(f.timeout=setTimeout(function(){return f.timeout=null,f.reject(new e('Request timed out','timeout'))},this._settings.timeout)),this._requests[a.id]=f;try{this._ws.send(d)}catch(b){return clearTimeout(this._requests[a.id].timeout),delete this._requests[a.id],Promise.reject(new e(b,'ws'))}return h},g.prototype._hello=function(a){var b={type:'hello',version:'2'};a&&(b.auth=a);var c=this.subscriptions();return c.length&&(b.subs=c),this._send(b,!0)},g.prototype.subscriptions=function(){return Object.keys(this._subscriptions)},g.prototype.subscribe=function(a,b){var c=this;if(!a||'/'!==a[0])return Promise.reject(new e('Invalid path','user'));var d=this._subscriptions[a];if(d)return-1===d.indexOf(b)&&d.push(b),Promise.resolve();if(this._subscriptions[a]=[b],!this._ws||this._ws.readyState!==g.WebSocket.OPEN)return Promise.resolve();var f=this._send({type:'sub',path:a},!0);return f.catch(function(){delete c._subscriptions[a]}),f},g.prototype.unsubscribe=function(b,c){if(!b||'/'!==b[0])return Promise.reject(new e('Invalid path','user'));var d=this._subscriptions[b];if(!d)return Promise.resolve();var f=!1;if(!c)delete this._subscriptions[b],f=!0;else{var i=d.indexOf(c);if(-1===i)return Promise.resolve();d.splice(i,1),d.length||(delete this._subscriptions[b],f=!0)}if(!f||!this._ws||this._ws.readyState!==g.WebSocket.OPEN)return Promise.resolve();var h=this._send({type:'unsub',path:b},!0);return h.catch(a),h},g.prototype._onMessage=function(c){this._beat();var d=c.data,f=d[0];if('{'!==f){if(this._packets.push(d.slice(1)),'!'!==f)return;d=this._packets.join(''),this._packets=[]}this._packets.length&&(this._packets=[],this.onError(new e('Received an incomplete message','protocol')));try{var g=b(d)}catch(a){return this.onError(a)}var h=null;if(g.statusCode&&400<=g.statusCode&&599>=g.statusCode&&(h=new e(g.payload.message||g.payload.error||'Error','server'),h.statusCode=g.statusCode,h.data=g.payload,h.headers=g.headers,h.path=g.path),'ping'===g.type)return this._send({type:'ping'},!1).catch(a);if('update'===g.type)return this.onUpdate(g.message);if('pub'===g.type||'revoke'===g.type){var l=this._subscriptions[g.path];if('revoke'===g.type&&delete this._subscriptions[g.path],l&&void 0!==g.message){var m={};'revoke'===g.type&&(m.revoked=!0);for(var n=0;n<l.length;++n)l[n](g.message,m)}return}var j=this._requests[g.id];if(!j)return this.onError(new e('Received response for unknown request','protocol'));clearTimeout(j.timeout),delete this._requests[g.id];var k=function(a,b){return a?j.reject(a):j.resolve(b)};return'request'===g.type?k(h,{payload:g.payload,statusCode:g.statusCode,headers:g.headers}):'message'===g.type?k(h,{payload:g.message}):'hello'===g.type?(this.id=g.socket,g.heartbeat&&(this._heartbeatTimeout=g.heartbeat.interval+g.heartbeat.timeout,this._beat()),k(h)):'sub'===g.type||'unsub'===g.type?k(h):(k(new e('Received invalid response','protocol')),this.onError(new e('Received unknown response type: '+g.type,'protocol')))},g.prototype._beat=function(){var a=this;this._heartbeatTimeout&&(clearTimeout(this._heartbeat),this._heartbeat=setTimeout(function(){a.onError(new e('Disconnecting due to heartbeat timeout','timeout')),a._ws.close()},this._heartbeatTimeout))},{Client:g}});
