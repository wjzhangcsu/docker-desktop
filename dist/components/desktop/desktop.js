var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var common_1 = require('angular2/common');
var desktop_1 = require('../../desktop/desktop/desktop');
var taskbar_1 = require('../../desktop/taskbar/taskbar');
var file_browser_1 = require('../../desktop/application/file-browser');
var photo_browser_1 = require('../../desktop/application/photo-browser');
var web_browser_1 = require('../../desktop/application/web-browser');
var pdf_1 = require('../../desktop/application/pdf');
var terminal_1 = require('../../desktop/application/terminal');
var editor_1 = require('../../desktop/application/editor');
var video_player_1 = require('../../desktop/application/video-player');
var dock_1 = require('../../desktop/taskbar/dock');
var menu_1 = require('../../desktop/menu/menu');
var http_1 = require('angular2/http');
var router_1 = require('angular2/router');
var copy_path = '';
var postOptions = { headers: new http_1.Headers({
        'Content-Type': 'application/json'
    }) };
var DesktopAppCmp = (function () {
    function DesktopAppCmp(http, routerParams) {
        var _this = this;
        this.http = http;
        this._id = 'desktop';
        this.backgroundImage = '/resource/images/img1.jpg';
        this.fileBrowsers = [];
        this.photoBrowsers = [];
        this.webBrowsers = [];
        this.pdfs = [];
        this.videoPlayer = [];
        this.menus = menu_1.menuList;
        this.terminals = [];
        this.shortcuts = [];
        this.editorList = [];
        this.docks = [];
        this.idIndex = 0;
        this.iconMap = {
            'inode/directory': 'icon-folder',
            'text/plain': 'icon-textfile',
            'image/png': 'icon-image',
            'image/jpeg': 'icon-image',
            'application/ogg': 'icon-video',
            'application/zip': 'icon-zip',
            'inode/x-empty': 'icon-textfile',
            'application/pdf': 'icon-pdf'
        };
        this.socket = null;
        this.callback = null;
        this.params = {};
        this.params = routerParams.params;
        setTimeout(function () {
            var term_id = _this.params.id + '§' + 11;
            _this.socket = io.connect("http://" + window.location.host);
            _this.socket.emit('createTerminal', term_id, function (term_id) {
                var str = '';
                _this.term_id = term_id;
                _this.socket.on('data' + term_id, function (data) {
                    str += data.toString().replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');
                    if (/[\d\w]+:\/#$/.test(str.trim())) {
                        _this.callback && _this.callback(str);
                        str = '';
                    }
                });
            });
        }, 100);
        var index = 1;
        this.shortcuts = [{
                icon: 'icon-computer',
                text: '这台电脑',
                shadow: 'shadow',
                dblclick: function () {
                    var config = {
                        title: '这台电脑',
                        path: '/',
                        icon: 'icon-computer',
                        uploadUrl: '/upload/' + _this.params.id
                    };
                    _this.createApp('file-browser', _this.fileBrowsers, _this.getFileBrowserConfig(config));
                }
            }, {
                icon: 'icon-user',
                text: '我的文档',
                shadow: 'shadow',
                dblclick: function () {
                    var config = {
                        title: '我的文档',
                        path: '/root',
                        icon: 'icon-user',
                        uploadUrl: '/upload/' + _this.params.id,
                        menu: [{
                                text: "新建",
                                items: [{
                                        text: '文件夹',
                                        handler: function () {
                                            _this.mkdir(config['object'].path + '/NewFolder', function () {
                                                config['object'].refresh();
                                            });
                                        }
                                    }, {
                                        text: '文档',
                                        handler: function () {
                                            _this.touch(config['object'].path + '/NewFile', function () {
                                                config['object'].refresh();
                                            });
                                        }
                                    }],
                                handler: function (event) {
                                }
                            }, {
                                text: "刷新",
                                handler: function (event) {
                                    config['object'].refresh();
                                }
                            }, {
                                text: "粘贴",
                                handler: function (event) {
                                    var filename = copy_path.split('/').pop() + '_copy';
                                    _this.http.post('/cp/' + _this.params.id + '?source=' + copy_path + '&to=' + config['object'].path + '/' + filename, JSON.stringify({}), postOptions).subscribe(function (res) {
                                        config['object'].refresh();
                                    });
                                }
                            }]
                    };
                    _this.createApp('file-browser', _this.fileBrowsers, _this.getFileBrowserConfig(config));
                }
            }, {
                icon: 'icon-terminal',
                text: 'Terminal',
                shadow: 'shadow',
                dblclick: function () {
                    _this.createApp('terminal', _this.terminals, { icon: 'icon-terminal', title: 'Terminal', container_id: _this.params.id, icon_class: 'icon-terminal' });
                }
            }, {
                icon: 'icon-ie-edge',
                text: 'Internet',
                shadow: 'shadow',
                dblclick: function () {
                    _this.createApp('web-browser', _this.webBrowsers, { icon: 'icon-ie-edge', src: 'http://' + _this.params.ip + ':' + _this.params.port, title: 'Internet', icon_class: 'icon-ie-edge' });
                }
            }];
    }
    DesktopAppCmp.prototype.createApp = function (type, list, config) {
        if (config === void 0) { config = {}; }
        var id = type + '-' + this.idIndex++;
        list.push(_.extend(config, {
            _id: id,
            type: type,
            componentList: list
        }));
        var isFind = false;
        dock_1.dockAppList.forEach(function (item, index) {
            if (item._id === type)
                isFind = true;
        });
        if (!isFind)
            dock_1.dockAppList.push({ _id: type, items: list, icon: 'task-icon-' + type });
    };
    DesktopAppCmp.prototype.lsByPath = function (path, config) {
        var _this = this;
        this.ls(path, function (list) {
            list.forEach(function (item) {
                item.text = item.name;
                item.icon = _this.iconMap[item.type];
                item.rename = (function (name) {
                    _this.mv(item.path, item.path.split('/').splice(0, item.path.split('/').length - 1).join('/') + '/' + name, function () {
                        config['object'].refresh();
                    });
                });
                item.menu = [{
                        text: "打开",
                        handler: function (event) {
                            item.dblclick();
                        }
                    }, {
                        text: "复制",
                        handler: function (event) {
                            copy_path = item.path;
                        }
                    }, {
                        text: "重命名",
                        handler: function (event) {
                            item.obj.rename();
                        }
                    }, {
                        text: "删除",
                        handler: function (event) {
                            if (!confirm("确认删除？"))
                                return;
                            _this.rm(item.path, function () {
                                config['object'].refresh();
                            });
                        }
                    }];
                if (!item.icon)
                    item.icon = 'icon-file';
                if (item.type === 'inode/directory') {
                    item.dblclick = function () {
                        config['object']['setPath']((path === '/' ? '' : path) + '/' + item.name);
                    };
                }
                console.log(item.type);
                if (/image\/*/.test(item.type)) {
                    item.dblclick = function () {
                        _this.createApp('photo-browser', _this.photoBrowsers, { icon: 'icon-image', title: item.name, url: '/getFile/' + _this.params.id + '?url=' + item.path + '&type=' + item.type });
                    };
                }
                if (item.type === 'application/pdf') {
                    item.dblclick = function () {
                        _this.createApp('pdf', _this.pdfs, { title: item.name, icon: 'icon-pdf', src: 'http://127.0.0.1:8088/pdf.html?url=http://127.0.0.1:8088/getFile/' + _this.params.id + '?url=' + item.path + '§type=text/html' });
                    };
                }
                if (item.type === 'application/ogg') {
                    item.dblclick = function () {
                        _this.createApp('video-player', _this.videoPlayer, { url: 'http://127.0.0.1:8088/getFile/' + _this.params.id + '?url=' + item.path + '&type=video/ogg' });
                    };
                }
                if (item.type === 'application/zip') {
                    item.menu[0].text = '解压';
                    item.dblclick = function () {
                        _this.http.get('/unzip/' + _this.params.id + '?path=' + item.path).subscribe(function (res) {
                            config['object'].refresh();
                        });
                    };
                }
                if (item.type === 'text/plain' || item.type === 'inode/x-empty') {
                    item.dblclick = function () {
                        _this.cat(item.path, function (data) {
                            _this.createApp('editor', _this.editorList, {
                                context: data,
                                title: item.name,
                                icon: 'icon-textfile',
                                onSave: function (str) {
                                    if (!/\\n$/.test(str))
                                        str += '\n';
                                    _this.http.post('/write/' + _this.params.id + '?path=' + item.path, JSON.stringify({ body: str }), postOptions).subscribe(function (res) {
                                        if (res.status !== 200)
                                            alert(res.json().error);
                                    });
                                }
                            });
                        });
                    };
                }
            });
            config.fileList = list;
        });
    };
    DesktopAppCmp.prototype.getFileBrowserConfig = function (_config) {
        var _this = this;
        if (_config === void 0) { _config = {}; }
        var config = _.extend(_config, {
            onSetPath: function (path) {
                _this.lsByPath(path, config);
            },
            fileList: []
        });
        return config;
    };
    DesktopAppCmp.prototype.parse = function (str) {
        console.log('start!!!');
        var list = str.split('\n');
        var list2, list3 = [];
        list.forEach(function (item) {
            if (item.indexOf('/') === 0)
                list2 = list2 || [];
            if (list2)
                list2.push(item);
        });
        list2.pop();
        list2.forEach(function (item, index) {
            item = item.replace(/ /g, '');
            if (!item)
                return;
            var str = item.split(':');
            if (str[0].split('/').pop() === '*')
                return;
            list3.push({
                type: str[1].split(';')[0],
                name: str[0].split('/').pop(),
                path: str[0]
            });
        });
        return list3;
    };
    DesktopAppCmp.prototype.ls = function (name, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            done(_this.parse(data));
        };
        this.socket.emit('data' + this.term_id, 'file ' + name + '/* --mime \n');
    };
    DesktopAppCmp.prototype.cat = function (path, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            data = data.split('\n');
            console.log(data);
            done(data.splice(1, data.length - 2).join('\n'));
        };
        console.log('cat ' + path);
        this.socket.emit('data' + this.term_id, 'cat ' + path + ' \n');
    };
    DesktopAppCmp.prototype.rm = function (path, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            done();
        };
        this.socket.emit('data' + this.term_id, 'rm -r ' + path + ' \n');
    };
    DesktopAppCmp.prototype.mv = function (path, newPath, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            data = data.split('\n');
            console.log();
            done();
        };
        this.socket.emit('data' + this.term_id, 'mv ' + path + ' ' + newPath + ' \n');
    };
    DesktopAppCmp.prototype.touch = function (path, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            data = data.split('\n');
            console.log();
            done(data.splice(1, data.length - 2).join('\n'));
        };
        this.socket.emit('data' + this.term_id, 'touch ' + path + ' \n');
    };
    DesktopAppCmp.prototype.mkdir = function (path, done) {
        var _this = this;
        this.callback = function (data) {
            _this.callback = null;
            data = data.split('\n');
            console.log();
            done(data.splice(1, data.length - 2).join('\n'));
        };
        this.socket.emit('data' + this.term_id, 'mkdir ' + path + ' \n');
    };
    DesktopAppCmp = __decorate([
        core_1.Component({
            selector: 'desktop-app',
            template: "\n        <desktop [(shortcuts)]=\"shortcuts\" [(background_image)]=\"backgroundImage\"></desktop>\n        <taskbar [docks]=\"docks\"></taskbar>\n        <file-browser *ngFor=\"#item of fileBrowsers\" [config]=\"item\" ></file-browser>\n        <web-browser *ngFor=\"#item of webBrowsers\" [config]=\"item\" ></web-browser>\n        <photo-browser *ngFor=\"#item of photoBrowsers\" [config]=\"item\" ></photo-browser>\n        <terminal *ngFor=\"#item of terminals\" [config]=\"item\" ></terminal>\n        <editor *ngFor=\"#item of editorList\" [config]=\"item\" ></editor>\n        <video-player *ngFor=\"#item of videoPlayer\" [config]=\"item\" ></video-player>\n        <menu style=\"position:absolute\" *ngFor=\"#item of menus\" [config]=\"item\" ></menu>\n        <pdf *ngFor=\"#item of pdfs\" [config]=\"item\" ></pdf>\n    ",
            styles: ["\n\n      .fullscreen_post_bg img {\n          display: none;\n      }\n\n      .fullscreen_post_bg {\n          background-position: 50% 50%;\n          background-size: cover;\n          bottom: 0;\n          left: 0;\n          position: fixed;\n          right: 0;\n          top: 0;\n          z-index:-1;\n      }\n    "],
            directives: [common_1.NgFor, desktop_1.DesktopCmp, taskbar_1.TaskbarCmp, web_browser_1.WebBrowserCmp, file_browser_1.FileBrowserCmp, photo_browser_1.PhotoBrowserCmp, terminal_1.TerminalCmp, video_player_1.VideoPlayerCmp, menu_1.MenuCmp, editor_1.EditorCmp, router_1.ROUTER_DIRECTIVES, pdf_1.PdfCmp],
            viewProviders: [http_1.HTTP_PROVIDERS],
        }), 
        __metadata('design:paramtypes', [http_1.Http, router_1.RouteParams])
    ], DesktopAppCmp);
    return DesktopAppCmp;
})();
exports.DesktopAppCmp = DesktopAppCmp;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGVza3RvcC9kZXNrdG9wLnRzIl0sIm5hbWVzIjpbIkRlc2t0b3BBcHBDbXAiLCJEZXNrdG9wQXBwQ21wLmNvbnN0cnVjdG9yIiwiRGVza3RvcEFwcENtcC5jcmVhdGVBcHAiLCJEZXNrdG9wQXBwQ21wLmxzQnlQYXRoIiwiRGVza3RvcEFwcENtcC5nZXRGaWxlQnJvd3NlckNvbmZpZyIsIkRlc2t0b3BBcHBDbXAucGFyc2UiLCJEZXNrdG9wQXBwQ21wLmxzIiwiRGVza3RvcEFwcENtcC5jYXQiLCJEZXNrdG9wQXBwQ21wLnJtIiwiRGVza3RvcEFwcENtcC5tdiIsIkRlc2t0b3BBcHBDbXAudG91Y2giLCJEZXNrdG9wQXBwQ21wLm1rZGlyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBMEIsZUFBZSxDQUFDLENBQUE7QUFDMUMsdUJBQStCLGlCQUFpQixDQUFDLENBQUE7QUFDakQsd0JBQTJCLCtCQUErQixDQUFDLENBQUE7QUFDM0Qsd0JBQTJCLCtCQUErQixDQUFDLENBQUE7QUFDM0QsNkJBQStCLHdDQUF3QyxDQUFDLENBQUE7QUFDeEUsOEJBQWdDLHlDQUF5QyxDQUFDLENBQUE7QUFDMUUsNEJBQThCLHVDQUF1QyxDQUFDLENBQUE7QUFDdEUsb0JBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQseUJBQTRCLG9DQUFvQyxDQUFDLENBQUE7QUFDakUsdUJBQTBCLGtDQUFrQyxDQUFDLENBQUE7QUFDN0QsNkJBQStCLHdDQUF3QyxDQUFDLENBQUE7QUFDeEUscUJBQTRCLDRCQUE0QixDQUFDLENBQUE7QUFDekQscUJBQWtDLHlCQUF5QixDQUFDLENBQUE7QUFHNUQscUJBQTZDLGVBQWUsQ0FBQyxDQUFBO0FBQzdELHVCQUEyRSxpQkFBaUIsQ0FBQyxDQUFBO0FBRzdGLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUVsQixJQUFJLFdBQVcsR0FBRyxFQUFFLE9BQU8sRUFBRyxJQUFJLGNBQU8sQ0FBQztRQUN6QyxjQUFj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LEtBQUtBLGlCQUFrQkEsQ0FBQ0EsQ0FBQUEsQ0FBQ0E7b0JBQ2xDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQTt3QkFDWkEsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsY0FBY0EsRUFBRUEsS0FBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsZ0NBQWdDQSxHQUFDQSxLQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxHQUFDQSxPQUFPQSxHQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLENBQUFBO29CQUNsSkEsQ0FBQ0EsQ0FBQUE7Z0JBQ0xBLENBQUNBO2dCQUVEQSxFQUFFQSxDQUFBQSxDQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBa0JBLENBQUNBLENBQUFBLENBQUNBO29CQUNsQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBQ0EsSUFBSUEsQ0FBQUE7b0JBQ3RCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQTt3QkFDWkEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsR0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsR0FBQ0EsUUFBUUEsR0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBQUEsR0FBR0E7NEJBQ3BFQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFBQTt3QkFDOUJBLENBQUNBLENBQUNBLENBQUFBO29CQUNOQSxDQUFDQSxDQUFBQTtnQkFDTEEsQ0FBQ0E7Z0JBRURBLEVBQUVBLENBQUFBLENBQUVBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFlBQVlBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLGVBQWdCQSxDQUFDQSxDQUFBQSxDQUFDQTtvQkFDOURBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBO3dCQUNaQSxLQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxVQUFDQSxJQUFJQTs0QkFDckJBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUlBLENBQUNBLFVBQVVBLEVBQUVBO2dDQUN0Q0EsT0FBT0EsRUFBRUEsSUFBSUE7Z0NBQ2JBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBO2dDQUNoQkEsSUFBSUEsRUFBRUEsZUFBZUE7Z0NBQ3JCQSxNQUFNQSxFQUFFQSxVQUFDQSxHQUFHQTtvQ0FDUkEsRUFBRUEsQ0FBQUEsQ0FBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0NBQ2xCQSxHQUFHQSxJQUFFQSxJQUFJQSxDQUFBQTtvQ0FDYkEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsR0FBQ0EsUUFBUUEsR0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBQ0EsQ0FBQ0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBQUEsR0FBR0E7d0NBQy9HQSxFQUFFQSxDQUFBQSxDQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxLQUFLQSxHQUFJQSxDQUFDQTs0Q0FDcEJBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLENBQUFBO29DQUMvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQUE7Z0NBQ05BLENBQUNBOzZCQUNKQSxDQUFDQSxDQUFBQTt3QkFDTkEsQ0FBQ0EsQ0FBQ0EsQ0FBQUE7b0JBQ05BLENBQUNBLENBQUFBO2dCQUNMQSxDQUFDQTtZQUNMQSxDQUFDQSxDQUFDQSxDQUFBQTtZQUVGQSxNQUFNQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFBQTtRQUMx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LENBQUFBO0lBQ3RFQSxDQUFDQTtJQUVETiwyQkFBR0EsR0FBSEEsVUFBSUEsSUFBSUEsRUFBRUEsSUFBSUE7UUFBZE8saUJBU0NBO1FBUkdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQUNBLElBQUlBO1lBQ2pCQSxLQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFBQTtZQUNwQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQUE7WUFDdkJBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUFBO1lBQ2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFBQTtRQUNsREEsQ0FBQ0EsQ0FBQUE7UUFDREEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBRUEsTUFBTUEsR0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQUE7UUFDekJBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLEdBQUNBLElBQUlBLEdBQUNBLEtBQUtBLENBQUNBLENBQUFBO0lBQzVEQSxDQUFDQTtJQUVEUCwwQkFBRUEsR0FBRkEsVUFBR0EsSUFBSUEsRUFBRUEsSUFBSUE7UUFBYlEsaUJBTUNBO1FBTEdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQUNBLElBQUlBO1lBQ2pCQSxLQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFBQTtZQUNwQkEsSUFBSUEsRUFBRUEsQ0FBQUE7UUFDVkEsQ0FBQ0EsQ0FBQUE7UUFDREEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsR0FBQ0EsSUFBSUEsR0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQUE7SUFDOURBLENBQUNBO0lBRURSLDBCQUFFQSxHQUFGQSxVQUFHQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQTtRQUF0QlMsaUJBU0NBO1FBUkdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQUNBLElBQUlBO1lBQ2pCQSxLQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFBQTtZQUNwQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQUE7WUFDdkJBLE9BQU9BLENBQUNBLEdBQUdBLEVBQUVBLENBQUFBO1lBQ2JBLElBQUlBLEVBQUVBLENBQUFBO1FBQ1ZBLENBQUNBLENBQUFBO1FBRURBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLEtBQUtBLEdBQUNBLElBQUlBLEdBQUNBLEdBQUdBLEdBQUVBLE9BQU9BLEdBQUVBLEtBQUtBLENBQUNBLENBQUFBO0lBQ3pFQSxDQUFDQTtJQUVEVCw2QkFBS0EsR0FBTEEsVUFBTUEsSUFBSUEsRUFBRUEsSUFBSUE7UUFBaEJVLGlCQVNDQTtRQVJHQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxVQUFDQSxJQUFJQTtZQUNqQkEsS0FBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQUE7WUFDcEJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUFBO1lBQ3ZCQSxPQUFPQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFBQTtZQUNiQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFBQTtRQUNsREEsQ0FBQ0EsQ0FBQUE7UUFFREEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsR0FBQ0EsSUFBSUEsR0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQUE7SUFDOURBLENBQUNBO0lBRURWLDZCQUFLQSxHQUFMQSxVQUFNQSxJQUFJQSxFQUFFQSxJQUFJQTtRQUFoQlcsaUJBU0NBO1FBUkdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQUNBLElBQUlBO1lBQ2pCQSxLQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFBQTtZQUNwQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQUE7WUFDdkJBLE9BQU9BLENBQUNBLEdBQUdBLEVBQUVBLENBQUFBO1lBQ2JBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUFBO1FBQ2xEQSxDQUFDQSxDQUFBQTtRQUVEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxRQUFRQSxHQUFDQSxJQUFJQSxHQUFDQSxLQUFLQSxDQUFDQSxDQUFBQTtJQUM5REEsQ0FBQ0E7SUFsU0xYO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNQQSxRQUFRQSxFQUFFQSxhQUFhQTtZQUN2QkEsUUFBUUEsRUFBRUEsazBCQVdUQTtZQUNEQSxNQUFNQSxFQUFFQSxDQUFDQSx1VUFnQlJBLENBQUNBO1lBQ0ZBLFVBQVVBLEVBQUVBLENBQUNBLGNBQUtBLEVBQUVBLG9CQUFVQSxFQUFFQSxvQkFBVUEsRUFBRUEsMkJBQWFBLEVBQUVBLDZCQUFjQSxFQUFFQSwrQkFBZUEsRUFBRUEsc0JBQVdBLEVBQUNBLDZCQUFjQSxFQUFFQSxjQUFPQSxFQUFFQSxrQkFBU0EsRUFBRUEsMEJBQWlCQSxFQUFDQSxZQUFNQSxDQUFDQTtZQUNyS0EsYUFBYUEsRUFBRUEsQ0FBQ0EscUJBQWNBLENBQUNBO1NBQ2xDQSxDQUFDQTs7c0JBa1hEQTtJQUFEQSxvQkFBQ0E7QUFBREEsQ0FuWkEsQUFtWkNBLElBQUE7QUFoWFkscUJBQWEsZ0JBZ1h6QixDQUFBIiwiZmlsZSI6ImNvbXBvbmVudHMvZGVza3RvcC9kZXNrdG9wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQgeyBOZ1N0eWxlLCBOZ0ZvciB9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG5pbXBvcnQgeyBEZXNrdG9wQ21wIH0gZnJvbSAnLi4vLi4vZGVza3RvcC9kZXNrdG9wL2Rlc2t0b3AnO1xuaW1wb3J0IHsgVGFza2JhckNtcCB9IGZyb20gJy4uLy4uL2Rlc2t0b3AvdGFza2Jhci90YXNrYmFyJztcbmltcG9ydCB7IEZpbGVCcm93c2VyQ21wIH0gZnJvbSAnLi4vLi4vZGVza3RvcC9hcHBsaWNhdGlvbi9maWxlLWJyb3dzZXInO1xuaW1wb3J0IHsgUGhvdG9Ccm93c2VyQ21wIH0gZnJvbSAnLi4vLi4vZGVza3RvcC9hcHBsaWNhdGlvbi9waG90by1icm93c2VyJztcbmltcG9ydCB7IFdlYkJyb3dzZXJDbXAgfSBmcm9tICcuLi8uLi9kZXNrdG9wL2FwcGxpY2F0aW9uL3dlYi1icm93c2VyJztcbmltcG9ydCB7IFBkZkNtcCB9IGZyb20gJy4uLy4uL2Rlc2t0b3AvYXBwbGljYXRpb24vcGRmJztcbmltcG9ydCB7IFRlcm1pbmFsQ21wIH0gZnJvbSAnLi4vLi4vZGVza3RvcC9hcHBsaWNhdGlvbi90ZXJtaW5hbCc7XG5pbXBvcnQgeyBFZGl0b3JDbXAgfSBmcm9tICcuLi8uLi9kZXNrdG9wL2FwcGxpY2F0aW9uL2VkaXRvcic7XG5pbXBvcnQgeyBWaWRlb1BsYXllckNtcCB9IGZyb20gJy4uLy4uL2Rlc2t0b3AvYXBwbGljYXRpb24vdmlkZW8tcGxheWVyJztcbmltcG9ydCB7IGRvY2tBcHBMaXN0IH0gZnJvbSAnLi4vLi4vZGVza3RvcC90YXNrYmFyL2RvY2snO1xuaW1wb3J0IHsgTWVudUNtcCAsIG1lbnVMaXN0fSBmcm9tICcuLi8uLi9kZXNrdG9wL21lbnUvbWVudSc7XG5pbXBvcnQgeyBib290c3RyYXAgfSAgICBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJ1xuaW1wb3J0IHsgSW5qZWN0b3IsIHByb3ZpZGUgfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7IEh0dHAsIEhUVFBfUFJPVklERVJTLCBIZWFkZXJzfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbmltcG9ydCB7Um91dGVDb25maWcsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfQklORElOR1MsIFJvdXRlUGFyYW1zfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG5kZWNsYXJlIHZhciAkLCBfXG52YXIgY29weV9wYXRoID0gJydcbiBkZWNsYXJlIHZhciBUZXJtaW5hbCAsIGlvXG52YXIgcG9zdE9wdGlvbnMgPSB7IGhlYWRlcnM6ICBuZXcgSGVhZGVycyh7XG5cdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbn0pfVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rlc2t0b3AtYXBwJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGVza3RvcCBbKHNob3J0Y3V0cyldPVwic2hvcnRjdXRzXCIgWyhiYWNrZ3JvdW5kX2ltYWdlKV09XCJiYWNrZ3JvdW5kSW1hZ2VcIj48L2Rlc2t0b3A+XG4gICAgICAgIDx0YXNrYmFyIFtkb2Nrc109XCJkb2Nrc1wiPjwvdGFza2Jhcj5cbiAgICAgICAgPGZpbGUtYnJvd3NlciAqbmdGb3I9XCIjaXRlbSBvZiBmaWxlQnJvd3NlcnNcIiBbY29uZmlnXT1cIml0ZW1cIiA+PC9maWxlLWJyb3dzZXI+XG4gICAgICAgIDx3ZWItYnJvd3NlciAqbmdGb3I9XCIjaXRlbSBvZiB3ZWJCcm93c2Vyc1wiIFtjb25maWddPVwiaXRlbVwiID48L3dlYi1icm93c2VyPlxuICAgICAgICA8cGhvdG8tYnJvd3NlciAqbmdGb3I9XCIjaXRlbSBvZiBwaG90b0Jyb3dzZXJzXCIgW2NvbmZpZ109XCJpdGVtXCIgPjwvcGhvdG8tYnJvd3Nlcj5cbiAgICAgICAgPHRlcm1pbmFsICpuZ0Zvcj1cIiNpdGVtIG9mIHRlcm1pbmFsc1wiIFtjb25maWddPVwiaXRlbVwiID48L3Rlcm1pbmFsPlxuICAgICAgICA8ZWRpdG9yICpuZ0Zvcj1cIiNpdGVtIG9mIGVkaXRvckxpc3RcIiBbY29uZmlnXT1cIml0ZW1cIiA+PC9lZGl0b3I+XG4gICAgICAgIDx2aWRlby1wbGF5ZXIgKm5nRm9yPVwiI2l0ZW0gb2YgdmlkZW9QbGF5ZXJcIiBbY29uZmlnXT1cIml0ZW1cIiA+PC92aWRlby1wbGF5ZXI+XG4gICAgICAgIDxtZW51IHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGVcIiAqbmdGb3I9XCIjaXRlbSBvZiBtZW51c1wiIFtjb25maWddPVwiaXRlbVwiID48L21lbnU+XG4gICAgICAgIDxwZGYgKm5nRm9yPVwiI2l0ZW0gb2YgcGRmc1wiIFtjb25maWddPVwiaXRlbVwiID48L3BkZj5cbiAgICBgLFxuICAgIHN0eWxlczogW2BcblxuICAgICAgLmZ1bGxzY3JlZW5fcG9zdF9iZyBpbWcge1xuICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICB9XG5cbiAgICAgIC5mdWxsc2NyZWVuX3Bvc3RfYmcge1xuICAgICAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IDUwJSA1MCU7XG4gICAgICAgICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcbiAgICAgICAgICBib3R0b206IDA7XG4gICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgIHotaW5kZXg6LTE7XG4gICAgICB9XG4gICAgYF0sXG4gICAgZGlyZWN0aXZlczogW05nRm9yLCBEZXNrdG9wQ21wLCBUYXNrYmFyQ21wLCBXZWJCcm93c2VyQ21wLCBGaWxlQnJvd3NlckNtcCwgUGhvdG9Ccm93c2VyQ21wLCBUZXJtaW5hbENtcCxWaWRlb1BsYXllckNtcCwgTWVudUNtcCwgRWRpdG9yQ21wLCBST1VURVJfRElSRUNUSVZFUyxQZGZDbXBdLFxuICAgIHZpZXdQcm92aWRlcnM6IFtIVFRQX1BST1ZJREVSU10sXG59KVxuXG5leHBvcnQgY2xhc3MgRGVza3RvcEFwcENtcCB7XG4gICAgX2lkID0gJ2Rlc2t0b3AnXG4gICAgYmFja2dyb3VuZEltYWdlID0gJy9yZXNvdXJjZS9pbWFnZXMvaW1nMS5qcGcnXG4gICAgZmlsZUJyb3dzZXJzID0gW11cbiAgICBwaG90b0Jyb3dzZXJzID0gW11cbiAgICB3ZWJCcm93c2VycyA9IFtdXG4gICAgcGRmcyA9IFtdXG4gICAgdmlkZW9QbGF5ZXIgPSBbXVxuICAgIG1lbnVzID0gbWVudUxpc3RcbiAgICB0ZXJtaW5hbHMgPSBbXVxuICAgIHNob3J0Y3V0cyA9IFtdXG4gICAgZWRpdG9yTGlzdCA9IFtdXG4gICAgZG9ja3MgPSBbXVxuICAgIGlkSW5kZXggPSAwXG4gICAgY3JlYXRlQXBwKHR5cGUsIGxpc3QsIGNvbmZpZz17fSlcbiAgICB7XG4gICAgICAgIHZhciBpZCA9IHR5cGUgKyAnLScgKyB0aGlzLmlkSW5kZXggKysgXG4gICAgICAgIGxpc3QucHVzaChfLmV4dGVuZChjb25maWcse1xuICAgICAgICAgICAgX2lkOiBpZCxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBjb21wb25lbnRMaXN0OiBsaXN0XG4gICAgICAgIH0pKVxuICAgICAgICBcbiAgICAgICAgdmFyIGlzRmluZCA9IGZhbHNlIFxuICAgICAgICBkb2NrQXBwTGlzdC5mb3JFYWNoKChpdGVtLCBpbmRleCk9PntcbiAgICAgICAgICAgIGlmKCBpdGVtLl9pZCA9PT0gdHlwZSApXG4gICAgICAgICAgICAgICAgaXNGaW5kID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgaWYoICFpc0ZpbmQgKVxuICAgICAgICAgICAgZG9ja0FwcExpc3QucHVzaCh7X2lkOiB0eXBlLCBpdGVtczogbGlzdCwgaWNvbjogJ3Rhc2staWNvbi0nK3R5cGUgfSlcbiAgICB9XG4gICAgXG4gICAgbHNCeVBhdGgocGF0aCwgY29uZmlnKXtcbiAgICAgICAgdGhpcy5scyhwYXRoLCAobGlzdCk9PntcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaCggKGl0ZW0pPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSBpdGVtLm5hbWVcbiAgICAgICAgICAgICAgICBpdGVtLmljb24gPSB0aGlzLmljb25NYXBbaXRlbS50eXBlXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGl0ZW0ucmVuYW1lID0gKChuYW1lKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm12KGl0ZW0ucGF0aCwgaXRlbS5wYXRoLnNwbGl0KCcvJykuc3BsaWNlKDAsIGl0ZW0ucGF0aC5zcGxpdCgnLycpLmxlbmd0aC0xKS5qb2luKCcvJykrICcvJytuYW1lLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnWydvYmplY3QnXS5yZWZyZXNoKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGl0ZW0ubWVudSA9IFt7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwi5omT5byAXCIsXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGJsY2xpY2soKSAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCLlpI3liLZcIixcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weV9wYXRoID0gaXRlbS5wYXRoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwi6YeN5ZG95ZCNXCIsXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub2JqLnJlbmFtZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwi5Yig6ZmkXCIsXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IChldmVudCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCAhY29uZmlybShcIuehruiupOWIoOmZpO+8n1wiKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJtKGl0ZW0ucGF0aCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWdbJ29iamVjdCddLnJlZnJlc2goKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoICFpdGVtLmljb24gKVxuICAgICAgICAgICAgICAgICAgICBpdGVtLmljb24gPSAnaWNvbi1maWxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBpdGVtLnR5cGUgPT09ICdpbm9kZS9kaXJlY3RvcnknICl7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGJsY2xpY2sgPSAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnWydvYmplY3QnXVsnc2V0UGF0aCddKChwYXRoID09PSAnLyc/Jyc6cGF0aCkgKyAnLycgKyBpdGVtLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS50eXBlKVxuICAgICAgICAgICAgICAgIGlmKCAvaW1hZ2VcXC8qLy50ZXN0KGl0ZW0udHlwZSkgKXtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kYmxjbGljayA9ICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUFwcCgncGhvdG8tYnJvd3NlcicsIHRoaXMucGhvdG9Ccm93c2VycywgeyBpY29uOidpY29uLWltYWdlJywgdGl0bGU6IGl0ZW0ubmFtZSwgdXJsOiAnL2dldEZpbGUvJyt0aGlzLnBhcmFtcy5pZCsnP3VybD0nK2l0ZW0ucGF0aCsnJnR5cGU9JytpdGVtLnR5cGUgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggaXRlbS50eXBlID09PSAnYXBwbGljYXRpb24vcGRmJyApe1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmRibGNsaWNrID0gKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQXBwKCdwZGYnLCB0aGlzLnBkZnMsIHsgdGl0bGU6aXRlbS5uYW1lLCBpY29uOidpY29uLXBkZicsIHNyYzogJ2h0dHA6Ly8xMjcuMC4wLjE6ODA4OC9wZGYuaHRtbD91cmw9aHR0cDovLzEyNy4wLjAuMTo4MDg4L2dldEZpbGUvJyt0aGlzLnBhcmFtcy5pZCsnP3VybD0nK2l0ZW0ucGF0aCsnwqd0eXBlPXRleHQvaHRtbCcgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggaXRlbS50eXBlID09PSAnYXBwbGljYXRpb24vb2dnJyApe1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmRibGNsaWNrID0gKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQXBwKCd2aWRlby1wbGF5ZXInLCB0aGlzLnZpZGVvUGxheWVyLCB7IHVybDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODA4OC9nZXRGaWxlLycrdGhpcy5wYXJhbXMuaWQrJz91cmw9JytpdGVtLnBhdGgrJyZ0eXBlPXZpZGVvL29nZycgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggaXRlbS50eXBlID09PSAnYXBwbGljYXRpb24vemlwJyApe1xuICAgICAgICAgICAgICAgICAgICBpdGVtLm1lbnVbMF0udGV4dD0n6Kej5Y6LJ1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmRibGNsaWNrID0gKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaHR0cC5nZXQoJy91bnppcC8nK3RoaXMucGFyYW1zLmlkKyc/cGF0aD0nK2l0ZW0ucGF0aCkuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnWydvYmplY3QnXS5yZWZyZXNoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIGl0ZW0udHlwZSA9PT0gJ3RleHQvcGxhaW4nIHx8IGl0ZW0udHlwZSA9PT0gJ2lub2RlL3gtZW1wdHknICl7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGJsY2xpY2sgPSAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXQoaXRlbS5wYXRoLCAoZGF0YSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUFwcCgnZWRpdG9yJywgdGhpcy5lZGl0b3JMaXN0LCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBkYXRhLC8vcmVzLmpzb24oKS5ib2R5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ljb24tdGV4dGZpbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNhdmU6IChzdHIpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggIS9cXFxcbiQvLnRlc3Qoc3RyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIrPSdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmh0dHAucG9zdCgnL3dyaXRlLycrdGhpcy5wYXJhbXMuaWQrJz9wYXRoPScraXRlbS5wYXRoLCBKU09OLnN0cmluZ2lmeSh7Ym9keTogc3RyfSksIHBvc3RPcHRpb25zKS5zdWJzY3JpYmUocmVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggcmVzLnN0YXR1cyAhPT0gMjAwIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQocmVzLmpzb24oKS5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbmZpZy5maWxlTGlzdCA9IGxpc3RcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgaWNvbk1hcCA9IHtcbiAgICAgICAgJ2lub2RlL2RpcmVjdG9yeSc6ICdpY29uLWZvbGRlcicsXG4gICAgICAgICd0ZXh0L3BsYWluJzogJ2ljb24tdGV4dGZpbGUnLFxuICAgICAgICAnaW1hZ2UvcG5nJzogJ2ljb24taW1hZ2UnLFxuICAgICAgICAnaW1hZ2UvanBlZyc6ICdpY29uLWltYWdlJyxcbiAgICAgICAgJ2FwcGxpY2F0aW9uL29nZyc6ICdpY29uLXZpZGVvJyxcbiAgICAgICAgJ2FwcGxpY2F0aW9uL3ppcCc6ICdpY29uLXppcCcsXG4gICAgICAgICdpbm9kZS94LWVtcHR5JzogJ2ljb24tdGV4dGZpbGUnLFxuICAgICAgICAnYXBwbGljYXRpb24vcGRmJzogJ2ljb24tcGRmJ1xuICAgIH1cbiAgICBcbiAgICBnZXRGaWxlQnJvd3NlckNvbmZpZyhfY29uZmlnID0ge30pXG4gICAge1xuICAgICAgICB2YXIgY29uZmlnID0gXy5leHRlbmQoX2NvbmZpZyxcbiAgICAgICAge1xuICAgICAgICAgICAgb25TZXRQYXRoOiAocGF0aCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLmxzQnlQYXRoKHBhdGgsIGNvbmZpZylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWxlTGlzdDogW11cbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb25maWdcbiAgICB9XG4gICAgXG4gICAgcGFyc2Uoc3RyKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0ISEhJylcbiAgICAgICAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgICAgIHZhciBsaXN0MiAsIGxpc3QzID0gW11cbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgaWYoIGl0ZW0uaW5kZXhPZignLycpID09PSAwIClcbiAgICAgICAgICAgICAgICBsaXN0MiA9IGxpc3QyIHx8IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihsaXN0MilcbiAgICAgICAgICAgICAgICBsaXN0Mi5wdXNoKGl0ZW0pXG4gICAgICAgIH0pXG4gICAgICAgIGxpc3QyLnBvcCgpXG4gICAgICAgIFxuICAgICAgICBsaXN0Mi5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC8gL2csICcnKVxuICAgICAgICAgICAgaWYoICFpdGVtIClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHN0ciA9IGl0ZW0uc3BsaXQoJzonKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggc3RyWzBdLnNwbGl0KCcvJykucG9wKCkgPT09ICcqJyApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsaXN0My5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBzdHJbMV0uc3BsaXQoJzsnKVswXSxcbiAgICAgICAgICAgICAgICBuYW1lOiBzdHJbMF0uc3BsaXQoJy8nKS5wb3AoKSxcbiAgICAgICAgICAgICAgICBwYXRoOiBzdHJbMF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdDNcbiAgICB9XG4gICAgXG4gICAgc29ja2V0ID0gbnVsbFxuICAgIGNhbGxiYWNrOmFueSA9IG51bGxcbiAgICB0ZXJtX2lkOmFueSBcbiAgICBcbiAgICBscyhuYW1lLCBkb25lKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IChkYXRhKT0+e1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGxcbiAgICAgICAgICAgIGRvbmUodGhpcy5wYXJzZShkYXRhKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhdGEnK3RoaXMudGVybV9pZCwgJ2ZpbGUgJytuYW1lKycvKiAtLW1pbWUgXFxuJylcbiAgICB9XG4gICAgXG4gICAgY2F0KHBhdGgsIGRvbmUpe1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gKGRhdGEpPT57XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbFxuICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICAgICAgZG9uZShkYXRhLnNwbGljZSgxLCBkYXRhLmxlbmd0aC0yKS5qb2luKCdcXG4nKSlcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyggJ2NhdCAnK3BhdGgpXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhdGEnK3RoaXMudGVybV9pZCwgJ2NhdCAnK3BhdGgrJyBcXG4nKVxuICAgIH1cbiAgICBcbiAgICBybShwYXRoLCBkb25lKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IChkYXRhKT0+e1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGxcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhdGEnK3RoaXMudGVybV9pZCwgJ3JtIC1yICcrcGF0aCsnIFxcbicpXG4gICAgfVxuICAgIFxuICAgIG12KHBhdGgsIG5ld1BhdGgsIGRvbmUpe1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gKGRhdGEpPT57XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbFxuICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygpXG4gICAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZGF0YScrdGhpcy50ZXJtX2lkLCAnbXYgJytwYXRoKycgJysgbmV3UGF0aCArJyBcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0b3VjaChwYXRoLCBkb25lKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IChkYXRhKT0+e1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGxcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgY29uc29sZS5sb2coKVxuICAgICAgICAgICAgZG9uZShkYXRhLnNwbGljZSgxLCBkYXRhLmxlbmd0aC0yKS5qb2luKCdcXG4nKSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZGF0YScrdGhpcy50ZXJtX2lkLCAndG91Y2ggJytwYXRoKycgXFxuJylcbiAgICB9XG4gICAgXG4gICAgbWtkaXIocGF0aCwgZG9uZSl7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSAoZGF0YSk9PntcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKClcbiAgICAgICAgICAgIGRvbmUoZGF0YS5zcGxpY2UoMSwgZGF0YS5sZW5ndGgtMikuam9pbignXFxuJykpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhdGEnK3RoaXMudGVybV9pZCwgJ21rZGlyICcrcGF0aCsnIFxcbicpXG4gICAgfVxuICAgIHBhcmFtczphbnkgPSB7fVxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBodHRwPzogSHR0cCwgcm91dGVyUGFyYW1zPzogUm91dGVQYXJhbXMpe1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHJvdXRlclBhcmFtcy5wYXJhbXNcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PlxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdGVybV9pZCA9IHRoaXMucGFyYW1zLmlkICsnwqcnKyAxMVxuICAgICAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KFwiaHR0cDovL1wiK3dpbmRvdy5sb2NhdGlvbi5ob3N0KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjcmVhdGVUZXJtaW5hbCcsIHRlcm1faWQsICh0ZXJtX2lkKT0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ciA9ICcnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtX2lkID0gdGVybV9pZFxuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkYXRhJyt0ZXJtX2lkLCAoZGF0YSk9PntcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHgxQlxcWyhbMC05XXsxLDJ9KDtbMC05XXsxLDJ9KT8pP1ttfEtdL2csICcnKVxuICAgICAgICAgICAgICAgICAgICBpZiggL1tcXGRcXHddKzpcXC8jJC8udGVzdChzdHIudHJpbSgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2soc3RyKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gJydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwxMDApXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgLy8gICAgIHRoaXMuY2F0KCcvZXRjL2hvc3RzJywgZnVuY3Rpb24oKXt9KVxuICAgICAgICAvLyB9LCAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgaW5kZXggPSAxXG4gICAgICAgIHRoaXMuc2hvcnRjdXRzID0gW3tcbiAgICAgICAgICAgIGljb246ICdpY29uLWNvbXB1dGVyJyxcbiAgICAgICAgICAgIHRleHQ6ICfov5nlj7DnlLXohJEnLFxuICAgICAgICAgICAgc2hhZG93OiAnc2hhZG93JyxcbiAgICAgICAgICAgIGRibGNsaWNrOiAoKT0+e1xuICAgICAgICAgICAgICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6L+Z5Y+w55S16ISRJyxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnaWNvbi1jb21wdXRlcicsXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFVybDonL3VwbG9hZC8nK3RoaXMucGFyYW1zLmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQXBwKCdmaWxlLWJyb3dzZXInLCB0aGlzLmZpbGVCcm93c2VycywgdGhpcy5nZXRGaWxlQnJvd3NlckNvbmZpZyhjb25maWcpKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpY29uOiAnaWNvbi11c2VyJywgXG4gICAgICAgICAgICB0ZXh0OiAn5oiR55qE5paH5qGjJyxcbiAgICAgICAgICAgIHNoYWRvdzogJ3NoYWRvdycsXG4gICAgICAgICAgICBkYmxjbGljazooKT0+e1xuICAgICAgICAgICAgICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5oiR55qE5paH5qGjJyxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJy9yb290JyxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ljb24tdXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFVybDonL3VwbG9hZC8nK3RoaXMucGFyYW1zLmlkLFxuICAgICAgICAgICAgICAgICAgICBtZW51OiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCLmlrDlu7pcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfmlofku7blpLknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWtkaXIoY29uZmlnWydvYmplY3QnXS5wYXRoKycvTmV3Rm9sZGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ1snb2JqZWN0J10ucmVmcmVzaCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfmlofmoaMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG91Y2goY29uZmlnWydvYmplY3QnXS5wYXRoKycvTmV3RmlsZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWdbJ29iamVjdCddLnJlZnJlc2goKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIuWIt+aWsFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ1snb2JqZWN0J10ucmVmcmVzaCgpICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwi57KY6LS0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiAoZXZlbnQpPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZW5hbWUgPSBjb3B5X3BhdGguc3BsaXQoJy8nKS5wb3AoKSArICdfY29weSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmh0dHAucG9zdCgnL2NwLycrdGhpcy5wYXJhbXMuaWQrJz9zb3VyY2U9Jytjb3B5X3BhdGggKyAnJnRvPScgKyBjb25maWdbJ29iamVjdCddLnBhdGggKyAnLycgKyBmaWxlbmFtZSwgSlNPTi5zdHJpbmdpZnkoe30pLCBwb3N0T3B0aW9ucykuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ1snb2JqZWN0J10ucmVmcmVzaCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBcHAoJ2ZpbGUtYnJvd3NlcicsIHRoaXMuZmlsZUJyb3dzZXJzLCB0aGlzLmdldEZpbGVCcm93c2VyQ29uZmlnKGNvbmZpZykpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGljb246ICdpY29uLXRlcm1pbmFsJyxcbiAgICAgICAgICAgIHRleHQ6ICdUZXJtaW5hbCcsXG4gICAgICAgICAgICBzaGFkb3c6ICdzaGFkb3cnLFxuICAgICAgICAgICAgZGJsY2xpY2s6ICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBcHAoJ3Rlcm1pbmFsJywgdGhpcy50ZXJtaW5hbHMsIHsgaWNvbjonaWNvbi10ZXJtaW5hbCcsIHRpdGxlOidUZXJtaW5hbCcsIGNvbnRhaW5lcl9pZDogdGhpcy5wYXJhbXMuaWQgLCBpY29uX2NsYXNzOiAnaWNvbi10ZXJtaW5hbCd9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpY29uOiAnaWNvbi1pZS1lZGdlJyxcbiAgICAgICAgICAgIHRleHQ6ICdJbnRlcm5ldCcsXG4gICAgICAgICAgICBzaGFkb3c6ICdzaGFkb3cnLFxuICAgICAgICAgICAgZGJsY2xpY2s6ICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBcHAoJ3dlYi1icm93c2VyJywgdGhpcy53ZWJCcm93c2VycywgeyBpY29uOidpY29uLWllLWVkZ2UnLCBzcmM6J2h0dHA6Ly8nK3RoaXMucGFyYW1zLmlwKyc6Jyt0aGlzLnBhcmFtcy5wb3J0LCB0aXRsZTonSW50ZXJuZXQnLGljb25fY2xhc3M6ICdpY29uLWllLWVkZ2UnfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=