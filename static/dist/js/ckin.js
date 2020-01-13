/*!
   ckin v0.0.1: Custom HTML5 Video Player Skins.
   (c) 2017 
   MIT License
   git+https://github.com/hunzaboy/ckin.git
*/
// Source: https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca;
(function () {
    // helpers
    var regExp = function regExp(name) {
        return new RegExp('(^| )' + name + '( |$)');
    };
    var forEach = function forEach(list, fn, scope) {
        for (var i = 0; i < list.length; i++) {
            fn.call(scope, list[i]);
        }
    };

    // class list object with basic methods
    function ClassList(element) {
        this.element = element;
    }

    ClassList.prototype = {
        add: function add() {
            forEach(arguments, function (name) {
                if (!this.contains(name)) {
                    this.element.className += ' ' + name;
                }
            }, this);
        },
        remove: function remove() {
            forEach(arguments, function (name) {
                this.element.className = this.element.className.replace(regExp(name), '');
            }, this);
        },
        toggle: function toggle(name) {
            return this.contains(name) ? (this.remove(name), false) : (this.add(name), true);
        },
        contains: function contains(name) {
            return regExp(name).test(this.element.className);
        },
        // bonus..
        replace: function replace(oldName, newName) {
            this.remove(oldName), this.add(newName);
        }
    };

    // IE8/9, Safari
    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function get() {
                return new ClassList(this);
            }
        });
    }

    // replace() support for others
    if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
        DOMTokenList.prototype.replace = ClassList.prototype.replace;
    }
})();
(function () {
    if (typeof NodeList.prototype.forEach === "function") return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
})();

// Unfortunately, due to scattered support, browser sniffing is required
function browserSniff() {
    var nVer = navigator.appVersion,
        nAgt = navigator.userAgent,
        browserName = navigator.appName,
        fullVersion = '' + parseFloat(navigator.appVersion),
        majorVersion = parseInt(navigator.appVersion, 10),
        nameOffset,
        verOffset,
        ix;

    // MSIE 11
    if (navigator.appVersion.indexOf("Windows NT") !== -1 && navigator.appVersion.indexOf("rv:11") !== -1) {
        browserName = "IE";
        fullVersion = "11;";
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
            browserName = "IE";
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
                browserName = "Chrome";
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
                    browserName = "Safari";
                    fullVersion = nAgt.substring(verOffset + 7);
                    if ((verOffset = nAgt.indexOf("Version")) !== -1) {
                        fullVersion = nAgt.substring(verOffset + 8);
                    }
                }
                // Firefox
                else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
                        browserName = "Firefox";
                        fullVersion = nAgt.substring(verOffset + 8);
                    }
                    // In most other browsers, "name/version" is at the end of userAgent
                    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                            browserName = nAgt.substring(nameOffset, verOffset);
                            fullVersion = nAgt.substring(verOffset + 1);
                            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                                browserName = navigator.appName;
                            }
                        }
    // Trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }
    if ((ix = fullVersion.indexOf(" ")) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }
    // Get major version
    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }
    // Return data
    return [browserName, majorVersion];
}

var obj = {};
obj.browserInfo = browserSniff();
obj.browserName = obj.browserInfo[0];
obj.browserVersion = obj.browserInfo[1];

wrapPlayers();
/* Get Our Elements */
var players = document.querySelectorAll('.ckin__player');

var iconPlay = '<i class="ckin-play"></i>';
var iconPause = '<i class="ckin-pause"></i>';
var iconVolumeMute = '<i class="ckin-volume-mute"></i>';
var iconVolumeMedium = '<i class="ckin-volume-medium"></i>';
var iconVolumeLow = '<i class="ckin-volume-low"></i>';
var iconExpand = '<i class="ckin-expand"></i>';
var iconCompress = '<i class="ckin-compress"></i>';

