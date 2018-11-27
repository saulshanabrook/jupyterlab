// URL to the web application.
exports.url = 'http://localhost:8888/lab';
// Runs your program in a loop. Each item in the array is a `state`. Each `state` has a "check"
// function, and a "next" function to transition to the next state in the loop. These run
// in the global scope of your web app.
// BLeak assumes that the app is in the first state when it navigates to the URL. If you specify
// optional setup states, then it assumes that the final setup state transitions the web app to
// the first state in the loop.
// The last state in the loop must transition back to the first.
exports.loop = [
  // First state
  {
    // Return 'true' if the web application is ready for `next` to be run.
    check: function() {
      return true;
      return (
        window.lab.shell.currentWidget == null ||
        window.lab.shell.currentWidget.constructor.name == 'MainAreaWidget'
      );
    },
    // Transitions to the next state.
    next: function() {
      var targLink = document.querySelector(
        '#filebrowser > div.p-Widget.jp-DirListing.jp-FileBrowser-listing.jp-mod-selected > ul > li:nth-child(28)'
      );
      var clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('dblclick', true, true);
      targLink.dispatchEvent(clickEvent);
    }
  },
  // Second (and last) state
  {
    check: function() {
      // Example: Make sure the body of the thread has loaded.
      return lab.shell.currentWidget.constructor.name == 'DocumentWidget';
    },
    // Since this is the last state in the loop, it must transition back to the first state.
    next: function() {
      lab.shell.currentWidget.close();
    }
  }
];

// (Optional) Number of loop iterations to perform during leak detection (default: 8)
exports.iterations = 8;

// (Optional) An array of states describing how to login to the application. Executed *once*
// to set up the session. See 'config.loop' for a description of a state.
exports.login = [];
//   {
//     check: function() {
//       // Return 'true' if the element 'password-field' exists.
//       return !!document.getElementById('password-field');
//     },
//     next: function() {
//       // Log in to the application.
//       const pswd = document.getElementById('password-field');
//       const uname = document.getElementById('username-field');
//       const submitBtn = document.getElementById('submit');
//       uname.value = 'spongebob';
//       pswd.value = 'squarepants';
//       submitBtn.click();
//     }
//   }
// ];
// (Optional) An array of states describing how to get from config.url to the first state in
// the loop. Executed each time the tool explicitly re-navigates to config.url. See
// config.loop for a description of states.
// exports.setup = [];
// (Optional) How long (in milliseconds) to wait for a state transition to finish before declaring an error.
// Defaults to 10 minutes
// exports.timeout = 30 * 1000;
// (Optional) How long (in milliseconds) to wait between a check() returning 'true' and transitioning to the next step or taking a heap snapshot.
// Default: 1000
// exports.postCheckSleep = 1000;
// (Optional) How long (in milliseconds) to wait between transitioning to the next step and running check() for the first time.
// Default: 0
// exports.postNextSleep = 0;
// (Optional) How long (in milliseconds) to wait between submitting login credentials and reloading the page for a run.
// Default: 5000
// exports.postLoginSleep = 5000;
// (Optional) An array of numerical IDs identifying leaks with fixes in your code. Used to
// evaluate memory savings with different leak configurations and the effectiveness of bug fixes.
// In the code, condition the fix on $$$SHOULDFIX$$$(ID), or add logic to `exports.rewrite` (see below),
// and BLeak will run the web app with the fixes applied.
// exports.fixedLeaks = [0, 1, 2];
// (Optional) Proxy re-write rule that runs in a Node.js environment, *not* in the browser.
// Lets you rewrite the web app's JavaScript/HTML/CSS to test bug fixes. Especially useful for evaluating
// fixes on web apps you do not control.
// Return a Node.js Buffer containing the replacement resource contents, or the original contents if not
// modifying.
// exports.rewrite = function(
//   url /* URL of the resource */,
//   type /* MIME type of resource */,
//   data /* Contents of resource, as a Node.js Buffer */,
//   fixes /* Array of numerical IDs corresponding to bug fixes that are active during the session (see fixedLeaks) */
// ) {
//   function hasFix(n) {
//     return fixes.indexOf(n) !== -1;
//   }
//   // Example: Filter out non-JavaScript resources.
//   if (type.indexOf('javascript') !== -1) {
//     if (url.indexOf('19/common.js') !== -1) {
//       let src = data.toString();
//       // Example: Replace a specific string in `19/common.js` to fix bug 0.
//       if (hasFix(0)) {
//         src = src.replace(
//           `window.addEventListener("scroll",a,!1)`,
//           'window.onscroll=a'
//         );
//       }
//       return Buffer.from(src, 'utf8');
//     }
//   }
//   return data;
// };
