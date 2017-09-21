import Constants from '../helpers/constants';

var serialize = function(data) {
    return Object.keys(data).map(function(keyName) {
        return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName]);
    }).join('&');
};
var Activation = {
    packageId: '',
    expirationDate: '',
    licenceToken: '',
    getDsiPackageID: function (bookCode){
      var that = this;
      var headers = {
          'User-Agent': 'Super Agent/0.0.1',
          'Content-Type': 'application/json'
      };
      return fetch(Constants.getDsiPackageID.replace('{codigo}', bookCode) + Constants.leyaEducacao.apiKey, {
          method: "GET",
          headers: headers
      })
      .then((response) => response.json())
      .then((response) => {
        if(response.error){
          return Promise.reject('errorData');
        }else{
          that.packageId = response.packageid;
          that.expirationDate = response.expirationdate;
          return response;
        }
      });
    },
    generateLicense: function() {
      var that = this;
      var headers = {
          'User-Agent': 'Super Agent/0.0.1',
          'Content-Type': 'application/json',
          'api-key': Constants.leap.apiKey
      };
      let myRe = new RegExp('.{5}$');
      let expirationDate = that.expirationDate.replace(myRe.exec(that.expirationDate), ".000+0000");
      return fetch(Constants.licenseGeneration, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
    				type:"ACTIVATION_KEY",
    				uid_licensing_terms: that.packageId,
    				limitation_overrides:{
    					max_devices: 1,
    			 		expiration_timestamp: expirationDate
    			 	}
    			})
      })
      .then((response) => response.json())
      .then((response) => {
        console.log("generateLicense ", response.status)

        if(response.status !== 'PENDING'){
          return Promise.reject('errorGeneric');
        }else{
          that.licenceToken = response.token;
          return response;
        }
      });
    },
    activateLicense: function(session) {
      var that = this;
      var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json',
        'api-key': Constants.leap.apiKey
      };
      return fetch(Constants.licenseActivation + '?access_token=' + session.getToken(), {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          type:"ACTIVATION_KEY",
          key: that.licenceToken
        })
      })
      .then((response) => response.json())
      .then((response) => {
        console.log("activateLicense ", response.status)
        if(response.status !== 'ACTIVE'){
          return Promise.reject('errorGeneric');
        }else{
          return response;
        }
      });
    }
};

module.exports = Activation;