var videoElement;
players.forEach(function (player) {
    var video = player.querySelector('video');
    videoElement = video;

    var skin = attachSkin(video.dataset.ckin);
    player.classList.add(skin);

    var overlay = video.dataset.overlay;
    addOverlay(player, overlay);

    var title = showTitle(skin, video.dataset.title);
    if (title) {
        player.insertAdjacentHTML('beforeend', title);
    }

    var html = buildControls(skin);
    player.insertAdjacentHTML('beforeend', html);

    var color = video.dataset.color;
    addColor(player, color);

    var playerControls = player.querySelector('.' + skin + '__controls');
    var progress = player.querySelector('.progress');;
    var progressBar = player.querySelector('.progress__filled');
    var toggle = player.querySelectorAll('.toggle');
    var skipButtons = player.querySelectorAll('[data-skip]');
    var ranges = player.querySelectorAll('.' + skin + '__slider');
    var volumeButton = player.querySelector('.volume');
    var fullScreenButton = player.querySelector('.fullscreen');

    if (obj.browserName === "IE" && (obj.browserVersion === 8 || obj.browserVersion === 9)) {
        showControls(video);
        playerControls.style.display = "none";
    }

    video.addEventListener('click', function () {
        togglePlay(this, player);
    });
    video.addEventListener('play', function () {
        updateButton(this, toggle);
    });

    video.addEventListener('pause', function () {
        updateButton(this, toggle);
    });
    video.addEventListener('timeupdate', function () {
        handleProgress(this, progressBar);
    });

    toggle.forEach(function (button) {
        return button.addEventListener('click', function () {
            togglePlay(video, player);
        });
    });
    volumeButton.addEventListener('click', function () {
        toggleVolume(video, volumeButton);
    });

    var mousedown = false;
    progress.addEventListener('click', function (e) {
        scrub(e, video, progress);
    });
    progress.addEventListener('mousemove', function (e) {
        return mousedown && scrub(e, video, progress);
    });
    progress.addEventListener('mousedown', function () {
        return mousedown = true;
    });
    progress.addEventListener('mouseup', function () {
        return mousedown = false;
    });
    fullScreenButton.addEventListener('click', function (e) {
        return toggleFullScreen(player, fullScreenButton);
    });

    var sel = document.getElementById('rate');
    sel.addEventListener('change', function () {
        video.playbackRate = this.value;
    });
    addListenerMulti(player, 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function (e) {
        return onFullScreen(e, player);
    });

    //设置总时长
    video.oncanplay = function () {
        document.getElementById("duration").innerHTML = MillisecondToDate(video.duration);
    }

});


//reurn false 禁止函数内部执行其他的事件或者方法
var vol = 0.1;  //1代表100%音量，每次增减0.1
var time = 10; //单位秒，每次增减10秒
// var videoElement = player.querySelector('video');
console.log(videoElement.paused);

document.onkeyup = function (event) {//键盘事件

    console.log("keyCode:" + event.keyCode);
    var e = event || window.event || arguments.callee.caller.arguments[0];

    //鼠标上下键控制视频音量
    if (e && e.keyCode === 38) {

        // 按 向上键
        videoElement.volume !== 1 ? videoElement.volume += vol : 1;
        return false;

    } else if (e && e.keyCode === 40) {

        // 按 向下键
        videoElement.volume !== 0 ? videoElement.volume -= vol : 1;
        return false;

    } else if (e && e.keyCode === 37) {

        // 按 向左键
        videoElement.currentTime !== 0 ? videoElement.currentTime -= time : 1;
        return false;

    } else if (e && e.keyCode === 39) {

        // 按 向右键
        videoElement.volume !== videoElement.duration ? videoElement.currentTime += time : 1;
        return false;

    } else if (e && e.keyCode === 32) {

        // 按空格键 判断当前是否暂停
        videoElement.paused === true ? videoElement.play() : videoElement.pause();
        return false;
    }

}



function showControls(video) {

    video.setAttribute("controls", "controls");
}

function togglePlay(video, player) {
    var method = video.paused ? 'play' : 'pause';
    video[method]();
    video.paused ? player.classList.remove('is-playing') : player.classList.add('is-playing');
}

function updateButton(video, toggle) {
    var icon = video.paused ? iconPlay : iconPause;
    toggle.forEach(function (button) {
        return button.innerHTML = icon;
    });
}

function skip() {
    console.log(1);
    video.currentTime += parseFloat(this.dataset.skip);
}

function toggleVolume(video, volumeButton) {
    var level = video.volume;
    var icon = iconVolumeMedium;
    if (level == 1) {
        level = 0;
        icon = iconVolumeMute;
    } else if (level == 0.5) {
        level = 1;
        icon = iconVolumeMedium;
    } else {
        level = 0.5;
        icon = iconVolumeLow;
    }
    video['volume'] = level;
    volumeButton.innerHTML = icon;
}

function handleRangeUpdate() {
    video[this.name] = this.value;
}

function handleProgress(video, progressBar) {
    var percent = video.currentTime / video.duration * 100;
    progressBar.style.flexBasis = percent + '%';
    document.getElementById("currentTime").innerHTML = MillisecondToDate(video.currentTime);
}

