# WS-Base II
### in accordance w/ the prophecy ...
Basic startingpoint for frontend-design-production.

## Tooling setup
1. [Download and install Node](https://nodejs.org/).
2. Install the Grunt command line tools, `grunt-cli`, with `npm install -g grunt-cli`.
3. From the root `/WS-Base-2` directory run `npm install` to install dependencies listed in `package.json`.
4. Optional: Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/), install [Bundler](http://bundler.io/) with `gem install bundler` and finally run `bundle install`. This will install all Ruby dependencies, such as Jekyll and plugins.
5. Download [JSVendor](https://github.com/SirAnselot/JSVendor), unpack and place one level above root `(WS-Base-2/../vendor)` to use in multiple repros, or inside root `/WS-Base-2/vendor` and adjust vendor path in package.json `config.files.js.vendor` from `../vendor` to `vendor`. To add, change or remove Vendor-Scripts of your custom-compilation, edit file `grunt/vendorBridge.json`.
