angular.module('mvmsService', [])
  .factory('Config', function() {
    return {
      jsonp: true,
      root: 'http://10.10.52.197:50500'
      //root: 'http://10.10.52.197:9090'
      //root: 'http://10.2.9.97:8080'
      //root: 'http://10.10.76.30:9999'
      //'jsonp': false
    };
  })
  // 验证
  .factory('Test', function() {
    return {
      isUrl: function(url) {
        //return url.match(/^http:\/\/\w+(?:\.\w+)*\.\w+(?:\/?(?:\w+)?)*?(?:\/?\w+\.(?:html|shtml|htm|jsp))?(?:\/?\?(?:\w+=.*)?)?$/);
        // url规则比较混乱。。。所以匹配任何类型参数
        return url.match(/^http:\/\/\w+(?:\.\w+)*\.\w+(?:\/?(?:\w+)?)*?(?:\/?\w+\.(?:html|shtml|htm|jsp))?\/?.*$/);
      },
      isRightString: function(string, count) {
        var n = 0;
        var zh = string.match(/[^\x00-\x80]/g);
        if(zh) {
          n += zh.length;
        }
        var en = string.match(/[\x00-\x80]/g);
        if(en) {
          n += en.length / 2;
        }
        return Math.ceil(n) <= count;
      }
    };
  })
  .factory('AttrIndex', function() {
    return function(arr, attr) {
      if(!_.isEmpty(arr)) {
        return arr.slice(-1)[0][attr] + 1;
      }
      return  0;
    }
  })
  .factory('Move', function(swap, Tool, $rootScope) {
    return function(dir, s) {
      var list = Tool.list(s.list)
        , l = list.length
        , i = list.indexOf(s.item)
        , a;
      switch(dir) {
        case 'up':
          if(l == 1 || i == 0) return;
          a = i - 1;
          break;
        case 'down':
          if(l == 1 || i == l -1) return;
          a = i+1;
          break;
        case 'bottom':
          if(l == 1 || i== l -1) return;
          a = dir;
          break;
        case 'top':
          if(l == 1 || i == 0) return;
          a = dir;
          break;
      }
      $rootScope.$broadcast('listChange', a, i);
    };
  })
  .factory('Back', function($window, $document) {
    var body = $document[0].body;
    return {
      bottom: function() {
        body.scrollTop = body.scrollHeight;
      },
      top: function() {
        $window.scrollTo(0, 0);
      } 
    }
  })
  .factory('Tool', function() {
    return  {
      activate: function(item, list) {
        _.each(list, function(_item) {
          _item.active = false;
        });
        item.active = true;
      },
      list: function(data) {
        if(!data) return [];
        return _.isArray(data)
          ? data
          : data.plat_column_content_list;
      },
      copy: function(dest,src, filter) {
        var content_keys = filter || ['video_name', 'album_name', 'video_sub_name', 'album_sub_name', 'tip', 'label', 'latest_video_count', 'total_video_count'];
        var _dest = dest.content;
        Object.keys(src).forEach(function(key) {
          if(~content_keys.indexOf(key)) {
            if(key in _dest) 
              _dest[key] = src[key];
          } else {
            if(key in dest)
              dest[key] = src[key];
          }
        });
        return dest;
      },
      indexOfArray: function(arr, obj) {
        for(var i = 0; i < arr.length; i++) {
          if(angular.toJson(arr[i]) == angular.toJson(obj)) return i;
        }
        return -1;
      },
      without: function(arr, index) {
        var a = arr.slice(0, index);
        var b  = arr.slice(index+1);
        arr = a.concat(b);
        return arr;
      },
      clone: function(Obj) {
        var buf;  
        if (Obj instanceof Array) {
          buf = [];  //创建一个空的数组 
          var i = Obj.length;
          while (i--) {
            buf[i] = this.clone(Obj[i]);
          }   
          return buf; 
        }else if (Obj instanceof Object){
          buf = {};  //创建一个空对象 
          for (var k in Obj) {  //为这个对象添加新的属性 
            buf[k] = this.clone(Obj[k]);
          }   
          return buf;   
        }else{   
          return Obj;   
        }     
      }
    }
  })
  .factory('store', function() {
    return require('yields-store/index');
  })
  .factory('All', function() {
    return function (arr) {
      if(arr.checked) 
        _.each(arr, function(item) {
          item.checked = false;
        });
      else {
        _.each(arr, function(item) {
          item.checked = true;
        });
      }
      arr.checked = !arr.checked;
    };
  })
  .factory('adjustNode', function(swap) {
    return function(nodes, di, i) {
      var min = Math.min.call(null, i, di);
      var max = Math.max.call(null, i, di);
      if(di == max) 
        for(var j = min; j < max; j++)
          swap(nodes, j, j+1);
      else
        for(var k = max; k > min; k--) 
          swap(nodes, k, k-1);
    }
  })
  // global service
  .factory('Shit', function(Tool, $document, Plat, Back, Move, $modal, $rootScope, swap, store, Tree, adjustNode) {
    var d = $document[0];
    $rootScope.$on('swapNodes', function(e, di, i, isPlatNode) {
      if(isPlatNode)
        adjustNode(Plat.plats, di, i);
      else  {
        adjustNode($rootScope.node.nodes, di, i);
      }
    });
    return  {
      clientWidth: d.documentElement.clientWidth,
      clientHeight: d.documentElement.clientHeight,
      // 平台初始化显示个数
      platInit: Plat.init,
      activeNav: Plat.activeNav.bind(Plat),
      scroll: 0,
      getUrl: function(node, params) {
        url = node.url;
        if(url && ~url.indexOf('column_id')) {
          var column_id = url.split('column_id=')[1]; 
          return '/content/' + column_id + '?cate_code=' + node.cate_code;
        }
        return url;
      },
      backTop: Back.top,
      moveUp: Move.bind(Move, 'up'),
      moveDown: Move.bind(Move, 'down'),
      moveBottom: Move.bind(Move, 'bottom'),
      moveTop: Move.bind(Move, 'top'),
      logs: function(s) {
        $modal.open({
          windowClass: 'logs',
          templateUrl: '/partials/logs.html',
          controller: function($scope, $http, $modalInstance) {
            $scope.item = s.item;
          }
        });
      },
      editNodes: function(s) {
        $modal.open({
          windowClass: 'editNodes',
          templateUrl: '/partials/editNodes.html',
          controller: function($scope, $http, $modalInstance, $rootScope) {
            $scope.node = $rootScope.node = s;
            //console.log(s.nodes.map(function(node) {return node.id;}));
            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
            $scope.ok = function() {
              var save = s.nodes.map(function(item) {return item.id});
              store.set('siderNode-' + s.id, save);
              $modalInstance.close(true);
            };
          }
        });
      },
      // 应用到其他平台
      applyOthers: function(s) {
        $modal.open({
          windowClass: 'otherPlats',
          templateUrl: '/partials/otherPlats.html',
          controller: function($scope, $http, $modalInstance, All) {
            function resume() {
              // 标记是否已经选择
              $scope.other_plats.checked = true;
              // 取消选择
              $scope.all($scope.other_plats);
            }
            $scope.all = All;

            // 显示平台
            // 勾选other_plats里的平台(checked属性true）
            // 返回修改过的平台数组到页面
            $scope.other_plats = Plat.plats.filter(function(item) {
              if(item.plat != Plat.plat.plat) {
                if(_.isArray(s.item.other_plats))
                  if(~s.item.other_plats.indexOf(item.plat))
                    item.checked = true;
                return true;
              } else  
                return false;
            });
            //console.log($scope.other_plats.filter(function(item) {return item.checked}));

            // 确定
            $scope.ok = function() {
              // 重新读取other_plats的平台号
              s.item.other_plats = _.map(_.filter($scope.other_plats, function(obj) {
                return obj.checked;
              }), function(obj) {
                return obj.plat;
              });

              resume();

              $modalInstance.close(true);
            };

            // 取消
            $scope.cancel = function() {
              resume();
              $modalInstance.dismiss('cancel');
            };

            $modalInstance.result.then(function() {
            }, function() {
              resume();
            });
          }
        });
      },
      // 图片浏览
      view: function(e) {
        var src = e.target.src;
        if(!src) return;
        $modal.open({
          windowClass: 'imageView',
          templateUrl: '/partials/imageView.html',
          controller: function($scope) {
            //var img = new Image();
            //img.src = src;
            //$scope.img = img;
            $scope.src = src;
            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
          }
        });
      },
      // 切换平台顺序
      swapPlat: function(list) {
        $modal.open({
          windowClass: 'swapPlat',
          templateUrl: 'swapPlat.html',
          controller: function($scope, $modalInstance, $rootScope, swapPlat) {
            $scope.plats = Plat.plats;
            $scope.save = function() {
              var save = Plat.plats.map(function(item) {return item.plat});
              store.set(swapPlat(list)[list.name](), save);
              $modalInstance.close(true);
            };
            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
          }
        });
      }
    };
  })
  .factory('swapPlat', function() {
    return function(list) {
      return {
        video: function() {
          return list.name + '-' + list.list_arg.column_id + '-plat';
        },
        column: function() {
          return list.name + '-' + list.list_arg.cate_code + '-plat';
        },
        channel: function() {
          return list.name + '-plat';
        },
        firstStart: function() {
          return list.name + '-plat';
        },
        pluginManage: function() {
          return list.name + '-plat';
        },
        appPics: function() {
          return list.name + '-plat';
        },
        appList: function() {
          return list.name + '-plat';
        }
      }
    }
  })
  // 顶部通知服务
  .factory('Msg', function($rootScope, $timeout) {
    function Msg(config) {
      if(!(this instanceof Msg)) return new Msg;
      _.extend(this, config || {});
      this.stack = [];
      this.timeout = 3000;
    }
    Msg.prototype.add = function(obj) {
      var arr = this.stack;
      var last = arr[arr.length - 1];
      if(arr.length) {
        // 同一类型的通知
        if(last.type == obj.type) {
          last.msg = obj.msg;
          last.status = obj.status;
          if(last.timeout) {
            $timeout.cancel(last.timeout);
          }
        } else {
          arr.push(obj);
        }
      }
      else {
        arr.push(obj);
      }

      if(arr[arr.length - 1].status) {
        this.remove(arr[arr.length - 1]);
      }
      return this;
    };
    Msg.prototype.remove = function(obj) {
      var self = this;
      obj.timeout = $timeout(function() {
        _.each(self.stack, function(item, i) {
          if(_.isEqual(item, obj)) {
            var a = self.stack.slice(0, i);
            var b = self.stack.slice(i+1);
            self.stack = a.concat(b);
          }
        });
      }, this.timeout);
    };
    $rootScope.msgs = new Msg();
    return $rootScope.msgs;
  })
  .factory('List', function($http, Config) {
    function List(config) {
      if(!(this instanceof List)) return new List(config);
      // 请求时长
      this.timeout = 10000;
      // 请求方式
      this.method = 'GET';
      _.extend(this, Config);
      _.extend(this, config);
    }
    List.prototype = {
      query: function(params, success_cb, error_cb, url) {
        // 没有查询参数
        if(_.isFunction(params)) {
          if(arguments.length == 3) {
            // 指定url
            url = error_cb;
          }
          error_cb = success_cb;
          success_cb = params;
          params = {};
        }

        // 指定url
        if(url) this.listUrl = url;

        // 跨域测试
        if(this.jsonp) {
          this.method =  'JSONP';
          params.callback = 'JSON_CALLBACK';
          if(!~this.listUrl.indexOf('http')) {
            this.listUrl = this.root + this.listUrl;
          }
        }

        $http({url: this.listUrl, method: this.method, params: params, timeout: this.timeout})
          .success(success_cb)
          .error(error_cb);
      }
    };
    return List;
  })
  .factory('ListProvider', function(List, Plat, $rootScope, Msg, Tool, Tree, $location, $http, swap, $timeout, store, swapPlat, Post) {
    var listService = myapp.list_service; 
    var pagins = ['video', 'appList', 'appPics'];
    var obj;
    $rootScope.$on('platChange', function() {
      obj.loadList({plat: Plat.plat.plat, page_index: 1});
      Plat.listProvider = obj;
    });
    // 拖动成功事件监听， 对当前视图绑定的列表数组进行重新排序
    // di: draggable index,
    // i: target index
    $rootScope.$on('listChange', function(e, di, i) {
      function change(di, i) {
        var min = Math.min.call(null, i, di);
        var max = Math.max.call(null, i, di);
        if(di == max) 
          for(var j = min; j < max; j++)
            swap(obj.list.plat_column_content_list || obj.list, j, j+1);
        else
          for(var k = max; k > min; k--) 
            swap(obj.list.plat_column_content_list || obj.list, k, k-1);
        // 重新渲染
        obj.list_cb.call(obj, obj.list);
      }
      function list(item) {
        return {
          l: Tool.list(obj.list).length
        }
      }
      if(typeof di == 'string') {
        if(di == 'top') {
          var index = i;
          if(index == 0) return;
          for(var i = index; i > 0; i--) { 
            change(i-1, i);
          }
        } else if(di == 'bottom') {
          var index = i
            , l = Tool.list(obj.list).length;
          if(index == l-1) return;
          for(var i = index; i < l-1; i++) { 
            change(i+1, i);
          }
        } 
      }
      else {
        change(di, i);
      }
    });
    return function ListProvider(name, remove, _config) {
      var config;
      if(_config) {
        config = _config;
      }

      if(remove) {
        if(typeof remove == 'object') {
          config = remove;
          remove = false;
        }
      }

      if(!config) config = listService[name];

      var list = List(config);

      var tmp = _.extend(config, {
        name: name,

        page_index: 1,

        page_size: 20,

        loading: false,

        loadMore: function() {
          if(obj.loading || !obj.more) return;
          obj.loadList({page_index: ++this.config.page_index}, true);        
        },

        platList: ~['channel', 'column', 'video', 'firstStart', 'pluginManage', 'appList', 'appPics'].indexOf(name),

        search: ~['key', 'id', 'url'].indexOf(name),

        list: function(cb, arg) {
          this.list_cb = cb;
          this.list_arg = arg || {};
          if(~pagins.indexOf(this.name)) {
            this.list_arg.page_index = this.page_index;
            this.list_arg.page_size = this.page_size;
          }
          return this;
        },

        isChange: function() {
          var list = this.list.plat_column_content_list || this.list
            , _list = this.list_ori.plat_column_content_list || this.list_ori
          return angular.toJson(list) != angular.toJson(_list);
        },

        save: function() {
          if(this.disable) return;
          var self = this;
          var save;
          var _save;
          var list = this.list.plat_column_content_list || this.list
            , _list = this._list.plat_column_content_list || this._list
            , flag = 0;

          if (list)
            if(JSON.stringify(list).match(/ERROR/)) {
              Msg.add({msg: '请填写所有必填项!', type: 'list', status :1});
              return;
            }

          if(this.config.status != 0) {
            _.each(list, function(item, i) {
              if(item.status == 0) {
                flag++;
                return;
              }
              item.priority = i - flag;
            });
          } 
          /*
          else {
            _.each(list, function(item, i) {
              if(item.status == 1) {
                flag++;
                return;
              }
              item.priority = i - flag;
            });
          }
          */

          save = _.filter(list, function(obj, i) {
            return angular.toJson(obj) != angular.toJson((_list)[i]);
          });

          if(save.length) {
            this.disable = true;
            if(!_.isArray(this.list)) {
              var tmp = Tool.clone(this.list);
              tmp.plat_column_content_list = save;
              save = tmp;
            }

            _save = JSON.parse(angular.toJson(save));

            Post(this.saveUrl, _save, 'list', function(res) {
              self.disable = false;

              // 如果返回id数组
              // 保存服务端返回的id
              if(res && !_.isEmpty(res.ids)) {
                var j = 0;
                if(self.name == 'column') {
                  _.each(save, function(item) {
                    // 只保存给新建的项目
                    if(!item.id) {
                      item.id = res.ids[j]['id'];
                      item.videoColumn.id = item.column_id = res.ids[j]['column_id'];
                      j++;
                    }
                  });
                } else if(self.name == 'video') {
                  _.each(save.plat_column_content_list, function(item) {
                    // 只保存给新建的项目
                    if(!item.id) {
                      item.id = res.ids[j]['id'];
                      item.content_id = item.content.id = res.ids[j]['content_id'];
                      j++;
                    }
                  });
                } else if(self.name == 'firstStart' || self.name == 'pluginManage' || self.name == 'appPics' || self.name == 'appList') {
                  _.each(save, function(item) {
                    if(!item.id) {
                      item.id = res.ids[j]['id'];
                      item.identification = res.ids[j]['identification'];
                      j++;
                    }
                  })
                }
              }

              // 去除状态变化的项
              list = _.filter(list, function(item) {
                return item.status == (self.config.status != undefined ? self.config.status :  1);
              });
              if(_.isArray(self.list)) self.list = list;
              else self.list.plat_column_content_list = list;
              self._list = Tool.clone(self.list);
              self.list_ori = Tool.clone(self.list);

              // 重新指定scope
              self.list_cb(self.list);

            }, function() {
              self.disable = false;
            });
          } else Msg.add({msg: '无修改提交!', type: 'list', status: 1});
        },
        error: function(error) {
          Plat.plat.error = true;
        },
        success: function() {
          Plat.plat.error = false;
        },
        loadList: function(config, append) {
          var self = this;
          config = config || {};
          var msg;
          if(!append) {
            if(this.platList) {
              msg = '更新列表中...';
            } else if(this.search) {
              msg = '搜索中...';
            } else if(this.name == 'cateApi') {
              msg = '获取分类中...';
            }
          }
          if(msg) {
            Msg.add({msg: msg, type: 'list', status: 0});
          }
          this.config = _.extend(this.list_arg || {}, config); 
          this.loading = true;
          list.query(this.config, function(data, status) {
            if(status == 200) {
              self.loading = false;
              // 成功后执行
              var list, _list;
              if(self.platList) {
                self.success();
                var list = data;
                var _list = Tool.clone(list);
                // 对有效列表重新排序
                if (self.config.status != 0) {
                  try {
                    _.each(list.plat_column_content_list || list, function(item, i) {
                      item.priority = self.page_size * ((self.config.page_index || self.page_index) - 1) + i;
                    });
                  } catch(e) {};
                }
              } else list = data;

              if(!append) {
                self.list = list;
                self._list = _list;
                self.list_cb.call(self, self.list);
                if(self.platList)
                  if(Tool.list(list).length >= self.page_size)
                    self.more = true;
                  else 
                    self.more = false;
              } else {
                if(_.isArray(data)) {
                  if(!_.isEmpty(list)) {
                    self.list = self.list.concat(list);
                    self._list = self._list.concat(_list);
                    if(list.length >= self.page_size)
                      self.more = true;
                    else 
                      self.more = false;
                  }
                  else { 
                    --self.config.page_index;
                    self.more = false;
                  }
                } else {
                  if(!_.isEmpty(list.plat_column_content_list)) {
                    self.list.plat_column_content_list = self.list.plat_column_content_list.concat(list.plat_column_content_list);
                    self._list.plat_column_content_list = self._list.plat_column_content_list.concat(_list.plat_column_content_list);
                    if(Tool.list(list).length >= self.page_size)
                      self.more = true;
                    else 
                      self.more = false;
                  }
                  else {
                    --self.config.page_index;
                    self.more = false;
                  }
                }
              }
              self.list_ori = Tool.clone(self.list);

              if(!append) {
                if(self.platList) {
                  if(_.isEmpty(Tool.list(data))) {
                    msg = '列表为空。。';
                  } else {
                    msg = '更新列表成功!';
                  }
                } else if(self.search) {
                  msg = '搜索完毕!';
                } else if(self.name == 'cateApi') {
                  if(!self.list.data) {
                    msg = '分类为空。。';
                  } else {
                    msg = '获取分类完毕!';
                  }
                }
              } 

              if(msg) Msg.add({msg: msg, type: 'list', status: 1});

              if(self.platList && !append && !config.changeStats) {
                if(!Tree.click) {
                  var path = $location.$$path;
                  var pathArray = path.split('/');
                  if(pathArray.length == 3) {
                    if(pathArray[1] == 'content') {
                      Tree.find('客户端', function(node) {
                        this.load(node, function(node) {
                          var self = this;
                          _.each(node.nodes, function(node) {
                            if(node.cate_code == data.plat_channel_column.cate_code) {
                              self.load(node, function(node) {
                                _.each(node.nodes, function(node) {
                                  if(node.id == pathArray[2]) {
                                    self.load(node);
                                  }
                                });
                              });
                            }
                          });
                        });
                      });
                    } else {
                      var map = {
                        'others': '其他',
                        'appManage': '应用管理'
                      };
                      Tree.find(map[pathArray[1]] || pathArray[1], function(node) {
                        this.load(node, function(node) {
                          var self = this;
                          _.each(node.nodes, function(node) {
                            if(~node.url.indexOf(pathArray[2])) {
                              self.load(node);
                            }
                          });
                        })
                      });
                    }
                  } else {
                    Tree.find(pathArray[1], function(node) {
                      this.load(node);
                    });
                  }
                }
                Tree.click = false;
              }
            } else {
              Msg.add({msg: '服务器请求出错..', type: 'list', status: 1});
              self.loading = false;
              if(self.platList)
                self.error();
            }
          }, function() {
            Msg.add({msg: '网络请求失败, 请重试..', type: 'list', status: 1});
            self.loading = false;
            if(self.platList)
              self.error();
          });
        },
        plat: function(cb, arg) {
          var self = this;
          Plat.query(arg || {}, function(data, status) {
            if(status == 200) {
              if(_.isEmpty(data)) {
                Msg.add({msg: '平台为空...', type: 'list', status: 1});
                return;
              } 
              if(pc = store.get(swapPlat(self)[self.name]())) {
                if(data && data.length == pc.length) {
                  var _data = [];
                  _.each(pc, function(v, i) {
                    _.each(data, function(item) {
                      if(item.plat == v) _data[i] = item;
                    });
                  });
                  data = _data;
                }
              }
              cb(data);
              Plat.platChange.call(Plat, data, 0);
              Plat.plats = data;
            } else {
              cb([{name: '平台加载出错...请点此刷新重试..', error: true}]);
            }
          });
          return this;
        }
      });
      return remove ? tmp : (obj = tmp);
    }
  })
  .factory('swap', function() {
    return function (arr, index1, index2) {
      var i = arr[index1]
        , j = arr[index2];
      arr[index1] = j;
      arr[index2] = i;
      return arr;
    }
  })
  // 平台服务
  .factory('Plat', function(Tool, List, $rootScope, swap, Tree) {
    return Object.create(_.extend({
      init: 5,
      //listUrl: '/datas/plat.json',
      listUrl: '/plat/list.do',
      platChange: function(plats, i) {
        (this.plat = plats[i]).active = true;
        $rootScope.$broadcast('platChange');
      },
      activeNav: function(plats, i) {
        if(this.listProvider.isChange()) 
          if(!window.confirm('列表已有改动，您确定不保存吗?'))
            return;
        Tree.click = true;
        // 交换位置
        if(i >= this.init) {
          var active = this.active || 0;
          plats = swap(plats, i, active);
          this.platChange(plats, active);
        } else {
          this.active = i;
          Tool.activate(plats[i], plats);
          this.platChange(plats, i);
        }
      },
    }, new List));
  })
  .factory('Tree', function($http, List, Msg, store) {
    return {
      init: function() {
        _.extend(this, new List());
        return (this.tree = myapp.tree);
      },
      error: function() {
        Msg.add({msg: '菜单网络请求失败，请重试..', type: 'tree', status: 1});
      },
      // 打开节点或节点列表
      load: function(node, cb) {
        this.click = true;
        var self = this;
        function done() {
          // 如果是激活列表，则关闭同级其他列表
          if(node.active = !node.active) {
            self.find(self.tree, node, function(finds) {
              _.each(finds, function(find) {
                if(!find.child_url) {
                  if(node.child_url) return;
                }
                find.active = false;
              });
            });
          }
        }
        function show(ctx, node) {
          done();
          if(node.active) {
            var nodes = node.nodes;
            var _sort = nodes.map(function(n) { return n.id;});
            var sort = store.get('siderNode-' + node.id);
            if(!_.isEmpty(sort)) {
              var _data = [];
              _.each(sort, function(v, i) {
                _.each(nodes, function(item) {
                  if(item.id == v) _data.push(item);
                });
              });
              var news = _.difference(_sort, sort);
              news = _.filter(nodes, function(node) {
                return ~news.indexOf(node.id);
              });
              if(news.length) {
                node.nodes = _data.concat(news);
                store.set('sliderNode-' + node.id, sort);
              } else {
                node.nodes = _data;
              }
            }
            cb && cb.call(ctx, node);
          }
        }
        if(node.child_url) {
          if(!node.nodes) {
            this.query(function(data) {
              node.nodes = data;
              show(self, node);
              //done();
              //cb && cb.call(self, node);
            }, this.error, node.child_url);
           return false;
          }
        }
        if(node.nodes) {
          show(this, node);
          //done();
          //cb && cb.call(this, node);
          return false;
        }
        if(!node.active) {
          done();
          cb && cb.call(self, node);
          (this.link || {}).active = false;
          this.link = node;
        }
        return true;
      },
      // 通过节点找同级节点列表
      find: function(base, node, fn) {
        if(!fn) {
          fn = node;
          node = base;
          base = this.tree;
        }
        var self = this;
        var find;
        var subs = [];

        for(var i = 0, l = base.length; i < l; i++) {
          var item = base[i];
          if(node.name) {
            if(_.isEqual(node, item)) {
              fn(_.filter(base, function(find) {return !_.isEqual(find, node)}));
              return true;
            }
          } else {
            if(new RegExp(node).test(angular.toJson(item))) {
              fn.call(this, item);
            }
          }
          if(item.nodes) subs.push(item.nodes);
        }
        for(var j = 0, k = subs.length;j < k; j++) {
          if(this.find(subs[j], node, fn)) return;
        }
      }
    };
  })
  .factory('UploadPic', function() {
    return {};
  })
  .factory('addVideo', function($modal, ListProvider, Back, $timeout) {
    return function(rec_cb, item) {
      $modal.open({
        windowClass: 'video',
        templateUrl: '/partials/addVideo.html',
        controller: function($scope, $http, $modalInstance) {
          $scope.search = {
            keyword: '',
            fee: -1,
            o: 1,
            //all: -1,
            all: 0, // 站内
            //cate: -1,
            //relation: -1,
            c: 1,
            t: 0,
            isUrl: 0
          };

          // 关键字搜索
          $scope.searchByKey = function() {
            ListProvider('key', true)
              .list(function(data) {
                $scope.list = data;
              },{
                k: $scope.search.keyword,
                fee: $scope.search.fee,
                o: $scope.search.o,
                all: $scope.search.all
              }).loadList();
          };

          // url搜索
          $scope.searchByUrl = function() {
            ListProvider('url', true)
              .list(function(data) {
                $scope.list = data;
              }, {
                t: $scope.search.isUrl,
                url: $scope.search.url
              }).loadList();
          };
          // id搜索
          $scope.searchById = function() {
            ListProvider('id', true)
              .list(function(data) {
                $scope.list = data;
              }, {
                c: $scope.search.c,
                t: $scope.search.t,
                id: $scope.search.id,
                isUrl: 1
              }).loadList();
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.item = item;
          $scope.recommend = function(i) {
            rec_cb.call($scope, i);
            $scope.cancel();
            $timeout(function() {
              Back.bottom();
            }, 0);
          };
        }
      });
    }
  })
  .factory('Post', function($http, Msg) {
    return function(saveUrl, save, type, success_cb, error_cb) {
      function msg(_msg, status) {
        Msg.add({msg: _msg, type: type, status: status});
      }
      function error() {
        msg('保存失败..请重试', 1);
        error_cb && error_cb();
      }
      msg('保存中..', 0);
      $http.post(saveUrl, save)
        .success(function(res, status) {
          if(status == 200 && res.ok) {
            msg('保存成功!', 1);
            success_cb && success_cb(res);
          } else error();
        })
        .error(error);
    }
  });