function scrub(e, video, progress) {
    var scrubTime = e.offsetX / progress.offsetWidth * video.duration;
    video.currentTime = scrubTime;
}

function wrapPlayers() {

    var videos = document.querySelectorAll('video');

    videos.forEach(function (video) {

        var wrapper = document.createElement('div');
        wrapper.classList.add('ckin__player');

        video.parentNode.insertBefore(wrapper, video);

        wrapper.appendChild(video);
    });
}

function buildControls(skin) {
    var html = [];
    html.push('<button class="' + skin + '__button--big toggle" title="Toggle Play">' + iconPlay + '</button>');

    html.push('<div class="' + skin + '__controls ckin__controls">');

    html.push('<button class="' + skin + '__button toggle" title="Toggle Video">' + iconPlay + '</button>','<span id="currentTime">0:00</span>',
        '<div class="progress">', '<div class="progress__filled"></div>', '</div>','<span id="duration">0:00</span>',
        '<button class="' + skin + '__button volume" title="Volume">' + iconVolumeMedium + '</button>',
        '<select id="rate" style="border:0;appearance: none;-moz-appearance: none;-webkit-appearance: none;opacity:0; ">' +
        '<option value="0.5">0.5x</option><option value="1" selected>1.0x</option><option value="1.25">1.25x</option> ' +
        '<option value="1.5">1.5x</option> <option value="2">2.0x</option></select>',
        '<button class="' + skin + '__button fullscreen" title="Full Screen">' + iconExpand + '</button>');

    html.push('</div>');

    return html.join('');
}

function attachSkin(skin) {
    if (typeof skin != 'undefined' && skin != '') {
        return skin;
    } else {
        return 'default';
    }
}

function showTitle(skin, title) {
    if (typeof title != 'undefined' && title != '') {
        return '<div class="' + skin + '__title">' + title + '</div>';
    } else {
        return false;
    }
}

function addOverlay(player, overlay) {

    if (overlay == 1) {
        player.classList.add('ckin__overlay');
    } else if (overlay == 2) {
        player.classList.add('ckin__overlay--2');
    } else {
        return;
    }
}

function addColor(player, color) {
    if (typeof color != 'undefined' && color != '') {
        var buttons = player.querySelectorAll('button');
        var progress = player.querySelector('.progress__filled');
        progress.style.background = color;
        buttons.forEach(function (button) {
            return button.style.color = color;
        });
    }
}

function toggleFullScreen(player, fullScreenButton) {
    // let isFullscreen = false;
    if (!document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        player.classList.add('ckin__fullscreen');

        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen(); // Firefox
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen(); // Chrome and Safari
        } else if (player.msRequestFullscreen) {
            player.msRequestFullscreen();
        }
        isFullscreen = true;

        fullScreenButton.innerHTML = iconCompress;
    } else {
        player.classList.remove('ckin__fullscreen');

        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
        fullScreenButton.innerHTML = iconExpand;
    }
}

function onFullScreen(e, player) {
    var isFullscreenNow = document.webkitFullscreenElement !== null;
    if (!isFullscreenNow) {
        player.classList.remove('ckin__fullscreen');
        player.querySelector('.fullscreen').innerHTML = iconExpand;
    } else {
        // player.querySelector('.fullscreen').innerHTML = iconExpand;

    }
}

function addListenerMulti(element, eventNames, listener) {
    var events = eventNames.split(' ');
    for (var i = 0, iLen = events.length; i < iLen; i++) {
        element.addEventListener(events[i], listener, false);
    }
}

// 时间格式化
function MillisecondToDate(msd) {
    console.log(msd);
    let time = parseFloat(msd);
    if (null!= time &&""!== time) {
        if (time >=60&& time <60*60) {
            let minute = parseInt(time /60.0) + '';
            let second = parseInt((parseFloat(time /60.0) - parseInt(time /60.0)) *60) + '';
            time = minute.padStart(2,'0') +':'+ second.padStart(2,'0');
        }else if (time >=60*60&& time <60*60*24) {
            let hour = parseInt(time /3600.0) + '';
            let minute = parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) +'';
            let second = parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -
                parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) + '';
            time = hour.padStart(2,'0')+':'+minute.padStart(2,'0') +':'+ second.padStart(2,'0');
        }else {
            let temp = parseInt(time) + '';
            time = temp.padStart(5,'00:00') ;
        }
    }else{
        time = "00:00";
    }
    return time;
}