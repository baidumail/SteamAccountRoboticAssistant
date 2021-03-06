function modConfirmationHeaders(details){

  // Add Referer to emulate site-request
  //////////////////////////////////////
  var headers = details.requestHeaders,
  blockingResponse = {};

  for( var i = 0, l = headers.length; i < l; ++i ) {
    if(headers[i].name == 'Cookie'){
      headers[i].value = headers[i].value+" mobileClientVersion=0 (2.1.3); mobileClient=android; Steam_Language=english; dob=;";
    } else if(headers[i].name == 'User-Agent'){
      headers[i].value = "Mozilla/5.0 (Linux; Android 6.0; Nexus 6P Build/XXXXX; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/47.0.2526.68 Mobile Safari/537.36";
    }
  }

  var b = new Object();
  b.name = 'Referer';
  b.value = conf_link;
  headers.push(b);

  blockingResponse.requestHeaders = headers;
  return blockingResponse;

}


function modGiftBulkHeaders(details){

  // Add Origin and Referer to emulate site-request
  /////////////////////////////////////////////////
  var headers = details.requestHeaders,
  blockingResponse = {};

  for( var i = 0, l = headers.length; i < l; ++i ) {
    if(headers[i].name == 'Origin'){
      headers[i].value = 'https://store.steampowered.com';
    } else if(headers[i].name == 'Accept'){
      headers[i].value = 'text/javascript, text/html, application/xml, text/xml, */*';
    }
  }

  headers.push({name: 'Referer', value: 'https://store.steampowered.com/checkout/sendgift/'+bulk_gid});
  headers.push({name: 'X-Prototype-Version', value: '1.7'});
  headers.push({name: 'X-Requested-With', value: 'XMLHttpRequest'});

  blockingResponse.requestHeaders = headers;
  return blockingResponse;

}


//
// Replace Header-Origin and -Referer to accept trades automatically
////////////////////////////////////////////////////////////////////
chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  var headers = details.requestHeaders,
  blockingResponse = {};

  //console.log('Replacing Headers for Tradeoffer.');

  for( var i = 0, l = headers.length; i < l; ++i ) {
    if(headers[i].name == 'Origin') headers[i].value = 'https://steamcommunity.com';
  }

  headers.push({name: 'Referer', value: 'https://steamcommunity.com/tradeoffer/'});

  blockingResponse.requestHeaders = headers;
  return blockingResponse;
},{urls: [ "https://steamcommunity.com/tradeoffer/*" ]},['requestHeaders','blocking']);


//
// Replace Header-Origin and -Referer to send Market-Listings
/////////////////////////////////////////////////////////////
chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  // Only replace requests from our extension
  if(details.tabId === -1){

    var headers = details.requestHeaders,
    blockingResponse = {};

    //console.log('Replacing Headers for Sellitem.');

    for( var i = 0, l = headers.length; i < l; ++i ) {
      if(headers[i].name == 'Origin') headers[i].value = inventoryLink;
    }

    headers.push({name: 'Referer', value: 'https://steamcommunity.com/market/sellitem/'});

    blockingResponse.requestHeaders = headers;
    return blockingResponse;

  }
},{urls: ["https://steamcommunity.com/market/sellitem/"]},['requestHeaders','blocking']);


// Replacing CSP-Headers - see https://matthewspencer.github.io/browser-extensions-and-csp-headers/
// Needed to automate Community-Badge crafting due to some tasks rely on
// store.steampowered.com - which is not part of the Standard-CSP-Headers
// @see https://developer.mozilla.org/en-US/docs/Web/Security/CSP
///////////////////////////////////////////////////////////////////////////////////////////////////

let cspHeaders = ['content-security-policy','x-webkit-csp'];
// @see https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives

let cspSources = ['connect-src','default-src','font-src','frame-src','img-src','media-src','object-src','script-src','style-src'];

function isCspHeader(headerName) {
  return cspHeaders.includes(headerName.toLowerCase());
}

function modifyCspHeaders(details) {
  details.responseHeaders.forEach((responseHeader) => {
    if (!isCspHeader(responseHeader.name)) {
      return;
    }
    let csp = responseHeader.value;
    cspSources.forEach((cspSource) => {
      csp = csp.replace(cspSource, cspSource + ' http://*.steampowered.com https://*.steampowered.com');
    });
    responseHeader.value = csp;
  });
  return { responseHeaders: details.responseHeaders };
}

chrome.webRequest.onHeadersReceived.addListener(
  modifyCspHeaders,
  {
    urls : [ 'http://*/*', 'https://*/*' ],
    types: [ 'main_frame' ]
  },
  ['responseHeaders','blocking']
);