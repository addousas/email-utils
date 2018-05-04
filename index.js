export function getAjax(url, success) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send();
  return xhr;
}

export function postAjax(url, data, success) {
  var params = typeof data == 'string' ? data : Object.keys(data).map(
          function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
      ).join('&');

  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open('POST', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(params);
  return xhr;
}

export function getMouseXY (e) {
  var tempY = 0;
  var tempX = 0;

  if (window.IE) {
    // grab the x-y pos.s if browser is IE
    tempX = event.clientX + document.body.scrollLeft
    tempY = event.clientY + document.body.scrollTop
  } else {
    // grab the x-y pos.s if browser is NS
    tempX = e.pageX
    tempY = e.pageY
  }
  // catch possible negative values in NS4
  if (tempX < 0) {
    tempX = 0
  }
  if (tempY < 0) {
    tempY = 0
  }
  // show the position values in the form named Show
  // in the text fields named MouseX and MouseY
  window.tempX = tempX
  window.tempY = tempY
  return true
}

  
export function pushCartContent(){
  console.log('MY_APP pushCartContent')
  
//    window.appLayer.cartContent.items.forEach(
//     function(item){
//        
//        var xhttp = new XMLHttpRequest()
//        var itemStr = JSON.stringify(item)
//        alert('pushCartContent: ' + itemStr)
//        console.log('MY_APP ' + itemStr)
//        xhttp.open('POST', 'http://www.litlife.io/products?hello='+ itemStr);
//       xhttp.send()

//      })

}

export function checkCart (e) {
  console.log('MY_APP checkCart 1')
  getMouseXY(e)

  setTimeout(function () { 
    getAjax('/cart.js', function(data){ 
      console.log( 'testing: '+ data);
      var cartContent = JSON.parse(data)
      window.appLayer.cartContent = cartContent

      if (window.appLayer.cart_items_count != cartContent.item_count){
        console.log('MY_APP Change in cart' + window.appLayer.cart_items_count + '!=' + cartContent.item_count)
        window.appLayer.cart_items_count = cartContent.item_count
        // push content
        pushCartContent()
      }

    });
  }, 1000)
}



export function submit(options, email, callback) {
  if (options.destination == 'email' && options.email) {
    submitFormspree(options, email, callback);
  } else if (options.destination == 'service') {
    if (options.account.service == 'mailchimp') {
      submitMailchimp(options, email, callback);
    } else if (options.account.service == 'constant-contact') {
      submitConstantContact(options, email, callback);
    }
  }
}

export function submitFormspree(options, email, cb) {
  var url, xhr, params;

  url = '//formspree.io/' + options.email;
  xhr = new XMLHttpRequest();

  params = 'email=' + encodeURIComponent(email);

  xhr.open('POST', url);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function() {
    var jsonResponse = {};
    if (xhr.status < 400) {
      try {
        jsonResponse = JSON.parse(xhr.response);
      } catch (err) {}

      if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
        cb('Formspree has sent an email to ' + options.email + ' for verification.');
      } else {
        cb(true);
      }
    } else {
      cb(false);
    }
  }

  xhr.send(params);
};

export function submitMailchimp(options, email, cb) {
  var cbCode, url, script;

  cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

  window[cbCode] = function(resp) {
    cb(resp && resp.result === 'success');

    delete window[cbCode];
  }

  url = options.list;
  if (!url) {
    return cb(false);
  }

  url = url.replace('http:', 'https:');
  url = url.replace(/list-manage[0-9]+\.com/, 'list-manage.com');
  url = url.replace('?', '/post-json?');
  url = url + '&EMAIL=' + encodeURIComponent(email);
  url = url + '&c=' + cbCode;

  script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
};

export function submitConstantContact(options, email, cb) {
  if (!options.form || !options.form.listId) {
    return cb(false);
  }

  var xhr, body;

  xhr = new XMLHttpRequest();

  body = {
    email: email,
    ca: options.form.campaignActivity,
    list: options.form.listId
  };

  xhr.open('POST', 'https://visitor2.constantcontact.com/api/signup');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function() {
    cb(xhr && xhr.status < 400);
  };

  xhr.send(JSON.stringify(body));
};
