/*!
 * Signature Pad v4.1.7 | https://github.com/szimek/signature_pad
 * (c) 2023 Szymon Nowak | Released under the MIT license
 */
! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).SignaturePad = e()
}(this, (function() {
    "use strict";
    /**
     * 表示一个点的类，用于存储和操作与点相关的数据。
     */
    class t {
        /**
         * 构造函数初始化点的位置、压力和时间。
         * 
         * @param {number} t 点的x坐标。
         * @param {number} e 点的y坐标。
         * @param {number} i 点的压力，默认为0。
         * @param {number} s 点的时间戳，默认为当前时间。
         * @throws 如果x或y坐标不是数字，则抛出错误。
         */
        constructor(t, e, i, s) {
            if (isNaN(t) || isNaN(e)) throw new Error(`Point is invalid: (${t}, ${e})`);
            this.x = +t, this.y = +e, this.pressure = i || 0, this.time = s || Date.now()
        }

        /**
         * 计算当前点到另一个点的距离。
         * 
         * @param {t} t 另一个点的对象。
         * @returns {number} 当前点到另一个点的直线距离。
         */
        distanceTo(t) {
            return Math.sqrt(Math.pow(this.x - t.x, 2) + Math.pow(this.y - t.y, 2))
        }

        /**
         * 比较当前点是否与另一个点完全相等。
         * 
         * @param {t} t 另一个点的对象。
         * @returns {boolean} 如果坐标、压力和时间完全相等，则返回true，否则返回false。
         */
        equals(t) {
            return this.x === t.x && this.y === t.y && this.pressure === t.pressure && this.time === t.time
        }

        /**
         * 计算当前点与另一个点的速率。
         * 
         * @param {t} t 另一个点的对象。
         * @returns {number} 如果时间不同，则返回两点间的距离除以时间差，否则返回0。
         */
        velocityFrom(t) {
            return this.time !== t.time ? this.distanceTo(t) / (this.time - t.time) : 0
        }
    }
    /**
     * 该类用于表示三次贝塞尔曲线。
     * 贝塞尔曲线是一种用于图形设计的数学模型，用于平滑地连接两个点。
     * 通过定义起点、两个控制点和终点，可以计算出曲线上的点。
     */
    class e {
        /**
         * 根据给定的点和宽度信息创建一个三次贝塞尔曲线对象。
         * @param {Object} startPoint 起点。
         * @param {Object} controlPoint1 第一个控制点。
         * @param {Object} controlPoint2 第二个控制点。
         * @param {Object} endPoint 终点。
         * @param {number} startWidth 起点的宽度。
         * @param {number} endWidth 终点的宽度。
         */
        constructor(t, e, i, s, n, o) {
            this.startPoint = t, this.control2 = e, this.control1 = i, this.endPoint = s, this.startWidth = n, this.endWidth = o
        }

        /**
         * 计算三次贝塞尔曲线的长度。
         * 通过在曲线上均匀分布点并计算相邻点之间的距离来近似曲线的长度。
         * @returns {number} 曲线的长度。
         */
        length() {
            let t, e, i = 0;
            for (let s = 0; s <= 10; s += 1) {
                const n = s / 10,
                    o = this.point(n, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x),
                    h = this.point(n, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
                if (s > 0) {
                    const s = o - t,
                        n = h - e;
                    i += Math.sqrt(s * s + n * n)
                }
                t = o, e = h
            }
            return i
        }

        /**
         * 计算三次贝塞尔曲线在给定点t处的x或y值。
         * 使用贝塞尔曲线的数学公式来计算这一点。
         * @param {number} t 参数，表示曲线上点的位置，范围在0到1之间。
         * @param {number} start 起始值。
         * @param {number} control1 第一个控制点的值。
         * @param {number} control2 第二个控制点的值。
         * @param {number} end 终止值。
         * @returns {number} 在点t处的贝塞尔曲线值。
         */
        point(t, e, i, s, n) {
            return e * (1 - t) * (1 - t) * (1 - t) + 3 * i * (1 - t) * (1 - t) * t + 3 * s * (1 - t) * t * t + n * t * t * t
        }

        /**
         * 根据起点和终点以及它们的控制点计算控制点。
         * 这是静态方法，可以直接通过类调用，不需要实例化对象。
         * @param {Object} p1 起点。
         * @param {Object} p2 第一个控制点。
         * @param {Object} p3 第二个控制点。
         * @returns {Object} 包含c1和c2控制点的对象。
         */
        static calculateControlPoints(e, i, s) {
            const n = e.x - i.x,
                o = e.y - i.y,
                h = i.x - s.x,
                r = i.y - s.y,
                a = (e.x + i.x) / 2,
                c = (e.y + i.y) / 2,
                d = (i.x + s.x) / 2,
                l = (i.y + s.y) / 2,
                u = Math.sqrt(n * n + o * o),
                v = Math.sqrt(h * h + r * r),
                _ = v / (u + v),
                p = d + (a - d) * _,
                m = l + (c - l) * _,
                g = i.x - p,
                w = i.y - m;
            return {
                c1: new t(a + g, c + w),
                c2: new t(d + g, l + w)
            }
        }

        /**
         * 根据起点、控制点和终点的坐标数组以及宽度信息创建三次贝塞尔曲线。
         * 这是静态方法，可以直接通过类调用，不需要实例化对象。
         * @param {Array} t 包含起点、控制点和终点的坐标数组。
         * @param {Object} i 起点和终点的宽度信息。
         * @returns {e} 创建的三次贝塞尔曲线对象。
         */
        static fromPoints(t, i) {
            const s = this.calculateControlPoints(t[0], t[1], t[2]).c2,
                n = this.calculateControlPoints(t[1], t[2], t[3]).c1;
            return new e(t[1], s, n, t[2], i.start, i.end)
        }
    }
    // 定义类 i
    class i {
        // 构造函数
        constructor() {
            try {
                // 尝试创建一个 EventTarget 对象
                this._et = new EventTarget
            } catch (t) {
                // 如果失败，则使用 document 作为替代
                this._et = document
            }
        }

        // 添加事件监听器
        addEventListener(t, e, i) {
            this._et.addEventListener(t, e, i)
        }

        // 派发事件
        dispatchEvent(t) {
            return this._et.dispatchEvent(t)
        }

        // 移除事件监听器
        removeEventListener(t, e, i) {
            this._et.removeEventListener(t, e, i)
        }
    }

    // 定义类 s，继承自类 i
    class s extends i {
        // 构造函数
        constructor(t, e = {}) {
            super(); // 调用父类的构造函数
            this.canvas = t; // 画布
            this._drawingStroke = !1; // 是否正在绘制
            this._isEmpty = !0; // 画布是否为空
            this._lastPoints = []; // 上次的点
            this._data = []; // 绘制数据
            this._lastVelocity = 0; // 上次的速度
            this._lastWidth = 0; // 上次的宽度

            // 处理鼠标按下事件
            this._handleMouseDown = t => {
                1 === t.buttons && this._strokeBegin(t)
            };

            // 处理鼠标移动事件
            this._handleMouseMove = t => {
                this._strokeMoveUpdate(t)
            };

            // 处理鼠标松开事件
            this._handleMouseUp = t => {
                1 === t.buttons && this._strokeEnd(t)
            };

            // 处理触摸开始事件
            this._handleTouchStart = t => {
                if (t.cancelable && t.preventDefault(), 1 === t.targetTouches.length) {
                    const e = t.changedTouches[0];
                    this._strokeBegin(e)
                }
            };

            // 处理触摸移动事件
            this._handleTouchMove = t => {
                t.cancelable && t.preventDefault();
                const e = t.targetTouches[0];
                this._strokeMoveUpdate(e)
            };

            // 处理触摸结束事件
            this._handleTouchEnd = t => {
                if (t.target === this.canvas) {
                    t.cancelable && t.preventDefault();
                    const e = t.changedTouches[0];
                    this._strokeEnd(e)
                }
            };

            // 处理指针开始事件
            this._handlePointerStart = t => {
                t.preventDefault(), this._strokeBegin(t)
            };

            // 处理指针移动事件
            this._handlePointerMove = t => {
                this._strokeMoveUpdate(t)
            };

            // 处理指针结束事件
            this._handlePointerEnd = t => {
                this._drawingStroke && (t.preventDefault(), this._strokeEnd(t))
            };

            // 初始化配置
            this.velocityFilterWeight = e.velocityFilterWeight || .7;
            this.minWidth = e.minWidth || .5;
            this.maxWidth = e.maxWidth || 2.5;
            this.throttle = "throttle" in e ? e.throttle : 16;
            this.minDistance = "minDistance" in e ? e.minDistance : 5;
            this.dotSize = e.dotSize || 0;
            this.penColor = e.penColor || "black";
            this.backgroundColor = e.backgroundColor || "rgba(0,0,0,0)";
            this.compositeOperation = e.compositeOperation || "source-over";

            // 节流函数，限制函数的执行频率
            this._strokeMoveUpdate = this.throttle ? function(t, e = 250) {
                let i, s, n, o = 0,
                    h = null;
                const r = () => {
                    o = Date.now(), h = null, i = t.apply(s, n), h || (s = null, n = [])
                };
                return function(...a) {
                    const c = Date.now(),
                        d = e - (c - o);
                    return s = this, n = a, d <= 0 || d > e ? (h && (clearTimeout(h), h = null), o = c, i = t.apply(s, n), h || (s = null, n = [])) : h || (h = window.setTimeout(r, d)), i
                }
            }(s.prototype._strokeUpdate, this.throttle) : s.prototype._strokeUpdate;

            // 获取 2D 绘图上下文
            this._ctx = t.getContext("2d");
            this.clear(); // 清空画布
            this.on(); // 启用事件监听
        }

        // 清空画布
        clear() {
            const {
                _ctx: t,
                canvas: e
            } = this;
            t.fillStyle = this.backgroundColor;
            t.clearRect(0, 0, e.width, e.height);
            t.fillRect(0, 0, e.width, e.height);
            this._data = [];
            this._reset(this._getPointGroupOptions());
            this._isEmpty = !0;
        }

        // 从数据URL加载图像
        fromDataURL(t, e = {}) {
            return new Promise(((i, s) => {
                const n = new Image,
                    o = e.ratio || window.devicePixelRatio || 1,
                    h = e.width || this.canvas.width / o,
                    r = e.height || this.canvas.height / o,
                    a = e.xOffset || 0,
                    c = e.yOffset || 0;
                this._reset(this._getPointGroupOptions());
                n.onload = () => {
                    this._ctx.drawImage(n, a, c, h, r), i()
                };
                n.onerror = t => {
                    s(t)
                };
                n.crossOrigin = "anonymous";
                n.src = t;
                this._isEmpty = !1;
            }))
        }

		/**
		 * 将当前图形转换为数据URL。
		 * 此方法支持将图形导出为PNG和SVG格式。对于SVG格式，它允许提供额外的参数进行定制。
		 * 
		 * @param {string} t - 图片的MIME类型，默认为"image/png"。可以设置为"image/svg+xml"以导出SVG格式。
		 * @param {object|number} e - 当导出为PNG时，此参数无效。当导出为SVG时，可以是一个对象，用于定制SVG输出。
		 *                            如果t为"image/svg+xml"，且e不是对象，则将其视为undefined。
		 *                            如果t不是"image/svg+xml"，且e不是数字，则将其视为undefined。
		 *                            当导出为SVG时，此参数可以被忽略。
		 * @returns {string} 返回一个数据URL，表示当前图形。如果MIME类型为"image/svg+xml"，则返回SVG格式的数据URL；
		 *                   否则，返回PNG格式的数据URL。
		 */
		toDataURL(t = "image/png", e) {
			// 当请求的MIME类型为image/svg+xml时，处理SVG导出
			if ("image/svg+xml" === t) {
				// 如果e不是对象，则将其设置为undefined，以保持与API的一致性
				"object" != typeof e && (e = void 0);
				// 使用base64编码将SVG内容转换为数据URL
				return `data:image/svg+xml;base64,${btoa(this.toSVG(e))}`;
			}
			// 当请求的MIME类型不是image/svg+xml时，处理PNG导出
			// 如果e不是数字，则将其设置为undefined，以保持与API的一致性
			"number" != typeof e && (e = void 0);
			// 返回PNG格式的数据URL
			return this.canvas.toDataURL(t, e);
		}

        // 启用事件监听
        on() {
            this.canvas.style.touchAction = "none";
            this.canvas.style.msTouchAction = "none";
            this.canvas.style.userSelect = "none";
            const t = /Macintosh/.test(navigator.userAgent) && "ontouchstart" in document;
            window.PointerEvent && !t ? this._handlePointerEvents() : (this._handleMouseEvents(), "ontouchstart" in window && this._handleTouchEvents())
        }

        // 禁用事件监听
        off() {
            this.canvas.style.touchAction = "auto";
            this.canvas.style.msTouchAction = "auto";
            this.canvas.style.userSelect = "auto";
            this.canvas.removeEventListener("pointerdown", this._handlePointerStart);
            this.canvas.removeEventListener("pointermove", this._handlePointerMove);
            this.canvas.ownerDocument.removeEventListener("pointerup", this._handlePointerEnd);
            this.canvas.removeEventListener("mousedown", this._handleMouseDown);
            this.canvas.removeEventListener("mousemove", this._handleMouseMove);
            this.canvas.ownerDocument.removeEventListener("mouseup", this._handleMouseUp);
            this.canvas.removeEventListener("touchstart", this._handleTouchStart);
            this.canvas.removeEventListener("touchmove", this._handleTouchMove);
            this.canvas.removeEventListener("touchend", this._handleTouchEnd);
        }

        // 检查画布是否为空
        isEmpty() {
            return this._isEmpty
        }

        // 从数据中绘制
        fromData(t, {
            clear: e = !0
        } = {}) {
            e && this.clear();
            this._fromData(t, this._drawCurve.bind(this), this._drawDot.bind(this));
            this._data = this._data.concat(t);
        }

        // 导出绘制数据
        toData() {
            return this._data
        }

        // 获取点组选项
        _getPointGroupOptions(t) {
            return {
                penColor: t && "penColor" in t ? t.penColor : this.penColor,
                dotSize: t && "dotSize" in t ? t.dotSize : this.dotSize,
                minWidth: t && "minWidth" in t ? t.minWidth : this.minWidth,
                maxWidth: t && "maxWidth" in t ? t.maxWidth : this.maxWidth,
                velocityFilterWeight: t && "velocityFilterWeight" in t ? t.velocityFilterWeight : this.velocityFilterWeight,
                compositeOperation: t && "compositeOperation" in t ? t.compositeOperation : this.compositeOperation
            }
        }

        /**
         * 开始绘制线条。
         * 当调用此方法时，表示开始记录一条新的线条。它首先触发一个自定义事件“beginStroke”，允许监听者取消绘制操作。
         * 如果绘制被允许，则初始化线条绘制的状态，并准备一个新的点组用于记录线条的点信息。
         * 
         * @param {Object} t - 绘制开始时的时间戳或其他相关信息。
         */
        // 开始绘制
        _strokeBegin(t) {
            // 触发“beginStroke”事件，允许监听者取消操作。
            if (!this.dispatchEvent(new CustomEvent("beginStroke", {
                    detail: t,
                    cancelable: !0
                }))) return;

            // 标记当前处于绘制状态。
            this._drawingStroke = !0;

            // 获取绘制选项。
            const e = this._getPointGroupOptions(),
                // 创建一个新的点组对象，初始化其选项和空的点列表。
                i = Object.assign(Object.assign({}, e), {
                    points: []
                });

            // 将新的点组添加到数据数组中。
            this._data.push(i);
            // 重置绘制状态，为新的线条绘制做准备。
            this._reset(e);
            // 更新线条状态，开始记录第一个点。
            this._strokeUpdate(t);
        }
        /**
         * 更新绘制的笔触。
         * 当检测到新的笔触数据时，这个方法用于更新当前的绘制状态，包括计算新点的位置、压力等信息，并根据这些信息决定是添加一个新点、绘制曲线还是绘制点。
         * @param {MouseEvent|PointerEvent} t - 鼠标或触笔事件对象，提供当前位置和压力信息。
         */
        _strokeUpdate(t) {
            // 如果当前没有正在绘制的笔触，则返回。
            if (!this._drawingStroke) return;
            // 如果数据数组为空，说明当前笔触尚未开始，需要调用_strokeBegin方法开始新的笔触。
            if (0 === this._data.length) return void this._strokeBegin(t);
            // 触发beforeUpdateStroke事件，允许外部在更新笔触前进行干预。
            this.dispatchEvent(new CustomEvent("beforeUpdateStroke", {
                detail: t
            }));
            // 记录鼠标或触笔事件的客户端X、Y坐标及压力信息。
            const e = t.clientX,
                i = t.clientY,
                s = void 0 !== t.pressure ? t.pressure : void 0 !== t.force ? t.force : 0,
				
                // 根据当前坐标和压力信息创建一个新的点对象。
                n = this._createPoint(e, i, s),
                // 获取当前笔触的最后一个点组。
                o = this._data[this._data.length - 1],
                h = o.points,
                r = h.length > 0 && h[h.length - 1],
                // 判断新点与最后一个点的距离是否小于最小距离阈值。
                a = !!r && n.distanceTo(r) <= this.minDistance,
                // 获取当前点组的绘制选项。
                c = this._getPointGroupOptions(o);
            // 如果新点与最后一个点的距离大于最小距离，或当前没有最后一个点，或当前点组不满足连续绘制条件，则添加一个新点。
			
            if (!r || !r || !a) {
                // 根据新点信息和绘制选项，添加新点到点组，并根据情况绘制曲线或点。
                const t = this._addPoint(n, c);
                r ? t && this._drawCurve(t, c) : this._drawDot(n, c), h.push({
                    time: n.time,
                    x: n.x,
                    y: n.y,
                    pressure: n.pressure
                })
            }
            // 更新完成后，触发afterUpdateStroke事件，允许外部在更新笔触后进行处理。
            document.dispatchEvent(new CustomEvent("afterUpdateStroke", {
                detail: {
					x: t.layerX,
					y: t.layerY
					// pressure: t.pressure,//笔迹压力，实测没用
				},
            }))
			//console.log(t);
        }
        /**
         * 处理绘制结束的操作。
         * 当检测到绘制动作结束时，此方法将被调用。它首先检查是否正在进行绘制，
         * 如果是，则更新绘制状态，然后设置绘制动作结束，并触发一个自定义事件“endStroke”。
         * 
         * @param {number} t - 绘制结束时的时间戳或其他相关参数。
         */
        _strokeEnd(t) {
            // 检查是否正在绘制，如果是，则进行绘制的更新操作
            this._drawingStroke && (this._strokeUpdate(t), this._drawingStroke = !1,
                // 触发一个自定义事件“endStroke”，携带结束时的时间戳或其他相关信息
                document.dispatchEvent(new CustomEvent("endStroke", {
                    detail: t
                })))
        }
        _handlePointerEvents() {
            this._drawingStroke = !1, this.canvas.addEventListener("pointerdown", this._handlePointerStart), this.canvas.addEventListener("pointermove", this._handlePointerMove), this.canvas.ownerDocument.addEventListener("pointerup", this._handlePointerEnd)
        }
        _handleMouseEvents() {
            this._drawingStroke = !1, this.canvas.addEventListener("mousedown", this._handleMouseDown), this.canvas.addEventListener("mousemove", this._handleMouseMove), this.canvas.ownerDocument.addEventListener("mouseup", this._handleMouseUp)
        }
        _handleTouchEvents() {
            this.canvas.addEventListener("touchstart", this._handleTouchStart), this.canvas.addEventListener("touchmove", this._handleTouchMove), this.canvas.addEventListener("touchend", this._handleTouchEnd)
        }
        _reset(t) {
            this._lastPoints = [], this._lastVelocity = 0, this._lastWidth = (t.minWidth + t.maxWidth) / 2, this._ctx.fillStyle = t.penColor, this._ctx.globalCompositeOperation = t.compositeOperation
        }
        _createPoint(e, i, s) {
            const n = this.canvas.getBoundingClientRect();
            return new t(e - n.left, i - n.top, s, (new Date).getTime())
        }
        _addPoint(t, i) {
            const {
                _lastPoints: s
            } = this;
            if (s.push(t), s.length > 2) {
                3 === s.length && s.unshift(s[0]);
                const t = this._calculateCurveWidths(s[1], s[2], i),
                    n = e.fromPoints(s, t);
                return s.shift(), n
            }
            return null
        }
        _calculateCurveWidths(t, e, i) {
            const s = i.velocityFilterWeight * e.velocityFrom(t) + (1 - i.velocityFilterWeight) * this._lastVelocity,
                n = this._strokeWidth(s, i),
                o = {
                    end: n,
                    start: this._lastWidth
                };
            return this._lastVelocity = s, this._lastWidth = n, o
        }
        _strokeWidth(t, e) {
            return Math.max(e.maxWidth / (t + 1), e.minWidth)
        }
        /**
         * 绘制曲线段
         * 
         * 该方法用于在画布上绘制一个圆弧形的曲线段。通过指定圆心的位置和半径，以及不需要填充的属性，来创建一个圆形的曲线段。
         * 主要用于在绘图过程中，实现特定形状的曲线绘制，是绘制复杂图形的一部分。
         * 
         * @param {number} t 圆心的横坐标
         * @param {number} e 圆心的纵坐标
         * @param {number} i 圆的半径
         */
        _drawCurveSegment(t, e, i) {
            const s = this._ctx;
            // 从指定的起点开始绘制曲线
            s.moveTo(t, e);
            // 绘制一个圆弧，圆心为(t,e)，半径为i，从0度开始绘制，绕圆心旋转2*π弧度，方向为顺时针
            s.arc(t, e, i, 0, 2 * Math.PI, !1);
            // 标记当前图形状态为非空，表示已经绘制了内容
            this._isEmpty = !1;
        }
        // 绘制曲线
        _drawCurve(t, e) {
            const i = this._ctx,
                s = t.endWidth - t.startWidth,
                n = 2 * Math.ceil(t.length());
            i.beginPath(), i.fillStyle = e.penColor;
            for (let i = 0; i < n; i += 1) {
                const o = i / n,
                    h = o * o,
                    r = h * o,
                    a = 1 - o,
                    c = a * a,
                    d = c * a;
                let l = d * t.startPoint.x;
                l += 3 * c * o * t.control1.x, l += 3 * a * h * t.control2.x, l += r * t.endPoint.x;
                let u = d * t.startPoint.y;
                u += 3 * c * o * t.control1.y, u += 3 * a * h * t.control2.y, u += r * t.endPoint.y;
                const v = Math.min(t.startWidth + r * s, e.maxWidth);
                this._drawCurveSegment(l, u, v)
            }
            i.closePath(), i.fill()
        }
        // 绘制点
        _drawDot(t, e) {
            const i = this._ctx,
                s = e.dotSize > 0 ? e.dotSize : (e.minWidth + e.maxWidth) / 2;
            i.beginPath(), this._drawCurveSegment(t.x, t.y, s), i.closePath(), i.fillStyle = e.penColor, i.fill()
        }
        _fromData(e, i, s) {
            for (const n of e) {
                const {
                    points: e
                } = n, o = this._getPointGroupOptions(n);
                if (e.length > 1)
                    for (let s = 0; s < e.length; s += 1) {
                        const n = e[s],
                            h = new t(n.x, n.y, n.pressure, n.time);
                        0 === s && this._reset(o);
                        const r = this._addPoint(h, o);
                        r && i(r, o)
                    } else this._reset(o), s(e[0], o)
            }
        }
		/**
		 * 将画布转换为SVG格式的字符串。
		 * 此功能允许包括背景颜色，并将画布上的线条和点转换为SVG路径和圆点元素。
		 * @param {Object} options - 转换选项。
		 * @param {boolean} options.includeBackgroundColor - 是否包含背景颜色，默认为false。
		 * @returns {string} - 转换后的SVG字符串。
		 */
		toSVG({
			includeBackgroundColor: t = !1
		} = {}) {
			// 获取画布的数据
			const e = this._data,
				// 获取设备的像素比，用于适配高分屏
				i = Math.max(window.devicePixelRatio || 1, 1),
				// 计算调整后的画布宽度和高度
				s = this.canvas.width / i,
				n = this.canvas.height / i,
				// 创建SVG元素
				o = document.createElementNS("http://www.w3.org/2000/svg", "svg");

			// 设置SVG的基本属性
			o.setAttribute("xmlns", "http://www.w3.org/2000/svg"),
			o.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"),
			o.setAttribute("viewBox", `0 0 ${s} ${n}`),
			o.setAttribute("width", s.toString()),
			o.setAttribute("height", n.toString());

			// 如果需要包含背景色，并且设置了背景色，则创建一个矩形元素填充背景色
			if (t && this.backgroundColor) {
				const t = document.createElement("rect");
				t.setAttribute("width", "100%"),
				t.setAttribute("height", "100%"),
				t.setAttribute("fill", this.backgroundColor),
				o.appendChild(t);
			}

			// 遍历数据，创建SVG路径元素表示线条
			this._fromData(e, ((t, {
				penColor: e
			}) => {
				const i = document.createElement("path");
				// 确保线条的控制点坐标有效
				if (!(isNaN(t.control1.x) || isNaN(t.control1.y) || isNaN(t.control2.x) || isNaN(t.control2.y))) {
					const s = `M ${t.startPoint.x.toFixed(3)},${t.startPoint.y.toFixed(3)} C ${t.control1.x.toFixed(3)},${t.control1.y.toFixed(3)} ${t.control2.x.toFixed(3)},${t.control2.y.toFixed(3)} ${t.endPoint.x.toFixed(3)},${t.endPoint.y.toFixed(3)}`;
					i.setAttribute("d", s),
					i.setAttribute("stroke-width", (2.25 * t.endWidth).toFixed(3)),
					i.setAttribute("stroke", e),
					i.setAttribute("fill", "none"),
					i.setAttribute("stroke-linecap", "round"),
					o.appendChild(i);
				}
			}), ((t, {
				penColor: e,
				dotSize: i,
				minWidth: s,
				maxWidth: n
			}) => {
				// 创建SVG圆点元素表示点
				const h = document.createElement("circle"),
					r = i > 0 ? i : (s + n) / 2;
				h.setAttribute("r", r.toString()),
				h.setAttribute("cx", t.x.toString()),
				h.setAttribute("cy", t.y.toString()),
				h.setAttribute("fill", e),
				o.appendChild(h);
			}));

			// 返回SVG元素的HTML表示字符串
			return o.outerHTML
		}
    }
    return s
}));
//# sourceMappingURL=signature_pad.umd.min.js.map