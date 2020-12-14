(function(root) {
    //进度条，构造函数
    function Progress () {
        this.durTime = 0; //总时间
        this.frameId = null;    //定时器
        this.startTime = 0;     //进度条起始位置
        this.lastPersent = 0;   //上次走到的百分比、

        this.init();
    }

    Progress.prototype = {
        init: function() {
            this.getDom();
            this.renderAllTime(266);
            
        },
        getDom: function() {
            this.curTime = document.querySelector('.curTime');
            this.circle = document.querySelector('.circle');
            this.frontBg = document.querySelector('.frontBg');
            this.totalTime = document.querySelector('.totalTime');

            //console.log(this.totalTime);

        },
        renderAllTime: function(time) {
            this.getDom();      //在使用innerHTML之前用一下getDOM，不然它要报错说没有这个DOM元素的定义，有必要吗？
            this.durTime = time;
            time =this.formatTime(time);

            this.totalTime.innerHTML = time;


        },
        formatTime: function(time){
            time = Math.round(time);

            var m = Math.floor(time / 60);
            var s = time % 60;

            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;

            return m + ':' + s;

        },

        move: function(per) { //移动进度条
            cancelAnimationFrame(this.frameId);//在开启新的定时器时需要清定时器
            var This = this;
            this.startTime = new Date().getTime();

            //per决定了上一次的百分比是否要清空
            this.lastPersent = per === undefined? this.lastPersent : per;

            function frame () {
                var curTime = new Date().getTime();
                var per = This.lastPersent + (curTime - This.startTime) / (This.durTime * 1000);

                if(per <= 1){   //表示还没播放完
                    This.update(per);
                }else{
                    cancelAnimationFrame(This.frameId);
                }
                This.frameId = requestAnimationFrame(frame);
            }
            frame();
        },

        update: function(per) {    //更新进度条
            //更新左侧时间
            var time = this.formatTime(per * this.durTime);
            this.curTime.innerHTML = time;

            //更新进度条的位置
            this.frontBg.style.width = per * 100 + '%';

            //更新原点的位置

            var l = per * this.circle.parentNode.offsetWidth;
            this.circle.style.transform = 'translateX(' + l + 'px)' ;

        },
        stop: function() {  //停止进度条
            cancelAnimationFrame(this.frameId);

            var stopTime = new Date().getTime();
            this.lastPersent += (stopTime - this.startTime) / (this.durTime * 1000);


        },
    }

    //实例化
    function instancesProgress () {
        return new Progress();
    }

    //拖拽
    function Drag (obj) {
        this.obj = obj;
        this.startPointX = 0;
        this.startLeft = 0;
        this.percent = 0;
    }
    Drag.prototype = {
        init: function() {
            var This = this;
            this.obj.style.transform = 'translateX(0px)';

            //拖拽开始
            this.obj.addEventListener('touchstart', function(ev){
                This.startPointX = ev.changedTouches[0].pageX;   //更新摁下的第一根手指的坐标点
                This.startLeft = parseFloat(this.style.transform.split('(')[1]);

                This.start && This.start();
            }),

            this.obj.addEventListener('touchmove', function(ev){
                This.disPointX = ev.changedTouches[0].pageX - This.startPointX;
                var l = This.startLeft + This.disPointX;
               
                if(l < 0){
                    l = 0;
                }else if(l > this.offsetParent.offsetWidth){ //当超过父级的时候，意思就是播放完了
                    l = this.offsetParent.offsetWidth;
                }

                this.style.transform = "translateX(" + l + "px)";   //那个进度条上的圆点的位置

                

                //拖拽的百分比
                This.percent = l / this.offsetParent.offsetWidth;
                This.move && This.move(This.percent);

                ev.preventDefault();
            });

            this.obj.addEventListener('touchend', function(ev){  //最开始这里没给ev这个参数，就等于没有东西来调用这个方法，所以实现不了拖拽。
                This.end && This.end(This.percent);
            });

        }
    }
    function instancesDrag (obj) {
        return new Drag(obj);
    }

    root.progress = {
        pro: instancesProgress,
        drag: instancesDrag
    }


})(window.player || (window.player = {}));