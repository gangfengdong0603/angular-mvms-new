angular.module('mvmsDirective', [])
  .directive('scroll', function($window, $document) {
    return function(scope, element, attrs) {
      var windowEl = angular.element($window);
      windowEl.bind('scroll', function() {
        scope.$apply(function() {
          scope[attrs.scroll] = $document[0].body.scrollTop;
        });
      });
    }
  })
  .directive('hLight', function() {
    var active;
    return function(scope, element) {
      // 鼠标按下高亮列表项
      angular.element(element).bind('mousedown', function() {
        if(active) angular.element(active).removeClass('active');
        angular.element(element).addClass('active');
        active = element;
      });
    }
  })
  .directive('sortable', function($document, $rootScope) {
    var Sortable = require('sortable/index');
    var indexof = require('yields-indexof/index');
    var sortable;
    return function(scope, element, attrs) {
      // 判断是否是当前列表最后一项，如果是，进行拖动绑定
      if(scope.$last) {
        if(sortable) {
          // 解除上一次列表的事件绑定
          if(attrs.class == 'item') sortable.unbind();
        }
        //console.log('初始化sortable对象..');
        var _sortable;
        _sortable = new Sortable(element.parent()[0]);
        //_sortable.els = _.toArray(_sortable.els);
        // 移除列表最后的编号项
        //_sortable.els.pop();
        // 指定clone的高度，根据当前移动元素的高度
        /*
        _sortable.on('start', function() {
          var _h = this.draggable.getBoundingClientRect().height
            , h = _h < 41 ? _h - 8: _h - 41;
          this.clone.style.height = h + 'px';
        });
        */
        // 绑定拖动事件
        _sortable.bind();
        // 拖动成功事件回调
        _sortable.on('update', function() {
          if(attrs.class == 'item')
            $rootScope.$broadcast('listChange', indexof(this.draggable), this.i);
          else
            $rootScope.$broadcast('swapNodes', indexof(this.draggable), this.i, attrs.class == 'platNode');
        });
        if(attrs.class == 'item') sortable = _sortable;
      }
    }
  })
  .directive('vrs', function() {
    return function(scope, element) {
      element.bind('change', function() {
        var cate_code = this.value;
        scope.item.channelBean.cid = myapp.vrs[cate_code];
      });
    }
  })
  .directive('check', function(Test) {
    return function(scope, element, attrs) {
      var config = scope.config[attrs.check];
      // 字段
      if(config.js_rule == 2) {
        if(config.value) {
          if(!/(至多)|(超过)|(最多)|(个字)/.test(config.value)) return;
          var match = config.value.match(/\d+/);
          if(match){ 
            match = match[0];
            element.bind('input', function() {
              if(!Test.isRightString(this.value, match)) {
                element.css({backgroundColor: 'red'})
              } else {
                element.css({backgroundColor: '#fff'})
              }
            });
          }
        }
      } else if(config.js_rule == 1) {
        element.bind('blur', function() {
          if(this.value == '') return;
          if(!Test.isUrl(this.value)) {
            element.css({backgroundColor: 'red'});
          }
        });
        element.bind('focus', function() {
          element.css({backgroundColor: '#fff'});
        });
      }
    }
  })
  .directive('upload', function($timeout, UploadPic) {
    var Upload = require('component-upload/index');
    return function(scope, element, attrs) {
      angular.element(element).bind('change', function() {
        function done() {
          $timeout(function() {
            angular.element(pro).remove();
          }, 3000);
        }
        function text(str, error) {
          pro.text(str);
          if(error) upload.emit('error');
        }
        var input = this;
        var pro = angular.element(input.parentElement.appendChild(document.createElement('span')));
        pro.addClass('progress');
        var file = input.files[0];
        var container = input.previousElementSibling; 
        var upload = new Upload(file);
        upload.on('error', function() {
          done();
        });
        // 只能上传图片
        if(!upload.file || !upload.file.type || !/image/.test(upload.file.type)) return text('只能上传图片!', 1);
        if(upload.file.size > 300 * 1024) return text('图片不能超过300k!', 1);
        upload.to('/cms/upload.do');
        upload.on('progress', function(e) {
          text(Math.ceil(e.percent) + '%');
        });
        upload.on('end', function(res) {
          done();
          if(!res.response) return;
          res = JSON.parse(res.response);
          if(res.length) {
            container.tagName == 'INPUT'
              ? (container.value = res[0])
              : (container.src = res[0]);
            if(attrs.upload) {
              var names = attrs.upload.split('.');
              function next(obj, i) {
                if(i == names.length-1) {
                  obj[names.pop()] = res[0];
                  return;
                }
                if(!obj[names[i]]) obj[names[i]] = {};
                next(obj[names[i]], ++i);
              }
              next(scope.item && scope || UploadPic.scope, 0);
            }
          }
        });
      });
    }
  })
  .directive('ngTarget', function() {
    return function(scope, element, attrs) {
      var t = attrs.ngTarget;
      if(!t) return;
      t = t.match(/(_\w+)(?:\s+)?:(?:\s+)?(.*)(?:\s+)?}/);
      if(t && t.length != 3) return;
      t = t.slice(1);
      var value;
      _.each(t[1].split('.'), function(v) {
        value = (value || scope)[v];
      });
      if(value) {
        element.attr({target: t[0]});
      }
    }
  })
  .directive('keyPress', function() {
    return function(scope, element, attrs) {
      element.bind('keypress', function(e) {
        if(e.keyCode == 13) {
          if(attrs.keyPress == 'button') {
            this.nextElementSibling.click();
          }
          else scope[attrs.keyPress]();
        }
      });
    }
  })
  // 对图片添加调整显示比例功能
  .directive('adjust', function($window, $http) {
    var ml, mt, controls;
    return function(scope, element, attrs) {
      element.bind('load', function() {
        this.style.marginLeft = -(ml = this.width / 2) + 'px';
        this.style.marginTop = -(mt = this.height / 2) + 'px';
      });
    }
  });
