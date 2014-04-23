angular.module('mvmsController', [])
  .controller('rootCtrl', function(Tree, ListProvider, Test) {
    if(!Tree.click) {
      Tree.find('首页', function(node, others) {
        Tree.load(node);
      })
    }
    Tree.click = false;
  })
  // 常用全局数值供整个页面使用, 其他controller调用访问Shit服务
  .controller('pageCtrl', function($scope, $element, Shit, $window, $document) {
    _.each(Shit, function(v, i) {
      $scope[i] = v;
    });
    var a = '关闭侧边栏', b = '打开侧边栏';
    $scope.ftitle = a;
    $scope.fullscreen = function() {
      $element.toggleClass('fullscreen');
      $scope.ftitle = /关/.test($scope.ftitle) ? b : a;
    };
    angular.element($window).bind('resize', function() {
      if(+getComputedStyle(document.body).width.split('px')[0] <= 1338) {
        if($element.hasClass('manual')) return;
        if(!$element.hasClass('fullscreen'))
          $element.addClass('fullscreen manual');
      } else {
        if($element.hasClass('manual'))
          $element.removeClass('fullscreen manual');
      }
    });
  })
  // 左侧导航控制, 最大高度参考顶部高度(减去), 底部留出10px
  .controller('sliderCtrl', function($scope, Tree, $element, Shit, $window, $document) {
    var resize;
    (resize = function() {
      $element.css({'height': $document[0].documentElement.clientHeight - 140 + 'px'});
    })();
    angular.element($window).bind('resize', resize);
    $scope.nodes = Tree.init();
    $scope.load = function(node) {
      if(!node.new) {
        Tree.load.call(Tree, node);
      }
    }
  })
  .controller('appListCtrl', function($scope, ListProvider, AttrIndex, Plat) {
    $scope.listShow = true;
    $scope.listProvider = ListProvider('appList')
      .plat(function(plats) {
        $scope.plats = plats;
      })
      .list(function(data) {
        $scope.list = data;
      });

    $scope.adds = [{name: '添加应用'}];

    $scope.add = function() {
      $scope.list.push(myapp.models.hotApp(2, AttrIndex($scope.list, 'priority'), Plat.plat.plat));
    };

    $scope.changeStatus = function(item, e) {
      item.status = -(item.status-1);
      if(item.status == 1) {
        item.priority = ($scope.listProvider.config.page_size || 1) - 1;
      }
      if(item.status == 1) {
        e.target.classList.add('on');
      } else 
          e.target.classList.remove('on');
    };
    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });
  })
  .controller('appPicsCtrl', function($scope, ListProvider, AttrIndex, Plat) {
    $scope.listShow = false;
    $scope.listProvider = ListProvider('appPics')
      .plat(function(plats) {
        $scope.plats = plats;
      })
      .list(function(data) {
        $scope.list = data;
      });

    $scope.adds = [{name: '添加推荐应用'}];

    $scope.add = function() {
      $scope.list.push(myapp.models.hotApp(1, AttrIndex($scope.list, 'priority'), Plat.plat.plat));
    };

    $scope.changeStatus = function(item, e) {
      item.status = -(item.status-1);
      if(item.status == 1) {
        item.priority = ($scope.listProvider.config.page_size || 1) - 1;
      }
      if(item.status == 1) {
        e.target.classList.add('on');
      } else 
          e.target.classList.remove('on');
    };
    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });
  })
  .controller('pluginManageCtrl', function($scope, ListProvider, addVideo, $modal, AttrIndex, Plat, Back, $timeout) {
    $scope.listShow = true;
    $scope.adds = [
      {name: '添加活动'}
    ];

    $scope.add = function() {
      $scope.list.push(myapp.models.plugin(AttrIndex($scope.list, 'priority'), Plat.plat.plat));
      $timeout(function() {
        Back.bottom();
      }, 0);
    };

    $scope.upload = function(scope) {
      $modal.open({
        windowClass: 'mutlUpload',
        templateUrl: 'mutlUpload.html',
        controller: function($scope, $http, $modalInstance, UploadPic) {
          UploadPic.scope = scope;
          $scope.item = scope.item;
          $scope.ok= function() {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

    $scope.listProvider = ListProvider('pluginManage')
      .plat(function(plats) {
        $scope.plats = plats;
      })
      .list(function(data) {
        $scope.list = data;
      });

      $scope.changeStatus = function(item, e) {
        item.status = -(item.status-1);
        if(item.status == 1) {
          item.priority = ($scope.listProvider.config.page_size || 1) - 1;
        }
        if(item.status == 1) {
          e.target.classList.add('on');
        } else 
            e.target.classList.remove('on');
      };
      $scope.stats = 1;
      $scope.$watch('stats', function(a, b) {
        // 切换状态
        if(a != b) {
          $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
        }
      });
  })
  .controller('firstStartManageCtrl', function($scope, ListProvider, addVideo, Plat, Tool, AttrIndex, $modal) {
    $scope.listShow = true;

    $scope.upload = function(scope) {
      $modal.open({
        windowClass: 'mutlUpload',
        templateUrl: 'mutlUpload.html',
        controller: function($scope, $http, $modalInstance, UploadPic) {
          UploadPic.scope = scope;
          $scope.item = scope.item;
          $scope.ok= function() {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

    $scope.adds = [
      {name: '添加视频'}
    ];
    $scope.listProvider = ListProvider('firstStart')
      .plat(function(plats) {
        $scope.plats = plats;
      })
      .list(function(data) {
        $scope.list = data;
      });
    function rec_cb(i) {
      var rec = Tool.copy(myapp.models.firstVideo(Plat.plat.plat, AttrIndex($scope.list, 'priority')), this.list[i], [])
      this.item.list.push(rec);
    }

    $scope.changeStatus = function(item, e) {
      item.status = -(item.status-1);
      if(item.status == 1) {
        item.priority = ($scope.listProvider.config.page_size || 1) - 1;
      }
      if(item.status == 1) {
        e.target.classList.add('on');
      } else 
          e.target.classList.remove('on');
    };

    $scope.add = function() {
      addVideo(rec_cb, $scope);
    };

    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });
  })
  .controller('channelConfigCtrl', function($scope, $modal, Tool, $timeout, ListProvider, $http) {
    $scope.config = function() {
      $modal.open({
        windowClass: 'modal-channel',
        templateUrl: 'channelConfig.html',
        controller: function($scope, $modalInstance, item, Post) {
          $scope.item = item;
          // 测试
          //item.channelBean.cate_api = 'http://api.tv.sohu.com/music/category.json';
          // 取消
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
          //选取全部
          $scope.allSelect = function() {
            if($scope.all) {
              //console.log('取消全部');
              var index = (function() {
                for(var i = 0; i < $scope.selects.length;i++) {
                  if(~angular.toJson($scope.selects[i]).indexOf('全部')) return i;
                }
              })();
              $scope.selects = Tool.without($scope.selects, index);
              $scope.all = false;
              //console.log($scope.selects)
            } else {
              $scope.all = true;
              //console.log('选取全部');
              $scope.selects.push({
                cateAlias: '',
                cateName: '',
                cateValue: '全部',
                searchKey: ''
              });
            }
          };
                   
          // 添加选项
          $scope.addSelect = function(cate, c) {
            var select = {
              cateAlias: cate.cate_alias,
              cateName: cate.cate_name,
              cateValue: c.name,
              searchKey: c.search_key
            };

            if(c.select) {
              //console.log('选中');
              $scope.selects.push(select);
            } else {
              //console.log('未选中');
              $scope.selects = _.filter($scope.selects, function(item) {
                return item.searchKey != select.searchKey;
              });
            }
          };

          $timeout(function() {
            var url;
            var first;
            ($scope.getApi = function() {
              var config = {
                listUrl: item.channelBean.cate_api
              };
                if(!config.listUrl) return;
                //if(config.listUrl.match(/\.(\w+)\.com/)[1] != document.domain.match(/\.(\w+)\.com/)[1]) return;

                url = url || config.listUrl;
                first = url == config.listUrl;
                config.jsonp = true;
                ListProvider('cateApi', true, config)
                  .list(function(data) {
                    if(!data.data) return;

                    $scope.cateSort = {};                                      
                    if(first) {
                      $scope.selects = item.channelBean.common_cate || [];    
                      $scope.all = !!(~angular.toJson($scope.selects).indexOf('全部'));           
                    } else {
                      $scope.selects = [];
                      $scope.all = false;
                    }
                    _.each($scope.selects, function(select, i) {               
                      $scope.cateSort[select.cateValue] = i;                   
                    });                                                        

                    _.each($scope.selects,function(select) {
                      _.each(data.data.categorys, function(list) {
                        _.each(list.cates, function(cate) {
                          if(cate.search_key == select.searchKey)
                            cate.select = true;
                        });
                      });
                    });
                    $scope.categorys = data.data.categorys;                        
                  }, {
                    plat: 1,
                    api_key: '0c8e093a4535ef10d40d21d396d7477e'
                  })
                  .loadList();
            })();
          }, 300);

          $scope.save= function() {
            var self = this;
            _.each($scope.selects, function(select) {
              select.sort = $scope.cateSort[select.cateValue];
            });            
            var save = {
              cate_code: item.cate_code,
              cate_api: item.channelBean.cate_api,
              v3_cate_api: item.channelBean.v3_cate_api,
              common_cate: $scope.selects
            };
            save.common_cate = _.sortBy(save.common_cate, function(item) {return item.sort});
            for(var i = 0, l = save.common_cate.length; i < l; i++) delete save.common_cate[i].sort;
            Post('/channel/save.do', save, 'channelConfig', function() {
              item.channelBean.common_cate = save.common_cate;
              $modalInstance.close(true);
            });
          };
        },
        resolve: {
          item: function() {
            return $scope.item;
          }
        }
      });
    };
  })
  // 频道管理
  .controller('channelManageCtrl', function(Plat, $scope, ListProvider, $modal, Back, $timeout, AttrIndex) {

     $scope.listShow = true;


    $scope.upload = function(scope) {
      $modal.open({
        windowClass: 'mutlUpload',
        templateUrl: 'mutlUpload.html',
        controller: function($scope, $http, $modalInstance, UploadPic) {
          UploadPic.scope = scope;
          $scope.item = scope.item;
          $scope.ok= function() {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

     $scope.listProvider = ListProvider('channel')
      .plat(function(plats) {
        $scope.plats = plats;
      })
      .list(function(list) {
        $scope.list = list;
      });

    $scope.adds = [
      {name: '频道'}
    ];

    // 添加频道
    $scope.add = function() {
      $scope.list.push(myapp.models.channel(Plat.plat.plat, AttrIndex($scope.list, 'priority')));
      $timeout(function() {
        Back.bottom();
      }, 0);
    };


    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });

  })
  .controller('columnConfigCtrl', function($scope, $modal, $routeParams, Post, Msg) {

    // 配置
    $scope.config = function () {
      $modal.open({
        windowClass: 'modal-column',
        templateUrl: 'columnConfig.html',
        controller: function($scope, $modalInstance, item, Plat, All) {

          $scope.js_rules = myapp.js_rules; 
          // 取消配置
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          }

          $scope.ok = function() {
            var plats = $scope.plats.filter(function(plat) {return plat.checked});
            if(!plats.length) return Msg.add({msg: '请勾选平台!', type: 'columnConfig', status: 1});
            config.plats = plats.map(function(plat) {return plat.plat});
            Post('/plat_channel_column/update_conf.do', config, 'columnConfig', function() {
              $modalInstance.close(true);
            });
          };

          var config = {
            //栏目id
            column_id: item.column_id, 
            //平台数组
            plats: [Plat.plat.plat],
            //配置
            config: {}
          };

          // 配置初始化
           _.each(myapp.columnConfig, function(column) {
              config.config[column] = {
                js_rule: 0,
                active: false
              }
            });

          if(item.content_column_config) {
            config.plats = [Plat.plat.plat];
            config.config = item.content_column_config;
          }
          $scope.config = config.config;

          /*
          _.each(item.content_column_config, function(v, i) {
            if(v[Object.keys(v)[1]]) {
              item.content_column_config[i].active = true;
            }
          });
        */

          // 全选
          $scope.all = All; 

          Plat.query({column_id: item.column_id, cate_code: item.cate_code}, function(data) {
            $scope.plats = data;
            _.each($scope.plats, function(item) {
              if(item.plat == Plat.plat.plat) item.checked = true;
            });
          });

        },
        resolve: {
          item: function() {
            return $scope.item
          }
        }
      });
    };
  })
  // 栏目管理
  .controller('columnManageCtrl', function($scope, $routeParams, ListProvider, $timeout, Plat, Back, AttrIndex) {

    $scope.listShow = true;

    $scope.adds = [
      {name: '栏目'} 
    ];

    $scope.add = function() {
      $scope.list.push(myapp.models.column($routeParams.cate_code, Plat.plat.plat, AttrIndex($scope.list, 'priority')));
      $timeout(function() {
        Back.bottom();
      }, 0);
    };
    
    $scope.listProvider = ListProvider('column')
      .plat(function(plats) {
        $scope.plats = plats;
      }, {cate_code: $routeParams.cate_code})
      .list(function(list) {
        $scope.list = list;
        ListProvider('all_channels', true)
          .list(function(jumps) {
            $scope.jumps = jumps;
          })
          .loadList();
      }, {cate_code: $routeParams.cate_code});

    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });
  })
  // 视频
  .controller('videoCtrl', function($scope, $routeParams, ListProvider, $timeout, Plat, Back, $modal, AttrIndex, addVideo, Tool) {

    $scope.listShow = true;

    $scope.adds = [
      {name: '视频'}, 
      {name: '活动'}
    ];

    $scope.changeStatus = function(item, e) {
      item.status = -(item.status-1);
      if(item.status == 1) {
        item.priority = ($scope.listProvider.config.page_size || 1) - 1;
      }
      if(item.status == 1) {
        e.target.classList.add('on');
      } else 
          e.target.classList.remove('on');
    };

    function videoModel(type) {
      return myapp.models.video($routeParams.column_id, Plat.plat.plat, AttrIndex($scope.list.plat_column_content_list, 'priority'), $scope.list.plat_channel_column.cate_code, $scope.list.plat_channel_column.other_plats, type);
    }

    // 添加活动
    function addActivity() {
      $scope.list.plat_column_content_list.push(videoModel(2));
    }

    // 添加视频回调
    function rec_cb(i) {
      var rec = Tool.copy(videoModel(1), this.list[i]);
      if(rec.type == 0) {
        rec.content.tv_desc = this.list[i].video_desc;
      } else {
        rec.content.tv_desc = this.list[i].album_desc;
      }
      this.item.list.plat_column_content_list.push(rec);
    }

    $scope.add = function(index) {
      switch(index) {
        case 0: 
          addVideo(rec_cb, $scope);
          break;
        case 1:
          addActivity();
          $timeout(function() {
            Back.bottom();
          }, 0);
          break;
      }
    };

    $scope.upload = function(scope) {
      $modal.open({
        windowClass: 'mutlUpload',
        templateUrl: 'mutlUpload.html',
        controller: function($scope, $http, $modalInstance, UploadPic) {
          UploadPic.scope = scope;
          $scope.item = scope.item;
          $scope.ok= function() {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

    $scope.listProvider = ListProvider('video')
      .plat(function(plats) {
        $scope.plats = plats;
      }, {column_id: $routeParams.column_id, cate_code: $routeParams.cate_code})
      .list(function(list) {
        $scope.list = list;
        $scope.config = list.plat_channel_column.content_column_config;
      }, {column_id: $routeParams.column_id});

    $scope.stats = 1;
    $scope.$watch('stats', function(a, b) {
      // 切换状态
      if(a != b) {
        $scope.listProvider.loadList({changeStats: true, status: a, page_index: 1});
      }
    });
  });
