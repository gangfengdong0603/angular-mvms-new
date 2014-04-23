build:
	@rm -fr release && mkdir -p release/stylesheets && mkdir release/partials/ && mkdir -p release/template/modal && mkdir release/javascripts
	@./node_modules/.bin/uglifyjs \
		bower_components/underscore/underscore-min.js \
		build/build.js  -o release/javascripts/release.js
	@cat bower_components/angular/angular.min.js bower_components/angular-route/angular-route.min.js >> release/javascripts/release.js
	@node support/build.js
	@./node_modules/.bin/uglifyjs \
		release/app.js \
		release/controller.js \
		release/directive.js \
		release/service.js \
		release/ui-bootstrap-custom-0.6.0.js >> release/javascripts/release.js
	@cp -fr public/images release
	@cat bower_components/normalize-css/normalize.css release/stylesheets/style.css | ./node_modules/.bin/cleancss -o /tmp/css_tmp \
		&& cp /tmp/css_tmp release/stylesheets/style.css && rm -f tmp/css_tmp
	@./tools/send

.PHONY: build
