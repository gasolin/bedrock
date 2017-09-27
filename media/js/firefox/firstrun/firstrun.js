/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (Mozilla) {
    'use strict';

    var animateSunrise = function () {
        var scene = document.getElementById('scene');

        var redirect = function(event) {
            document.getElementById('sunrise').removeEventListener('transitionend', redirect);
            if (event.propertyName === 'transform') {
                window.setTimeout(function () {
                    // Bug 1381051 sign in should redirect to about:home instead of about:newtab.
                    window.location.href = 'about:home';
                }, 200);
            }
        };

        var onVerificationComplete = function () {
            scene.dataset.signIn = 'true';
            document.getElementById('sunrise').addEventListener('transitionend', redirect, false);
        };

        Mozilla.UITour.getConfiguration('sync', function(config) {
            if (config.setup) {
                // skip showing the sign in form if the user is signed in
                document.getElementById('sky').addEventListener('transitionend', function(event) {
                    if (event.propertyName === 'opacity') {
                        scene.dataset.skipStep = 'true';
                        onVerificationComplete();
                    }
                }, false);
            } else {
                document.getElementById('sky').addEventListener('transitionend', function(event) {
                    if (event.propertyName === 'opacity') {
                        scene.dataset.modal = 'true';
                    }
                }, false);

                var skipbutton = document.getElementById('skip-button');
                skipbutton.onclick = onVerificationComplete;
                
                var hideOrShowSkipButton = function (data) {
                    switch(data.data.url) {
                    case 'signin':
                    case 'signup':
                    case 'reset_password':
                        skipbutton.disabled = false;
                        skipbutton.classList.remove('skipbutton-hidden');
                        break;
                    default:
                        skipbutton.classList.add('skipbutton-hidden');
                        break;
                    }
                };
        
                var disableSkipButton = function () {
                    skipbutton.disabled = true;
                };

                Mozilla.Client.getFirefoxDetails(function(data) {
                    Mozilla.FxaIframe.init({
                        distribution: data.distribution,
                        gaEventName: 'firstrun-fxa',
                        onVerificationComplete: onVerificationComplete,
                        onLogin: onVerificationComplete,
                        onFormEnabled: disableSkipButton,
                        onNavigated:  hideOrShowSkipButton
                    });
                });
            }
        });

        scene.dataset.sunrise = 'true';
    };

    document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
            animateSunrise();
        }
    };

})(window.Mozilla);
