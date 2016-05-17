(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('ReferralCtrl', ReferralCtrl);


    ReferralCtrl.$inject = ['$stateParams'];
    function ReferralCtrl($stateParams) {
        var vm = this;

        vm.referralLink = "http://fight.offtherecord.com/" + $stateParams.referralCode;
        var encodedReferralLink = encodeURIComponent(vm.referralLink);

        // ----- INTERFACE ------------------------------------------------------------

        vm.copyLink = copyLink;
        vm.emailLink = emailLink;
        vm.shareLinkOnFacebook = shareLinkOnFacebook;
        vm.tweetLink = tweetLink;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function copyLink() {
            var copyTextarea = document.querySelector('#share-link');
            copyTextarea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }
        }

        function emailLink() {
            window.location.href= "mailto:?subject=I think you'd find this app useful!" +
                "&amp;body=Off The Record lets you fight your traffic ticket from your phone in under a minute, " +
                "saving you hundreds of $$$ on car insurance. If they don't beat the ticket, it's free." +
                " \n\r\n\r" +
                encodeURI("https://offtherecord.com");
        }

        function shareLinkOnFacebook() {
            var fbShareUrl = "https://www.facebook.com/v2.5/dialog/share?app_id=545669822241752" +
                "&amp;caption=OFFTHERECORD.COM" +
                "&amp;description=Off%20the%20Record%20is%20the%20smart%2C%20easy%20way%20to%20fight%20your%20speeding%20tickets%20and%20moving%20violations.%20We%20win%20or%20its%20free!%20Login%20now%20to%20claim%20%2420%20credit%20on%20your%20first%20ticket.&amp;display=popup&amp;e2e=%7B%7D" +
                "&amp;href=" + encodedReferralLink +
                "&amp;locale=en_US" +
                "&amp;mobile_iframe=false" +
                "&amp;next=https%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D42%23cb%3Df1aebf1bc6ea7cc%26domain%3Dme.offtherecord.com%26origin%3Dhttps%253A%252F%252Fme.offtherecord.com%252Ff6869a4ca42bfc%26relation%3Dopener%26frame%3Df220ab47b69d5d4%26result%3D%2522xxRESULTTOKENxx%2522" +
                "&amp;picture=https%3A%2F%2Fs3.amazonaws.com%2Fotr-assets%2Fimg%2Ffriends-fight-speeding-tickets.jpg" +
                "&amp;sdk=joey" +
                "&amp;title=Get%20%2420%20off%20your%20next%20traffic%20ticket." +
                "&amp;url=http%3A%2F%2Ffight.offtherecord.com%2F" +
                "&amp;version=v2.5";

            window.open(fbShareUrl, '_blank');
        }

        function tweetLink() {
            var tweetUrl = "http://twitter.com/share?text=This app lets you " +
                "fight your traffic ticket from your phone in under a minute. If they don't win, it's free!" +
                "&url=" + encodedReferralLink +
                "&hashtags=fightyourticket,cleanrecord,offtherecordapp";

            window.open(tweetUrl, '_blank');
        }
    }
})();