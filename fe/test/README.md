# Testing on the browser

`npm run selenium` will launch all unit tests cointained in 
`test/browserstack/scripts/automate`.

The `gauge-displays` directory contains code created for determining layout
breakpoints across display devices and configurations. Though this code is not 
well organized nor easy to read, it's serving as the basis for running more 
tests directly in the browser through Browserstack using Selenium.

However, it still needs some heavy refactoring and cleanup.

A Github action is configured to run the Selenium tests on pull requests to the
`dev` branch. As a consequence, it's not recommended that commits be pushed
directly to the `dev` branch so that the tests can be run before merging. The
action can be found at `.github/workflows/browsersupport.yml` and may be
triggered to run in a Github action runner by adding `RUN_BROWSERSTACK`
anywhere in a commit message.

Test results for the original repository can be found here:
https://gist.github.com/NestaTestUser/8fb890ee1ebf84435539faa7996b140e .

Forks of the repository should be configured with the following action secrets
in `org/repo/settings/secrets/actions` in Github:

 * `BROWSERSTACK_USERNAME`: The account name to use in Browserstack.
 * `BROWSERSTACK_ACCESS_KEY`: The access key provided by Browserstack.
 * `BROWSERSTACK_GIST_TOKEN`: A Github token authorized to create Gists.

TODO:

 * Rewrite test runner in functional style, separating test-list generation from 
   test running.
 * Add Browserstack session & queue management.
 * Describe testing setup procedure on Browserstack and Github.
 * Run on all os/browser/version configurations available on Browserstack.
